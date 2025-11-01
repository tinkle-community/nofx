package main

import (
	"fmt"
	"log"
	"nofx/market"
)

// 示例: 如何使用订单簿分析指标
func main() {
	// 获取BTC的市场数据(包括订单簿)
	symbol := "BTCUSDT"
	data, err := market.Get(symbol)
	if err != nil {
		log.Fatalf("获取市场数据失败: %v", err)
	}

	// 打印完整的市场数据(包括订单簿信息)
	fmt.Println("=== 完整市场数据 ===")
	fmt.Println(market.Format(data))

	// 单独访问订单簿数据
	if data.OrderBook != nil {
		fmt.Println("\n=== 订单簿分析 ===")
		fmt.Printf("买单前5档总量: %.2f\n", data.OrderBook.BidVolumeTop5)
		fmt.Printf("卖单前5档总量: %.2f\n", data.OrderBook.AskVolumeTop5)
		fmt.Printf("不平衡度: %.4f\n", data.OrderBook.Imbalance)

		// 解读不平衡度
		if data.OrderBook.Imbalance > 0.1 {
			fmt.Println("📈 买盘压力强劲 - 可能上涨")
		} else if data.OrderBook.Imbalance < -0.1 {
			fmt.Println("📉 卖盘压力强劲 - 可能下跌")
		} else {
			fmt.Println("⚖️ 买卖盘相对平衡")
		}

		fmt.Printf("\n最优买价: %.4f\n", data.OrderBook.BidPrice1)
		fmt.Printf("最优卖价: %.4f\n", data.OrderBook.AskPrice1)
		fmt.Printf("买卖价差: %.4f (%.4f%%)\n", data.OrderBook.Spread, data.OrderBook.SpreadPercent)
	}

	// 结合其他指标进行综合分析
	fmt.Println("\n=== 综合分析 ===")
	fmt.Printf("当前价格: %.2f\n", data.CurrentPrice)
	fmt.Printf("MACD: %.4f\n", data.CurrentMACD)
	fmt.Printf("RSI(7): %.2f\n", data.CurrentRSI7)

	if data.OrderBook != nil {
		// 示例: 当订单簿不平衡度与技术指标一致时,信号更强
		if data.OrderBook.Imbalance > 0.1 && data.CurrentMACD > 0 && data.CurrentRSI7 < 70 {
			fmt.Println("\n✅ 强买入信号: 订单簿买盘强 + MACD金叉 + RSI未超买")
		} else if data.OrderBook.Imbalance < -0.1 && data.CurrentMACD < 0 && data.CurrentRSI7 > 30 {
			fmt.Println("\n⚠️ 强卖出信号: 订单簿卖盘强 + MACD死叉 + RSI未超卖")
		}
	}
}
