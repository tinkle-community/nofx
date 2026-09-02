package mexcpaper

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"nofx/market"
	"nofx/trader/types"
)

const (
	DefaultInitialBalance = 10000.0
	defaultFeeRate        = 0.0005
)

type priceProvider interface {
	GetPrice(symbol string) (float64, error)
}

type mexcPublicPrices struct{}

func (mexcPublicPrices) GetPrice(symbol string) (float64, error) {
	return market.GetMEXCPrice(symbol)
}

type paperPosition struct {
	Symbol     string  `json:"symbol"`
	Side       string  `json:"side"`
	Quantity   float64 `json:"quantity"`
	EntryPrice float64 `json:"entry_price"`
	Leverage   int     `json:"leverage"`
	Margin     float64 `json:"margin"`
	OpenedAt   int64   `json:"opened_at"`
}

type paperOrder struct {
	ID           string  `json:"id"`
	Symbol       string  `json:"symbol"`
	Side         string  `json:"side"`
	PositionSide string  `json:"position_side"`
	Type         string  `json:"type"`
	Price        float64 `json:"price"`
	StopPrice    float64 `json:"stop_price"`
	Quantity     float64 `json:"quantity"`
	ExecutedQty  float64 `json:"executed_qty"`
	AveragePrice float64 `json:"average_price"`
	Commission   float64 `json:"commission"`
	Status       string  `json:"status"`
	CreatedAt    int64   `json:"created_at"`
}

type closedRecord struct {
	Symbol      string  `json:"symbol"`
	Side        string  `json:"side"`
	EntryPrice  float64 `json:"entry_price"`
	ExitPrice   float64 `json:"exit_price"`
	Quantity    float64 `json:"quantity"`
	RealizedPnL float64 `json:"realized_pnl"`
	Fee         float64 `json:"fee"`
	Leverage    int     `json:"leverage"`
	EntryTime   int64   `json:"entry_time"`
	ExitTime    int64   `json:"exit_time"`
	OrderID     string  `json:"order_id"`
	CloseType   string  `json:"close_type"`
}

type paperState struct {
	InitialBalance float64                   `json:"initial_balance"`
	Available      float64                   `json:"available"`
	FeeRate        float64                   `json:"fee_rate"`
	NextOrderID    int64                     `json:"next_order_id"`
	Positions      map[string]*paperPosition `json:"positions"`
	Orders         map[string]*paperOrder    `json:"orders"`
	Closed         []closedRecord            `json:"closed"`
	Leverage       map[string]int            `json:"leverage"`
	CrossMargin    map[string]bool           `json:"cross_margin"`
	UpdatedAt      int64                     `json:"updated_at"`
}

type accountStore struct {
	mu    sync.Mutex
	path  string
	state paperState
}

var accountRegistry = struct {
	sync.Mutex
	stores map[string]*accountStore
}{stores: make(map[string]*accountStore)}

// Trader simulates a USDT-margined futures account while reading prices only
// from MEXC's unauthenticated public API.
type Trader struct {
	account *accountStore
	prices  priceProvider
}

func NewMEXCPaperTrader(accountID string, initialBalance float64) (*Trader, error) {
	dataDir := strings.TrimSpace(os.Getenv("NOFX_MEXC_PAPER_DATA_DIR"))
	if dataDir == "" {
		dataDir = filepath.Join("data", "mexc-paper")
	}
	return newMEXCPaperTrader(accountID, initialBalance, dataDir, mexcPublicPrices{})
}

func newMEXCPaperTrader(accountID string, initialBalance float64, dataDir string, prices priceProvider) (*Trader, error) {
	accountID = sanitizeAccountID(accountID)
	if accountID == "" {
		return nil, errors.New("MEXC paper account ID is required")
	}
	if initialBalance <= 0 {
		initialBalance = DefaultInitialBalance
	}
	absDir, err := filepath.Abs(dataDir)
	if err != nil {
		return nil, fmt.Errorf("resolve MEXC paper data directory: %w", err)
	}
	if err := os.MkdirAll(absDir, 0o700); err != nil {
		return nil, fmt.Errorf("create MEXC paper data directory: %w", err)
	}
	path := filepath.Join(absDir, accountID+".json")

	accountRegistry.Lock()
	account := accountRegistry.stores[path]
	if account == nil {
		account = &accountStore{path: path}
		if err := account.load(initialBalance); err != nil {
			accountRegistry.Unlock()
			return nil, err
		}
		accountRegistry.stores[path] = account
	}
	accountRegistry.Unlock()
	return &Trader{account: account, prices: prices}, nil
}

func sanitizeAccountID(value string) string {
	var builder strings.Builder
	for _, r := range strings.TrimSpace(value) {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			builder.WriteRune(r)
		}
	}
	return builder.String()
}

func newState(initialBalance float64) paperState {
	return paperState{
		InitialBalance: initialBalance,
		Available:      initialBalance,
		FeeRate:        defaultFeeRate,
		NextOrderID:    1,
		Positions:      make(map[string]*paperPosition),
		Orders:         make(map[string]*paperOrder),
		Leverage:       make(map[string]int),
		CrossMargin:    make(map[string]bool),
		Closed:         make([]closedRecord, 0),
		UpdatedAt:      time.Now().UnixMilli(),
	}
}

func (a *accountStore) load(initialBalance float64) error {
	body, err := os.ReadFile(a.path)
	if errors.Is(err, os.ErrNotExist) {
		a.state = newState(initialBalance)
		return a.saveLocked()
	}
	if err != nil {
		return fmt.Errorf("read MEXC paper account: %w", err)
	}
	if err := json.Unmarshal(body, &a.state); err != nil {
		return fmt.Errorf("decode MEXC paper account: %w", err)
	}
	if a.state.InitialBalance <= 0 || a.state.Available < 0 {
		return errors.New("MEXC paper account contains invalid balances")
	}
	if a.state.FeeRate <= 0 {
		a.state.FeeRate = defaultFeeRate
	}
	if a.state.NextOrderID <= 0 {
		a.state.NextOrderID = 1
	}
	if a.state.Positions == nil {
		a.state.Positions = make(map[string]*paperPosition)
	}
	if a.state.Orders == nil {
		a.state.Orders = make(map[string]*paperOrder)
	}
	if a.state.Leverage == nil {
		a.state.Leverage = make(map[string]int)
	}
	if a.state.CrossMargin == nil {
		a.state.CrossMargin = make(map[string]bool)
	}
	return nil
}

func (a *accountStore) saveLocked() error {
	a.state.UpdatedAt = time.Now().UnixMilli()
	body, err := json.MarshalIndent(a.state, "", "  ")
	if err != nil {
		return fmt.Errorf("encode MEXC paper account: %w", err)
	}
	tempPath := a.path + ".tmp"
	if err := os.WriteFile(tempPath, body, 0o600); err != nil {
		return fmt.Errorf("write MEXC paper account: %w", err)
	}
	if err := os.Rename(tempPath, a.path); err != nil {
		return fmt.Errorf("commit MEXC paper account: %w", err)
	}
	return nil
}

func normalizeSymbol(symbol string) string {
	return strings.ToUpper(strings.NewReplacer("/", "", "-", "", "_", "").Replace(strings.TrimSpace(symbol)))
}

func positionKey(symbol, side string) string {
	return normalizeSymbol(symbol) + ":" + strings.ToLower(side)
}

func (t *Trader) GetMarketPrice(symbol string) (float64, error) {
	return t.prices.GetPrice(normalizeSymbol(symbol))
}

func (t *Trader) refresh() (map[string]float64, error) {
	t.account.mu.Lock()
	symbolSet := make(map[string]struct{})
	for _, position := range t.account.state.Positions {
		symbolSet[position.Symbol] = struct{}{}
	}
	for _, order := range t.account.state.Orders {
		if order.Status == "NEW" {
			symbolSet[order.Symbol] = struct{}{}
		}
	}
	t.account.mu.Unlock()
	if len(symbolSet) == 0 {
		symbolSet["BTCUSDT"] = struct{}{}
	}

	prices := make(map[string]float64, len(symbolSet))
	for symbol := range symbolSet {
		price, err := t.GetMarketPrice(symbol)
		if err != nil {
			return nil, err
		}
		prices[symbol] = price
	}

	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	changed := false
	for _, order := range t.account.state.Orders {
		if order.Status != "NEW" {
			continue
		}
		price := prices[order.Symbol]
		if !orderTriggered(order, price) {
			continue
		}
		closeType := "take_profit"
		if order.Type == "STOP_MARKET" {
			closeType = "stop_loss"
		}
		fee, quantity, err := t.closePositionLocked(order.Symbol, strings.ToLower(order.PositionSide), order.Quantity, price, order.ID, closeType)
		if err != nil {
			order.Status = "CANCELED"
		} else {
			order.Status = "FILLED"
			order.ExecutedQty = quantity
			order.AveragePrice = price
			order.Commission = fee
		}
		changed = true
	}
	if changed {
		if err := t.account.saveLocked(); err != nil {
			return nil, err
		}
	}
	return prices, nil
}

func orderTriggered(order *paperOrder, price float64) bool {
	if price <= 0 || order.StopPrice <= 0 {
		return false
	}
	if order.PositionSide == "LONG" {
		if order.Type == "STOP_MARKET" {
			return price <= order.StopPrice
		}
		return price >= order.StopPrice
	}
	if order.Type == "STOP_MARKET" {
		return price >= order.StopPrice
	}
	return price <= order.StopPrice
}

func (t *Trader) GetBalance() (map[string]interface{}, error) {
	prices, err := t.refresh()
	if err != nil {
		return nil, err
	}
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	walletBalance := t.account.state.Available
	unrealized := 0.0
	usedMargin := 0.0
	for _, position := range t.account.state.Positions {
		usedMargin += position.Margin
		walletBalance += position.Margin
		unrealized += positionPnL(position, prices[position.Symbol])
	}
	totalEquity := walletBalance + unrealized
	return map[string]interface{}{
		"asset":                   "USDT",
		"balance":                 walletBalance,
		"wallet_balance":          walletBalance,
		"totalWalletBalance":      walletBalance,
		"available_balance":       t.account.state.Available,
		"availableBalance":        t.account.state.Available,
		"total_equity":            totalEquity,
		"totalEquity":             totalEquity,
		"totalUnrealizedProfit":   unrealized,
		"total_unrealized_profit": unrealized,
		"used_margin":             usedMargin,
		"paper_trading":           true,
		"price_source":            "MEXC public API",
	}, nil
}

func (t *Trader) GetPositions() ([]map[string]interface{}, error) {
	prices, err := t.refresh()
	if err != nil {
		return nil, err
	}
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	keys := make([]string, 0, len(t.account.state.Positions))
	for key := range t.account.state.Positions {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	positions := make([]map[string]interface{}, 0, len(keys))
	for _, key := range keys {
		position := t.account.state.Positions[key]
		price := prices[position.Symbol]
		amount := position.Quantity
		if position.Side == "short" {
			amount = -amount
		}
		unrealized := positionPnL(position, price)
		positions = append(positions, map[string]interface{}{
			"symbol":           position.Symbol,
			"side":             position.Side,
			"positionSide":     strings.ToUpper(position.Side),
			"positionAmt":      amount,
			"entryPrice":       position.EntryPrice,
			"markPrice":        price,
			"unrealizedProfit": unrealized,
			"unRealizedProfit": unrealized,
			"liquidationPrice": liquidationPrice(position),
			"leverage":         float64(position.Leverage),
			"margin":           position.Margin,
			"paperTrading":     true,
		})
	}
	return positions, nil
}

func positionPnL(position *paperPosition, price float64) float64 {
	if position.Side == "short" {
		return (position.EntryPrice - price) * position.Quantity
	}
	return (price - position.EntryPrice) * position.Quantity
}

func liquidationPrice(position *paperPosition) float64 {
	if position.Leverage <= 1 {
		return 0
	}
	distance := 0.9 / float64(position.Leverage)
	if position.Side == "short" {
		return position.EntryPrice * (1 + distance)
	}
	return math.Max(0, position.EntryPrice*(1-distance))
}

func (t *Trader) OpenLong(symbol string, quantity float64, leverage int) (map[string]interface{}, error) {
	return t.openPosition(symbol, "long", quantity, leverage)
}

func (t *Trader) OpenShort(symbol string, quantity float64, leverage int) (map[string]interface{}, error) {
	return t.openPosition(symbol, "short", quantity, leverage)
}

func (t *Trader) openPosition(symbol, side string, quantity float64, leverage int) (map[string]interface{}, error) {
	symbol = normalizeSymbol(symbol)
	if quantity <= 0 {
		return nil, errors.New("paper order quantity must be greater than zero")
	}
	if leverage < 1 || leverage > 100 {
		return nil, errors.New("paper leverage must be between 1 and 100")
	}
	price, err := t.GetMarketPrice(symbol)
	if err != nil {
		return nil, err
	}
	notional := price * quantity
	margin := notional / float64(leverage)
	fee := notional * defaultFeeRate

	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	if t.account.state.Available+1e-9 < margin+fee {
		return nil, fmt.Errorf("insufficient MEXC paper balance: need %.4f USDT, available %.4f USDT", margin+fee, t.account.state.Available)
	}
	key := positionKey(symbol, side)
	position := t.account.state.Positions[key]
	if position == nil {
		position = &paperPosition{Symbol: symbol, Side: side, Leverage: leverage, OpenedAt: time.Now().UnixMilli()}
		t.account.state.Positions[key] = position
	}
	oldNotional := position.EntryPrice * position.Quantity
	position.Quantity += quantity
	position.EntryPrice = (oldNotional + notional) / position.Quantity
	position.Leverage = leverage
	position.Margin += margin
	t.account.state.Available -= margin + fee
	t.account.state.Leverage[symbol] = leverage

	order := t.newFilledOrderLocked(symbol, side, quantity, price, fee, "MARKET")
	if err := t.account.saveLocked(); err != nil {
		return nil, err
	}
	return orderResult(order), nil
}

func (t *Trader) CloseLong(symbol string, quantity float64) (map[string]interface{}, error) {
	return t.closePosition(symbol, "long", quantity, "manual")
}

func (t *Trader) CloseShort(symbol string, quantity float64) (map[string]interface{}, error) {
	return t.closePosition(symbol, "short", quantity, "manual")
}

func (t *Trader) closePosition(symbol, side string, quantity float64, closeType string) (map[string]interface{}, error) {
	symbol = normalizeSymbol(symbol)
	price, err := t.GetMarketPrice(symbol)
	if err != nil {
		return nil, err
	}
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	orderID := t.nextOrderIDLocked()
	fee, executed, err := t.closePositionLocked(symbol, side, quantity, price, orderID, closeType)
	if err != nil {
		return nil, err
	}
	order := &paperOrder{
		ID: orderID, Symbol: symbol, Side: closeOrderSide(side), PositionSide: strings.ToUpper(side),
		Type: "MARKET", Price: price, AveragePrice: price, Quantity: executed, ExecutedQty: executed,
		Commission: fee, Status: "FILLED", CreatedAt: time.Now().UnixMilli(),
	}
	t.account.state.Orders[order.ID] = order
	if err := t.account.saveLocked(); err != nil {
		return nil, err
	}
	return orderResult(order), nil
}

func (t *Trader) closePositionLocked(symbol, side string, quantity, price float64, orderID, closeType string) (float64, float64, error) {
	key := positionKey(symbol, side)
	position := t.account.state.Positions[key]
	if position == nil || position.Quantity <= 0 {
		return 0, 0, fmt.Errorf("no %s MEXC paper position for %s", side, symbol)
	}
	if quantity <= 0 || quantity > position.Quantity {
		quantity = position.Quantity
	}
	ratio := quantity / position.Quantity
	releasedMargin := position.Margin * ratio
	realizedPnL := positionPnL(&paperPosition{
		Side: side, EntryPrice: position.EntryPrice, Quantity: quantity,
	}, price)
	fee := price * quantity * t.account.state.FeeRate
	t.account.state.Available += releasedMargin + realizedPnL - fee
	if t.account.state.Available < 0 {
		t.account.state.Available = 0
	}
	t.account.state.Closed = append(t.account.state.Closed, closedRecord{
		Symbol: symbol, Side: side, EntryPrice: position.EntryPrice, ExitPrice: price,
		Quantity: quantity, RealizedPnL: realizedPnL, Fee: fee, Leverage: position.Leverage,
		EntryTime: position.OpenedAt, ExitTime: time.Now().UnixMilli(), OrderID: orderID, CloseType: closeType,
	})
	position.Quantity -= quantity
	position.Margin -= releasedMargin
	if position.Quantity <= 1e-12 {
		delete(t.account.state.Positions, key)
		t.cancelPositionOrdersLocked(symbol, strings.ToUpper(side), "CANCELED")
	} else {
		for _, order := range t.account.state.Orders {
			if order.Status == "NEW" && order.Symbol == symbol && order.PositionSide == strings.ToUpper(side) {
				order.Quantity = math.Min(order.Quantity, position.Quantity)
			}
		}
	}
	return fee, quantity, nil
}

func (t *Trader) newFilledOrderLocked(symbol, side string, quantity, price, fee float64, orderType string) *paperOrder {
	order := &paperOrder{
		ID: t.nextOrderIDLocked(), Symbol: symbol, Side: openOrderSide(side), PositionSide: strings.ToUpper(side),
		Type: orderType, Price: price, AveragePrice: price, Quantity: quantity, ExecutedQty: quantity,
		Commission: fee, Status: "FILLED", CreatedAt: time.Now().UnixMilli(),
	}
	t.account.state.Orders[order.ID] = order
	return order
}

func (t *Trader) nextOrderIDLocked() string {
	id := t.account.state.NextOrderID
	t.account.state.NextOrderID++
	return strconv.FormatInt(id, 10)
}

func orderResult(order *paperOrder) map[string]interface{} {
	id, _ := strconv.ParseInt(order.ID, 10, 64)
	return map[string]interface{}{
		"orderId": id, "symbol": order.Symbol, "status": order.Status,
		"avgPrice": order.AveragePrice, "executedQty": order.ExecutedQty, "commission": order.Commission,
		"paperTrading": true,
	}
}

func openOrderSide(side string) string {
	if side == "short" {
		return "SELL"
	}
	return "BUY"
}

func closeOrderSide(side string) string {
	if side == "short" {
		return "BUY"
	}
	return "SELL"
}

func (t *Trader) SetLeverage(symbol string, leverage int) error {
	if leverage < 1 || leverage > 100 {
		return errors.New("paper leverage must be between 1 and 100")
	}
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	t.account.state.Leverage[normalizeSymbol(symbol)] = leverage
	return t.account.saveLocked()
}

func (t *Trader) SetMarginMode(symbol string, isCrossMargin bool) error {
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	t.account.state.CrossMargin[normalizeSymbol(symbol)] = isCrossMargin
	return t.account.saveLocked()
}

func (t *Trader) SetStopLoss(symbol, positionSide string, quantity, stopPrice float64) error {
	return t.setTriggerOrder(symbol, positionSide, quantity, stopPrice, "STOP_MARKET")
}

func (t *Trader) SetTakeProfit(symbol, positionSide string, quantity, takeProfitPrice float64) error {
	return t.setTriggerOrder(symbol, positionSide, quantity, takeProfitPrice, "TAKE_PROFIT_MARKET")
}

func (t *Trader) setTriggerOrder(symbol, positionSide string, quantity, stopPrice float64, orderType string) error {
	symbol = normalizeSymbol(symbol)
	positionSide = strings.ToUpper(strings.TrimSpace(positionSide))
	if positionSide != "LONG" && positionSide != "SHORT" {
		return errors.New("position side must be LONG or SHORT")
	}
	if stopPrice <= 0 {
		return errors.New("trigger price must be greater than zero")
	}
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	position := t.account.state.Positions[positionKey(symbol, strings.ToLower(positionSide))]
	if position == nil {
		return fmt.Errorf("no %s MEXC paper position for %s", strings.ToLower(positionSide), symbol)
	}
	if quantity <= 0 || quantity > position.Quantity {
		quantity = position.Quantity
	}
	for _, existing := range t.account.state.Orders {
		if existing.Status == "NEW" && existing.Symbol == symbol && existing.PositionSide == positionSide && existing.Type == orderType {
			existing.Status = "CANCELED"
		}
	}
	order := &paperOrder{
		ID: t.nextOrderIDLocked(), Symbol: symbol, Side: closeOrderSide(strings.ToLower(positionSide)),
		PositionSide: positionSide, Type: orderType, StopPrice: stopPrice, Quantity: quantity,
		Status: "NEW", CreatedAt: time.Now().UnixMilli(),
	}
	t.account.state.Orders[order.ID] = order
	return t.account.saveLocked()
}

func (t *Trader) CancelStopLossOrders(symbol string) error {
	return t.cancelOrders(symbol, "STOP_MARKET")
}

func (t *Trader) CancelTakeProfitOrders(symbol string) error {
	return t.cancelOrders(symbol, "TAKE_PROFIT_MARKET")
}

func (t *Trader) CancelStopOrders(symbol string) error {
	return t.cancelOrders(symbol, "STOP_MARKET", "TAKE_PROFIT_MARKET")
}

func (t *Trader) CancelAllOrders(symbol string) error {
	return t.cancelOrders(symbol)
}

func (t *Trader) cancelOrders(symbol string, orderTypes ...string) error {
	symbol = normalizeSymbol(symbol)
	wanted := make(map[string]bool, len(orderTypes))
	for _, orderType := range orderTypes {
		wanted[orderType] = true
	}
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	for _, order := range t.account.state.Orders {
		if order.Status != "NEW" || (symbol != "" && order.Symbol != symbol) {
			continue
		}
		if len(wanted) == 0 || wanted[order.Type] {
			order.Status = "CANCELED"
		}
	}
	return t.account.saveLocked()
}

func (t *Trader) cancelPositionOrdersLocked(symbol, positionSide, status string) {
	for _, order := range t.account.state.Orders {
		if order.Status == "NEW" && order.Symbol == symbol && order.PositionSide == positionSide {
			order.Status = status
		}
	}
}

func (t *Trader) FormatQuantity(symbol string, quantity float64) (string, error) {
	if quantity <= 0 {
		return "", errors.New("quantity must be greater than zero")
	}
	return strconv.FormatFloat(math.Floor(quantity*1e8)/1e8, 'f', 8, 64), nil
}

func (t *Trader) GetOrderStatus(symbol, orderID string) (map[string]interface{}, error) {
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	order := t.account.state.Orders[orderID]
	if order == nil || (symbol != "" && order.Symbol != normalizeSymbol(symbol)) {
		return nil, fmt.Errorf("MEXC paper order not found: %s", orderID)
	}
	return orderResult(order), nil
}

func (t *Trader) GetClosedPnL(startTime time.Time, limit int) ([]types.ClosedPnLRecord, error) {
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	if limit <= 0 {
		limit = 100
	}
	result := make([]types.ClosedPnLRecord, 0, limit)
	for i := len(t.account.state.Closed) - 1; i >= 0 && len(result) < limit; i-- {
		record := t.account.state.Closed[i]
		exitTime := time.UnixMilli(record.ExitTime)
		if !startTime.IsZero() && exitTime.Before(startTime) {
			continue
		}
		result = append(result, types.ClosedPnLRecord{
			Symbol: record.Symbol, Side: record.Side, EntryPrice: record.EntryPrice, ExitPrice: record.ExitPrice,
			Quantity: record.Quantity, RealizedPnL: record.RealizedPnL, Fee: record.Fee, Leverage: record.Leverage,
			EntryTime: time.UnixMilli(record.EntryTime), ExitTime: exitTime, OrderID: record.OrderID,
			CloseType: record.CloseType, ExchangeID: "mexc_paper",
		})
	}
	return result, nil
}

func (t *Trader) GetOpenOrders(symbol string) ([]types.OpenOrder, error) {
	if _, err := t.refresh(); err != nil {
		return nil, err
	}
	symbol = normalizeSymbol(symbol)
	t.account.mu.Lock()
	defer t.account.mu.Unlock()
	result := make([]types.OpenOrder, 0)
	for _, order := range t.account.state.Orders {
		if order.Status != "NEW" || (symbol != "" && order.Symbol != symbol) {
			continue
		}
		result = append(result, types.OpenOrder{
			OrderID: order.ID, Symbol: order.Symbol, Side: order.Side, PositionSide: order.PositionSide,
			Type: order.Type, Price: order.Price, StopPrice: order.StopPrice, Quantity: order.Quantity, Status: order.Status,
		})
	}
	sort.Slice(result, func(i, j int) bool { return result[i].OrderID < result[j].OrderID })
	return result, nil
}

var _ types.Trader = (*Trader)(nil)
