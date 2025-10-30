package trader

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"
)

// MockTrader 模拟交易器 (Paper Trading)
// 无需真实API Key，使用公开市场数据进行模拟交易
type MockTrader struct {
	exchange string // 模拟的交易所 ("binance", "okx", etc.)
	client   *http.Client

	// 虚拟账户
	initialBalance   float64
	availableBalance float64
	totalEquity      float64
	unrealizedPnL    float64
	accountMutex     sync.RWMutex

	// 虚拟持仓
	positions      map[string]*MockPosition
	positionsMutex sync.RWMutex

	// 已完成的交易历史（用于统计）
	closedTrades      []MockTrade
	closedTradesMutex sync.RWMutex

	// 缓存
	cacheDuration       time.Duration
	priceCache          map[string]*priceCache
	priceCacheMutex     sync.RWMutex
	precisionCache      map[string]int
	precisionCacheMutex sync.RWMutex
}

// MockPosition 虚拟持仓
type MockPosition struct {
	Symbol           string
	Side             string  // "long" or "short"
	EntryPrice       float64
	Quantity         float64
	Leverage         int
	MarginUsed       float64
	OpenTime         time.Time
	UnrealizedPnL    float64
	LiquidationPrice float64
}

// MockTrade 已完成的交易
type MockTrade struct {
	Symbol     string
	Side       string
	EntryPrice float64
	ExitPrice  float64
	Quantity   float64
	Leverage   int
	PnL        float64
	PnLPercent float64
	OpenTime   time.Time
	CloseTime  time.Time
}

type priceCache struct {
	price     float64
	timestamp time.Time
}

// NewMockTrader 创建模拟交易器
func NewMockTrader(exchange string, initialBalance float64) *MockTrader {
	log.Printf("🎮 创建模拟交易器 (Paper Trading)")
	log.Printf("  📊 交易所: %s (模拟)", exchange)
	log.Printf("  💰 初始资金: %.2f USDT (虚拟)", initialBalance)
	log.Printf("  ✅ 无需API Key，使用公开市场数据")

	return &MockTrader{
		exchange:         exchange,
		client:           &http.Client{Timeout: 10 * time.Second},
		initialBalance:   initialBalance,
		availableBalance: initialBalance,
		totalEquity:      initialBalance,
		positions:        make(map[string]*MockPosition),
		closedTrades:     make([]MockTrade, 0),
		cacheDuration:    5 * time.Second, // 5秒价格缓存
		priceCache:       make(map[string]*priceCache),
		precisionCache:   make(map[string]int),
	}
}

// GetBalance 获取虚拟账户余额
func (t *MockTrader) GetBalance() (map[string]interface{}, error) {
	t.accountMutex.RLock()
	defer t.accountMutex.RUnlock()

	// 计算未实现盈亏
	unrealizedPnL := 0.0
	t.positionsMutex.RLock()
	for _, pos := range t.positions {
		unrealizedPnL += pos.UnrealizedPnL
	}
	t.positionsMutex.RUnlock()

	totalEquity := t.availableBalance + unrealizedPnL

	result := make(map[string]interface{})
	result["totalWalletBalance"] = totalEquity
	result["availableBalance"] = t.availableBalance
	result["totalUnrealizedProfit"] = unrealizedPnL

	log.Printf("✓ 模拟账户: 总权益=%.2f, 可用=%.2f, 未实现盈亏=%.2f",
		totalEquity, t.availableBalance, unrealizedPnL)

	return result, nil
}

// GetPositions 获取虚拟持仓
func (t *MockTrader) GetPositions() ([]map[string]interface{}, error) {
	t.positionsMutex.RLock()
	defer t.positionsMutex.RUnlock()

	var result []map[string]interface{}

	for symbol, pos := range t.positions {
		// 更新持仓的当前价格和未实现盈亏
		currentPrice, err := t.GetMarketPrice(symbol)
		if err != nil {
			log.Printf("⚠ 获取%s价格失败: %v", symbol, err)
			continue
		}

		// 计算未实现盈亏
		var unrealizedPnL float64
		if pos.Side == "long" {
			unrealizedPnL = (currentPrice - pos.EntryPrice) * pos.Quantity
		} else {
			unrealizedPnL = (pos.EntryPrice - currentPrice) * pos.Quantity
		}
		pos.UnrealizedPnL = unrealizedPnL

		// 计算清算价格（简化版）
		var liqPrice float64
		if pos.Side == "long" {
			liqPrice = pos.EntryPrice * (1 - 0.9/float64(pos.Leverage))
		} else {
			liqPrice = pos.EntryPrice * (1 + 0.9/float64(pos.Leverage))
		}
		pos.LiquidationPrice = liqPrice

		posMap := make(map[string]interface{})
		posMap["symbol"] = pos.Symbol
		posMap["side"] = pos.Side
		posMap["positionAmt"] = pos.Quantity
		posMap["entryPrice"] = pos.EntryPrice
		posMap["markPrice"] = currentPrice
		posMap["unRealizedProfit"] = unrealizedPnL
		posMap["leverage"] = float64(pos.Leverage)
		posMap["liquidationPrice"] = liqPrice

		result = append(result, posMap)
	}

	return result, nil
}

// OpenLong 开多仓（模拟）
func (t *MockTrader) OpenLong(symbol string, quantity float64, leverage int) (map[string]interface{}, error) {
	// 检查是否已有持仓
	t.positionsMutex.RLock()
	if _, exists := t.positions[symbol]; exists {
		t.positionsMutex.RUnlock()
		return nil, fmt.Errorf("已有%s持仓，请先平仓", symbol)
	}
	t.positionsMutex.RUnlock()

	// 获取当前价格
	price, err := t.GetMarketPrice(symbol)
	if err != nil {
		return nil, fmt.Errorf("获取价格失败: %w", err)
	}

	// 计算所需保证金
	positionValue := price * quantity
	marginRequired := positionValue / float64(leverage)

	// 检查可用余额
	t.accountMutex.RLock()
	if marginRequired > t.availableBalance {
		t.accountMutex.RUnlock()
		return nil, fmt.Errorf("保证金不足: 需要%.2f USDT, 可用%.2f USDT",
			marginRequired, t.availableBalance)
	}
	t.accountMutex.RUnlock()

	// 扣除保证金
	t.accountMutex.Lock()
	t.availableBalance -= marginRequired
	t.accountMutex.Unlock()

	// 创建持仓
	position := &MockPosition{
		Symbol:       symbol,
		Side:         "long",
		EntryPrice:   price,
		Quantity:     quantity,
		Leverage:     leverage,
		MarginUsed:   marginRequired,
		OpenTime:     time.Now(),
		UnrealizedPnL: 0,
	}

	t.positionsMutex.Lock()
	t.positions[symbol] = position
	t.positionsMutex.Unlock()

	log.Printf("✓ 模拟开多仓: %s 数量: %.4f 价格: %.4f 杠杆: %dx 保证金: %.2f",
		symbol, quantity, price, leverage, marginRequired)

	result := make(map[string]interface{})
	result["orderId"] = fmt.Sprintf("mock_%d", time.Now().UnixNano())
	result["symbol"] = symbol
	result["status"] = "filled"
	return result, nil
}

// OpenShort 开空仓（模拟）
func (t *MockTrader) OpenShort(symbol string, quantity float64, leverage int) (map[string]interface{}, error) {
	// 检查是否已有持仓
	t.positionsMutex.RLock()
	if _, exists := t.positions[symbol]; exists {
		t.positionsMutex.RUnlock()
		return nil, fmt.Errorf("已有%s持仓，请先平仓", symbol)
	}
	t.positionsMutex.RUnlock()

	// 获取当前价格
	price, err := t.GetMarketPrice(symbol)
	if err != nil {
		return nil, fmt.Errorf("获取价格失败: %w", err)
	}

	// 计算所需保证金
	positionValue := price * quantity
	marginRequired := positionValue / float64(leverage)

	// 检查可用余额
	t.accountMutex.RLock()
	if marginRequired > t.availableBalance {
		t.accountMutex.RUnlock()
		return nil, fmt.Errorf("保证金不足: 需要%.2f USDT, 可用%.2f USDT",
			marginRequired, t.availableBalance)
	}
	t.accountMutex.RUnlock()

	// 扣除保证金
	t.accountMutex.Lock()
	t.availableBalance -= marginRequired
	t.accountMutex.Unlock()

	// 创建持仓
	position := &MockPosition{
		Symbol:       symbol,
		Side:         "short",
		EntryPrice:   price,
		Quantity:     quantity,
		Leverage:     leverage,
		MarginUsed:   marginRequired,
		OpenTime:     time.Now(),
		UnrealizedPnL: 0,
	}

	t.positionsMutex.Lock()
	t.positions[symbol] = position
	t.positionsMutex.Unlock()

	log.Printf("✓ 模拟开空仓: %s 数量: %.4f 价格: %.4f 杠杆: %dx 保证金: %.2f",
		symbol, quantity, price, leverage, marginRequired)

	result := make(map[string]interface{})
	result["orderId"] = fmt.Sprintf("mock_%d", time.Now().UnixNano())
	result["symbol"] = symbol
	result["status"] = "filled"
	return result, nil
}

// CloseLong 平多仓（模拟）
func (t *MockTrader) CloseLong(symbol string, quantity float64) (map[string]interface{}, error) {
	t.positionsMutex.Lock()
	defer t.positionsMutex.Unlock()

	position, exists := t.positions[symbol]
	if !exists || position.Side != "long" {
		return nil, fmt.Errorf("没有找到 %s 的多仓", symbol)
	}

	// 获取当前价格
	exitPrice, err := t.GetMarketPrice(symbol)
	if err != nil {
		return nil, fmt.Errorf("获取价格失败: %w", err)
	}

	// 计算盈亏
	pnl := (exitPrice - position.EntryPrice) * position.Quantity
	pnlPercent := ((exitPrice - position.EntryPrice) / position.EntryPrice) * 100 * float64(position.Leverage)

	// 归还保证金 + 盈亏
	t.accountMutex.Lock()
	t.availableBalance += position.MarginUsed + pnl
	t.accountMutex.Unlock()

	// 记录交易历史
	trade := MockTrade{
		Symbol:     symbol,
		Side:       "long",
		EntryPrice: position.EntryPrice,
		ExitPrice:  exitPrice,
		Quantity:   position.Quantity,
		Leverage:   position.Leverage,
		PnL:        pnl,
		PnLPercent: pnlPercent,
		OpenTime:   position.OpenTime,
		CloseTime:  time.Now(),
	}

	t.closedTradesMutex.Lock()
	t.closedTrades = append(t.closedTrades, trade)
	t.closedTradesMutex.Unlock()

	// 删除持仓
	delete(t.positions, symbol)

	log.Printf("✓ 模拟平多仓: %s 入场: %.4f 出场: %.4f 盈亏: %.2f USDT (%.2f%%)",
		symbol, position.EntryPrice, exitPrice, pnl, pnlPercent)

	result := make(map[string]interface{})
	result["orderId"] = fmt.Sprintf("mock_%d", time.Now().UnixNano())
	result["symbol"] = symbol
	result["status"] = "filled"
	return result, nil
}

// CloseShort 平空仓（模拟）
func (t *MockTrader) CloseShort(symbol string, quantity float64) (map[string]interface{}, error) {
	t.positionsMutex.Lock()
	defer t.positionsMutex.Unlock()

	position, exists := t.positions[symbol]
	if !exists || position.Side != "short" {
		return nil, fmt.Errorf("没有找到 %s 的空仓", symbol)
	}

	// 获取当前价格
	exitPrice, err := t.GetMarketPrice(symbol)
	if err != nil {
		return nil, fmt.Errorf("获取价格失败: %w", err)
	}

	// 计算盈亏
	pnl := (position.EntryPrice - exitPrice) * position.Quantity
	pnlPercent := ((position.EntryPrice - exitPrice) / position.EntryPrice) * 100 * float64(position.Leverage)

	// 归还保证金 + 盈亏
	t.accountMutex.Lock()
	t.availableBalance += position.MarginUsed + pnl
	t.accountMutex.Unlock()

	// 记录交易历史
	trade := MockTrade{
		Symbol:     symbol,
		Side:       "short",
		EntryPrice: position.EntryPrice,
		ExitPrice:  exitPrice,
		Quantity:   position.Quantity,
		Leverage:   position.Leverage,
		PnL:        pnl,
		PnLPercent: pnlPercent,
		OpenTime:   position.OpenTime,
		CloseTime:  time.Now(),
	}

	t.closedTradesMutex.Lock()
	t.closedTrades = append(t.closedTrades, trade)
	t.closedTradesMutex.Unlock()

	// 删除持仓
	delete(t.positions, symbol)

	log.Printf("✓ 模拟平空仓: %s 入场: %.4f 出场: %.4f 盈亏: %.2f USDT (%.2f%%)",
		symbol, position.EntryPrice, exitPrice, pnl, pnlPercent)

	result := make(map[string]interface{})
	result["orderId"] = fmt.Sprintf("mock_%d", time.Now().UnixNano())
	result["symbol"] = symbol
	result["status"] = "filled"
	return result, nil
}

// SetLeverage 设置杠杆（模拟，直接返回成功）
func (t *MockTrader) SetLeverage(symbol string, leverage int) error {
	log.Printf("  ✓ 模拟设置 %s 杠杆为 %dx", symbol, leverage)
	return nil
}

// GetMarketPrice 获取市场价格（使用Binance公开API）
func (t *MockTrader) GetMarketPrice(symbol string) (float64, error) {
	// 检查缓存
	t.priceCacheMutex.RLock()
	if cache, exists := t.priceCache[symbol]; exists {
		if time.Since(cache.timestamp) < t.cacheDuration {
			t.priceCacheMutex.RUnlock()
			return cache.price, nil
		}
	}
	t.priceCacheMutex.RUnlock()

	// 使用Binance公开API获取价格（无需认证）
	url := fmt.Sprintf("https://fapi.binance.com/fapi/v1/ticker/price?symbol=%s", symbol)
	resp, err := t.client.Get(url)
	if err != nil {
		return 0, fmt.Errorf("获取价格失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, fmt.Errorf("读取响应失败: %w", err)
	}

	var result struct {
		Price string `json:"price"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return 0, fmt.Errorf("解析价格失败: %w", err)
	}

	price, err := strconv.ParseFloat(result.Price, 64)
	if err != nil {
		return 0, err
	}

	// 更新缓存
	t.priceCacheMutex.Lock()
	t.priceCache[symbol] = &priceCache{
		price:     price,
		timestamp: time.Now(),
	}
	t.priceCacheMutex.Unlock()

	return price, nil
}

// SetStopLoss 设置止损（模拟，直接返回成功）
func (t *MockTrader) SetStopLoss(symbol string, positionSide string, quantity, stopPrice float64) error {
	log.Printf("  ✓ 模拟设置止损: %s %.4f", symbol, stopPrice)
	return nil
}

// SetTakeProfit 设置止盈（模拟，直接返回成功）
func (t *MockTrader) SetTakeProfit(symbol string, positionSide string, quantity, takeProfitPrice float64) error {
	log.Printf("  ✓ 模拟设置止盈: %s %.4f", symbol, takeProfitPrice)
	return nil
}

// CancelAllOrders 取消所有挂单（模拟，直接返回成功）
func (t *MockTrader) CancelAllOrders(symbol string) error {
	log.Printf("  ✓ 模拟取消 %s 所有挂单", symbol)
	return nil
}

// GetSymbolPrecision 获取交易对精度（使用Binance公开API）
func (t *MockTrader) GetSymbolPrecision(symbol string) (int, error) {
	// 检查缓存
	t.precisionCacheMutex.RLock()
	if precision, exists := t.precisionCache[symbol]; exists {
		t.precisionCacheMutex.RUnlock()
		return precision, nil
	}
	t.precisionCacheMutex.RUnlock()

	// 使用Binance公开API获取交易规则
	url := "https://fapi.binance.com/fapi/v1/exchangeInfo"
	resp, err := t.client.Get(url)
	if err != nil {
		return 3, nil // 默认精度
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 3, nil
	}

	var result struct {
		Symbols []struct {
			Symbol  string `json:"symbol"`
			Filters []map[string]interface{} `json:"filters"`
		} `json:"symbols"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return 3, nil
	}

	for _, s := range result.Symbols {
		if s.Symbol == symbol {
			for _, filter := range s.Filters {
				if filter["filterType"] == "LOT_SIZE" {
					stepSize := filter["stepSize"].(string)
					precision := calculatePrecision(stepSize)

					// 缓存精度
					t.precisionCacheMutex.Lock()
					t.precisionCache[symbol] = precision
					t.precisionCacheMutex.Unlock()

					return precision, nil
				}
			}
		}
	}

	return 3, nil // 默认精度
}

// FormatQuantity 格式化数量到正确精度
func (t *MockTrader) FormatQuantity(symbol string, quantity float64) (string, error) {
	precision, err := t.GetSymbolPrecision(symbol)
	if err != nil {
		return fmt.Sprintf("%.3f", quantity), nil
	}

	format := fmt.Sprintf("%%.%df", precision)
	return fmt.Sprintf(format, quantity), nil
}

// GetTradeStatistics 获取交易统计（用于展示模拟交易结果）
func (t *MockTrader) GetTradeStatistics() map[string]interface{} {
	t.closedTradesMutex.RLock()
	defer t.closedTradesMutex.RUnlock()

	stats := make(map[string]interface{})

	totalTrades := len(t.closedTrades)
	if totalTrades == 0 {
		stats["total_trades"] = 0
		stats["win_rate"] = 0.0
		stats["total_pnl"] = 0.0
		stats["roi"] = 0.0
		return stats
	}

	winTrades := 0
	totalPnL := 0.0

	for _, trade := range t.closedTrades {
		totalPnL += trade.PnL
		if trade.PnL > 0 {
			winTrades++
		}
	}

	winRate := float64(winTrades) / float64(totalTrades) * 100
	roi := (totalPnL / t.initialBalance) * 100

	stats["total_trades"] = totalTrades
	stats["win_trades"] = winTrades
	stats["lose_trades"] = totalTrades - winTrades
	stats["win_rate"] = winRate
	stats["total_pnl"] = totalPnL
	stats["roi"] = roi
	stats["initial_balance"] = t.initialBalance

	t.accountMutex.RLock()
	stats["current_equity"] = t.availableBalance + t.unrealizedPnL
	t.accountMutex.RUnlock()

	return stats
}
