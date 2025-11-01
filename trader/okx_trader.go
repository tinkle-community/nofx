package trader

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

// OKXTrader OKX交易器
type OKXTrader struct {
	apiKey     string
	secretKey  string
	passphrase string
	baseURL    string
	client     *http.Client
	dryRun     bool // Dry Run模式：只记录日志，不发送真实订单

	// 余额缓存
	cachedBalance     map[string]interface{}
	balanceCacheTime  time.Time
	balanceCacheMutex sync.RWMutex

	// 持仓缓存
	cachedPositions     []map[string]interface{}
	positionsCacheTime  time.Time
	positionsCacheMutex sync.RWMutex

	// 持仓模式配置（从 API 获取的真实配置）
	positionMode      string // "long_short_mode" 或 "net_mode"
	positionModeCache time.Time
	posModeMutex      sync.RWMutex

	// 缓存有效期（15秒）
	cacheDuration time.Duration
}

// NewOKXTrader 创建OKX交易器
func NewOKXTrader(apiKey, secretKey, passphrase string, dryRun bool) *OKXTrader {
	return &OKXTrader{
		apiKey:        apiKey,
		secretKey:     secretKey,
		passphrase:    passphrase,
		baseURL:       "https://www.okx.com",
		client:        &http.Client{Timeout: 30 * time.Second},
		dryRun:        dryRun,
		cacheDuration: 15 * time.Second,
	}
}

// sign 生成签名
func (t *OKXTrader) sign(timestamp, method, requestPath, body string) string {
	message := timestamp + method + requestPath + body
	h := hmac.New(sha256.New, []byte(t.secretKey))
	h.Write([]byte(message))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

// request 发送HTTP请求
func (t *OKXTrader) request(ctx context.Context, method, path string, body interface{}) ([]byte, error) {
	var bodyBytes []byte
	if body != nil {
		var err error
		bodyBytes, err = json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("序列化请求失败: %w", err)
		}
	}

	timestamp := time.Now().UTC().Format("2006-01-02T15:04:05.999Z")
	sign := t.sign(timestamp, method, path, string(bodyBytes))

	req, err := http.NewRequestWithContext(ctx, method, t.baseURL+path, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("OK-ACCESS-KEY", t.apiKey)
	req.Header.Set("OK-ACCESS-SIGN", sign)
	req.Header.Set("OK-ACCESS-TIMESTAMP", timestamp)
	req.Header.Set("OK-ACCESS-PASSPHRASE", t.passphrase)

	resp, err := t.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %w", err)
	}

	// 检查HTTP状态码
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API返回错误状态码 %d: %s", resp.StatusCode, string(respBody))
	}

	// 解析响应检查code
	var apiResp struct {
		Code string          `json:"code"`
		Msg  string          `json:"msg"`
		Data json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	if apiResp.Code != "0" {
		// 打印完整响应以便调试
		debugMode := os.Getenv("DEBUG_MODE") == "true"
		if debugMode {
			log.Printf("[DEBUG] OKX API 错误响应: %s", string(respBody))
		}
		return nil, fmt.Errorf("API返回错误: code=%s, msg=%s, data=%s", apiResp.Code, apiResp.Msg, string(apiResp.Data))
	}

	return apiResp.Data, nil
}

// GetBalance 获取账户余额（带缓存）
func (t *OKXTrader) GetBalance() (map[string]interface{}, error) {
	// 🔥 Dry Run 模式：返回模拟账户数据
	if t.dryRun {
		result := make(map[string]interface{})
		result["totalWalletBalance"] = 1000.0 // 模拟初始余额
		result["availableBalance"] = 1000.0   // 全部可用
		result["totalUnrealizedProfit"] = 0.0 // 无未实现盈亏
		log.Printf("📝 [DRY RUN] 模拟账户余额: 总余额=1000.00, 可用=1000.00")
		return result, nil
	}

	// 先检查缓存是否有效
	t.balanceCacheMutex.RLock()
	if t.cachedBalance != nil && time.Since(t.balanceCacheTime) < t.cacheDuration {
		cacheAge := time.Since(t.balanceCacheTime)
		t.balanceCacheMutex.RUnlock()
		log.Printf("✓ 使用缓存的账户余额（缓存时间: %.1f秒前）", cacheAge.Seconds())
		return t.cachedBalance, nil
	}
	t.balanceCacheMutex.RUnlock()

	// 缓存过期或不存在，调用API
	log.Printf("🔄 缓存过期，正在调用OKX API获取账户余额...")

	data, err := t.request(context.Background(), "GET", "/api/v5/account/balance", nil)
	if err != nil {
		log.Printf("❌ OKX API调用失败: %v", err)
		return nil, fmt.Errorf("获取账户余额失败: %w", err)
	}

	var balanceData []struct {
		TotalEq string `json:"totalEq"`
		Details []struct {
			Ccy           string `json:"ccy"`
			Eq            string `json:"eq"`
			AvailBal      string `json:"availBal"`
			UnrealizedPnl string `json:"upl"`
		} `json:"details"`
	}

	if err := json.Unmarshal(data, &balanceData); err != nil {
		return nil, fmt.Errorf("解析余额数据失败: %w", err)
	}

	if len(balanceData) == 0 {
		return nil, fmt.Errorf("余额数据为空")
	}

	result := make(map[string]interface{})
	totalEq, _ := strconv.ParseFloat(balanceData[0].TotalEq, 64)
	result["totalWalletBalance"] = totalEq

	// 计算可用余额和未实现盈亏（USDT）
	availBal := 0.0
	unrealizedPnl := 0.0
	for _, detail := range balanceData[0].Details {
		if detail.Ccy == "USDT" {
			availBal, _ = strconv.ParseFloat(detail.AvailBal, 64)
			unrealizedPnl, _ = strconv.ParseFloat(detail.UnrealizedPnl, 64)
			break
		}
	}
	result["availableBalance"] = availBal
	result["totalUnrealizedProfit"] = unrealizedPnl

	log.Printf("✓ OKX API返回: 总余额=%.2f, 可用=%.2f, 未实现盈亏=%.2f",
		totalEq, availBal, unrealizedPnl)

	// 更新缓存
	t.balanceCacheMutex.Lock()
	t.cachedBalance = result
	t.balanceCacheTime = time.Now()
	t.balanceCacheMutex.Unlock()

	return result, nil
}

// GetPositions 获取所有持仓（带缓存）
func (t *OKXTrader) GetPositions() ([]map[string]interface{}, error) {
	// 🔥 Dry Run 模式：返回空持仓列表
	if t.dryRun {
		log.Printf("📝 [DRY RUN] 模拟持仓信息: 无持仓")
		return []map[string]interface{}{}, nil
	}

	// 先检查缓存是否有效
	t.positionsCacheMutex.RLock()
	if t.cachedPositions != nil && time.Since(t.positionsCacheTime) < t.cacheDuration {
		cacheAge := time.Since(t.positionsCacheTime)
		t.positionsCacheMutex.RUnlock()
		log.Printf("✓ 使用缓存的持仓信息（缓存时间: %.1f秒前）", cacheAge.Seconds())
		return t.cachedPositions, nil
	}
	t.positionsCacheMutex.RUnlock()

	// 缓存过期或不存在，调用API
	log.Printf("🔄 缓存过期，正在调用OKX API获取持仓信息...")

	data, err := t.request(context.Background(), "GET", "/api/v5/account/positions", nil)
	if err != nil {
		return nil, fmt.Errorf("获取持仓失败: %w", err)
	}

	var positions []struct {
		InstId  string `json:"instId"`
		Pos     string `json:"pos"`
		AvgPx   string `json:"avgPx"`
		MarkPx  string `json:"markPx"`
		Upl     string `json:"upl"`
		Lever   string `json:"lever"`
		LiqPx   string `json:"liqPx"`
		PosSide string `json:"posSide"`
		MgnMode string `json:"mgnMode"`
		CTime   string `json:"cTime"` // 持仓创建时间（Unix毫秒时间戳）
		UTime   string `json:"uTime"` // 持仓更新时间（Unix毫秒时间戳）
	}

	if err := json.Unmarshal(data, &positions); err != nil {
		return nil, fmt.Errorf("解析持仓数据失败: %w", err)
	}

	var result []map[string]interface{}
	log.Printf("📊 OKX API 返回 %d 个持仓记录", len(positions))

	for _, pos := range positions {
		posAmt, _ := strconv.ParseFloat(pos.Pos, 64)
		if posAmt == 0 {
			continue // 跳过无持仓的
		}

		// 📝 记录原始的 instId 和 posSide，帮助调试
		log.Printf("  ├─ 原始持仓: instId=%s, posSide=%s, pos=%s", pos.InstId, pos.PosSide, pos.Pos)

		posMap := make(map[string]interface{})
		posMap["symbol"] = pos.InstId
		posMap["positionAmt"] = posAmt
		posMap["entryPrice"], _ = strconv.ParseFloat(pos.AvgPx, 64)
		posMap["markPrice"], _ = strconv.ParseFloat(pos.MarkPx, 64)
		posMap["unRealizedProfit"], _ = strconv.ParseFloat(pos.Upl, 64)
		posMap["leverage"], _ = strconv.ParseFloat(pos.Lever, 64)
		posMap["liquidationPrice"], _ = strconv.ParseFloat(pos.LiqPx, 64)

		// 判断方向
		// OKX有两种持仓模式：
		// 1. 双向持仓：posSide = "long" 或 "short"
		// 2. 单向持仓：posSide = "net"，通过pos数量正负判断方向
		var side string
		if pos.PosSide == "long" {
			side = "long"
		} else if pos.PosSide == "short" {
			side = "short"
		} else if pos.PosSide == "net" || pos.PosSide == "" {
			// 单向持仓模式：正数=多仓，负数=空仓
			if posAmt > 0 {
				side = "long"
			} else {
				side = "short"
				posAmt = -posAmt // 转为正数
				posMap["positionAmt"] = posAmt
			}
		} else {
			log.Printf("  └─ ❌ 未知的持仓方向: %s (symbol=%s), 跳过该持仓", pos.PosSide, pos.InstId)
			continue
		}

		posMap["side"] = side
		posMap["posSide"] = pos.PosSide // 🔧 保存原始 posSide（用于平仓时判断持仓模式）

		// 解析开仓时间（cTime是Unix毫秒时间戳）
		if pos.CTime != "" {
			cTime, err := strconv.ParseInt(pos.CTime, 10, 64)
			if err == nil {
				posMap["openTime"] = cTime // 毫秒时间戳
			}
		}

		log.Printf("  └─ ✓ 解析成功: symbol=%s, side=%s, posSide=%s, amount=%.4f, openTime=%s", pos.InstId, side, pos.PosSide, posAmt, pos.CTime)

		result = append(result, posMap)
	}

	// 更新缓存
	t.positionsCacheMutex.Lock()
	t.cachedPositions = result
	t.positionsCacheTime = time.Now()
	t.positionsCacheMutex.Unlock()

	return result, nil
}

// GetAccountConfig 获取账户配置（包含持仓模式）
func (t *OKXTrader) GetAccountConfig() (string, error) {
	// 🔥 Dry Run 模式：返回默认配置
	if t.dryRun {
		return "net_mode", nil
	}

	// 先检查缓存是否有效（缓存1小时，持仓模式不会频繁变化）
	t.posModeMutex.RLock()
	if t.positionMode != "" && time.Since(t.positionModeCache) < time.Hour {
		posMode := t.positionMode
		t.posModeMutex.RUnlock()
		return posMode, nil
	}
	t.posModeMutex.RUnlock()

	// 缓存过期或不存在，调用API
	data, err := t.request(context.Background(), "GET", "/api/v5/account/config", nil)
	if err != nil {
		return "", fmt.Errorf("获取账户配置失败: %w", err)
	}

	var configs []struct {
		PosMode string `json:"posMode"` // "long_short_mode" 或 "net_mode"
	}

	if err := json.Unmarshal(data, &configs); err != nil {
		return "", fmt.Errorf("解析账户配置失败: %w", err)
	}

	if len(configs) == 0 {
		return "", fmt.Errorf("账户配置数据为空")
	}

	posMode := configs[0].PosMode
	log.Printf("📋 OKX 账户持仓模式: %s", posMode)

	// 更新缓存
	t.posModeMutex.Lock()
	t.positionMode = posMode
	t.positionModeCache = time.Now()
	t.posModeMutex.Unlock()

	return posMode, nil
}

// getPosSideForTrade 获取交易时应该使用的 posSide
// 根据账户真实配置的持仓模式和方向（long/short）返回正确的 posSide
func (t *OKXTrader) getPosSideForTrade(direction string) string {
	// 获取账户配置的持仓模式
	posMode, err := t.GetAccountConfig()
	if err != nil {
		log.Printf("⚠️  获取持仓模式失败，默认使用单向持仓: %v", err)
		return "net" // 出错时默认使用单向持仓
	}

	// 根据持仓模式返回正确的 posSide
	if posMode == "net_mode" {
		return "net" // 单向持仓模式
	}
	// long_short_mode - 双向持仓模式
	return direction // 返回 "long" 或 "short"
}

// setLeverageInternal 设置杠杆（内部方法，带持仓方向）
func (t *OKXTrader) setLeverageInternal(symbol string, leverage int, positionSide string) error {
	// 先尝试获取当前杠杆（从持仓信息）
	currentLeverage := 0
	positions, err := t.GetPositions()
	if err == nil {
		for _, pos := range positions {
			if pos["symbol"] == symbol {
				if lev, ok := pos["leverage"].(float64); ok {
					currentLeverage = int(lev)
					break
				}
			}
		}
	}

	// 如果当前杠杆已经是目标杠杆，跳过
	if currentLeverage == leverage && currentLeverage > 0 {
		log.Printf("  ✓ %s 杠杆已是 %dx，无需切换", symbol, leverage)
		return nil
	}

	// 设置杠杆
	body := map[string]interface{}{
		"instId":  symbol,
		"lever":   strconv.Itoa(leverage),
		"mgnMode": "isolated", // 逐仓模式
		"posSide": positionSide, // 持仓方向：long 或 short
	}

	_, err = t.request(context.Background(), "POST", "/api/v5/account/set-leverage", body)
	if err != nil {
		return fmt.Errorf("设置杠杆失败: %w", err)
	}

	log.Printf("  ✓ %s 杠杆已切换为 %dx (%s)", symbol, leverage, positionSide)

	// 切换杠杆后等待3秒
	log.Printf("  ⏱ 等待3秒冷却期...")
	time.Sleep(3 * time.Second)

	return nil
}

// SetLeverage 设置杠杆（实现Trader接口）
// 对于OKX，由于需要指定posSide，这里尝试同时设置long和short方向的杠杆
func (t *OKXTrader) SetLeverage(symbol string, leverage int) error {
	// 尝试设置long方向
	errLong := t.setLeverageInternal(symbol, leverage, "long")

	// 尝试设置short方向
	errShort := t.setLeverageInternal(symbol, leverage, "short")

	// 如果两个都失败，返回错误
	if errLong != nil && errShort != nil {
		return fmt.Errorf("设置杠杆失败: long方向=%v, short方向=%v", errLong, errShort)
	}

	return nil
}

// OpenLong 开多仓
func (t *OKXTrader) OpenLong(symbol string, quantity float64, leverage int) (map[string]interface{}, error) {
	// 🔥 Dry Run 模式：只记录日志，不发送真实订单
	if t.dryRun {
		log.Printf("📝 [DRY RUN] 开多仓: %s, 数量: %.4f, 杠杆: %dx (模拟)", symbol, quantity, leverage)
		return map[string]interface{}{
			"orderId": "DRY_RUN_" + symbol + "_LONG",
			"symbol":  symbol,
			"status":  "filled",
		}, nil
	}

	// 先取消该币种的所有委托单
	if err := t.CancelAllOrders(symbol); err != nil {
		log.Printf("  ⚠ 取消旧委托单失败（可能没有委托单）: %v", err)
	}

	// 🔧 获取正确的 posSide（基于账户真实配置）
	posSide := t.getPosSideForTrade("long")
	log.Printf("  📊 开多仓使用 posSide=%s", posSide)

	// 设置杠杆
	if err := t.setLeverageInternal(symbol, leverage, posSide); err != nil {
		return nil, err
	}

	// 格式化数量
	quantityStr, err := t.FormatQuantity(symbol, quantity)
	if err != nil {
		return nil, err
	}

	// 创建市价买入订单
	body := map[string]interface{}{
		"instId":  symbol,
		"tdMode":  "isolated", // 逐仓模式
		"side":    "buy",
		"posSide": posSide, // 🔧 使用检测到的正确 posSide
		"ordType": "market",
		"sz":      quantityStr,
	}

	data, err := t.request(context.Background(), "POST", "/api/v5/trade/order", body)
	if err != nil {
		return nil, fmt.Errorf("开多仓失败: %w", err)
	}

	var orders []struct {
		OrdId   string `json:"ordId"`
		ClOrdId string `json:"clOrdId"`
		SCode   string `json:"sCode"`
		SMsg    string `json:"sMsg"`
	}

	if err := json.Unmarshal(data, &orders); err != nil {
		return nil, fmt.Errorf("解析订单响应失败: %w", err)
	}

	if len(orders) == 0 || orders[0].SCode != "0" {
		msg := "未知错误"
		if len(orders) > 0 {
			msg = orders[0].SMsg
		}
		return nil, fmt.Errorf("下单失败: %s", msg)
	}

	log.Printf("✓ 开多仓成功: %s 数量: %s", symbol, quantityStr)
	log.Printf("  订单ID: %s", orders[0].OrdId)

	result := make(map[string]interface{})
	result["orderId"] = orders[0].OrdId
	result["symbol"] = symbol
	result["status"] = "filled"
	return result, nil
}

// OpenShort 开空仓
func (t *OKXTrader) OpenShort(symbol string, quantity float64, leverage int) (map[string]interface{}, error) {
	// 🔥 Dry Run 模式：只记录日志，不发送真实订单
	if t.dryRun {
		log.Printf("📝 [DRY RUN] 开空仓: %s, 数量: %.4f, 杠杆: %dx (模拟)", symbol, quantity, leverage)
		return map[string]interface{}{
			"orderId": "DRY_RUN_" + symbol + "_SHORT",
			"symbol":  symbol,
			"status":  "filled",
		}, nil
	}

	// 先取消该币种的所有委托单
	if err := t.CancelAllOrders(symbol); err != nil {
		log.Printf("  ⚠ 取消旧委托单失败（可能没有委托单）: %v", err)
	}

	// 🔧 获取正确的 posSide（基于账户真实配置）
	posSide := t.getPosSideForTrade("short")
	log.Printf("  📊 开空仓使用 posSide=%s", posSide)

	// 设置杠杆
	if err := t.setLeverageInternal(symbol, leverage, posSide); err != nil {
		return nil, err
	}

	// 格式化数量
	quantityStr, err := t.FormatQuantity(symbol, quantity)
	if err != nil {
		return nil, err
	}

	// 创建市价卖出订单
	body := map[string]interface{}{
		"instId":  symbol,
		"tdMode":  "isolated", // 逐仓模式
		"side":    "sell",
		"posSide": posSide, // 🔧 使用检测到的正确 posSide
		"ordType": "market",
		"sz":      quantityStr,
	}

	data, err := t.request(context.Background(), "POST", "/api/v5/trade/order", body)
	if err != nil {
		return nil, fmt.Errorf("开空仓失败: %w", err)
	}

	var orders []struct {
		OrdId   string `json:"ordId"`
		ClOrdId string `json:"clOrdId"`
		SCode   string `json:"sCode"`
		SMsg    string `json:"sMsg"`
	}

	if err := json.Unmarshal(data, &orders); err != nil {
		return nil, fmt.Errorf("解析订单响应失败: %w", err)
	}

	if len(orders) == 0 || orders[0].SCode != "0" {
		msg := "未知错误"
		if len(orders) > 0 {
			msg = orders[0].SMsg
		}
		return nil, fmt.Errorf("下单失败: %s", msg)
	}

	log.Printf("✓ 开空仓成功: %s 数量: %s", symbol, quantityStr)
	log.Printf("  订单ID: %s", orders[0].OrdId)

	result := make(map[string]interface{})
	result["orderId"] = orders[0].OrdId
	result["symbol"] = symbol
	result["status"] = "filled"
	return result, nil
}

// CloseLong 平多仓
func (t *OKXTrader) CloseLong(symbol string, quantity float64) (map[string]interface{}, error) {
	// 🔥 Dry Run 模式：只记录日志，不发送真实订单
	if t.dryRun {
		log.Printf("📝 [DRY RUN] 平多仓: %s (模拟)", symbol)
		return map[string]interface{}{
			"orderId": "DRY_RUN_CLOSE_" + symbol + "_LONG",
			"symbol":  symbol,
			"status":  "filled",
		}, nil
	}

	// 获取当前持仓信息（用于获取数量和持仓模式）
	positions, err := t.GetPositions()
	if err != nil {
		return nil, err
	}

	// 查找对应的持仓，获取数量和原始 posSide
	var actualPosSide string
	foundPosition := false
	for _, pos := range positions {
		if pos["symbol"] == symbol && pos["side"] == "long" {
			if quantity == 0 {
				quantity = pos["positionAmt"].(float64)
			}
			// 获取原始的 posSide（可能是 "long" 或 "net"）
			if posSide, ok := pos["posSide"].(string); ok {
				actualPosSide = posSide
			} else {
				actualPosSide = "long" // 默认值
			}
			foundPosition = true
			break
		}
	}

	if !foundPosition || quantity == 0 {
		return nil, fmt.Errorf("没有找到 %s 的多仓", symbol)
	}

	// 🔧 转换symbol格式：PENGU-USDT → PENGU-USDT-SWAP
	// OKX持仓API返回 "XXX-USDT"，但交易API需要 "XXX-USDT-SWAP"
	instId := symbol
	if strings.Contains(symbol, "-") && strings.HasSuffix(symbol, "-USDT") && !strings.HasSuffix(symbol, "-SWAP") {
		instId = symbol + "-SWAP"
	}

	// 格式化数量
	quantityStr, err := t.FormatQuantity(instId, quantity)
	if err != nil {
		return nil, err
	}

	log.Printf("  📊 准备平多仓: symbol=%s, instId=%s, posSide=%s, 原始数量=%.4f, 格式化数量=%s",
		symbol, instId, actualPosSide, quantity, quantityStr)

	// 创建市价卖出订单（平多）
	body := map[string]interface{}{
		"instId":  instId,
		"tdMode":  "isolated",
		"side":    "sell",
		"posSide": actualPosSide, // 🔧 使用持仓的真实 posSide（可能是 "long" 或 "net"）
		"ordType": "market",
		"sz":      quantityStr,
	}

	// 📊 调试日志：打印请求详情
	debugMode := os.Getenv("DEBUG_MODE") == "true"
	if debugMode {
		bodyJSON, _ := json.Marshal(body)
		log.Printf("[DEBUG] OKX CloseLong 请求: symbol=%s → instId=%s, body=%s", symbol, instId, string(bodyJSON))
	}

	data, err := t.request(context.Background(), "POST", "/api/v5/trade/order", body)
	if err != nil {
		log.Printf("❌ OKX API 调用失败: symbol=%s, instId=%s, error=%v", symbol, instId, err)
		return nil, fmt.Errorf("平多仓失败: %w", err)
	}

	var orders []struct {
		OrdId string `json:"ordId"`
		SCode string `json:"sCode"`
		SMsg  string `json:"sMsg"`
	}

	if err := json.Unmarshal(data, &orders); err != nil {
		log.Printf("❌ 解析订单响应失败: data=%s, error=%v", string(data), err)
		return nil, fmt.Errorf("解析订单响应失败: %w", err)
	}

	if len(orders) == 0 || orders[0].SCode != "0" {
		msg := "未知错误"
		sCode := "unknown"
		if len(orders) > 0 {
			msg = orders[0].SMsg
			sCode = orders[0].SCode
		}
		log.Printf("❌ OKX 平仓订单失败: symbol=%s, instId=%s, sCode=%s, sMsg=%s, 完整data=%s",
			symbol, instId, sCode, msg, string(data))
		return nil, fmt.Errorf("平仓失败 (sCode=%s): %s", sCode, msg)
	}

	log.Printf("✓ 平多仓成功: %s (instId: %s) 数量: %s", symbol, instId, quantityStr)

	// 平仓后取消该币种的所有挂单
	if err := t.CancelAllOrders(instId); err != nil {
		log.Printf("  ⚠ 取消挂单失败: %v", err)
	}

	result := make(map[string]interface{})
	result["orderId"] = orders[0].OrdId
	result["symbol"] = symbol
	result["status"] = "filled"
	return result, nil
}

// CloseShort 平空仓
func (t *OKXTrader) CloseShort(symbol string, quantity float64) (map[string]interface{}, error) {
	// 🔥 Dry Run 模式：只记录日志，不发送真实订单
	if t.dryRun {
		log.Printf("📝 [DRY RUN] 平空仓: %s (模拟)", symbol)
		return map[string]interface{}{
			"orderId": "DRY_RUN_CLOSE_" + symbol + "_SHORT",
			"symbol":  symbol,
			"status":  "filled",
		}, nil
	}

	// 获取当前持仓信息（用于获取数量和持仓模式）
	positions, err := t.GetPositions()
	if err != nil {
		return nil, err
	}

	// 查找对应的持仓，获取数量和原始 posSide
	var actualPosSide string
	foundPosition := false
	for _, pos := range positions {
		if pos["symbol"] == symbol && pos["side"] == "short" {
			if quantity == 0 {
				quantity = pos["positionAmt"].(float64)
			}
			// 获取原始的 posSide（可能是 "short" 或 "net"）
			if posSide, ok := pos["posSide"].(string); ok {
				actualPosSide = posSide
			} else {
				actualPosSide = "short" // 默认值
			}
			foundPosition = true
			break
		}
	}

	if !foundPosition || quantity == 0 {
		return nil, fmt.Errorf("没有找到 %s 的空仓", symbol)
	}

	// 🔧 转换symbol格式：PENGU-USDT → PENGU-USDT-SWAP
	// OKX持仓API返回 "XXX-USDT"，但交易API需要 "XXX-USDT-SWAP"
	instId := symbol
	if strings.Contains(symbol, "-") && strings.HasSuffix(symbol, "-USDT") && !strings.HasSuffix(symbol, "-SWAP") {
		instId = symbol + "-SWAP"
	}

	// 格式化数量
	quantityStr, err := t.FormatQuantity(instId, quantity)
	if err != nil {
		return nil, err
	}

	log.Printf("  📊 准备平空仓: symbol=%s, instId=%s, posSide=%s, 原始数量=%.4f, 格式化数量=%s",
		symbol, instId, actualPosSide, quantity, quantityStr)

	// 创建市价买入订单（平空）
	body := map[string]interface{}{
		"instId":  instId,
		"tdMode":  "isolated",
		"side":    "buy",
		"posSide": actualPosSide, // 🔧 使用持仓的真实 posSide（可能是 "short" 或 "net"）
		"ordType": "market",
		"sz":      quantityStr,
	}

	// 📊 调试日志：打印请求详情
	debugMode := os.Getenv("DEBUG_MODE") == "true"
	if debugMode {
		bodyJSON, _ := json.Marshal(body)
		log.Printf("[DEBUG] OKX CloseShort 请求: symbol=%s → instId=%s, body=%s", symbol, instId, string(bodyJSON))
	}

	data, err := t.request(context.Background(), "POST", "/api/v5/trade/order", body)
	if err != nil {
		if debugMode {
			log.Printf("[DEBUG] OKX CloseShort 失败: symbol=%s, instId=%s, error=%v", symbol, instId, err)
		}
		return nil, fmt.Errorf("平空仓失败: %w", err)
	}

	var orders []struct {
		OrdId string `json:"ordId"`
		SCode string `json:"sCode"`
		SMsg  string `json:"sMsg"`
	}

	if err := json.Unmarshal(data, &orders); err != nil {
		return nil, fmt.Errorf("解析订单响应失败: %w", err)
	}

	if len(orders) == 0 || orders[0].SCode != "0" {
		msg := "未知错误"
		if len(orders) > 0 {
			msg = orders[0].SMsg
		}
		if debugMode {
			log.Printf("[DEBUG] OKX CloseShort 订单失败: symbol=%s, instId=%s, sCode=%s, sMsg=%s",
				symbol, instId, orders[0].SCode, msg)
		}
		return nil, fmt.Errorf("平仓失败: %s", msg)
	}

	log.Printf("✓ 平空仓成功: %s (instId: %s) 数量: %s", symbol, instId, quantityStr)

	// 平仓后取消该币种的所有挂单
	if err := t.CancelAllOrders(instId); err != nil {
		log.Printf("  ⚠ 取消挂单失败: %v", err)
	}

	result := make(map[string]interface{})
	result["orderId"] = orders[0].OrdId
	result["symbol"] = symbol
	result["status"] = "filled"
	return result, nil
}

// CancelAllOrders 取消该币种的所有挂单
func (t *OKXTrader) CancelAllOrders(symbol string) error {
	body := map[string]interface{}{
		"instId": symbol,
	}

	_, err := t.request(context.Background(), "POST", "/api/v5/trade/cancel-all-after", body)
	if err != nil {
		// 如果没有挂单，不算错误
		return nil
	}

	log.Printf("  ✓ 已取消 %s 的所有挂单", symbol)
	return nil
}

// GetMarketPrice 获取市场价格
func (t *OKXTrader) GetMarketPrice(symbol string) (float64, error) {
	path := fmt.Sprintf("/api/v5/market/ticker?instId=%s", symbol)
	data, err := t.request(context.Background(), "GET", path, nil)
	if err != nil {
		return 0, fmt.Errorf("获取价格失败: %w", err)
	}

	var tickers []struct {
		Last string `json:"last"`
	}

	if err := json.Unmarshal(data, &tickers); err != nil {
		return 0, fmt.Errorf("解析价格数据失败: %w", err)
	}

	if len(tickers) == 0 {
		return 0, fmt.Errorf("未找到价格")
	}

	price, err := strconv.ParseFloat(tickers[0].Last, 64)
	if err != nil {
		return 0, err
	}

	return price, nil
}

// SetStopLoss 设置止损单
func (t *OKXTrader) SetStopLoss(symbol string, positionSide string, quantity, stopPrice float64) error {
	var side string
	var posSide string

	if positionSide == "LONG" {
		side = "sell"
		posSide = "long"
	} else {
		side = "buy"
		posSide = "short"
	}

	// 格式化数量
	quantityStr, err := t.FormatQuantity(symbol, quantity)
	if err != nil {
		return err
	}

	body := map[string]interface{}{
		"instId":    symbol,
		"tdMode":    "isolated",
		"side":      side,
		"posSide":   posSide,
		"ordType":   "conditional",
		"sz":        quantityStr,
		"triggerPx": fmt.Sprintf("%.8f", stopPrice),
		"orderPx":   "-1", // 市价
	}

	_, err = t.request(context.Background(), "POST", "/api/v5/trade/order-algo", body)
	if err != nil {
		return fmt.Errorf("设置止损失败: %w", err)
	}

	log.Printf("  止损价设置: %.4f", stopPrice)
	return nil
}

// SetTakeProfit 设置止盈单
func (t *OKXTrader) SetTakeProfit(symbol string, positionSide string, quantity, takeProfitPrice float64) error {
	var side string
	var posSide string

	if positionSide == "LONG" {
		side = "sell"
		posSide = "long"
	} else {
		side = "buy"
		posSide = "short"
	}

	// 格式化数量
	quantityStr, err := t.FormatQuantity(symbol, quantity)
	if err != nil {
		return err
	}

	body := map[string]interface{}{
		"instId":    symbol,
		"tdMode":    "isolated",
		"side":      side,
		"posSide":   posSide,
		"ordType":   "conditional",
		"sz":        quantityStr,
		"triggerPx": fmt.Sprintf("%.8f", takeProfitPrice),
		"orderPx":   "-1", // 市价
	}

	_, err = t.request(context.Background(), "POST", "/api/v5/trade/order-algo", body)
	if err != nil {
		return fmt.Errorf("设置止盈失败: %w", err)
	}

	log.Printf("  止盈价设置: %.4f", takeProfitPrice)
	return nil
}

// GetSymbolPrecision 获取交易对的数量精度
func (t *OKXTrader) GetSymbolPrecision(symbol string) (int, error) {
	path := fmt.Sprintf("/api/v5/public/instruments?instType=SWAP&instId=%s", symbol)
	data, err := t.request(context.Background(), "GET", path, nil)
	if err != nil {
		return 0, fmt.Errorf("获取交易规则失败: %w", err)
	}

	var instruments []struct {
		LotSz string `json:"lotSz"`
	}

	if err := json.Unmarshal(data, &instruments); err != nil {
		return 0, fmt.Errorf("解析交易规则失败: %w", err)
	}

	if len(instruments) == 0 {
		log.Printf("  ⚠ %s 未找到精度信息，使用默认精度3", symbol)
		return 3, nil
	}

	precision := calculatePrecision(instruments[0].LotSz)
	log.Printf("  %s 数量精度: %d (lotSz: %s)", symbol, precision, instruments[0].LotSz)
	return precision, nil
}

// FormatQuantity 格式化数量到正确的精度
func (t *OKXTrader) FormatQuantity(symbol string, quantity float64) (string, error) {
	precision, err := t.GetSymbolPrecision(symbol)
	if err != nil {
		// 如果获取失败，使用默认格式
		return fmt.Sprintf("%.3f", quantity), nil
	}

	format := fmt.Sprintf("%%.%df", precision)
	return fmt.Sprintf(format, quantity), nil
}
