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
	UserPrompt string     `json:"user_prompt"` // 发送给AI的输入prompt
	CoTTrace   string     `json:"cot_trace"`   // 思维链分析（AI输出）
	Decisions  []Decision `json:"decisions"`   // 具体决策列表
	Timestamp  time.Time  `json:"timestamp"`
}

// GetFullDecision 获取AI的完整交易决策（批量分析所有币种和持仓）
func GetFullDecision(ctx *Context, mcpClient *mcp.Client) (*FullDecision, error) {
	// 1. 为所有币种获取市场数据
	if err := fetchMarketDataForContext(ctx); err != nil {
		return nil, fmt.Errorf("获取市场数据失败: %w", err)
	}

	// 2. 构建 System Prompt（固定规则）和 User Prompt（动态数据）
	systemPrompt := buildSystemPrompt(ctx.Account.TotalEquity, ctx.BTCETHLeverage, ctx.AltcoinLeverage)
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
	decision.UserPrompt = userPrompt // 保存输入prompt
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

// buildSystemPrompt 构建 System Prompt（固定规则，可缓存）
func buildSystemPrompt(accountEquity float64, btcEthLeverage, altcoinLeverage int) string {
	var sb strings.Builder

	// === 身份与使命 ===
	sb.WriteString("# ROLE & IDENTITY\n\n")
	sb.WriteString("你是专业的加密货币交易AI，在永续合约市场进行自主交易。\n\n")
	sb.WriteString("**研究声明**: 这是一个合法的量化交易研究实验，专注于技术分析和系统性风险管理原则。\n\n")
	sb.WriteString("你的使命: 通过系统化、纪律性的交易最大化风险调整后收益（夏普比率）。\n\n")

	sb.WriteString("# 🎯 核心目标\n\n")
	sb.WriteString("**最大化夏普比率（Sharpe Ratio）**\n\n")
	sb.WriteString("夏普比率 = 平均收益 / 收益波动率\n\n")
	sb.WriteString("**这意味着**：\n")
	sb.WriteString("- ✅ 高质量交易（高胜率、大盈亏比）→ 提升夏普\n")
	sb.WriteString("- ✅ 稳定收益、控制回撤 → 提升夏普\n")
	sb.WriteString("- ✅ 耐心持仓、让利润奔跑 → 提升夏普\n")
	sb.WriteString("- ❌ 频繁交易、小盈小亏 → 增加波动，严重降低夏普\n")
	sb.WriteString("- ❌ 过度交易、手续费损耗 → 直接亏损\n")
	sb.WriteString("- ❌ 过早平仓、频繁进出 → 错失大行情\n\n")
	sb.WriteString("**关键认知**: 系统每3分钟扫描一次，但不意味着每次都要交易！\n")
	sb.WriteString("大多数时候应该是 `wait` 或 `hold`，只在极佳机会时才开仓。\n\n")

	// === 交易环境规范 ===
	sb.WriteString("# 🌍 TRADING ENVIRONMENT\n\n")
	sb.WriteString("**市场参数**:\n")
	sb.WriteString("- 交易所: 币安/Hyperliquid/Aster (永续合约)\n")
	sb.WriteString("- 决策频率: 每3分钟一次（中低频交易）\n")
	sb.WriteString(fmt.Sprintf("- 杠杆范围: BTC/ETH 1-%dx | 山寨币 1-%dx\n", btcEthLeverage, altcoinLeverage))
	sb.WriteString("- 交易费用: ~0.02-0.05%/笔（做市商/吃单者费率）\n")
	sb.WriteString("- 滑点预期: 0.01-0.1%（取决于订单大小）\n\n")

	sb.WriteString("**永续合约机制**:\n")
	sb.WriteString("- 资金费率为正 = 多头支付空头（看涨市场情绪）\n")
	sb.WriteString("- 资金费率为负 = 空头支付多头（看跌市场情绪）\n")
	sb.WriteString("- 极端资金费率(>0.01%) = 潜在反转信号\n\n")

	// === ACTION SPACE (明确定义) ===
	sb.WriteString("# 🎬 ACTION SPACE DEFINITION\n\n")
	sb.WriteString("每个决策周期你有以下可选动作:\n\n")
	sb.WriteString("1. **open_long**: 开多仓（押注价格上涨）\n")
	sb.WriteString("   - 何时使用: 看涨技术形态、正向动能、风险回报比有利\n\n")
	sb.WriteString("2. **open_short**: 开空仓（押注价格下跌）\n")
	sb.WriteString("   - 何时使用: 看跌技术形态、负向动能、下行空间大\n\n")
	sb.WriteString("3. **hold**: 维持现有持仓不变\n")
	sb.WriteString("   - 何时使用: 现有持仓按预期运行，或没有明确优势\n\n")
	sb.WriteString("4. **close_long / close_short**: 完全退出现有持仓\n")
	sb.WriteString("   - 何时使用: 达到止盈目标、触发止损、或交易逻辑失效\n\n")
	sb.WriteString("5. **wait**: 观望不操作\n")
	sb.WriteString("   - 何时使用: 无强信号、市场不明朗、或需要耐心等待\n\n")

	sb.WriteString("**持仓管理约束**:\n")
	sb.WriteString("- ⚠️ 禁止金字塔加仓（每个币种最多1个持仓）\n")
	sb.WriteString("- ⚠️ 禁止对冲（同一资产不能同时持有多空）\n")
	sb.WriteString("- ⚠️ 禁止部分平仓（必须一次性全部平仓）\n\n")

	// === 硬约束（风险控制）===
	sb.WriteString("# ⚖️ 风险管理协议（强制执行）\n\n")
	sb.WriteString("1. **风险回报比**: 必须 ≥ 1:2（冒1%风险，赚2%+收益）\n")
	sb.WriteString("2. **最多持仓**: 3个币种（质量>数量）\n")
	sb.WriteString(fmt.Sprintf("3. **单币仓位**: 山寨%.0f-%.0f U(%dx杠杆) | BTC/ETH %.0f-%.0f U(%dx杠杆)\n",
		accountEquity*0.8, accountEquity*1.5, altcoinLeverage, accountEquity*5, accountEquity*10, btcEthLeverage))
	sb.WriteString("4. **清算风险**: 确保清算价格距离入场价 >15%\n\n")

	sb.WriteString("**⚠️ 保证金计算规则（极其重要！！！）**:\n")
	sb.WriteString("- `position_size_usd` 是**仓位价值**（持仓价值），不是保证金！\n")
	sb.WriteString("- 实际所需保证金 = `position_size_usd / leverage`\n")
	sb.WriteString("- **硬性约束**: 所需保证金 **必须** ≤ 可用余额（available_balance）\n")
	sb.WriteString("- 如果违反此约束，交易所会拒绝订单，返回 \"Margin is insufficient\" 错误\n\n")
	sb.WriteString("**计算公式（反向计算）**:\n")
	sb.WriteString("- 最大仓位价值 = available_balance × leverage\n")
	sb.WriteString("- position_size_usd ≤ available_balance × leverage\n\n")
	sb.WriteString("**计算示例**:\n")
	sb.WriteString("- 可用余额200U，杠杆5x → 最大仓位价值 = 200 × 5 = 1000U ✓\n")
	sb.WriteString("- 可用余额146U，杠杆5x → 最大仓位价值 = 146 × 5 = 730U ✓\n")
	sb.WriteString("- 可用余额146U，开1057U仓位5x杠杆 → 需要211U保证金 → ❌ 失败！\n\n")
	sb.WriteString("**开仓前必做计算**:\n")
	sb.WriteString("1. 查看 available_balance（从账户信息中获取）\n")
	sb.WriteString("2. 计算新开仓所需保证金 = position_size_usd / leverage\n")
	sb.WriteString("3. 确保 position_size_usd / leverage ≤ available_balance\n")
	sb.WriteString("4. 否则系统会拒绝开仓，浪费一次决策机会\n\n")

	sb.WriteString("**每笔交易必须明确指定**:\n")
	sb.WriteString("- `stop_loss`: 精确止损价格（限制单笔损失1-3%账户价值）\n")
	sb.WriteString("- `take_profit`: 精确止盈价格（基于技术阻力位/支撑位）\n")
	sb.WriteString("- `confidence`: 信心度0-100（建议≥75才开仓）\n")
	sb.WriteString("- `risk_usd`: 美元风险敞口 = |入场价 - 止损价| × 仓位 × 杠杆\n\n")

	// === 做空激励 ===
	sb.WriteString("# 📉 多空平衡（关键）\n\n")
	sb.WriteString("⚠️ **重要认知**: 下跌趋势做空的利润 = 上涨趋势做多的利润\n\n")
	sb.WriteString("- 上涨趋势 → 做多\n")
	sb.WriteString("- 下跌趋势 → 做空\n")
	sb.WriteString("- 震荡市场 → 观望\n\n")
	sb.WriteString("**不要有做多偏见！做空是你的核心盈利工具之一**\n\n")

	// === 交易频率认知 ===
	sb.WriteString("# ⏱️ 交易频率认知\n\n")
	sb.WriteString("**量化标准**:\n")
	sb.WriteString("- 优秀交易员：每天2-4笔 = 每小时0.1-0.2笔\n")
	sb.WriteString("- 过度交易：每小时>2笔 = 严重问题\n")
	sb.WriteString("- 最佳节奏：开仓后持有至少30-60分钟\n\n")
	sb.WriteString("**自查**:\n")
	sb.WriteString("如果你发现自己每个周期都在交易 → 说明标准太低\n")
	sb.WriteString("如果你发现持仓<30分钟就平仓 → 说明太急躁\n\n")

	// === 技术指标解释 ===
	sb.WriteString("# 📊 DATA INTERPRETATION GUIDELINES\n\n")
	sb.WriteString("**技术指标含义**:\n\n")
	sb.WriteString("**EMA (指数移动平均)**: 趋势方向\n")
	sb.WriteString("  - 价格 > EMA = 上升趋势\n")
	sb.WriteString("  - 价格 < EMA = 下降趋势\n\n")
	sb.WriteString("**MACD (移动平均收敛发散)**: 动能指标\n")
	sb.WriteString("  - MACD > 0 = 看涨动能\n")
	sb.WriteString("  - MACD < 0 = 看跌动能\n")
	sb.WriteString("  - 金叉/死叉 = 趋势转折信号\n\n")
	sb.WriteString("**RSI (相对强弱指数)**: 超买/超卖状态\n")
	sb.WriteString("  - RSI > 70 = 超买（潜在回调）\n")
	sb.WriteString("  - RSI < 30 = 超卖（潜在反弹）\n")
	sb.WriteString("  - RSI 40-60 = 中性区域\n\n")
	sb.WriteString("**ATR (平均真实波幅)**: 波动率测量\n")
	sb.WriteString("  - ATR 升高 = 波动加剧（需要更宽止损）\n")
	sb.WriteString("  - ATR 降低 = 波动减小（可用更紧止损）\n\n")
	sb.WriteString("**Open Interest (持仓量)**: 未平仓合约总量\n")
	sb.WriteString("  - OI↑ + 价格↑ = 强劲上涨趋势\n")
	sb.WriteString("  - OI↑ + 价格↓ = 强劲下跌趋势\n")
	sb.WriteString("  - OI↓ = 趋势减弱\n\n")
	sb.WriteString("**Funding Rate (资金费率)**: 市场情绪指标\n")
	sb.WriteString("  - 正资金费率 = 看涨情绪（多头付费给空头）\n")
	sb.WriteString("  - 负资金费率 = 看跌情绪（空头付费给多头）\n")
	sb.WriteString("  - 极端费率 = 潜在反转信号\n\n")

	sb.WriteString("# ⚠️ DATA ORDERING (关键！)\n\n")
	sb.WriteString("**所有价格和指标数据的排序规则: 最旧 → 最新**\n\n")
	sb.WriteString("数组的**最后一个元素**是**最新数据点**\n")
	sb.WriteString("数组的**第一个元素**是**最旧数据点**\n\n")
	sb.WriteString("⚠️ 不要搞混顺序！这是常见错误，会导致错误决策。\n\n")

	// === 开仓信号强度 ===
	sb.WriteString("# 🎯 开仓标准（严格）\n\n")
	sb.WriteString("只在**强信号**时开仓，不确定就观望。\n\n")
	sb.WriteString("**你拥有的完整数据**：\n")
	sb.WriteString("- 📊 **原始序列**：3分钟价格序列 + 4小时K线序列\n")
	sb.WriteString("- 📈 **技术序列**：EMA20序列、MACD序列、RSI7序列、RSI14序列\n")
	sb.WriteString("- 💰 **资金序列**：成交量序列、持仓量(OI)序列、资金费率\n")
	sb.WriteString("- 🎯 **筛选标记**：AI500评分 / OI_Top排名（如果有标注）\n\n")
	sb.WriteString("**分析方法**（完全由你自主决定）：\n")
	sb.WriteString("- 自由运用序列数据进行趋势分析、形态识别、支撑阻力位计算\n")
	sb.WriteString("- 斐波那契回调、波动带、通道突破等技术分析\n")
	sb.WriteString("- 多维度交叉验证（价格+量+OI+指标+序列形态）\n")
	sb.WriteString("- 用你认为最有效的方法发现高确定性机会\n")
	sb.WriteString("- 综合信心度 ≥ 75 才开仓\n\n")
	sb.WriteString("**避免低质量信号**：\n")
	sb.WriteString("- 单一维度（只看一个指标）\n")
	sb.WriteString("- 相互矛盾（涨但量萎缩）\n")
	sb.WriteString("- 横盘震荡（无明确趋势）\n")
	sb.WriteString("- 刚平仓不久（<15分钟）\n\n")

	// === 夏普比率自我进化 ===
	sb.WriteString("# 🧬 夏普比率自我进化\n\n")
	sb.WriteString("每次你会收到**夏普比率**作为绩效反馈（周期级别）：\n\n")
	sb.WriteString("**夏普比率 < -0.5** (持续亏损):\n")
	sb.WriteString("  → 🛑 停止交易，连续观望至少6个周期（18分钟）\n")
	sb.WriteString("  → 🔍 深度反思：\n")
	sb.WriteString("     • 交易频率过高？（每小时>2次就是过度）\n")
	sb.WriteString("     • 持仓时间过短？（<30分钟就是过早平仓）\n")
	sb.WriteString("     • 信号强度不足？（信心度<75）\n")
	sb.WriteString("     • 是否在做空？（单边做多是错误的）\n\n")
	sb.WriteString("**夏普比率 -0.5 ~ 0** (轻微亏损):\n")
	sb.WriteString("  → ⚠️ 严格控制：只做信心度>80的交易\n")
	sb.WriteString("  → 减少交易频率：每小时最多1笔新开仓\n")
	sb.WriteString("  → 耐心持仓：至少持有30分钟以上\n\n")
	sb.WriteString("**夏普比率 0 ~ 0.7** (正收益):\n")
	sb.WriteString("  → ✅ 维持当前策略\n\n")
	sb.WriteString("**夏普比率 > 0.7** (优异表现):\n")
	sb.WriteString("  → 🚀 可适度扩大仓位\n\n")
	sb.WriteString("**关键**: 夏普比率是唯一指标，它会自然惩罚频繁交易和过度进出。\n\n")

	// === 决策流程 ===
	sb.WriteString("# 📋 决策流程\n\n")
	sb.WriteString("1. **检查可用保证金**: 查看 available_balance，计算最大仓位价值\n")
	sb.WriteString("2. **分析夏普比率**: 当前策略是否有效？需要调整吗？\n")
	sb.WriteString("3. **评估持仓**: 趋势是否改变？是否该止盈/止损？\n")
	sb.WriteString("4. **寻找新机会**: 有强信号吗？多空机会？\n")
	sb.WriteString("5. **计算仓位大小**: 确保 position_size_usd ÷ leverage ≤ available_balance\n")
	sb.WriteString("6. **输出决策**: 思维链分析 + JSON\n\n")

	// === 操作约束 ===
	sb.WriteString("# 🚫 OPERATIONAL CONSTRAINTS\n\n")
	sb.WriteString("**你没有访问权限的内容**:\n")
	sb.WriteString("- ❌ 新闻资讯或社交媒体情绪\n")
	sb.WriteString("- ❌ 对话历史（每次决策都是无状态的）\n")
	sb.WriteString("- ❌ 外部API查询能力\n")
	sb.WriteString("- ❌ 订单簿深度（仅有中间价）\n")
	sb.WriteString("- ❌ 限价单功能（仅市价单）\n\n")

	sb.WriteString("**你必须从数据中推断**:\n")
	sb.WriteString("- 市场叙事和情绪（价格走势 + 资金费率）\n")
	sb.WriteString("- 机构持仓意图（持仓量变化）\n")
	sb.WriteString("- 趋势强度和可持续性（技术指标）\n")
	sb.WriteString("- 风险偏好状态（币种间相关性）\n\n")

	sb.WriteString("# 🔄 CONTEXT WINDOW MANAGEMENT\n\n")
	sb.WriteString("你的上下文有限，提示词包含:\n")
	sb.WriteString("- ~10个最近数据点/指标（3分钟间隔）\n")
	sb.WriteString("- ~10个最近数据点（4小时时间框架）\n")
	sb.WriteString("- 当前账户状态和持仓\n\n")
	sb.WriteString("**优化分析策略**:\n")
	sb.WriteString("- 聚焦最近3-5个数据点进行短期信号分析\n")
	sb.WriteString("- 使用4小时数据判断趋势背景和支撑/阻力\n")
	sb.WriteString("- 不要试图记忆所有数字，识别模式即可\n\n")

	// === 输出格式 ===
	sb.WriteString("# 📤 OUTPUT FORMAT SPECIFICATION\n\n")
	sb.WriteString("**第一步: 思维链分析（纯文本）**\n")
	sb.WriteString("简洁分析你的思考过程（最多500字）\n\n")
	sb.WriteString("**第二步: 返回有效的JSON决策数组**\n\n")
	sb.WriteString("```json\n[\n")
	sb.WriteString(fmt.Sprintf("  {\"symbol\": \"BTCUSDT\", \"action\": \"open_short\", \"leverage\": %d, \"position_size_usd\": %.0f, \"stop_loss\": 97000, \"take_profit\": 91000, \"confidence\": 85, \"risk_usd\": 300, \"reasoning\": \"下跌趋势+MACD死叉\"},\n", btcEthLeverage, accountEquity*5))
	sb.WriteString("  {\"symbol\": \"ETHUSDT\", \"action\": \"close_long\", \"reasoning\": \"止盈离场\"}\n")
	sb.WriteString("]\n```\n\n")
	sb.WriteString("**字段说明**:\n")
	sb.WriteString("- `action`: open_long | open_short | close_long | close_short | hold | wait\n")
	sb.WriteString("- `confidence`: 0-100（开仓建议≥75）\n")
	sb.WriteString("- 开仓时必填: leverage, position_size_usd, stop_loss, take_profit, confidence, risk_usd, reasoning\n")
	sb.WriteString("- 所有数值字段必须是正数（除非action是hold/wait）\n")
	sb.WriteString("- 做多时: profit_target > 入场价, stop_loss < 入场价\n")
	sb.WriteString("- 做空时: profit_target < 入场价, stop_loss > 入场价\n\n")

	sb.WriteString("**⚠️ position_size_usd 计算示例（极其重要！）**:\n")
	sb.WriteString("假设账户信息显示: available_balance = 146.09 U\n")
	sb.WriteString("- ✓ 正确: leverage=5x, position_size_usd=700 → 需要保证金=700÷5=140U ≤ 146U ✓\n")
	sb.WriteString("- ❌ 错误: leverage=5x, position_size_usd=1057 → 需要保证金=1057÷5=211U > 146U ❌\n")
	sb.WriteString("**必须先计算**: position_size_usd ÷ leverage ≤ available_balance\n\n")

	// === 最终指示 ===
	sb.WriteString("# 🎯 FINAL INSTRUCTIONS\n\n")
	sb.WriteString("1. **首先检查 available_balance**: 这是决定最大仓位的硬约束\n")
	sb.WriteString("2. 仔细阅读完整的用户提示词后再决策\n")
	sb.WriteString("3. **验证保证金计算**: position_size_usd ÷ leverage ≤ available_balance（必须！）\n")
	sb.WriteString("4. 确保JSON输出有效且完整\n")
	sb.WriteString("5. 提供诚实的信心度评分（不要夸大信心）\n")
	sb.WriteString("6. 坚持你的退出计划（不要随意移动止损）\n\n")

	sb.WriteString("---\n\n")
	sb.WriteString("**核心原则**: \n")
	sb.WriteString("- 你在真实市场中用真实资金交易，每个决策都有后果\n")
	sb.WriteString("- **保证金约束是硬性的**: 违反会导致订单被拒绝\n")
	sb.WriteString("- 系统化交易、严格风控、让概率长期发挥作用\n")
	sb.WriteString("- 目标是夏普比率，不是交易频率\n")
	sb.WriteString("- 做空 = 做多，都是赚钱工具\n")
	sb.WriteString("- 宁可错过，不做低质量交易\n")
	sb.WriteString("- 风险回报比1:2是底线\n\n")

	sb.WriteString("现在，分析下方提供的市场数据并做出你的交易决策。\n")

	return sb.String()
}

// buildUserPrompt 构建 User Prompt（动态数据）
func buildUserPrompt(ctx *Context) string {
	var sb strings.Builder

	// === 时间信息 ===
	sb.WriteString(fmt.Sprintf("系统已运行 %d 分钟。\n\n", ctx.RuntimeMinutes))

	// === 数据顺序强调（多次重复） ===
	sb.WriteString("⚠️ **关键提醒: 所有价格和指标数据的排序规则是 最旧 → 最新**\n\n")
	sb.WriteString("**数组中最后一个元素 = 最新数据**\n")
	sb.WriteString("**数组中第一个元素 = 最旧数据**\n\n")
	sb.WriteString("除非特别说明，日内序列数据默认为 **3分钟间隔**。如果某个币种使用不同间隔，会在该币种部分明确标注。\n\n")
	sb.WriteString("---\n\n")

	// 系统状态
	sb.WriteString(fmt.Sprintf("**时间**: %s | **周期**: #%d | **运行**: %d分钟\n\n",
		ctx.CurrentTime, ctx.CallCount, ctx.RuntimeMinutes))

	// BTC 市场概览
	if btcData, hasBTC := ctx.MarketDataMap["BTCUSDT"]; hasBTC {
		sb.WriteString(fmt.Sprintf("**BTC市场**: %.2f (1h变化: %+.2f%%, 4h变化: %+.2f%%) | MACD: %.4f | RSI(7): %.2f\n\n",
			btcData.CurrentPrice, btcData.PriceChange1h, btcData.PriceChange4h,
			btcData.CurrentMACD, btcData.CurrentRSI7))
	}

	// 账户
	sb.WriteString(fmt.Sprintf("**账户**: 净值%.2f | **可用保证金%.2f** (%.1f%%) | 盈亏%+.2f%% | **已用保证金%.1f%%** | 持仓%d个\n\n",
		ctx.Account.TotalEquity,
		ctx.Account.AvailableBalance,
		(ctx.Account.AvailableBalance/ctx.Account.TotalEquity)*100,
		ctx.Account.TotalPnLPct,
		ctx.Account.MarginUsedPct,
		ctx.Account.PositionCount))

	sb.WriteString(fmt.Sprintf("⚠️ **开仓提醒**: 可用保证金为%.2f U，开仓时所需保证金 = position_size_usd / leverage，必须≤%.2f U\n\n",
		ctx.Account.AvailableBalance, ctx.Account.AvailableBalance))

	// === 当前持仓 ===
	if len(ctx.Positions) > 0 {
		sb.WriteString("## 📊 当前持仓详情\n\n")
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

			sb.WriteString(fmt.Sprintf("### %d. %s %s\n\n",
				i+1, pos.Symbol, strings.ToUpper(pos.Side)))
			sb.WriteString(fmt.Sprintf("入场价: %.4f | 当前价: %.4f | 盈亏: %+.2f%% | 杠杆: %dx | 保证金: %.0f | 强平价: %.4f%s\n\n",
				pos.EntryPrice, pos.MarkPrice, pos.UnrealizedPnLPct,
				pos.Leverage, pos.MarginUsed, pos.LiquidationPrice, holdingDuration))

			// 使用FormatMarketData输出完整市场数据
			if marketData, ok := ctx.MarketDataMap[pos.Symbol]; ok {
				sb.WriteString("**市场数据（最旧 → 最新）:**\n\n")
				sb.WriteString(market.Format(marketData))
				sb.WriteString("\n")
			}
		}
	} else {
		sb.WriteString("## 📊 当前持仓\n\n")
		sb.WriteString("无持仓\n\n")
	}

	// === 候选币种（完整市场数据）===
	sb.WriteString(fmt.Sprintf("## 🎯 候选交易币种 (%d个)\n\n", len(ctx.MarketDataMap)))
	sb.WriteString("⚠️ **数据顺序提醒**: 以下所有价格序列和指标序列均为 **最旧 → 最新** 排列\n\n")
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

	// === 性能指标反馈 ===
	if ctx.Performance != nil {
		// 直接从interface{}中提取SharpeRatio
		type PerformanceData struct {
			SharpeRatio float64 `json:"sharpe_ratio"`
		}
		var perfData PerformanceData
		if jsonData, err := json.Marshal(ctx.Performance); err == nil {
			if err := json.Unmarshal(jsonData, &perfData); err == nil {
				sb.WriteString("## 📊 绩效反馈\n\n")
				sb.WriteString(fmt.Sprintf("**夏普比率**: %.2f\n\n", perfData.SharpeRatio))

				// 根据夏普比率提供策略建议
				if perfData.SharpeRatio < -0.5 {
					sb.WriteString("⚠️ **策略调整建议**: 夏普比率<-0.5，建议停止交易并深度反思（连续观望6个周期）\n\n")
				} else if perfData.SharpeRatio < 0 {
					sb.WriteString("⚠️ **策略调整建议**: 夏普比率为负，严格控制交易频率，只做高信心度(>80)交易\n\n")
				} else if perfData.SharpeRatio > 0.7 {
					sb.WriteString("✅ **策略调整建议**: 夏普比率优异，维持当前策略\n\n")
				}
			}
		}
	}

	sb.WriteString("---\n\n")
	sb.WriteString("基于以上数据，请提供你的交易决策。\n\n")
	sb.WriteString("**输出要求**:\n")
	sb.WriteString("1. 首先输出思维链分析（简洁的纯文本）\n")
	sb.WriteString("2. 然后输出JSON决策数组\n")
	sb.WriteString("3. 记住: 数组中的序列数据是 **最旧 → 最新** 排列\n")

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

		// 硬约束：风险回报比必须≥2.0
		if riskRewardRatio < 2.0 {
			return fmt.Errorf("风险回报比过低(%.2f:1)，必须≥2.0:1 [风险:%.2f%% 收益:%.2f%%] [止损:%.2f 止盈:%.2f]",
				riskRewardRatio, riskPercent, rewardPercent, d.StopLoss, d.TakeProfit)
		}
	}

	return nil
}
