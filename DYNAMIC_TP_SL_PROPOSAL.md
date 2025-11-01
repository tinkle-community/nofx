# 動態止盈止損功能設計方案

## 🔴 問題描述

**用戶反饋**：
> 还有动态止盈止损我建议你给ai decisions里加个adjust tp sl 或者给close加个quantity 不然应该是没有作用

**根本原因**：
- 策略模板（adaptive.txt）提到"追蹤止損"功能：
  - 浮盈達到 0.8% → 止損移到成本價（保證不虧）
  - 浮盈達到 1.2% → 止損移到 +0.5%（鎖定一半利潤）
- 但 AI 無法執行這些操作，因為 Decision 結構**不支持**：
  - ❌ 調整現有持倉的止盈/止損
  - ❌ 部分平倉（分批止盈）

## 📊 當前限制

### Decision 結構（decision/engine.go:72-82）
```go
type Decision struct {
    Symbol          string  `json:"symbol"`
    Action          string  `json:"action"` // "open_long", "open_short", "close_long", "close_short", "hold", "wait"
    Leverage        int     `json:"leverage,omitempty"`
    PositionSizeUSD float64 `json:"position_size_usd,omitempty"`
    StopLoss        float64 `json:"stop_loss,omitempty"`      // ⚠️ 只在開倉時有效
    TakeProfit      float64 `json:"take_profit,omitempty"`    // ⚠️ 只在開倉時有效
    Confidence      int     `json:"confidence,omitempty"`
    RiskUSD         float64 `json:"risk_usd,omitempty"`
    Reasoning       string  `json:"reasoning"`
}
```

### 當前支持的 Actions
- `open_long` - 開多倉（有 stop_loss, take_profit）
- `open_short` - 開空倉（有 stop_loss, take_profit）
- `close_long` - 全部平多倉
- `close_short` - 全部平空倉
- `hold` - 持倉不動
- `wait` - 觀望

---

## ✅ 解決方案

### 方案 A：添加新的 Action Types（推薦）

#### 1. `adjust_stop_loss` - 調整止損
```json
{
  "symbol": "BTCUSDT",
  "action": "adjust_stop_loss",
  "new_stop_loss": 100500.0,
  "reasoning": "浮盈達到 1.5%，將止損移到成本價 (100500) 保證不虧"
}
```

#### 2. `adjust_take_profit` - 調整止盈
```json
{
  "symbol": "BTCUSDT",
  "action": "adjust_take_profit",
  "new_take_profit": 102000.0,
  "reasoning": "價格距離 EMA20 僅 0.3%，將止盈提前到 102000 避免回撤"
}
```

#### 3. `partial_close` - 部分平倉
```json
{
  "symbol": "BTCUSDT",
  "action": "partial_close",
  "close_percentage": 50,
  "reasoning": "價格到達第一目標 104300，分批平倉 50%，剩餘持倉繼續追蹤"
}
```

### 方案 B：修改現有 close action（次選）

給 `close_long` / `close_short` 添加 `quantity` 參數：
```json
{
  "symbol": "BTCUSDT",
  "action": "close_long",
  "quantity": 0.5,  // 0.5 = 50%, 1.0 = 100%（預設）
  "reasoning": "部分止盈"
}
```

---

## 🛠️ 實施步驟

### 步驟 1：修改 Decision 結構

**文件**: `decision/engine.go`

```go
type Decision struct {
    Symbol          string  `json:"symbol"`
    Action          string  `json:"action"`
    // Actions: "open_long", "open_short", "close_long", "close_short",
    //          "adjust_stop_loss", "adjust_take_profit", "partial_close", "hold", "wait"

    // 開倉參數
    Leverage        int     `json:"leverage,omitempty"`
    PositionSizeUSD float64 `json:"position_size_usd,omitempty"`
    StopLoss        float64 `json:"stop_loss,omitempty"`
    TakeProfit      float64 `json:"take_profit,omitempty"`

    // 調整參數（新增）
    NewStopLoss     float64 `json:"new_stop_loss,omitempty"`     // 用於 adjust_stop_loss
    NewTakeProfit   float64 `json:"new_take_profit,omitempty"`   // 用於 adjust_take_profit
    ClosePercentage float64 `json:"close_percentage,omitempty"`  // 用於 partial_close (0-100)

    // 通用參數
    Confidence      int     `json:"confidence,omitempty"`
    RiskUSD         float64 `json:"risk_usd,omitempty"`
    Reasoning       string  `json:"reasoning"`
}
```

### 步驟 2：實現 Action 執行邏輯

**文件**: `trader/auto_trader.go` 或新建 `trader/position_manager.go`

```go
// 處理調整止損
func (t *AutoTrader) adjustStopLoss(symbol string, newStopLoss float64) error {
    // 1. 獲取當前持倉
    position := t.getPosition(symbol)
    if position == nil {
        return fmt.Errorf("持倉不存在")
    }

    // 2. 調用交易所 API 修改止損單
    err := t.exchange.ModifyStopLoss(symbol, position.OrderID, newStopLoss)
    if err != nil {
        return err
    }

    // 3. 更新本地持倉記錄
    position.StopLoss = newStopLoss

    log.Printf("✓ %s 止損已調整到 %.2f", symbol, newStopLoss)
    return nil
}

// 處理部分平倉
func (t *AutoTrader) partialClose(symbol string, percentage float64) error {
    // 1. 獲取當前持倉
    position := t.getPosition(symbol)
    if position == nil {
        return fmt.Errorf("持倉不存在")
    }

    // 2. 計算平倉數量
    closeQty := position.Quantity * (percentage / 100.0)

    // 3. 執行市價平倉
    err := t.exchange.ClosePosition(symbol, closeQty)
    if err != nil {
        return err
    }

    // 4. 更新本地持倉記錄
    position.Quantity -= closeQty

    log.Printf("✓ %s 部分平倉 %.1f%% (%.4f)", symbol, percentage, closeQty)
    return nil
}
```

### 步驟 3：更新模板說明

**文件**: `prompts/adaptive.txt`

在輸出格式部分添加：

```markdown
## 可用的 Actions

### 開倉
- `open_long` / `open_short` - 開倉（必須指定 leverage, position_size_usd, stop_loss, take_profit）

### 平倉
- `close_long` / `close_short` - 全部平倉
- `partial_close` - 部分平倉（指定 close_percentage: 0-100）

### 調整持倉
- `adjust_stop_loss` - 調整止損（指定 new_stop_loss）
- `adjust_take_profit` - 調整止盈（指定 new_take_profit）

### 觀望
- `hold` - 持倉不動
- `wait` - 觀望

## 追蹤止損範例

```json
[
  {
    "symbol": "BTCUSDT",
    "action": "adjust_stop_loss",
    "new_stop_loss": 100500,
    "confidence": 85,
    "reasoning": "浮盈達到 1.5%（目前價格 101500），將止損移到成本價 100500，保證不虧"
  }
]
```

## 部分止盈範例

```json
[
  {
    "symbol": "BTCUSDT",
    "action": "partial_close",
    "close_percentage": 50,
    "confidence": 80,
    "reasoning": "價格到達第一目標 104300（4h EMA20 前 0.2%），分批止盈 50%，剩餘倉位繼續持有"
  }
]
```
```

### 步驟 4：更新交易邏輯主循環

**文件**: `trader/auto_trader.go` - `executeTrades()` 函數

```go
func (t *AutoTrader) executeTrades(decisions []decision.Decision) {
    for _, d := range decisions {
        switch d.Action {
        case "open_long", "open_short":
            t.openPosition(d)

        case "close_long", "close_short":
            t.closePosition(d.Symbol)

        case "adjust_stop_loss":
            t.adjustStopLoss(d.Symbol, d.NewStopLoss)

        case "adjust_take_profit":
            t.adjustTakeProfit(d.Symbol, d.NewTakeProfit)

        case "partial_close":
            t.partialClose(d.Symbol, d.ClosePercentage)

        case "hold", "wait":
            // 不操作

        default:
            log.Printf("⚠️  未知的 action: %s", d.Action)
        }
    }
}
```

---

## 🧪 測試驗證

### 測試用例 1：追蹤止損
1. 開多倉 BTCUSDT @ 100000，止損 99000，止盈 102000
2. 價格上漲到 101500（浮盈 1.5%）
3. AI 決策：`adjust_stop_loss` → 100500（成本價）
4. 驗證：止損單已更新，即使回撤到 100500 也不會虧損

### 測試用例 2：部分止盈
1. 持倉 BTCUSDT 多單 0.1 BTC
2. 價格到達第一目標 104300
3. AI 決策：`partial_close` 50%
4. 驗證：平倉 0.05 BTC，剩餘 0.05 BTC 繼續持有

### 測試用例 3：錯誤處理
1. AI 決策：`adjust_stop_loss` 但持倉不存在
2. 驗證：記錄錯誤，不影響其他決策

---

## 📈 預期效果

### 優化前（當前狀態）
- AI 只能在開倉時設定止盈止損
- 無法根據行情變化動態調整
- "追蹤止損"策略無法執行 ❌

### 優化後
- AI 可以根據浮盈動態移動止損 ✅
- 可以分批止盈（第一目標平 50%，第二目標平剩餘）✅
- 真正實現"讓利潤奔跑，限制虧損"✅
- 提升夏普比率（減少回撤，鎖定利潤）✅

---

## 🔗 相關文件

- `decision/engine.go` - Decision 結構定義
- `trader/auto_trader.go` - 交易執行邏輯
- `prompts/adaptive.txt` - 策略模板（提到追蹤止損）
- `prompts/default.txt` - 基礎策略模板

---

## ⚠️ 風險提示

1. **交易所 API 支持**：需要確認 Binance/Hyperliquid 是否支持修改止損單
2. **訂單管理**：需要追蹤止損單的 orderID，才能修改
3. **錯誤處理**：如果修改失敗，需要回退或重試
4. **日誌記錄**：所有調整操作都應該記錄到 decision_logger

---

**優先級**: 🔴 High - 這是實現追蹤止損策略的必要功能

**預估工作量**:
- 修改 Decision 結構: 30 分鐘
- 實現執行邏輯: 2-3 小時
- 更新模板說明: 30 分鐘
- 測試驗證: 1-2 小時
- **總計**: 4-6 小時

---

**下一步**: 等待用戶確認方案後開始實施
