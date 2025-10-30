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
	"strconv"
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
		return nil, fmt.Errorf("API返回错误: code=%s, msg=%s", apiResp.Code, apiResp.Msg)
	}

	return apiResp.Data, nil
}

// GetBalance 获取账户余额（带缓存）
func (t *OKXTrader) GetBalance() (map[string]interface{}, error) {
	// 🔥 Dry Run 模式：返回模拟账户数据
	if t.dryRun {
		result := make(map[string]interface{})
		result["totalWalletBalance"] = 1000.0  // 模拟初始余额
		result["availableBalance"] = 1000.0     // 全部可用
		result["totalUnrealizedProfit"] = 0.0   // 无未实现盈亏
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
		InstId    string `json:"instId"`
		Pos       string `json:"pos"`
		AvgPx     string `json:"avgPx"`
		MarkPx    string `json:"markPx"`
		Upl       string `json:"upl"`
		Lever     string `json:"lever"`
		LiqPx     string `json:"liqPx"`
		PosSide   string `json:"posSide"`
		MgnMode   string `json:"mgnMode"`
	}

	if err := json.Unmarshal(data, &positions); err != nil {
		return nil, fmt.Errorf("解析持仓数据失败: %w", err)
	}

	var result []map[string]interface{}
	for _, pos := range positions {
		posAmt, _ := strconv.ParseFloat(pos.Pos, 64)
		if posAmt == 0 {
			continue // 跳过无持仓的
		}

		posMap := make(map[string]interface{})
		posMap["symbol"] = pos.InstId
		posMap["positionAmt"] = posAmt
		posMap["entryPrice"], _ = strconv.ParseFloat(pos.AvgPx, 64)
		posMap["markPrice"], _ = strconv.ParseFloat(pos.MarkPx, 64)
		posMap["unRealizedProfit"], _ = strconv.ParseFloat(pos.Upl, 64)
		posMap["leverage"], _ = strconv.ParseFloat(pos.Lever, 64)
		posMap["liquidationPrice"], _ = strconv.ParseFloat(pos.LiqPx, 64)

		// 判断方向
		if pos.PosSide == "long" {
			posMap["side"] = "long"
		} else if pos.PosSide == "short" {
			posMap["side"] = "short"
		}

		result = append(result, posMap)
	}

	// 更新缓存
	t.positionsCacheMutex.Lock()
	t.cachedPositions = result
	t.positionsCacheTime = time.Now()
	t.positionsCacheMutex.Unlock()

	return result, nil
}

// SetLeverage 设置杠杆
func (t *OKXTrader) SetLeverage(symbol string, leverage int) error {
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
	}

	_, err = t.request(context.Background(), "POST", "/api/v5/account/set-leverage", body)
	if err != nil {
		return fmt.Errorf("设置杠杆失败: %w", err)
	}

	log.Printf("  ✓ %s 杠杆已切换为 %dx", symbol, leverage)

	// 切换杠杆后等待3秒
	log.Printf("  ⏱ 等待3秒冷却期...")
	time.Sleep(3 * time.Second)

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

	// 设置杠杆
	if err := t.SetLeverage(symbol, leverage); err != nil {
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
		"posSide": "long",
		"ordType": "market",
		"sz":      quantityStr,
	}

	data, err := t.request(context.Background(), "POST", "/api/v5/trade/order", body)
	if err != nil {
		return nil, fmt.Errorf("开多仓失败: %w", err)
	}

	var orders []struct {
		OrdId  string `json:"ordId"`
		ClOrdId string `json:"clOrdId"`
		SCode  string `json:"sCode"`
		SMsg   string `json:"sMsg"`
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

	// 设置杠杆
	if err := t.SetLeverage(symbol, leverage); err != nil {
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
		"posSide": "short",
		"ordType": "market",
		"sz":      quantityStr,
	}

	data, err := t.request(context.Background(), "POST", "/api/v5/trade/order", body)
	if err != nil {
		return nil, fmt.Errorf("开空仓失败: %w", err)
	}

	var orders []struct {
		OrdId  string `json:"ordId"`
		ClOrdId string `json:"clOrdId"`
		SCode  string `json:"sCode"`
		SMsg   string `json:"sMsg"`
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

	// 如果数量为0，获取当前持仓数量
	if quantity == 0 {
		positions, err := t.GetPositions()
		if err != nil {
			return nil, err
		}

		for _, pos := range positions {
			if pos["symbol"] == symbol && pos["side"] == "long" {
				quantity = pos["positionAmt"].(float64)
				break
			}
		}

		if quantity == 0 {
			return nil, fmt.Errorf("没有找到 %s 的多仓", symbol)
		}
	}

	// 格式化数量
	quantityStr, err := t.FormatQuantity(symbol, quantity)
	if err != nil {
		return nil, err
	}

	// 创建市价卖出订单（平多）
	body := map[string]interface{}{
		"instId":  symbol,
		"tdMode":  "isolated",
		"side":    "sell",
		"posSide": "long",
		"ordType": "market",
		"sz":      quantityStr,
	}

	data, err := t.request(context.Background(), "POST", "/api/v5/trade/order", body)
	if err != nil {
		return nil, fmt.Errorf("平多仓失败: %w", err)
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
		return nil, fmt.Errorf("平仓失败: %s", msg)
	}

	log.Printf("✓ 平多仓成功: %s 数量: %s", symbol, quantityStr)

	// 平仓后取消该币种的所有挂单
	if err := t.CancelAllOrders(symbol); err != nil {
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

	// 如果数量为0，获取当前持仓数量
	if quantity == 0 {
		positions, err := t.GetPositions()
		if err != nil {
			return nil, err
		}

		for _, pos := range positions {
			if pos["symbol"] == symbol && pos["side"] == "short" {
				quantity = pos["positionAmt"].(float64)
				break
			}
		}

		if quantity == 0 {
			return nil, fmt.Errorf("没有找到 %s 的空仓", symbol)
		}
	}

	// 格式化数量
	quantityStr, err := t.FormatQuantity(symbol, quantity)
	if err != nil {
		return nil, err
	}

	// 创建市价买入订单（平空）
	body := map[string]interface{}{
		"instId":  symbol,
		"tdMode":  "isolated",
		"side":    "buy",
		"posSide": "short",
		"ordType": "market",
		"sz":      quantityStr,
	}

	data, err := t.request(context.Background(), "POST", "/api/v5/trade/order", body)
	if err != nil {
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
		return nil, fmt.Errorf("平仓失败: %s", msg)
	}

	log.Printf("✓ 平空仓成功: %s 数量: %s", symbol, quantityStr)

	// 平仓后取消该币种的所有挂单
	if err := t.CancelAllOrders(symbol); err != nil {
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
