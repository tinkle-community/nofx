package market

import (
	"encoding/json"
	"fmt"
	"log"
	"nofx/pool"
	"strings"
	"time"
)

// PositionInfo 持仓信息
type PositionInfo struct {
	Symbol           string  `json:"symbol"`
	Side             string  `json:"side"` // "long" or "short"
	EntryPrice       float64 `json:"entry_price"`
	MarkPrice        float64 `json:"mark_price"`
	Quantity         float64 `json:"quantity"`
	Leverage         int     `json:"leverage"`
	UnrealizedPnL    float64 `json:"unrealized_pnl"`
	UnrealizedPnLPct float64 `json:"unrealized_pnl_pct"`
	LiquidationPrice float64 `json:"liquidation_price"`
	MarginUsed       float64 `json:"margin_used"`
}

// AccountInfo 账户信息
type AccountInfo struct {
	TotalEquity      float64 `json:"total_equity"`      // 账户净值
	AvailableBalance float64 `json:"available_balance"` // 可用余额
	TotalPnL         float64 `json:"total_pnl"`         // 总盈亏
	TotalPnLPct      float64 `json:"total_pnl_pct"`     // 总盈亏百分比
	MarginUsed       float64 `json:"margin_used"`       // 已用保证金
	MarginUsedPct    float64 `json:"margin_used_pct"`   // 保证金使用率
	PositionCount    int     `json:"position_count"`    // 持仓数量
}

// CandidateCoin 候选币种（来自币种池）
type CandidateCoin struct {
	Symbol  string   `json:"symbol"`
	Sources []string `json:"sources"` // 来源: "ai500" 和/或 "oi_top"
}

// OITopData 持仓量增长Top数据（用于AI决策参考）
type OITopData struct {
	Rank              int     // OI Top排名
	OIDeltaPercent    float64 // 持仓量变化百分比（1小时）
	OIDeltaValue      float64 // 持仓量变化价值
	PriceDeltaPercent float64 // 价格变化百分比
	NetLong           float64 // 净多仓
	NetShort          float64 // 净空仓
}

// TradingContext 交易上下文（传递给AI的完整信息）
type TradingContext struct {
	CurrentTime    string                 `json:"current_time"`
	RuntimeMinutes int                    `json:"runtime_minutes"`
	CallCount      int                    `json:"call_count"`
	Account        AccountInfo            `json:"account"`
	Positions      []PositionInfo         `json:"positions"`
	CandidateCoins []CandidateCoin        `json:"candidate_coins"`
	MarketDataMap  map[string]*MarketData `json:"-"` // 不序列化，但内部使用
	OITopDataMap   map[string]*OITopData  `json:"-"` // OI Top数据映射
	Performance    interface{}            `json:"-"` // 历史表现分析（logger.PerformanceAnalysis）
}

// TradingDecision AI的交易决策
type TradingDecision struct {
	Symbol          string  `json:"symbol"`
	Action          string  `json:"action"` // "open_long", "open_short", "close_long", "close_short", "hold", "wait"
	Leverage        int     `json:"leverage,omitempty"`
	PositionSizeUSD float64 `json:"position_size_usd,omitempty"`
	StopLoss        float64 `json:"stop_loss,omitempty"`
	TakeProfit      float64 `json:"take_profit,omitempty"`
	Reasoning       string  `json:"reasoning"`
}

// AIFullDecision AI的完整决策（包含思维链）
type AIFullDecision struct {
	CoTTrace  string            `json:"cot_trace"` // 思维链分析
	Decisions []TradingDecision `json:"decisions"` // 具体决策列表
	Timestamp time.Time         `json:"timestamp"`
}

// GetFullTradingDecision 获取AI的完整交易决策（批量分析所有币种和持仓）
func GetFullTradingDecision(ctx *TradingContext) (*AIFullDecision, error) {
	// 1. 为所有币种获取市场数据
	if err := fetchMarketDataForContext(ctx); err != nil {
		return nil, fmt.Errorf("获取市场数据失败: %w", err)
	}

	// 2. 构建AI提示
	prompt := buildFullDecisionPrompt(ctx)

	// 3. 调用AI API
	aiResponse, err := callDeepSeekAPI(prompt)
	if err != nil {
		return nil, fmt.Errorf("调用AI API失败: %w", err)
	}

	// 4. 解析AI响应
	decision, err := parseFullDecisionResponse(aiResponse, ctx.Account.TotalEquity)
	if err != nil {
		return nil, fmt.Errorf("解析AI响应失败: %w", err)
	}

	decision.Timestamp = time.Now()
	return decision, nil
}

// fetchMarketDataForContext 为上下文中的所有币种获取市场数据和OI数据
func fetchMarketDataForContext(ctx *TradingContext) error {
	ctx.MarketDataMap = make(map[string]*MarketData)
	ctx.OITopDataMap = make(map[string]*OITopData)

	// 收集所有需要获取数据的币种
	symbolSet := make(map[string]bool)

	// 1. 优先获取持仓币种的数据（这是必须的）
	for _, pos := range ctx.Positions {
		symbolSet[pos.Symbol] = true
	}

	// 2. 候选币种数量根据账户状态动态调整
	maxCandidates := calculateMaxCandidates(ctx)
	for i, coin := range ctx.CandidateCoins {
		if i >= maxCandidates {
			break
		}
		symbolSet[coin.Symbol] = true
	}

	// 并发获取市场数据
	// 持仓币种集合（用于判断是否跳过OI检查）
	positionSymbols := make(map[string]bool)
	for _, pos := range ctx.Positions {
		positionSymbols[pos.Symbol] = true
	}

	for symbol := range symbolSet {
		data, err := GetMarketData(symbol)
		if err != nil {
			// 单个币种失败不影响整体，只记录错误
			continue
		}

		// ⚠️ 流动性过滤：持仓价值低于15M USD的币种不做（多空都不做）
		// 持仓价值 = 持仓量 × 当前价格
		// 但现有持仓必须保留（需要决策是否平仓）
		isExistingPosition := positionSymbols[symbol]
		if !isExistingPosition && data.OpenInterest != nil && data.CurrentPrice > 0 {
			// 计算持仓价值（USD）= 持仓量 × 当前价格
			oiValue := data.OpenInterest.Latest * data.CurrentPrice
			oiValueInMillions := oiValue / 1_000_000 // 转换为百万美元单位
			if oiValueInMillions < 15 {
				log.Printf("⚠️  %s 持仓价值过低(%.2fM USD < 15M)，跳过此币种 [持仓量:%.0f × 价格:%.4f]",
					symbol, oiValueInMillions, data.OpenInterest.Latest, data.CurrentPrice)
				continue
			}
		}

		ctx.MarketDataMap[symbol] = data
	}

	// 加载OI Top数据（不影响主流程）
	oiPositions, err := pool.GetOITopPositions()
	if err == nil {
		for _, pos := range oiPositions {
			// 标准化符号匹配
			symbol := pos.Symbol
			ctx.OITopDataMap[symbol] = &OITopData{
				Rank:              pos.Rank,
				OIDeltaPercent:    pos.OIDeltaPercent,
				OIDeltaValue:      pos.OIDeltaValue,
				PriceDeltaPercent: pos.PriceDeltaPercent,
				NetLong:           pos.NetLong,
				NetShort:          pos.NetShort,
			}
		}
	}

	return nil
}

// calculateMaxCandidates 根据账户状态计算需要分析的候选币种数量
func calculateMaxCandidates(ctx *TradingContext) int {
	// 直接返回候选池的全部币种数量
	// 因为候选池已经在 auto_trader.go 中筛选过了
	// 固定分析前20个评分最高的币种（来自AI500）
	return len(ctx.CandidateCoins)
}

// buildFullDecisionPrompt 构建完整的AI决策提示
func buildFullDecisionPrompt(ctx *TradingContext) string {
	var sb strings.Builder

	sb.WriteString("# 🤖 加密货币交易AI竞赛系统\n\n")
	sb.WriteString("你是专业的加密货币交易AI，根据市场数据自主决策，做多做空均可。\n\n")

	// 添加BTC市场趋势
	sb.WriteString("## 🌍 BTC市场趋势\n")
	if btcData, hasBTC := ctx.MarketDataMap["BTCUSDT"]; hasBTC {
		sb.WriteString(fmt.Sprintf("- 价格: %.2f | 1h: %+.2f%% | 4h: %+.2f%%\n",
			btcData.CurrentPrice, btcData.PriceChange1h, btcData.PriceChange4h))
		sb.WriteString(fmt.Sprintf("- MACD: %.4f | RSI: %.2f | 资金费率: %.6f\n\n",
			btcData.CurrentMACD, btcData.CurrentRSI7, btcData.FundingRate))
	} else {
		sb.WriteString("BTC数据暂无\n\n")
	}

	// 系统状态
	sb.WriteString("## 📊 系统状态\n")
	sb.WriteString(fmt.Sprintf("- **当前时间**: %s\n", ctx.CurrentTime))
	sb.WriteString(fmt.Sprintf("- **运行时长**: %d 分钟\n", ctx.RuntimeMinutes))
	sb.WriteString(fmt.Sprintf("- **调用次数**: 第 %d 次\n\n", ctx.CallCount))

	// 账户信息
	sb.WriteString("## 💰 账户信息\n")
	sb.WriteString(fmt.Sprintf("- **账户净值**: %.2f USDT\n", ctx.Account.TotalEquity))
	sb.WriteString(fmt.Sprintf("- **可用余额**: %.2f USDT (%.1f%%)\n",
		ctx.Account.AvailableBalance,
		(ctx.Account.AvailableBalance/ctx.Account.TotalEquity)*100))
	sb.WriteString(fmt.Sprintf("- **总盈亏**: %.2f USDT (%+.2f%%)\n",
		ctx.Account.TotalPnL, ctx.Account.TotalPnLPct))
	sb.WriteString(fmt.Sprintf("- **已用保证金**: %.2f USDT (%.1f%%)\n",
		ctx.Account.MarginUsed, ctx.Account.MarginUsedPct))
	sb.WriteString(fmt.Sprintf("- **持仓数量**: %d\n\n", ctx.Account.PositionCount))

	// 当前持仓详情
	if len(ctx.Positions) > 0 {
		sb.WriteString("## 📈 当前持仓\n")
		for i, pos := range ctx.Positions {
			sb.WriteString(fmt.Sprintf("\n### 持仓 #%d: %s %s\n", i+1, pos.Symbol, strings.ToUpper(pos.Side)))
			sb.WriteString(fmt.Sprintf("- **入场价**: %.4f USDT\n", pos.EntryPrice))
			sb.WriteString(fmt.Sprintf("- **当前价**: %.4f USDT\n", pos.MarkPrice))
			sb.WriteString(fmt.Sprintf("- **数量**: %.4f\n", pos.Quantity))
			sb.WriteString(fmt.Sprintf("- **杠杆**: %dx\n", pos.Leverage))
			sb.WriteString(fmt.Sprintf("- **未实现盈亏**: %.2f USDT (%+.2f%%)\n",
				pos.UnrealizedPnL, pos.UnrealizedPnLPct))
			sb.WriteString(fmt.Sprintf("- **强平价**: %.4f USDT\n", pos.LiquidationPrice))
			sb.WriteString(fmt.Sprintf("- **占用保证金**: %.2f USDT\n", pos.MarginUsed))

			// 添加市场数据
			if marketData, ok := ctx.MarketDataMap[pos.Symbol]; ok {
				sb.WriteString(formatMarketDataBrief(marketData))
			}
		}
		sb.WriteString("\n")
	} else {
		sb.WriteString("## 📈 当前持仓\n")
		sb.WriteString("暂无持仓\n\n")
	}

	// 候选币种池
	sb.WriteString("## 🎯 候选币种池\n")
	sb.WriteString(fmt.Sprintf("共 %d 个币种（已过滤持仓价值<15M USD的低流动性币种）\n\n", len(ctx.MarketDataMap)))

	displayedCount := 0
	for _, coin := range ctx.CandidateCoins {
		// 只显示已获取市场数据的币种
		marketData, hasData := ctx.MarketDataMap[coin.Symbol]
		if !hasData {
			continue
		}
		displayedCount++

		// 显示币种来源标签 - 使用圆括号避免与JSON混淆
		sourceTags := ""
		hasAI500 := false
		hasOITop := false
		for _, source := range coin.Sources {
			if source == "ai500" {
				hasAI500 = true
			} else if source == "oi_top" {
				hasOITop = true
			}
		}

		if hasAI500 && hasOITop {
			sourceTags = "(AI500+OI_Top双重信号)"
		} else if hasAI500 {
			sourceTags = "(AI500高评分)"
		} else if hasOITop {
			sourceTags = "(OI_Top持仓增长)"
		}

		sb.WriteString(fmt.Sprintf("\n### 币种 #%d: %s %s\n", displayedCount, coin.Symbol, sourceTags))
		sb.WriteString(formatMarketDataBrief(marketData))

		// 如果有OI Top数据，也显示出来
		if oiTopData, hasOI := ctx.OITopDataMap[coin.Symbol]; hasOI {
			sb.WriteString(fmt.Sprintf("**市场热度数据** (OI Top排名 #%d):\n", oiTopData.Rank))
			sb.WriteString(fmt.Sprintf("  - 持仓量1h变化: %+.2f%% (价值: $%.0f)\n",
				oiTopData.OIDeltaPercent, oiTopData.OIDeltaValue))
			sb.WriteString(fmt.Sprintf("  - 价格1h变化: %+.2f%% | 净多仓: %.0f | 净空仓: %.0f\n",
				oiTopData.PriceDeltaPercent, oiTopData.NetLong, oiTopData.NetShort))
		}
	}

	// 添加历史表现反馈（如果有）
	if ctx.Performance != nil {
		sb.WriteString(formatPerformanceFeedback(ctx.Performance))
	}

	// AI决策要求
	sb.WriteString("## 🎯 任务\n\n")
	sb.WriteString("分析市场数据，自主决策：\n")
	sb.WriteString("1. 评估现有持仓 → 持有或平仓\n")
	sb.WriteString(fmt.Sprintf("2. 从%d个候选币种中找交易机会\n", len(ctx.MarketDataMap)))
	sb.WriteString("3. 开新仓（如果有机会）\n\n")

	sb.WriteString("## 📋 规则\n\n")
	sb.WriteString(fmt.Sprintf("1. **单币种仓位上限**: 山寨币≤%.0f USDT | BTC/ETH≤%.0f USDT\n", ctx.Account.TotalEquity*1.5, ctx.Account.TotalEquity*10))
	sb.WriteString("2. **杠杆**: 山寨币=20倍 | BTC/ETH=50倍\n")
	sb.WriteString("3. **保证金上限**: 总使用率≤90%%\n")
	sb.WriteString("4. **风险回报比**: ≥1:2\n\n")

	sb.WriteString("### 📤 输出格式\n\n")
	sb.WriteString("**思维链分析** (纯文本)\n")
	sb.WriteString("- 分析持仓 → 找新机会 → 账户检查\n")
	sb.WriteString("- **最后必须列出最终决策摘要**（例如：持有XX，平仓XX，开多XX，开空XX）\n\n")
	sb.WriteString("---\n\n")
	sb.WriteString("**决策JSON** (不要用```标记)\n")
	sb.WriteString("[\n")
	sb.WriteString("  {\"symbol\": \"BTCUSDT\", \"action\": \"open_long\", \"leverage\": 50, \"position_size_usd\": 15000, \"stop_loss\": 92000, \"take_profit\": 98000, \"reasoning\": \"突破做多\"},\n")
	sb.WriteString("  {\"symbol\": \"ETHUSDT\", \"action\": \"hold\", \"reasoning\": \"持续观察\"}\n")
	sb.WriteString("]\n\n")
	sb.WriteString("**action类型**: open_long | open_short | close_long | close_short | hold | wait\n")
	sb.WriteString("**开仓必填**: leverage, position_size_usd, stop_loss, take_profit\n")
	sb.WriteString("**position_size_usd**: 仓位价值(非保证金)，保证金=position_size_usd/leverage\n\n")

	sb.WriteString("### 📝 完整示例\n\n")

	// 简化示例仓位（使用新的仓位上限）
	btcSize := ctx.Account.TotalEquity * 8 // BTC示例：8倍净值（不超过10倍上限）
	altSize := ctx.Account.TotalEquity * 1 // 山寨币示例：1倍净值（不超过1.5倍上限）

	sb.WriteString("**思维链**:\n")
	sb.WriteString("当前持仓：ETHUSDT多头盈利+2.3%，趋势良好继续持有。\n")
	sb.WriteString("新机会：BTC突破上涨，MACD金叉，资金费率低，做多信号强。\n")
	sb.WriteString("         SOLUSDT回调至支撑位，出现反弹信号，可小仓位做多。\n")
	sb.WriteString("账户：可用余额充足，保证金使用率32%，可分散开仓。\n")
	sb.WriteString("**最终决策**：持有ETHUSDT，开多BTCUSDT(8倍净值)，开多SOLUSDT(1倍净值)。\n\n")
	sb.WriteString("---\n\n")
	sb.WriteString("[\n")
	sb.WriteString("  {\"symbol\": \"ETHUSDT\", \"action\": \"hold\", \"reasoning\": \"盈利良好，趋势延续\"},\n")
	sb.WriteString(fmt.Sprintf("  {\"symbol\": \"BTCUSDT\", \"action\": \"open_long\", \"leverage\": 50, \"position_size_usd\": %.0f, \"stop_loss\": 92000, \"take_profit\": 98000, \"reasoning\": \"突破做多\"},\n", btcSize))
	sb.WriteString(fmt.Sprintf("  {\"symbol\": \"SOLUSDT\", \"action\": \"open_long\", \"leverage\": 20, \"position_size_usd\": %.0f, \"stop_loss\": 180, \"take_profit\": 210, \"reasoning\": \"支撑位反弹\"}\n", altSize))
	sb.WriteString("]\n\n")

	sb.WriteString("现在请开始分析并给出你的决策！\n")

	return sb.String()
}

// formatPerformanceFeedback 格式化历史表现反馈
func formatPerformanceFeedback(perfInterface interface{}) string {
	// 类型断言（避免循环依赖，使用interface{}）
	type TradeOutcome struct {
		Symbol     string
		Side       string
		OpenPrice  float64
		ClosePrice float64
		PnL        float64
		PnLPct     float64
		Duration   string
	}
	type SymbolPerformance struct {
		Symbol        string
		TotalTrades   int
		WinningTrades int
		LosingTrades  int
		WinRate       float64
		TotalPnL      float64
		AvgPnL        float64
	}
	type PerformanceAnalysis struct {
		TotalTrades   int
		WinningTrades int
		LosingTrades  int
		WinRate       float64
		AvgWin        float64
		AvgLoss       float64
		ProfitFactor  float64
		RecentTrades  []TradeOutcome
		SymbolStats   map[string]*SymbolPerformance
		BestSymbol    string
		WorstSymbol   string
	}

	// 使用JSON转换进行类型转换（避免直接类型断言）
	jsonData, _ := json.Marshal(perfInterface)
	var perf PerformanceAnalysis
	if err := json.Unmarshal(jsonData, &perf); err != nil {
		return ""
	}

	var sb strings.Builder

	sb.WriteString("## 📊 历史表现反馈\n\n")

	if perf.TotalTrades == 0 {
		sb.WriteString("暂无历史交易数据\n\n")
		return sb.String()
	}

	// 整体统计
	sb.WriteString("### 整体表现\n")
	sb.WriteString(fmt.Sprintf("- **总交易数**: %d 笔 (盈利: %d | 亏损: %d)\n",
		perf.TotalTrades, perf.WinningTrades, perf.LosingTrades))
	sb.WriteString(fmt.Sprintf("- **胜率**: %.1f%%\n", perf.WinRate))
	sb.WriteString(fmt.Sprintf("- **平均盈利**: +%.2f%% | 平均亏损: %.2f%%\n",
		perf.AvgWin, perf.AvgLoss))
	if perf.ProfitFactor > 0 {
		sb.WriteString(fmt.Sprintf("- **盈亏比**: %.2f:1\n", perf.ProfitFactor))
	}
	sb.WriteString("\n")

	// 最近交易
	if len(perf.RecentTrades) > 0 {
		sb.WriteString("### 最近交易\n")
		displayCount := len(perf.RecentTrades)
		if displayCount > 5 {
			displayCount = 5
		}
		for i := 0; i < displayCount; i++ {
			trade := perf.RecentTrades[i]
			outcome := "✓"
			if trade.PnL < 0 {
				outcome = "✗"
			}
			sb.WriteString(fmt.Sprintf("%d. %s %s: %.4f → %.4f = %+.2f%% %s\n",
				i+1, trade.Symbol, strings.ToUpper(trade.Side),
				trade.OpenPrice, trade.ClosePrice,
				trade.PnLPct, outcome))
		}
		sb.WriteString("\n")
	}

	// 币种表现（显示前3个最好和最差）
	if len(perf.SymbolStats) > 0 {
		sb.WriteString("### 币种表现\n")

		if perf.BestSymbol != "" {
			if stats, exists := perf.SymbolStats[perf.BestSymbol]; exists {
				sb.WriteString(fmt.Sprintf("- **最佳**: %s (胜率%.0f%%, 平均%+.2f%%)\n",
					stats.Symbol, stats.WinRate, stats.AvgPnL))
			}
		}

		if perf.WorstSymbol != "" {
			if stats, exists := perf.SymbolStats[perf.WorstSymbol]; exists {
				sb.WriteString(fmt.Sprintf("- **最差**: %s (胜率%.0f%%, 平均%+.2f%%)\n",
					stats.Symbol, stats.WinRate, stats.AvgPnL))
			}
		}
		sb.WriteString("\n")
	}

	return sb.String()
}

// formatMarketDataBrief 格式化市场数据（简洁版）
func formatMarketDataBrief(data *MarketData) string {
	var sb strings.Builder

	sb.WriteString("**市场数据** (3分钟线):\n")
	sb.WriteString(fmt.Sprintf("  - 价格: %.4f | 1h变化: %+.2f%% | 4h变化: %+.2f%% (%s)\n",
		data.CurrentPrice, data.PriceChange1h, data.PriceChange4h, priceTrend(data.PriceChange1h, data.PriceChange4h)))
	sb.WriteString(fmt.Sprintf("  - EMA20: %.4f (%s) | MACD: %.4f (%s) | RSI(7): %.2f (%s)\n",
		data.CurrentEMA20, pricePosition(data.CurrentPrice, data.CurrentEMA20),
		data.CurrentMACD, macdTrend(data.CurrentMACD), data.CurrentRSI7, rsiStatus(data.CurrentRSI7)))

	if data.OpenInterest != nil {
		oiChange := ((data.OpenInterest.Latest - data.OpenInterest.Average) / data.OpenInterest.Average) * 100
		fundingSignal := fundingRateSignal(data.FundingRate)
		sb.WriteString(fmt.Sprintf("  - 持仓量: %+.2f%% | 资金费率: %.6f (%s)\n", oiChange, data.FundingRate, fundingSignal))
	}

	return sb.String()
}

// parseFullDecisionResponse 解析AI的完整决策响应
func parseFullDecisionResponse(aiResponse string, accountEquity float64) (*AIFullDecision, error) {
	// 1. 提取 cot_trace（思维链）
	cotTrace := extractCoTTrace(aiResponse)

	// 2. 提取 JSON 决策列表
	decisions, err := extractDecisions(aiResponse)
	if err != nil {
		// 即使JSON解析失败，也返回思维链
		return &AIFullDecision{
			CoTTrace:  cotTrace,
			Decisions: []TradingDecision{},
		}, fmt.Errorf("提取决策失败: %w\n\n=== AI思维链分析 ===\n%s", err, cotTrace)
	}

	// 3. 验证决策（包含仓位价值上限检查）
	if err := validateDecisions(decisions, accountEquity); err != nil {
		// 验证失败时，也返回思维链和决策，但标记为错误
		return &AIFullDecision{
			CoTTrace:  cotTrace,
			Decisions: decisions,
		}, fmt.Errorf("决策验证失败: %w\n\n=== AI思维链分析 ===\n%s", err, cotTrace)
	}

	return &AIFullDecision{
		CoTTrace:  cotTrace,
		Decisions: decisions,
	}, nil
}

// extractCoTTrace 提取思维链分析
func extractCoTTrace(response string) string {
	// 查找JSON数组的开始位置
	jsonStart := strings.Index(response, "[")

	if jsonStart > 0 {
		// 思维链是JSON数组之前的内容
		return strings.TrimSpace(response[:jsonStart])
	}

	// 如果找不到JSON，整个响应都是思维链
	return strings.TrimSpace(response)
}

// extractDecisions 提取JSON决策列表
func extractDecisions(response string) ([]TradingDecision, error) {
	// 直接查找JSON数组 - 找第一个完整的JSON数组
	arrayStart := strings.Index(response, "[")
	if arrayStart == -1 {
		return nil, fmt.Errorf("无法找到JSON数组起始")
	}

	// 从 [ 开始，匹配括号找到对应的 ]
	arrayEnd := findMatchingBracket(response, arrayStart)
	if arrayEnd == -1 {
		return nil, fmt.Errorf("无法找到JSON数组结束")
	}

	jsonContent := strings.TrimSpace(response[arrayStart : arrayEnd+1])

	// 解析JSON
	var decisions []TradingDecision
	if err := json.Unmarshal([]byte(jsonContent), &decisions); err != nil {
		return nil, fmt.Errorf("JSON解析失败: %w\nJSON内容: %s", err, jsonContent)
	}

	return decisions, nil
}

// validateDecisions 验证所有决策（需要账户信息）
func validateDecisions(decisions []TradingDecision, accountEquity float64) error {
	for i, decision := range decisions {
		if err := validateDecision(&decision, accountEquity); err != nil {
			return fmt.Errorf("决策 #%d 验证失败: %w", i+1, err)
		}
	}
	return nil
}

// findMatchingBracket 查找匹配的右括号
func findMatchingBracket(s string, start int) int {
	if start >= len(s) || s[start] != '[' {
		return -1
	}

	depth := 0
	for i := start; i < len(s); i++ {
		switch s[i] {
		case '[':
			depth++
		case ']':
			depth--
			if depth == 0 {
				return i
			}
		}
	}

	return -1
}

// validateDecision 验证单个决策的有效性
func validateDecision(d *TradingDecision, accountEquity float64) error {
	// 验证action
	validActions := map[string]bool{
		"open_long":   true,
		"open_short":  true,
		"close_long":  true,
		"close_short": true,
		"hold":        true,
		"wait":        true,
	}

	if !validActions[d.Action] {
		return fmt.Errorf("无效的action: %s", d.Action)
	}

	// 开仓操作必须提供完整参数
	if d.Action == "open_long" || d.Action == "open_short" {
		// 根据币种判断杠杆上限和仓位价值上限
		maxLeverage := 20                       // 山寨币固定20倍
		maxPositionValue := accountEquity * 1.5 // 山寨币最多1.5倍账户净值
		if d.Symbol == "BTCUSDT" || d.Symbol == "ETHUSDT" {
			maxLeverage = 50                      // BTC和ETH固定50倍
			maxPositionValue = accountEquity * 10 // BTC/ETH最多10倍账户净值
		}

		if d.Leverage <= 0 || d.Leverage > maxLeverage {
			return fmt.Errorf("杠杆必须在1-%d之间（%s）: %d", maxLeverage, d.Symbol, d.Leverage)
		}
		if d.PositionSizeUSD <= 0 {
			return fmt.Errorf("仓位大小必须大于0: %.2f", d.PositionSizeUSD)
		}
		// 验证仓位价值上限（加1%容差以避免浮点数精度问题）
		tolerance := maxPositionValue * 0.01 // 1%容差
		if d.PositionSizeUSD > maxPositionValue+tolerance {
			if d.Symbol == "BTCUSDT" || d.Symbol == "ETHUSDT" {
				return fmt.Errorf("BTC/ETH单币种仓位价值不能超过%.0f USDT（10倍账户净值），实际: %.0f", maxPositionValue, d.PositionSizeUSD)
			} else {
				return fmt.Errorf("山寨币单币种仓位价值不能超过%.0f USDT（1.5倍账户净值），实际: %.0f", maxPositionValue, d.PositionSizeUSD)
			}
		}
		if d.StopLoss <= 0 || d.TakeProfit <= 0 {
			return fmt.Errorf("止损和止盈必须大于0")
		}

		// 验证止损止盈的合理性
		if d.Action == "open_long" {
			if d.StopLoss >= d.TakeProfit {
				return fmt.Errorf("做多时止损价必须小于止盈价")
			}
		} else {
			if d.StopLoss <= d.TakeProfit {
				return fmt.Errorf("做空时止损价必须大于止盈价")
			}
		}
	}

	return nil
}
