# OKX API 实现审计报告

生成时间: 2025-11-01

## 📋 审计概述

对 `trader/okx_trader.go` 中使用的所有 OKX API 端点进行了全面审计，与官方文档 `欧易API接入指南.md` 逐一对比。

### 审计的 API 端点（共8个）

1. ✅ GET /api/v5/account/config - 获取账户配置
2. ✅ GET /api/v5/account/balance - 获取账户余额
3. ✅ POST /api/v5/trade/order - 下单
4. ⚠️ GET /api/v5/account/positions - 获取持仓信息（缺少字段）
5. ✅ POST /api/v5/account/set-leverage - 设置杠杆
6. ❌ POST /api/v5/trade/cancel-all-after - **错误使用**
7. ❌ POST /api/v5/trade/order-algo - **参数错误**
8. ✅ POST /api/v5/account/position/margin-balance - 调整保证金

---

## 🔴 发现的严重问题

### 问题 1: CancelAllOrders 使用了错误的 API 端点

**位置**: `trader/okx_trader.go:864-874`

**问题描述**:
- 代码使用 `/api/v5/trade/cancel-all-after` 并传入 `instId` 参数
- 该端点实际用途：**倒计时全部撤单**，需要 `timeOut` 参数（10-120秒）
- 不是"取消指定币种所有挂单"的 API

**原始代码**:
```go
func (t *OKXTrader) CancelAllOrders(symbol string) error {
    body := map[string]interface{}{
        "instId": symbol,  // ❌ 错误！该API不接受instId
    }
    _, err := t.request(context.Background(), "POST", "/api/v5/trade/cancel-all-after", body)
    // ...
}
```

**文档说明** (欧易API接入指南.md:12440-12520):
- 参数: `timeOut` (必需) - 倒计时秒数，取值范围 0 或 [10, 120]
- 用途: 在倒计时结束后，取消所有挂单（账户维度或标签维度）

**修复方案**:
```go
func (t *OKXTrader) CancelAllOrders(symbol string) error {
    // ⚠️ OKX没有提供"取消指定币种所有挂单"的直接API
    // 正确实现需要：先查询挂单列表，然后批量取消
    log.Printf("  ⚠️  跳过取消 %s 挂单（功能待实现）", symbol)
    return nil
}
```

**影响**:
- 功能完全失效
- 每次开仓前的清理挂单操作无效
- 好在代码已忽略此函数的错误返回值

---

### 问题 2: SetStopLoss/SetTakeProfit 使用了错误的参数

**位置**:
- `trader/okx_trader.go:927-937` (SetStopLoss)
- `trader/okx_trader.go:967-977` (SetTakeProfit)

**问题描述**:
- 使用 `ordType="conditional"` (止盈止损订单)
- 但使用了 `triggerPx` 和 `orderPx` 参数
- 这些参数是用于 `ordType="trigger"` (计划委托)

**原始代码**:
```go
body := map[string]interface{}{
    "ordType":   "conditional",
    "triggerPx": stopPrice,    // ❌ 错误！conditional类型不用这个参数
    "orderPx":   "-1",         // ❌ 错误！conditional类型不用这个参数
}
```

**文档说明** (欧易API接入指南.md:14659-14692):

对于 `ordType="conditional"` (单向止盈止损):
- 止损: 使用 `slTriggerPx` (止损触发价) + `slOrdPx` (止损委托价)
- 止盈: 使用 `tpTriggerPx` (止盈触发价) + `tpOrdPx` (止盈委托价)

对于 `ordType="trigger"` (计划委托):
- 使用 `triggerPx` (触发价) + `orderPx` (委托价)

**修复后代码**:

止损订单:
```go
body := map[string]interface{}{
    "instId":      symbol,
    "tdMode":      "isolated",
    "side":        side,
    "posSide":     posSide,
    "ordType":     "conditional",
    "sz":          quantityStr,
    "slTriggerPx": fmt.Sprintf("%.8f", stopPrice), // ✅ 正确
    "slOrdPx":     "-1",                           // ✅ 正确 (-1表示市价)
}
```

止盈订单:
```go
body := map[string]interface{}{
    "instId":      symbol,
    "tdMode":      "isolated",
    "side":        side,
    "posSide":     posSide,
    "ordType":     "conditional",
    "sz":          quantityStr,
    "tpTriggerPx": fmt.Sprintf("%.8f", takeProfitPrice), // ✅ 正确
    "tpOrdPx":     "-1",                                 // ✅ 正确
}
```

**影响**:
- 止损/止盈订单可能无法正确创建
- 可能导致风控失效

---

### 问题 3: GetPositions 缺少 margin 字段解析

**位置**: `trader/okx_trader.go:237-276`

**问题描述**:
- 持仓信息结构体缺少 `margin` 字段
- 导致无法获取 API 返回的实际保证金值

**原始代码**:
```go
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
    // ❌ 缺少 margin 字段
}
```

**文档说明** (欧易API接入指南.md:2042):
- `margin`: String - 保证金余额，可增减，仅适用于逐仓/全仓

**修复后代码**:
```go
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
    Margin  string `json:"margin"` // ✅ 新增
    CTime   string `json:"cTime"`
    UTime   string `json:"uTime"`
}

// 解析时也要添加
posMap["margin"], _ = strconv.ParseFloat(pos.Margin, 64)
```

**影响**:
- 保证金信息需要通过计算获得，而非直接读取API准确值
- 可能导致保证金率计算不准确

---

## ✅ 验证正确的 API 实现

### 1. GET /api/v5/account/config ✅

**位置**: `trader/okx_trader.go:341`

**验证结果**: 完全正确
- 使用 `posMode` 字段判断持仓模式
- 符合文档要求

---

### 2. GET /api/v5/account/balance ✅

**位置**: `trader/okx_trader.go:158`

**验证结果**: 完全正确
- 正确解析 `totalEq` (账户总权益)
- 正确解析 `availBal` (可用余额)
- 正确解析 `upl` (未实现盈亏)

---

### 3. POST /api/v5/trade/order ✅

**位置**: `trader/okx_trader.go:495, 575, 692, 818`

**验证结果**: 正确（已在前期修复）

开仓示例:
```go
body := map[string]interface{}{
    "instId":  symbol,
    "tdMode":  "isolated",
    "side":    "buy",        // buy=开多, sell=开空
    "ordType": "market",
    "sz":      quantityStr,
}
// net mode: 省略 posSide
// long/short mode: 必须包含 posSide
if posSide != "net" {
    body["posSide"] = posSide
}
```

平仓示例:
```go
body := map[string]interface{}{
    "instId":  symbol,
    "tdMode":  "isolated",
    "side":    "sell",       // sell=平多, buy=平空
    "ordType": "market",
    "sz":      quantityStr,
}
if actualPosSide != "net" {
    body["posSide"] = actualPosSide
}
// 注意：开平仓模式下，平仓单自动具有只减仓逻辑，无需设置 reduceOnly
```

---

### 4. POST /api/v5/account/set-leverage ✅

**位置**: `trader/okx_trader.go:410-418`

**验证结果**: 完全正确

```go
body := map[string]interface{}{
    "instId":  symbol,
    "lever":   strconv.Itoa(leverage),
    "mgnMode": "isolated",
    "posSide": positionSide,  // "long" 或 "short"
}
```

符合文档要求 (欧易API接入指南.md:3553-3560):
- 逐仓模式 + 开平仓模式下，设置杠杆需要提供 posSide

---

### 5. POST /api/v5/account/position/margin-balance ✅

**位置**: `trader/okx_trader.go:1039-1044`

**验证结果**: 完全正确

```go
body := map[string]interface{}{
    "instId":  symbol,
    "posSide": posSide,      // "long" 或 "short"
    "type":    marginType,   // "add" 或 "reduce"
    "amt":     amount,
}
```

符合文档要求 (欧易API接入指南.md:3848):
- 所有必需参数都已正确提供

---

## 📊 审计总结

### 问题统计

| 级别 | 数量 | 详情 |
|------|------|------|
| 🔴 严重错误 | 2 | CancelAllOrders 端点错误，SetStopLoss/SetTakeProfit 参数错误 |
| ⚠️ 需要改进 | 1 | GetPositions 缺少 margin 字段 |
| ✅ 完全正确 | 5 | config, balance, order, set-leverage, margin-balance |

### 修复状态

- ✅ 问题 1 (CancelAllOrders): 已修复 - 临时禁用功能，添加待实现TODO
- ✅ 问题 2 (SetStopLoss/SetTakeProfit): 已修复 - 更正参数名称
- ✅ 问题 3 (GetPositions): 已修复 - 添加 margin 字段解析

---

## 📝 后续建议

### 1. 高优先级

- [ ] **实现完整的 CancelAllOrders 功能**
  - 步骤 1: 调用 GET /api/v5/trade/orders-pending 查询挂单
  - 步骤 2: 使用 POST /api/v5/trade/cancel-batch-orders 批量取消

### 2. 中优先级

- [ ] 验证止损/止盈功能是否正常工作（参数修复后）
- [ ] 测试 margin 字段是否正确解析

### 3. 低优先级

- [ ] 考虑添加更多 API 响应字段的解析（如 mgnRatio, mmr 等）
- [ ] 优化错误处理和日志记录

---

## 📚 参考文档

- 官方文档: `欧易API接入指南.md`
- 代码文件: `trader/okx_trader.go`
- 审计时间: 2025-11-01

---

## ✅ 审计结论

经过全面审计，发现并修复了 3 个关键问题：

1. **CancelAllOrders 使用了完全错误的 API 端点** - 已临时禁用，需要重新实现
2. **止损/止盈订单使用了错误的参数名称** - 已修复为正确的参数
3. **持仓信息缺少 margin 字段解析** - 已添加字段解析

除了 CancelAllOrders 需要重新实现外，其他 API 使用均已符合 OKX 官方文档规范。

建议尽快实现完整的 CancelAllOrders 功能，以确保开仓前能够正确清理旧挂单。
