package kernel

import (
	"encoding/json"
	"fmt"
	"nofx/market"
	"nofx/provider/nofxos"
	"sort"
	"strings"
	"time"
)

// ============================================================================
// AI Data Formatter
// ============================================================================
// Converts trading context into AI-friendly format, ensuring AI fully
// understands the data regardless of language.
// ============================================================================

// FormatContextForAI formats trading context into AI-readable text (including schema)
func FormatContextForAI(ctx *Context, lang Language) string {
	var sb strings.Builder

	// 1. Add schema description (so AI understands data format)
	sb.WriteString(GetSchemaPrompt(lang))
	sb.WriteString("\n---\n\n")

	// 2. Current state overview
	sb.WriteString(formatContextData(ctx, lang))

	return sb.String()
}

// FormatContextDataOnly formats context data only, without schema (for use when schema is already present)
func FormatContextDataOnly(ctx *Context, lang Language) string {
	return formatContextData(ctx, lang)
}

// formatContextData formats the core data section
func formatContextData(ctx *Context, lang Language) string {
	var sb strings.Builder

	// 1. Current state overview
	if lang == LangChinese {
		sb.WriteString(formatHeaderZH(ctx))
	} else {
		sb.WriteString(formatHeaderEN(ctx))
	}

	// 3. Account information
	if lang == LangChinese {
		sb.WriteString(formatAccountZH(ctx))
	} else {
		sb.WriteString(formatAccountEN(ctx))
	}

	// 4. Historical trading statistics
	if ctx.TradingStats != nil && ctx.TradingStats.TotalTrades > 0 {
		if lang == LangChinese {
			sb.WriteString(formatTradingStatsZH(ctx.TradingStats))
		} else {
			sb.WriteString(formatTradingStatsEN(ctx.TradingStats))
		}
	}

	// 5. Recent trade records
	if len(ctx.RecentOrders) > 0 {
		if lang == LangChinese {
			sb.WriteString(formatRecentTradesZH(ctx.RecentOrders))
		} else {
			sb.WriteString(formatRecentTradesEN(ctx.RecentOrders))
		}
	}

	// 5. Current positions
	if len(ctx.Positions) > 0 {
		if lang == LangChinese {
			sb.WriteString(formatCurrentPositionsZH(ctx))
		} else {
			sb.WriteString(formatCurrentPositionsEN(ctx))
		}
	}

	// 6. Candidate coins (with market data)
	if len(ctx.CandidateCoins) > 0 {
		if lang == LangChinese {
			sb.WriteString(formatCandidateCoinsZH(ctx))
		} else {
			sb.WriteString(formatCandidateCoinsEN(ctx))
		}
	}

	// User-defined external data sources (if available)
	if len(ctx.ExternalData) > 0 {
		sb.WriteString(formatExternalData(ctx.ExternalData, lang))
	}

	// 7. OI ranking data (if available)
	if ctx.OIRankingData != nil {
		nofxosLang := nofxos.LangEnglish
		if lang == LangChinese {
			nofxosLang = nofxos.LangChinese
		}
		sb.WriteString(nofxos.FormatOIRankingForAI(ctx.OIRankingData, nofxosLang))
	}

	return sb.String()
}

// ========== Chinese Formatting Functions ==========

// formatHeaderZH formats header information (Chinese)
func formatHeaderZH(ctx *Context) string {
	return fmt.Sprintf("# 📊 Trading Decision Request\n\nTime: %s | Cycle: #%d | Runtime: %d minutes\n\n",
		ctx.CurrentTime, ctx.CallCount, ctx.RuntimeMinutes)
}

// formatAccountZH formats account information (Chinese)
func formatAccountZH(ctx *Context) string {
	acc := ctx.Account
	var sb strings.Builder

	sb.WriteString("## Account Status\n\n")
	sb.WriteString(fmt.Sprintf("Total Equity: %.2f USDT | ", acc.TotalEquity))
	sb.WriteString(fmt.Sprintf("Available Balance: %.2f USDT (%.1f%%) | ", acc.AvailableBalance, (acc.AvailableBalance/acc.TotalEquity)*100))
	sb.WriteString(fmt.Sprintf("Total PnL: %+.2f%% | ", acc.TotalPnLPct))
	sb.WriteString(fmt.Sprintf("Margin Usage: %.1f%% | ", acc.MarginUsedPct))
	sb.WriteString(fmt.Sprintf("Position Count: %d\n\n", acc.PositionCount))

	// Add risk warnings
	if acc.MarginUsedPct > 70 {
		sb.WriteString("⚠️ **Risk Warning**: Margin usage > 70%, in a high-risk state!\n\n")
	} else if acc.MarginUsedPct > 50 {
		sb.WriteString("⚠️ **Risk Notice**: Margin usage > 50%, open positions with caution\n\n")
	}

	return sb.String()
}

// formatTradingStatsZH formats historical trading statistics (Chinese)
func formatTradingStatsZH(stats *TradingStats) string {
	var sb strings.Builder
	sb.WriteString("## Historical Trading Statistics\n\n")

	// Win/loss ratio calculation
	var winLossRatio float64
	if stats.AvgLoss > 0 {
		winLossRatio = stats.AvgWin / stats.AvgLoss
	}

	// Metric definitions (focusing on core metrics, excluding win rate)
	sb.WriteString("**Metric Definitions**:\n")
	sb.WriteString("- Profit Factor: Total Profit ÷ Total Loss (>1 means profitable, >1.5 good, >2 excellent)\n")
	sb.WriteString("- Sharpe Ratio: (Avg Return - Risk-free Return) ÷ Std Dev of Returns (>1 good, >2 excellent)\n")
	sb.WriteString("- Win/Loss Ratio: Avg Win ÷ Avg Loss (>1.5 good, >2 excellent)\n")
	sb.WriteString("- Max Drawdown: Largest decline of the equity curve from peak to trough (<20% is low risk)\n\n")

	// Data values
	sb.WriteString("**Current Data**:\n")
	sb.WriteString(fmt.Sprintf("- Total Trades: %d\n", stats.TotalTrades))
	sb.WriteString(fmt.Sprintf("- Profit Factor: %.2f\n", stats.ProfitFactor))
	sb.WriteString(fmt.Sprintf("- Sharpe Ratio: %.2f\n", stats.SharpeRatio))
	sb.WriteString(fmt.Sprintf("- Win/Loss Ratio: %.2f\n", winLossRatio))
	sb.WriteString(fmt.Sprintf("- Total PnL: %+.2f USDT\n", stats.TotalPnL))
	sb.WriteString(fmt.Sprintf("- Avg Win: +%.2f USDT\n", stats.AvgWin))
	sb.WriteString(fmt.Sprintf("- Avg Loss: -%.2f USDT\n", stats.AvgLoss))
	sb.WriteString(fmt.Sprintf("- Max Drawdown: %.1f%%\n\n", stats.MaxDrawdownPct))

	// Comprehensive analysis and decision guidance
	sb.WriteString("**Decision Reference**:\n")

	// Provide specific recommendations based on statistics
	if stats.TotalTrades < 10 {
		sb.WriteString("- Small sample size (<10 trades), statistics have limited reference value\n")
	}

	if stats.ProfitFactor >= 1.5 && stats.SharpeRatio >= 1 {
		sb.WriteString("- 📈 Good performance: you can keep the current strategy style\n")
	} else if stats.ProfitFactor >= 1.0 {
		sb.WriteString("- 📊 Normal performance: strategy is viable but has room for optimization\n")
	}

	if stats.ProfitFactor < 1.0 {
		sb.WriteString("- ⚠️ Profit Factor <1: losses exceed profits, improve win/loss ratio and optimize stops/targets\n")
	}

	if winLossRatio > 0 && winLossRatio < 1.5 {
		sb.WriteString("- ⚠️ Low win/loss ratio: let profits run and raise take-profit targets\n")
	}

	if stats.MaxDrawdownPct > 30 {
		sb.WriteString("- ⚠️ Max drawdown too high: reduce position size to control risk\n")
	} else if stats.MaxDrawdownPct < 10 {
		sb.WriteString("- ✅ Drawdown well controlled: risk management is effective\n")
	}

	sb.WriteString("\n")
	return sb.String()
}

// formatRecentTradesZH formats recent trades (Chinese)
func formatRecentTradesZH(orders []RecentOrder) string {
	var sb strings.Builder
	sb.WriteString("## Recently Closed Trades\n\n")

	for i, order := range orders {
		// Determine profit or loss
		profitOrLoss := "Profit"
		if order.RealizedPnL < 0 {
			profitOrLoss = "Loss"
		}

		sb.WriteString(fmt.Sprintf("%d. %s %s | Entry %.4f Exit %.4f | %s: %+.2f USDT (%+.2f%%) | %s → %s (%s)\n",
			i+1,
			order.Symbol,
			order.Side,
			order.EntryPrice,
			order.ExitPrice,
			profitOrLoss,
			order.RealizedPnL,
			order.PnLPct,
			order.EntryTime,
			order.ExitTime,
			order.HoldDuration,
		))
	}

	sb.WriteString("\n")
	return sb.String()
}

// formatCurrentPositionsZH formats current positions (Chinese)
func formatCurrentPositionsZH(ctx *Context) string {
	var sb strings.Builder
	sb.WriteString("## Current Positions\n\n")

	for i, pos := range ctx.Positions {
		// Calculate drawdown
		drawdown := pos.UnrealizedPnLPct - pos.PeakPnLPct

		sb.WriteString(fmt.Sprintf("%d. %s %s | ", i+1, pos.Symbol, strings.ToUpper(pos.Side)))
		sb.WriteString(fmt.Sprintf("Entry %.4f Current %.4f | ", pos.EntryPrice, pos.MarkPrice))
		sb.WriteString(fmt.Sprintf("Quantity %.4f | ", pos.Quantity))
		sb.WriteString(fmt.Sprintf("Position Value %.2f USDT | ", pos.Quantity*pos.MarkPrice))
		sb.WriteString(fmt.Sprintf("PnL %+.2f%% | ", pos.UnrealizedPnLPct))
		sb.WriteString(fmt.Sprintf("PnL Amount %+.2f USDT | ", pos.UnrealizedPnL))
		sb.WriteString(fmt.Sprintf("Peak PnL %.2f%% | ", pos.PeakPnLPct))
		sb.WriteString(fmt.Sprintf("Leverage %dx | ", pos.Leverage))
		sb.WriteString(fmt.Sprintf("Margin %.0f USDT | ", pos.MarginUsed))
		sb.WriteString(fmt.Sprintf("Liq Price %.4f\n", pos.LiquidationPrice))

		// Add analysis hints
		if drawdown < -0.30*pos.PeakPnLPct && pos.PeakPnLPct > 0.02 {
			sb.WriteString(fmt.Sprintf("   ⚠️ **Take-Profit Hint**: Current PnL retraced from peak %.2f%% to %.2f%%, drawdown %.2f%%, consider taking profit\n",
				pos.PeakPnLPct, pos.UnrealizedPnLPct, (drawdown/pos.PeakPnLPct)*100))
		}

		if pos.UnrealizedPnLPct < -4.0 {
			sb.WriteString("   ⚠️ **Stop-Loss Hint**: Loss approaching the -5% stop-loss line, consider stopping out\n")
		}

		// Show current price (if market data available)
		if ctx.MarketDataMap != nil {
			if mdata, ok := ctx.MarketDataMap[pos.Symbol]; ok {
				sb.WriteString(fmt.Sprintf("   📈 Current Price: %.4f\n", mdata.CurrentPrice))
			}
		}

		sb.WriteString("\n")
	}

	return sb.String()
}

// formatCandidateCoinsZH formats candidate coins (Chinese)
func formatCandidateCoinsZH(ctx *Context) string {
	var sb strings.Builder
	sb.WriteString("## Candidate Coins\n\n")

	for i, coin := range ctx.CandidateCoins {
		sb.WriteString(fmt.Sprintf("### %d. %s\n\n", i+1, coin.Symbol))

		// Current price
		if ctx.MarketDataMap != nil {
			if mdata, ok := ctx.MarketDataMap[coin.Symbol]; ok {
				sb.WriteString(fmt.Sprintf("Current Price: %.4f\n\n", mdata.CurrentPrice))

				// Kline data (multi-timeframe)
				if mdata.TimeframeData != nil {
					sb.WriteString(formatKlineDataZH(coin.Symbol, mdata.TimeframeData, ctx.Timeframes))
				}
			}
		}

		// OI data (if available)
		if ctx.OITopDataMap != nil {
			if oiData, ok := ctx.OITopDataMap[coin.Symbol]; ok {
				sb.WriteString(fmt.Sprintf("**OI Change**: OI Rank #%d | Change %+.2f%% (%+.2fM USDT) | Price Change %+.2f%%\n\n",
					oiData.Rank,
					oiData.OIDeltaPercent,
					oiData.OIDeltaValue/1_000_000,
					oiData.PriceDeltaPercent,
				))

				// OI interpretation
				oiChange := "increase"
				if oiData.OIDeltaPercent < 0 {
					oiChange = "decrease"
				}
				priceChange := "up"
				if oiData.PriceDeltaPercent < 0 {
					priceChange = "down"
				}

				interpretation := getOIInterpretationZH(oiChange, priceChange)
				sb.WriteString(fmt.Sprintf("**Market Interpretation**: %s\n\n", interpretation))
			}
		}
	}

	return sb.String()
}

// formatKlineDataZH formats kline data (Chinese)
func formatKlineDataZH(symbol string, tfData map[string]*market.TimeframeSeriesData, timeframes []string) string {
	var sb strings.Builder

	for _, tf := range timeframes {
		if data, ok := tfData[tf]; ok && len(data.Klines) > 0 {
			sb.WriteString(fmt.Sprintf("#### %s Timeframe (oldest to newest)\n\n", tf))
			sb.WriteString("```\n")
			sb.WriteString("Time(UTC)      Open      High      Low       Close     Volume\n")

			// Only show the latest 30 klines
			startIdx := 0
			if len(data.Klines) > 30 {
				startIdx = len(data.Klines) - 30
			}

			for i := startIdx; i < len(data.Klines); i++ {
				k := data.Klines[i]
				t := time.UnixMilli(k.Time).UTC()
				sb.WriteString(fmt.Sprintf("%s    %.4f    %.4f    %.4f    %.4f    %.2f\n",
					t.Format("01-02 15:04"),
					k.Open,
					k.High,
					k.Low,
					k.Close,
					k.Volume,
				))
			}

			// Mark the last kline
			if len(data.Klines) > 0 {
				sb.WriteString("    <- current\n")
			}

			sb.WriteString("```\n\n")
		}
	}

	return sb.String()
}

// getOIInterpretationZH returns OI change interpretation (Chinese)
func getOIInterpretationZH(oiChange, priceChange string) string {
	if oiChange == "increase" && priceChange == "up" {
		return OIInterpretation.OIUp_PriceUp.ZH
	} else if oiChange == "increase" && priceChange == "down" {
		return OIInterpretation.OIUp_PriceDown.ZH
	} else if oiChange == "decrease" && priceChange == "up" {
		return OIInterpretation.OIDown_PriceUp.ZH
	} else {
		return OIInterpretation.OIDown_PriceDown.ZH
	}
}

// ========== English Formatting Functions ==========

// formatHeaderEN formats header information (English)
func formatHeaderEN(ctx *Context) string {
	return fmt.Sprintf("# 📊 Trading Decision Request\n\nTime: %s | Period: #%d | Runtime: %d minutes\n\n",
		ctx.CurrentTime, ctx.CallCount, ctx.RuntimeMinutes)
}

// formatAccountEN formats account information (English)
func formatAccountEN(ctx *Context) string {
	acc := ctx.Account
	var sb strings.Builder

	sb.WriteString("## Account Status\n\n")
	sb.WriteString(fmt.Sprintf("Total Equity: %.2f USDT | ", acc.TotalEquity))
	sb.WriteString(fmt.Sprintf("Available Balance: %.2f USDT (%.1f%%) | ", acc.AvailableBalance, (acc.AvailableBalance/acc.TotalEquity)*100))
	sb.WriteString(fmt.Sprintf("Total PnL: %+.2f%% | ", acc.TotalPnLPct))
	sb.WriteString(fmt.Sprintf("Margin Usage: %.1f%% | ", acc.MarginUsedPct))
	sb.WriteString(fmt.Sprintf("Positions: %d\n\n", acc.PositionCount))

	// Risk warning
	if acc.MarginUsedPct > 70 {
		sb.WriteString("⚠️ **Risk Alert**: Margin usage > 70%, high risk!\n\n")
	} else if acc.MarginUsedPct > 50 {
		sb.WriteString("⚠️ **Risk Notice**: Margin usage > 50%, be cautious with new positions\n\n")
	}

	return sb.String()
}

// formatTradingStatsEN formats historical trading statistics (English)
func formatTradingStatsEN(stats *TradingStats) string {
	var sb strings.Builder
	sb.WriteString("## Historical Trading Statistics\n\n")

	// Win/Loss ratio calculation
	var winLossRatio float64
	if stats.AvgLoss > 0 {
		winLossRatio = stats.AvgWin / stats.AvgLoss
	}

	// Metric definitions (focus on core metrics, remove win rate)
	sb.WriteString("**Metric Definitions**:\n")
	sb.WriteString("- Profit Factor: Total profits ÷ Total losses (>1 = profitable, >1.5 = good, >2 = excellent)\n")
	sb.WriteString("- Sharpe Ratio: (Avg return - Risk-free rate) ÷ Std dev of returns (>1 = good, >2 = excellent)\n")
	sb.WriteString("- Win/Loss Ratio: Avg win ÷ Avg loss (>1.5 = good, >2 = excellent)\n")
	sb.WriteString("- Max Drawdown: Largest peak-to-trough decline in equity curve (<20% = low risk)\n\n")

	// Data values
	sb.WriteString("**Current Data**:\n")
	sb.WriteString(fmt.Sprintf("- Total Trades: %d\n", stats.TotalTrades))
	sb.WriteString(fmt.Sprintf("- Profit Factor: %.2f\n", stats.ProfitFactor))
	sb.WriteString(fmt.Sprintf("- Sharpe Ratio: %.2f\n", stats.SharpeRatio))
	sb.WriteString(fmt.Sprintf("- Win/Loss Ratio: %.2f\n", winLossRatio))
	sb.WriteString(fmt.Sprintf("- Total PnL: %+.2f USDT\n", stats.TotalPnL))
	sb.WriteString(fmt.Sprintf("- Avg Win: +%.2f USDT\n", stats.AvgWin))
	sb.WriteString(fmt.Sprintf("- Avg Loss: -%.2f USDT\n", stats.AvgLoss))
	sb.WriteString(fmt.Sprintf("- Max Drawdown: %.1f%%\n\n", stats.MaxDrawdownPct))

	// Analysis and decision guidance
	sb.WriteString("**Decision Guidance**:\n")

	// Specific recommendations based on stats
	if stats.TotalTrades < 10 {
		sb.WriteString("- Small sample size (<10 trades), statistics have limited significance\n")
	}

	if stats.ProfitFactor >= 1.5 && stats.SharpeRatio >= 1 {
		sb.WriteString("- 📈 Good performance: Maintain current strategy approach\n")
	} else if stats.ProfitFactor >= 1.0 {
		sb.WriteString("- 📊 Normal performance: Strategy viable but has room for optimization\n")
	}

	if stats.ProfitFactor < 1.0 {
		sb.WriteString("- ⚠️ Profit factor <1: Losses exceed profits, improve win/loss ratio, optimize TP/SL\n")
	}

	if winLossRatio > 0 && winLossRatio < 1.5 {
		sb.WriteString("- ⚠️ Low win/loss ratio: Let profits run, increase take-profit targets\n")
	}

	if stats.MaxDrawdownPct > 30 {
		sb.WriteString("- ⚠️ High max drawdown: Consider reducing position sizes to control risk\n")
	} else if stats.MaxDrawdownPct < 10 {
		sb.WriteString("- ✅ Good drawdown control: Risk management is effective\n")
	}

	sb.WriteString("\n")
	return sb.String()
}

// formatRecentTradesEN formats recent trades (English)
func formatRecentTradesEN(orders []RecentOrder) string {
	var sb strings.Builder
	sb.WriteString("## Recent Completed Trades\n\n")

	for i, order := range orders {
		profitOrLoss := "Profit"
		if order.RealizedPnL < 0 {
			profitOrLoss = "Loss"
		}

		sb.WriteString(fmt.Sprintf("%d. %s %s | Entry %.4f Exit %.4f | %s: %+.2f USDT (%+.2f%%) | %s → %s (%s)\n",
			i+1,
			order.Symbol,
			order.Side,
			order.EntryPrice,
			order.ExitPrice,
			profitOrLoss,
			order.RealizedPnL,
			order.PnLPct,
			order.EntryTime,
			order.ExitTime,
			order.HoldDuration,
		))
	}

	sb.WriteString("\n")
	return sb.String()
}

// formatCurrentPositionsEN formats current positions (English)
func formatCurrentPositionsEN(ctx *Context) string {
	var sb strings.Builder
	sb.WriteString("## Current Positions\n\n")

	for i, pos := range ctx.Positions {
		drawdown := pos.UnrealizedPnLPct - pos.PeakPnLPct

		sb.WriteString(fmt.Sprintf("%d. %s %s | ", i+1, pos.Symbol, strings.ToUpper(pos.Side)))
		sb.WriteString(fmt.Sprintf("Entry %.4f Current %.4f | ", pos.EntryPrice, pos.MarkPrice))
		sb.WriteString(fmt.Sprintf("Qty %.4f | ", pos.Quantity))
		sb.WriteString(fmt.Sprintf("Value %.2f USDT | ", pos.Quantity*pos.MarkPrice))
		sb.WriteString(fmt.Sprintf("PnL %+.2f%% | ", pos.UnrealizedPnLPct))
		sb.WriteString(fmt.Sprintf("PnL Amount %+.2f USDT | ", pos.UnrealizedPnL))
		sb.WriteString(fmt.Sprintf("Peak PnL %.2f%% | ", pos.PeakPnLPct))
		sb.WriteString(fmt.Sprintf("Leverage %dx | ", pos.Leverage))
		sb.WriteString(fmt.Sprintf("Margin %.0f USDT | ", pos.MarginUsed))
		sb.WriteString(fmt.Sprintf("Liq Price %.4f\n", pos.LiquidationPrice))

		// Analysis hints
		if drawdown < -0.30*pos.PeakPnLPct && pos.PeakPnLPct > 0.02 {
			sb.WriteString(fmt.Sprintf("   ⚠️ **Take Profit Alert**: PnL dropped from peak %.2f%% to %.2f%%, drawdown %.2f%%, consider taking profit\n",
				pos.PeakPnLPct, pos.UnrealizedPnLPct, (drawdown/pos.PeakPnLPct)*100))
		}

		if pos.UnrealizedPnLPct < -4.0 {
			sb.WriteString("   ⚠️ **Stop Loss Alert**: Loss approaching -5% threshold, consider cutting loss\n")
		}

		if ctx.MarketDataMap != nil {
			if mdata, ok := ctx.MarketDataMap[pos.Symbol]; ok {
				sb.WriteString(fmt.Sprintf("   📈 Current Price: %.4f\n", mdata.CurrentPrice))
			}
		}

		sb.WriteString("\n")
	}

	return sb.String()
}

// formatCandidateCoinsEN formats candidate coins (English)
func formatCandidateCoinsEN(ctx *Context) string {
	var sb strings.Builder
	sb.WriteString("## Candidate Coins\n\n")

	for i, coin := range ctx.CandidateCoins {
		sb.WriteString(fmt.Sprintf("### %d. %s\n\n", i+1, coin.Symbol))

		if ctx.MarketDataMap != nil {
			if mdata, ok := ctx.MarketDataMap[coin.Symbol]; ok {
				sb.WriteString(fmt.Sprintf("Current Price: %.4f\n\n", mdata.CurrentPrice))

				if mdata.TimeframeData != nil {
					sb.WriteString(formatKlineDataEN(coin.Symbol, mdata.TimeframeData, ctx.Timeframes))
				}
			}
		}

		if ctx.OITopDataMap != nil {
			if oiData, ok := ctx.OITopDataMap[coin.Symbol]; ok {
				sb.WriteString(fmt.Sprintf("**OI Change**: Rank #%d | Change %+.2f%% (%+.2fM USDT) | Price Change %+.2f%%\n\n",
					oiData.Rank,
					oiData.OIDeltaPercent,
					oiData.OIDeltaValue/1_000_000,
					oiData.PriceDeltaPercent,
				))

				oiChange := "increase"
				if oiData.OIDeltaPercent < 0 {
					oiChange = "decrease"
				}
				priceChange := "up"
				if oiData.PriceDeltaPercent < 0 {
					priceChange = "down"
				}

				interpretation := getOIInterpretationEN(oiChange, priceChange)
				sb.WriteString(fmt.Sprintf("**Market Interpretation**: %s\n\n", interpretation))
			}
		}
	}

	return sb.String()
}

// formatKlineDataEN formats kline data (English)
func formatKlineDataEN(symbol string, tfData map[string]*market.TimeframeSeriesData, timeframes []string) string {
	var sb strings.Builder

	// Sort timeframes for consistent output
	sortedTF := make([]string, len(timeframes))
	copy(sortedTF, timeframes)
	sort.Strings(sortedTF)

	for _, tf := range sortedTF {
		if data, ok := tfData[tf]; ok && len(data.Klines) > 0 {
			sb.WriteString(fmt.Sprintf("#### %s Timeframe (oldest → latest)\n\n", tf))
			sb.WriteString("```\n")
			sb.WriteString("Time(UTC)      Open      High      Low       Close     Volume\n")

			startIdx := 0
			if len(data.Klines) > 30 {
				startIdx = len(data.Klines) - 30
			}

			for i := startIdx; i < len(data.Klines); i++ {
				k := data.Klines[i]
				t := time.UnixMilli(k.Time).UTC()
				sb.WriteString(fmt.Sprintf("%s    %.4f    %.4f    %.4f    %.4f    %.2f\n",
					t.Format("01-02 15:04"),
					k.Open,
					k.High,
					k.Low,
					k.Close,
					k.Volume,
				))
			}

			if len(data.Klines) > 0 {
				sb.WriteString("    <- current\n")
			}

			sb.WriteString("```\n\n")
		}
	}

	return sb.String()
}

// getOIInterpretationEN returns OI change interpretation (English)
func getOIInterpretationEN(oiChange, priceChange string) string {
	if oiChange == "increase" && priceChange == "up" {
		return OIInterpretation.OIUp_PriceUp.EN
	} else if oiChange == "increase" && priceChange == "down" {
		return OIInterpretation.OIUp_PriceDown.EN
	} else if oiChange == "decrease" && priceChange == "up" {
		return OIInterpretation.OIDown_PriceUp.EN
	} else {
		return OIInterpretation.OIDown_PriceDown.EN
	}
}

// formatExternalData formats user-defined external data sources for the AI
// context. Each source's JSON is rendered compactly under its configured name,
// in sorted order for deterministic prompts.
func formatExternalData(externalData map[string]interface{}, lang Language) string {
	var sb strings.Builder
	if lang == LangChinese {
		sb.WriteString("## 外部数据源\n\n")
	} else {
		sb.WriteString("## External Data Sources\n\n")
	}

	names := make([]string, 0, len(externalData))
	for name := range externalData {
		names = append(names, name)
	}
	sort.Strings(names)

	for _, name := range names {
		encoded, err := json.Marshal(externalData[name])
		if err != nil {
			continue
		}
		sb.WriteString(fmt.Sprintf("- %s: %s\n", name, string(encoded)))
	}
	sb.WriteString("\n")
	return sb.String()
}
