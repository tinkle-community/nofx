# 订单簿分析指标使用说明

## 概述

订单簿(Order Book)分析指标可以帮助判断市场的买卖压力,是技术分析的重要补充。

## 新增指标

### 1. BidVolumeTop5 (买单前5档总量)
前5档买单的成交量之和,表示买盘深度。

### 2. AskVolumeTop5 (卖单前5档总量)
前5档卖单的成交量之和,表示卖盘深度。

### 3. Imbalance (买卖不平衡度)
计算公式: `(bid_volume_top5 - ask_volume_top5) / (bid_volume_top5 + ask_volume_top5)`

取值范围: -1 到 1
- **> 0.1**: 买盘压力强劲,可能上涨
- **< -0.1**: 卖盘压力强劲,可能下跌
- **-0.1 ~ 0.1**: 买卖盘相对平衡

### 4. 其他指标
- **BidPrice1**: 最优买价(买一价)
- **AskPrice1**: 最优卖价(卖一价)
- **Spread**: 买卖价差
- **SpreadPercent**: 买卖价差百分比(流动性指标)

## 使用示例

```go
import "nofx/market"

// 获取市场数据
data, err := market.Get("BTCUSDT")
if err != nil {
    log.Fatal(err)
}

// 访问订单簿数据
if data.OrderBook != nil {
    imbalance := data.OrderBook.Imbalance
    
    if imbalance > 0.1 {
        // 买盘压力强劲
        fmt.Println("强买入压力")
    } else if imbalance < -0.1 {
        // 卖盘压力强劲
        fmt.Println("强卖出压力")
    }
}
```

## 交易策略应用

### 信号确认
将订单簿不平衡度与技术指标结合使用,可以提高信号可靠性:

```go
// 强买入信号示例
if data.OrderBook.Imbalance > 0.1 &&  // 买盘强
   data.CurrentMACD > 0 &&             // MACD金叉
   data.CurrentRSI7 < 70 {             // RSI未超买
    // 开多单
}

// 强卖出信号示例
if data.OrderBook.Imbalance < -0.1 && // 卖盘强
   data.CurrentMACD < 0 &&             // MACD死叉
   data.CurrentRSI7 > 30 {             // RSI未超卖
    // 开空单
}
```

### 流动性检查
通过价差百分比判断市场流动性:

```go
// 流动性良好: 价差 < 0.05%
if data.OrderBook.SpreadPercent < 0.05 {
    // 可以执行大额交易
}
```

## 数据来源

订单簿数据来自币安合约API:
- **端点**: `https://fapi.binance.com/fapi/v1/depth`
- **参数**: `symbol`, `limit=5` (获取前5档)

## 注意事项

1. **实时性**: 订单簿数据是实时的,变化非常快
2. **深度**: 当前只计算前5档,可以根据需要调整
3. **容错**: 如果API调用失败,会返回空的订单簿数据,不影响其他功能
4. **解读**: 不平衡度需要结合其他指标综合判断,不能单独使用

## AI 决策整合

订单簿数据已经自动包含在发送给AI的市场数据中,AI可以利用这些信息做出更准确的交易决策。

在 `decision/engine.go` 的 `buildUserPrompt` 函数中,市场数据通过 `market.Format(marketData)` 自动包含订单簿信息。

## 运行示例

```bash
cd examples
go run orderbook_example.go
```

## 输出示例

```
=== 完整市场数据 ===
current_price = 94500.00, current_ema20 = 94320.500, current_macd = 125.340, current_rsi (7 period) = 62.450

In addition, here is the latest BTCUSDT open interest and funding rate for perps:

Open Interest: Latest: 125000.00 Average: 124875.00

Funding Rate: 1.20e-04

Order Book (Top 5 Levels):

Bid Volume (Top 5): 1250.50
Ask Volume (Top 5): 980.30
Imbalance: 0.1210 (Strong Buy Pressure)
Best Bid: 94498.5000 | Best Ask: 94501.0000
Spread: 2.5000 (0.0026%)

...
```

