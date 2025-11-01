package decision

import (
	"encoding/json"
	"fmt"
	"log"
	"nofx/market"
	"nofx/mcp"
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
	UpdateTime       int64   `json:"update_time"` // 持仓更新时间戳（毫秒）
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

// Context 交易上下文（传递给AI的完整信息）
type Context struct {
	CurrentTime     string                  `json:"current_time"`
	RuntimeMinutes  int                     `json:"runtime_minutes"`
	CallCount       int                     `json:"call_count"`
	Account         AccountInfo             `json:"account"`
	Positions       []PositionInfo          `json:"positions"`
	CandidateCoins  []CandidateCoin         `json:"candidate_coins"`
	MarketDataMap   map[string]*market.Data `json:"-"` // 不序列化，但内部使用
	OITopDataMap    map[string]*OITopData   `json:"-"` // OI Top数据映射
	Performance     interface{}             `json:"-"` // 历史表现分析（logger.PerformanceAnalysis）
	BTCETHLeverage  int                     `json:"-"` // BTC/ETH杠杆倍数（从配置读取）
	AltcoinLeverage int                     `json:"-"` // 山寨币杠杆倍数（从配置读取）
}

// Decision AI的交易决策
type Decision struct {
	Symbol          string  `json:"symbol"`
	Action          string  `json:"action"` // "open_long", "open_short", "close_long", "close_short", "hold", "wait"
	Leverage        int     `json:"leverage,omitempty"`
	PositionSizeUSD float64 `json:"position_size_usd,omitempty"`
	StopLoss        float64 `json:"stop_loss,omitempty"`
	TakeProfit      float64 `json:"take_profit,omitempty"`
	Confidence      int     `json:"confidence,omitempty"` // 信心度 (0-100)
	RiskUSD         float64 `json:"risk_usd,omitempty"`   // 最大美元风险
	Reasoning       string  `json:"reasoning"`
}

// FullDecision AI的完整决策（包含思维链）
type FullDecision struct {
	SystemPrompt string     `json:"system_prompt"` // 系统提示词（发送给AI的系统prompt）
	UserPrompt   string     `json:"user_prompt"`   // 发送给AI的输入prompt
	CoTTrace     string     `json:"cot_trace"`     // 思维链分析（AI输出）
	Decisions    []Decision `json:"decisions"`     // 具体决策列表
	Timestamp    time.Time  `json:"timestamp"`
}

// GetFullDecision 获取AI的完整交易决策（批量分析所有币种和持仓）
func GetFullDecision(ctx *Context, mcpClient *mcp.Client) (*FullDecision, error) {
	return GetFullDecisionWithCustomPrompt(ctx, mcpClient, "", false, "")
}

// GetFullDecisionWithCustomPrompt 获取AI的完整交易决策（支持自定义prompt和模板选择）
func GetFullDecisionWithCustomPrompt(ctx *Context, mcpClient *mcp.Client, customPrompt string, overrideBase bool, templateName string) (*FullDecision, error) {
	// 1. 为所有币种获取市场数据
	if err := fetchMarketDataForContext(ctx); err != nil {
		return nil, fmt.Errorf("获取市场数据失败: %w", err)
	}

	// 2. 构建 System Prompt（固定规则）和 User Prompt（动态数据）
	systemPrompt := buildSystemPromptWithCustom(ctx.Account.TotalEquity, ctx.BTCETHLeverage, ctx.AltcoinLeverage, customPrompt, overrideBase, templateName)
	userPrompt := buildUserPrompt(ctx)

	// 3. 调用AI API（使用 system + user prompt）
	aiResponse, err := mcpClient.CallWithMessages(systemPrompt, userPrompt)
	if err != nil {
		return nil, fmt.Errorf("调用AI API失败: %w", err)
	}

	// 4. 解析AI响应
	decision, err := parseFullDecisionResponse(aiResponse, ctx.Account.TotalEquity, ctx.BTCETHLeverage, ctx.AltcoinLeverage)
	if err != nil {
		return nil, fmt.Errorf("解析AI响应失败: %w", err)
	}

	decision.Timestamp = time.Now()
	decision.SystemPrompt = systemPrompt // 保存系统prompt
	decision.UserPrompt = userPrompt     // 保存输入prompt
	return decision, nil
}

// fetchMarketDataForContext 为上下文中的所有币种获取市场数据和OI数据
func fetchMarketDataForContext(ctx *Context) error {
	ctx.MarketDataMap = make(map[string]*market.Data)
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
		data, err := market.Get(symbol)
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
func calculateMaxCandidates(ctx *Context) int {
	// 直接返回候选池的全部币种数量
	// 因为候选池已经在 auto_trader.go 中筛选过了
	// 固定分析前20个评分最高的币种（来自AI500）
	return len(ctx.CandidateCoins)
}

// buildSystemPromptWithCustom 构建包含自定义内容的 System Prompt
func buildSystemPromptWithCustom(accountEquity float64, btcEthLeverage, altcoinLeverage int, customPrompt string, overrideBase bool, templateName string) string {
	// 如果覆盖基础prompt且有自定义prompt，只使用自定义prompt
	if overrideBase && customPrompt != "" {
		return customPrompt
	}

	// 获取基础prompt（使用指定的模板）
	basePrompt := buildSystemPrompt(accountEquity, btcEthLeverage, altcoinLeverage, templateName)

	// 如果没有自定义prompt，直接返回基础prompt
	if customPrompt == "" {
		return basePrompt
	}

	// 添加自定义prompt部分到基础prompt
	var sb strings.Builder
	sb.WriteString(basePrompt)
	sb.WriteString("\n\n")
	sb.WriteString("# 📌 个性化交易策略\n\n")
	sb.WriteString(customPrompt)
	sb.WriteString("\n\n")
	sb.WriteString("注意: 以上个性化策略是对基础规则的补充，不能违背基础风险控制原则。\n")

	return sb.String()
}

// buildSystemPrompt 构建 System Prompt（使用模板+动态部分）
func buildSystemPrompt(accountEquity float64, btcEthLeverage, altcoinLeverage int, templateName string) string {
	var sb strings.Builder

	// 1. 加载提示词模板（核心交易策略部分）
	if templateName == "" {
		templateName = "default" // 默认使用 default 模板
	}

	template, err := GetPromptTemplate(templateName)
	if err != nil {
		// 如果模板不存在，记录错误并使用 default
		log.Printf("⚠️  提示词模板 '%s' 不存在，使用 default: %v", templateName, err)
		template, err = GetPromptTemplate("default")
		if err != nil {
			// 如果连 default 都不存在，使用内置的简化版本
			log.Printf("❌ 无法加载任何提示词模板，使用内置简化版本")
			sb.WriteString("你是专业的加密货币交易AI。请根据市场数据做出交易决策。\n\n")
		} else {
			sb.WriteString(template.Content)
			sb.WriteString("\n\n")
		}
	} else {
		sb.WriteString(template.Content)
		sb.WriteString("\n\n")
	}

	// 2. 硬约束（风险控制）- 动态生成
	sb.WriteString("# 硬约束（风险控制）\n\n")
	sb.WriteString("1. 风险回报比: 必须 ≥ 1:3（冒1%风险，赚3%+收益）\n")
	sb.WriteString("2. 最多持仓: 3个币种（质量>数量）\n")
	sb.WriteString(fmt.Sprintf("3. 单币仓位: 山寨%.0f-%.0f U(%dx杠杆) | BTC/ETH %.0f-%.0f U(%dx杠杆)\n",
		accountEquity*0.8, accountEquity*1.5, altcoinLeverage, accountEquity*5, accountEquity*10, btcEthLeverage))
	sb.WriteString("4. 保证金: 总使用率 ≤ 90%\n\n")

	// 市场状态判断与策略选择
	sb.WriteString("# 市场状态判断（优先）\n\n")
	sb.WriteString("在制定交易决策前，必须先判断当前市场状态：\n\n")
	sb.WriteString("判断方法（多个指标交叉验证）：\n\n")
	sb.WriteString("1. 多时间框架一致性：\n")
	sb.WriteString("- 检查 15m/1h/4h MACD 方向一致度\n")
	sb.WriteString("- 3个时间框架方向一致 → 强趋势市场\n")
	sb.WriteString("- 2个时间框架方向一致 → 弱趋势市场\n")
	sb.WriteString("- 方向矛盾（15m上涨但1h下跌） → 震荡市场\n\n")
	sb.WriteString("2. 价格波动率：\n")
	sb.WriteString("- 最近 10 根 K线（高-低）/收盘价 > 3% → 趋势市场（大波动）\n")
	sb.WriteString("- 最近 10 根 K线（高-低）/收盘价 < 1.5% → 震荡市场（小波动）\n\n")
	sb.WriteString("3. 买卖压力极端值：\n")
	sb.WriteString("- BuySellRatio > 0.75 连续 3 根以上 → 强趋势（多）\n")
	sb.WriteString("- BuySellRatio < 0.25 连续 3 根以上 → 强趋势（空）\n")
	sb.WriteString("- BuySellRatio 在 0.4-0.6 波动 → 震荡\n\n")
	sb.WriteString("判断结论: 综合以上 3 个指标，判定当前市场状态为"趋势市场"或"震荡市场"\n\n")

	// 双策略系统
	sb.WriteString("# 双策略系统（根据市场状态选择）\n\n")
	sb.WriteString("## 策略 A: 震荡交易（震荡市场时使用）\n\n")
	sb.WriteString("策略定位: 专门做 BTC 震荡行情，快进快出，高胜率低盈亏比\n\n")
	sb.WriteString("震荡区间识别：\n")
	sb.WriteString("- 价格在15分钟/1小时 EMA20上下波动（±2-4%）\n")
	sb.WriteString("- MACD 在零轴附近（-200到+200之间）\n")
	sb.WriteString("- 多个时间框架方向不一致（如15m上涨但1h下跌）\n")
	sb.WriteString("- RSI 在30-70区间反复震荡\n\n")
	sb.WriteString("交易逻辑：\n")
	sb.WriteString("- 区间下沿（RSI<35 或接近支撑） → 做多\n")
	sb.WriteString("- 区间上沿（RSI>65 或接近压力） → 做空\n")
	sb.WriteString("- 趋势行情（多时间框架共振，放量突破） → 立即止损\n\n")
	sb.WriteString("止盈止损设置（震荡策略 - 技术位优先）：\n\n")
	sb.WriteString("核心原则：技术位 > 固定百分比（避免价格到技术位就回撤）\n\n")
	sb.WriteString("1. 入场前分析技术位：\n")
	sb.WriteString("- 做多：检查上方最近压力位（15m/1h EMA20、最近10根K线高点、整数关口）\n")
	sb.WriteString("- 做空：检查下方最近支撑位（15m/1h EMA20、最近10根K线低点、整数关口）\n\n")
	sb.WriteString("2. 止盈设置逻辑：\n")
	sb.WriteString("- 如果技术位距离 < 2% → 止盈设在技术位前 0.1%（例：压力 101,200，止盈 101,100）\n")
	sb.WriteString("- 如果技术位距离 > 2% → 使用固定 2% 止盈\n")
	sb.WriteString("- 理由：价格很可能在技术位遇阻，提前止盈避免回撤\n\n")
	sb.WriteString("3. 止损设置：\n")
	sb.WriteString("- 固定 0.8-1%（紧密止损）\n\n")
	sb.WriteString("4. 追踪止损（持仓中动态调整）：\n")
	sb.WriteString("- 浮盈达到 0.8% → 止损移到成本价（保证不亏）\n")
	sb.WriteString("- 浮盈达到 1.2% → 止损移到 +0.5%（锁定一半利润）\n")
	sb.WriteString("- 价格距离技术位 < 0.3% → 立即主动平仓（避免回撤）\n\n")
	sb.WriteString("5. 示例（做多）：\n")
	sb.WriteString("- 入场：100,000，15m EMA20: 101,200（+1.2%）\n")
	sb.WriteString("- 决策：止盈 101,100（技术位前 0.1%），而非 102,000\n")
	sb.WriteString("- 持仓：价格到 101,000（+1.0%）→ 止损移到 100,000\n")
	sb.WriteString("- 持仓：价格到 101,100（距离 EMA20 仅 0.1%）→ 立即平仓\n\n")
	sb.WriteString("退出信号：\n")
	sb.WriteString("- 多时间框架开始共振 → 市场转为趋势，立即止损\n\n")

	// 策略 B: 趋势跟随
	sb.WriteString("## 策略 B: 趋势跟随（趋势市场时使用）\n\n")
	sb.WriteString("策略定位: 捕捉趋势行情，让利润奔跑，中等胜率高盈亏比\n\n")
	sb.WriteString("趋势确认条件：\n")
	sb.WriteString("- 多时间框架共振（15m/1h/4h MACD 方向一致）\n")
	sb.WriteString("- 连续 2-3 根 K线放量（成交量 > 平均 1.5 倍）\n")
	sb.WriteString("- 买卖压力极端（BuySellRatio >0.7 或 <0.3）\n")
	sb.WriteString("- 价格突破关键位（EMA20）并回踩确认\n\n")
	sb.WriteString("交易逻辑：\n")
	sb.WriteString("- 突破后回踩入场（避免追高）\n")
	sb.WriteString("- 顺势交易（多头趋势做多，空头趋势做空）\n")
	sb.WriteString("- 持仓时间更长（至少 1-2 小时）\n\n")
	sb.WriteString("止盈止损设置（趋势策略 - 技术位优先）：\n\n")
	sb.WriteString("核心原则：技术位 > 固定百分比，但给予更大空间\n\n")
	sb.WriteString("1. 入场前分析技术位：\n")
	sb.WriteString("- 做多：检查上方关键压力位（1h/4h EMA20、前高、整数关口）\n")
	sb.WriteString("- 做空：检查下方关键支撑位（1h/4h EMA20、前低、整数关口）\n\n")
	sb.WriteString("2. 止盈设置逻辑：\n")
	sb.WriteString("- 如果技术位距离 < 5% → 止盈设在技术位前 0.2%\n")
	sb.WriteString("- 如果技术位在 5-10% → 分两批止盈（第一批技术位，第二批 10%）\n")
	sb.WriteString("- 如果技术位距离 > 10% → 使用追踪止损，让利润奔跑\n\n")
	sb.WriteString("3. 止损设置：\n")
	sb.WriteString("- 固定 1.5-2%（给足震荡空间）\n\n")
	sb.WriteString("4. 追踪止损（持仓中动态调整）：\n")
	sb.WriteString("- 浮盈达到 2% → 止损移到成本价（保证不亏）\n")
	sb.WriteString("- 浮盈达到 3% → 止损移到 +1%（锁定部分利润）\n")
	sb.WriteString("- 浮盈达到 5% → 止损移到 +2.5%（让利润奔跑，但保护已有收益）\n")
	sb.WriteString("- 价格距离技术位 < 0.5% → 考虑主动平仓或分批平仓\n\n")
	sb.WriteString("5. 示例（做多）：\n")
	sb.WriteString("- 入场：100,000，4h EMA20: 104,500（+4.5%）\n")
	sb.WriteString("- 决策：第一目标 104,300（技术位前），第二目标 110,000（+10%）\n")
	sb.WriteString("- 持仓：价格到 102,000（+2%）→ 止损移到 100,000\n")
	sb.WriteString("- 持仓：价格到 104,300（接近技术位）→ 主动平仓或分批平仓 50%\n\n")
	sb.WriteString("退出信号：\n")
	sb.WriteString("- 多时间框架方向开始矛盾 → 趋势减弱，获利离场\n")
	sb.WriteString("- 成交量萎缩 + MACD 背离 → 趋势可能反转\n\n")

	// 策略选择指导
	sb.WriteString("## 策略选择指导\n\n")
	sb.WriteString("必须在思维链中明确说明：\n")
	sb.WriteString("1. 市场状态判断: "当前市场状态：震荡/趋势（理由：...）"\n")
	sb.WriteString("2. 策略选择: "选择策略 A/B（理由：...）"\n")
	sb.WriteString("3. 技术位分析: "上方压力位：101,200（15m EMA20），下方支撑位：99,500（最近低点）"\n")
	sb.WriteString("4. 止盈止损: "止盈 101,100（技术位前 0.1%），止损 99,200（-0.8%）"\n")
	sb.WriteString("5. 追踪止损计划: "浮盈 0.8% 时移动止损到成本价"\n\n")
	sb.WriteString("重要提醒：\n")
	sb.WriteString("- 价格很可能在技术位（EMA20、前高前低、整数关口）遇阻或反弹\n")
	sb.WriteString("- 宁可少赚 0.5%，也不要从 +1.5% 回撤到止损\n")
	sb.WriteString("- 持仓中主动调整止损，锁定利润\n\n")

	// === 交易频率认知 ===
	sb.WriteString("# ⏱️ 交易频率认知\n\n")
	sb.WriteString("量化标准:\n")
	sb.WriteString("- 优秀交易员：每天2-4笔 = 每小时0.1-0.2笔\n")
	sb.WriteString("- 过度交易：每小时>2笔 = 严重问题\n")
	sb.WriteString("- 最佳节奏：开仓后持有至少30-60分钟\n\n")
	sb.WriteString("自查:\n")
	sb.WriteString("如果你发现自己每个周期都在交易 → 说明标准太低\n")
	sb.WriteString("如果你发现持仓<30分钟就平仓 → 说明太急躁\n\n")

	// === 开仓信号强度 ===
	sb.WriteString("# 🎯 开仓标准（严格）\n\n")
	sb.WriteString("只在强信号时开仓，不确定就观望。\n\n")
	sb.WriteString("你拥有的完整数据（专为震荡交易优化）：\n\n")
	sb.WriteString("📊 四个时间框架序列（每个包含最近10个数据点）：\n")
	sb.WriteString("1. 3分钟序列：实时价格 + 放量分析（当前价格 = 最后一根K线的收盘价）\n")
	sb.WriteString("   - Mid prices, EMA20, MACD, RSI7, RSI14\n")
	sb.WriteString("   - Volumes: 成交量序列（用于检测放量）\n")
	sb.WriteString("   - BuySellRatios: 买卖压力比（>0.6多方强，<0.4空方强）\n")
	sb.WriteString("2. 15分钟序列：短期震荡区间识别（覆盖最近2.5小时）\n")
	sb.WriteString("   - Mid prices, EMA20, MACD, RSI7, RSI14\n")
	sb.WriteString("3. 1小时序列：中期支撑压力确认（覆盖最近10小时）\n")
	sb.WriteString("   - Mid prices, EMA20, MACD, RSI7, RSI14\n")
	sb.WriteString("4. 4小时序列：大趋势预警（覆盖最近40小时）\n")
	sb.WriteString("   - EMA20 vs EMA50, ATR, Volume, MACD, RSI14\n\n")
	sb.WriteString("💰 资金数据：\n")
	sb.WriteString("- 持仓量(OI)变化、资金费率、成交量对比\n\n")
	sb.WriteString("🎯 震荡交易分析方法：\n\n")
	sb.WriteString("1. 震荡区间识别：\n")
	sb.WriteString("- 价格在15m/1h EMA20 上下±2-4%波动\n")
	sb.WriteString("- RSI 在30-70区间反复，未出现持续超买/超卖\n")
	sb.WriteString("- MACD 在零轴附近震荡，未出现明确金叉/死叉\n")
	sb.WriteString("- 1h和4h时间框架方向不一致（矛盾 = 震荡）\n\n")
	sb.WriteString("2. 买卖压力分析（3分钟放量检测）：\n")
	sb.WriteString("- 连续放量 = 最近2-3根3分钟K线成交量 > 平均成交量1.5倍\n")
	sb.WriteString("- 买方力量：BuySellRatio > 0.6（主动买入占比 > 60%）\n")
	sb.WriteString("- 卖方力量：BuySellRatio < 0.4（主动卖出占比 > 60%）\n")
	sb.WriteString("- 放量+买压 → 可能向上突破，做多或止损空单\n")
	sb.WriteString("- 放量+卖压 → 可能向下突破，做空或止损多单\n\n")
	sb.WriteString("3. 入场信号（高胜率位置）：\n")
	sb.WriteString("- 区间下沿做多：RSI < 35 + 买卖压力比 > 0.5 + 价格接近15m EMA20下方\n")
	sb.WriteString("- 区间上沿做空：RSI > 65 + 买卖压力比 < 0.5 + 价格接近15m EMA20上方\n")
	sb.WriteString("- 综合信心度 ≥ 75 才开仓\n\n")
	sb.WriteString("4. 止损信号（趋势突破，立即离场）：\n")
	sb.WriteString("- 多时间框架共振（15m/1h/4h方向一致）\n")
	sb.WriteString("- 连续2根以上3分钟K线放量突破区间\n")
	sb.WriteString("- MACD 突破零轴并加速\n\n")
	sb.WriteString("避免低质量信号：\n")
	sb.WriteString("- 单一维度（只看一个指标）\n")
	sb.WriteString("- 区间中部交易（等待区间边界）\n")
	sb.WriteString("- 刚平仓不久（<10分钟）\n")
	sb.WriteString("- 无买卖压力确认的入场\n\n")

	// === 夏普比率自我进化 ===
	sb.WriteString("# 🧬 夏普比率自我进化\n\n")
	sb.WriteString("每次你会收到夏普比率作为绩效反馈（周期级别）：\n\n")
	sb.WriteString("夏普比率 < -0.5 (持续亏损):\n")
	sb.WriteString("  → 🛑 停止交易，连续观望至少6个周期（18分钟）\n")
	sb.WriteString("  → 🔍 深度反思：\n")
	sb.WriteString("     • 交易频率过高？（每小时>2次就是过度）\n")
	sb.WriteString("     • 持仓时间过短？（<30分钟就是过早平仓）\n")
	sb.WriteString("     • 信号强度不足？（信心度<75）\n")
	sb.WriteString("     • 是否在做空？（单边做多是错误的）\n\n")
	sb.WriteString("夏普比率 -0.5 ~ 0 (轻微亏损):\n")
	sb.WriteString("  → ⚠️ 严格控制：只做信心度>80的交易\n")
	sb.WriteString("  → 减少交易频率：每小时最多1笔新开仓\n")
	sb.WriteString("  → 耐心持仓：至少持有30分钟以上\n\n")
	sb.WriteString("夏普比率 0 ~ 0.7 (正收益):\n")
	sb.WriteString("  → ✅ 维持当前策略\n\n")
	sb.WriteString("夏普比率 > 0.7 (优异表现):\n")
	sb.WriteString("  → 🚀 可适度扩大仓位\n\n")
	sb.WriteString("关键: 夏普比率是唯一指标，它会自然惩罚频繁交易和过度进出。\n\n")

	// === 决策流程 ===
	sb.WriteString("# 📋 决策流程\n\n")
	sb.WriteString("1. 分析夏普比率: 当前策略是否有效？需要调整吗？\n")
	sb.WriteString("2. 评估持仓: 趋势是否改变？是否该止盈/止损？\n")
	sb.WriteString("3. 寻找新机会: 有强信号吗？多空机会？\n")
	sb.WriteString("4. 输出决策: 思维链分析 + JSON\n\n")

	// 3. 输出格式 - 动态生成
	sb.WriteString("#输出格式\n\n")
	sb.WriteString("第一步: 思维链（纯文本）\n")
	sb.WriteString("简洁分析你的思考过程\n\n")
	sb.WriteString("第二步: JSON决策数组\n\n")
	sb.WriteString("```json\n[\n")
	sb.WriteString(fmt.Sprintf("  {\"symbol\": \"BTCUSDT\", \"action\": \"open_short\", \"leverage\": %d, \"position_size_usd\": %.0f, \"stop_loss\": 97000, \"take_profit\": 91000, \"confidence\": 85, \"risk_usd\": 300, \"reasoning\": \"下跌趋势+MACD死叉\"},\n", btcEthLeverage, accountEquity*5))
	sb.WriteString("  {\"symbol\": \"ETHUSDT\", \"action\": \"close_long\", \"reasoning\": \"止盈离场\"}\n")
	sb.WriteString("]\n```\n\n")
	sb.WriteString("字段说明:\n")
	sb.WriteString("- `action`: open_long | open_short | close_long | close_short | hold | wait\n")
	sb.WriteString("- `confidence`: 0-100（开仓建议≥75）\n")
	sb.WriteString("- 开仓时必填: leverage, position_size_usd, stop_loss, take_profit, confidence, risk_usd, reasoning\n\n")

	return sb.String()
}

// buildUserPrompt 构建 User Prompt（动态数据）
func buildUserPrompt(ctx *Context) string {
	var sb strings.Builder

	// 系统状态
	sb.WriteString(fmt.Sprintf("时间: %s | 周期: #%d | 运行: %d分钟\n\n",
		ctx.CurrentTime, ctx.CallCount, ctx.RuntimeMinutes))

	// BTC 市场
	if btcData, hasBTC := ctx.MarketDataMap["BTCUSDT"]; hasBTC {
		sb.WriteString(fmt.Sprintf("BTC: %.2f (1h: %+.2f%%, 4h: %+.2f%%) | MACD: %.4f | RSI: %.2f\n\n",
			btcData.CurrentPrice, btcData.PriceChange1h, btcData.PriceChange4h,
			btcData.CurrentMACD, btcData.CurrentRSI7))
	}

	// 账户
	sb.WriteString(fmt.Sprintf("账户: 净值%.2f | 余额%.2f (%.1f%%) | 盈亏%+.2f%% | 保证金%.1f%% | 持仓%d个\n\n",
		ctx.Account.TotalEquity,
		ctx.Account.AvailableBalance,
		(ctx.Account.AvailableBalance/ctx.Account.TotalEquity)*100,
		ctx.Account.TotalPnLPct,
		ctx.Account.MarginUsedPct,
		ctx.Account.PositionCount))

	// 持仓（完整市场数据）
	if len(ctx.Positions) > 0 {
		sb.WriteString("## 当前持仓\n")
		for i, pos := range ctx.Positions {
			// 计算持仓时长
			holdingDuration := ""
			if pos.UpdateTime > 0 {
				durationMs := time.Now().UnixMilli() - pos.UpdateTime
				durationMin := durationMs / (1000 * 60) // 转换为分钟
				if durationMin < 60 {
					holdingDuration = fmt.Sprintf(" | 持仓时长%d分钟", durationMin)
				} else {
					durationHour := durationMin / 60
					durationMinRemainder := durationMin % 60
					holdingDuration = fmt.Sprintf(" | 持仓时长%d小时%d分钟", durationHour, durationMinRemainder)
				}
			}

			sb.WriteString(fmt.Sprintf("%d. %s %s | 入场价%.4f 当前价%.4f | 盈亏%+.2f%% | 杠杆%dx | 保证金%.0f | 强平价%.4f%s\n\n",
				i+1, pos.Symbol, strings.ToUpper(pos.Side),
				pos.EntryPrice, pos.MarkPrice, pos.UnrealizedPnLPct,
				pos.Leverage, pos.MarginUsed, pos.LiquidationPrice, holdingDuration))

			// 使用FormatMarketData输出完整市场数据
			if marketData, ok := ctx.MarketDataMap[pos.Symbol]; ok {
				sb.WriteString(market.Format(marketData))
				sb.WriteString("\n")
			}
		}
	} else {
		sb.WriteString("当前持仓: 无\n\n")
	}

	// 候选币种（完整市场数据）
	sb.WriteString(fmt.Sprintf("## 候选币种 (%d个)\n\n", len(ctx.MarketDataMap)))
	displayedCount := 0
	for _, coin := range ctx.CandidateCoins {
		marketData, hasData := ctx.MarketDataMap[coin.Symbol]
		if !hasData {
			continue
		}
		displayedCount++

		sourceTags := ""
		if len(coin.Sources) > 1 {
			sourceTags = " (AI500+OI_Top双重信号)"
		} else if len(coin.Sources) == 1 && coin.Sources[0] == "oi_top" {
			sourceTags = " (OI_Top持仓增长)"
		}

		// 使用FormatMarketData输出完整市场数据
		sb.WriteString(fmt.Sprintf("### %d. %s%s\n\n", displayedCount, coin.Symbol, sourceTags))
		sb.WriteString(market.Format(marketData))
		sb.WriteString("\n")
	}
	sb.WriteString("\n")

	// 夏普比率（直接传值，不要复杂格式化）
	if ctx.Performance != nil {
		// 直接从interface{}中提取SharpeRatio
		type PerformanceData struct {
			SharpeRatio float64 `json:"sharpe_ratio"`
		}
		var perfData PerformanceData
		if jsonData, err := json.Marshal(ctx.Performance); err == nil {
			if err := json.Unmarshal(jsonData, &perfData); err == nil {
				sb.WriteString(fmt.Sprintf("## 📊 夏普比率: %.2f\n\n", perfData.SharpeRatio))
			}
		}
	}

	sb.WriteString("---\n\n")
	sb.WriteString("现在请分析并输出决策（思维链 + JSON）\n")

	return sb.String()
}

// parseFullDecisionResponse 解析AI的完整决策响应
func parseFullDecisionResponse(aiResponse string, accountEquity float64, btcEthLeverage, altcoinLeverage int) (*FullDecision, error) {
	// 1. 提取思维链
	cotTrace := extractCoTTrace(aiResponse)

	// 2. 提取JSON决策列表
	decisions, err := extractDecisions(aiResponse)
	if err != nil {
		return &FullDecision{
			CoTTrace:  cotTrace,
			Decisions: []Decision{},
		}, fmt.Errorf("提取决策失败: %w\n\n=== AI思维链分析 ===\n%s", err, cotTrace)
	}

	// 3. 验证决策
	if err := validateDecisions(decisions, accountEquity, btcEthLeverage, altcoinLeverage); err != nil {
		return &FullDecision{
			CoTTrace:  cotTrace,
			Decisions: decisions,
		}, fmt.Errorf("决策验证失败: %w\n\n=== AI思维链分析 ===\n%s", err, cotTrace)
	}

	return &FullDecision{
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
func extractDecisions(response string) ([]Decision, error) {
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

	// 🔧 修复常见的JSON格式错误：缺少引号的字段值
	// 匹配: "reasoning": 内容"}  或  "reasoning": 内容}  (没有引号)
	// 修复为: "reasoning": "内容"}
	// 使用简单的字符串扫描而不是正则表达式
	jsonContent = fixMissingQuotes(jsonContent)

	// 解析JSON
	var decisions []Decision
	if err := json.Unmarshal([]byte(jsonContent), &decisions); err != nil {
		return nil, fmt.Errorf("JSON解析失败: %w\nJSON内容: %s", err, jsonContent)
	}

	return decisions, nil
}

// fixMissingQuotes 替换中文引号为英文引号（避免输入法自动转换）
func fixMissingQuotes(jsonStr string) string {
	jsonStr = strings.ReplaceAll(jsonStr, "\u201c", "\"") // "
	jsonStr = strings.ReplaceAll(jsonStr, "\u201d", "\"") // "
	jsonStr = strings.ReplaceAll(jsonStr, "\u2018", "'")  // '
	jsonStr = strings.ReplaceAll(jsonStr, "\u2019", "'")  // '
	return jsonStr
}

// validateDecisions 验证所有决策（需要账户信息和杠杆配置）
func validateDecisions(decisions []Decision, accountEquity float64, btcEthLeverage, altcoinLeverage int) error {
	for i, decision := range decisions {
		if err := validateDecision(&decision, accountEquity, btcEthLeverage, altcoinLeverage); err != nil {
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
func validateDecision(d *Decision, accountEquity float64, btcEthLeverage, altcoinLeverage int) error {
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
		// 根据币种使用配置的杠杆上限
		maxLeverage := altcoinLeverage          // 山寨币使用配置的杠杆
		maxPositionValue := accountEquity * 1.5 // 山寨币最多1.5倍账户净值
		if d.Symbol == "BTCUSDT" || d.Symbol == "ETHUSDT" {
			maxLeverage = btcEthLeverage          // BTC和ETH使用配置的杠杆
			maxPositionValue = accountEquity * 10 // BTC/ETH最多10倍账户净值
		}

		if d.Leverage <= 0 || d.Leverage > maxLeverage {
			return fmt.Errorf("杠杆必须在1-%d之间（%s，当前配置上限%d倍）: %d", maxLeverage, d.Symbol, maxLeverage, d.Leverage)
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

		// 验证风险回报比（必须≥1:3）
		// 计算入场价（假设当前市价）
		var entryPrice float64
		if d.Action == "open_long" {
			// 做多：入场价在止损和止盈之间
			entryPrice = d.StopLoss + (d.TakeProfit-d.StopLoss)*0.2 // 假设在20%位置入场
		} else {
			// 做空：入场价在止损和止盈之间
			entryPrice = d.StopLoss - (d.StopLoss-d.TakeProfit)*0.2 // 假设在20%位置入场
		}

		var riskPercent, rewardPercent, riskRewardRatio float64
		if d.Action == "open_long" {
			riskPercent = (entryPrice - d.StopLoss) / entryPrice * 100
			rewardPercent = (d.TakeProfit - entryPrice) / entryPrice * 100
			if riskPercent > 0 {
				riskRewardRatio = rewardPercent / riskPercent
			}
		} else {
			riskPercent = (d.StopLoss - entryPrice) / entryPrice * 100
			rewardPercent = (entryPrice - d.TakeProfit) / entryPrice * 100
			if riskPercent > 0 {
				riskRewardRatio = rewardPercent / riskPercent
			}
		}

		// 硬约束：风险回报比必须≥3.0
		if riskRewardRatio < 3.0 {
			return fmt.Errorf("风险回报比过低(%.2f:1)，必须≥3.0:1 [风险:%.2f%% 收益:%.2f%%] [止损:%.2f 止盈:%.2f]",
				riskRewardRatio, riskPercent, rewardPercent, d.StopLoss, d.TakeProfit)
		}
	}

	return nil
}
