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
	EntryPrice      float64 `json:"entry_price,omitempty"` // 预期入场价格（用于风险回报比计算）
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
	decision, err := parseFullDecisionResponse(aiResponse, ctx.Account.TotalEquity, ctx.Account.AvailableBalance, ctx.BTCETHLeverage, ctx.AltcoinLeverage)
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
	sb.WriteString("   - 何时使用: 现有持仓按预期运行，趋势未改变\n")
	sb.WriteString("   - 必须针对**已有持仓的币种**使用\n\n")
	sb.WriteString("4. **close_long / close_short**: 完全退出现有持仓\n")
	sb.WriteString("   - 何时使用: 达到止盈目标、触发止损、或交易逻辑失效\n\n")
	sb.WriteString("5. **wait**: 观望不操作\n")
	sb.WriteString("   - 何时使用: 无强信号、市场不明朗、或需要耐心等待\n")
	sb.WriteString("   - 针对**无持仓的币种**，或者不想对任何币种操作时\n\n")
	sb.WriteString("**wait vs hold 使用说明**:\n")
	sb.WriteString("- 有BTCUSDT持仓，趋势正常 → {\"symbol\": \"BTCUSDT\", \"action\": \"hold\"}\n")
	sb.WriteString("- 无ETHUSDT持仓，观望不开 → 不输出ETHUSDT的决策（推荐）\n")
	sb.WriteString("- 如果本周期不想做任何操作 → 输出空数组 [] 即可\n\n")

	sb.WriteString("**持仓管理约束**:\n")
	sb.WriteString("- ⚠️ 禁止金字塔加仓（每个币种最多1个持仓）\n")
	sb.WriteString("- ⚠️ 禁止对冲（同一资产不能同时持有多空）\n")
	sb.WriteString("- ⚠️ 禁止部分平仓（必须一次性全部平仓）\n\n")
	sb.WriteString("**多持仓组合风险管理**:\n")
	sb.WriteString("- 避免同时持有高度相关的币种（如3个山寨币都做多）\n")
	sb.WriteString("- 优先选择相关性低的币种组合，分散风险\n")
	sb.WriteString("- BTC/ETH + 1-2个山寨币 是较好的组合\n")
	sb.WriteString("- 可以同时持有多头和空头，但需确保方向有根据\n\n")

	// === 硬约束（风险控制）===
	sb.WriteString("# ⚖️ 风险管理协议（强制执行）\n\n")
	sb.WriteString("1. **风险回报比**: 必须 ≥ 1:1.5（冒1%风险，赚1.5%+收益）\n")
	sb.WriteString("2. **最多持仓**: 3个币种（质量>数量）\n")
	sb.WriteString("3. **单币仓位范围**: \n")
	sb.WriteString("   - **最小仓位**: ≥ 账户净值的5%（避免手续费占比过高）\n")
	sb.WriteString("   - **推荐仓位**: 账户净值的10-30%（根据信心度调整）\n")
	sb.WriteString("   - **最大仓位**: available_balance × leverage（硬约束）\n")
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
	sb.WriteString("- `risk_usd`: 美元风险敞口（单笔最大可能亏损，不能超过账户净值的30%）\n")
	sb.WriteString("  计算公式: risk_usd = (|入场价 - 止损价| / 入场价) × position_size_usd\n")
	sb.WriteString("  示例: 入场价100k, 止损98k, 仓位5000U → risk_usd = (2k/100k) × 5000 = 100U\n")
	sb.WriteString(fmt.Sprintf("  ⚠️ 当前账户净值%.2f，单笔风险不能超过%.2f USD\n", accountEquity, accountEquity*0.30))
	sb.WriteString("  要求: risk_usd ≤ 账户净值的30%（严格遵守）\n\n")
	sb.WriteString("**止损止盈设置方法论**:\n")
	sb.WriteString("1. **基于ATR动态止损**: 止损距离 = 当前价格 ± (1.5~2.0 × ATR)\n")
	sb.WriteString("   - 高波动市场（ATR大）→ 使用2.0倍ATR\n")
	sb.WriteString("   - 低波动市场（ATR小）→ 使用1.5倍ATR\n\n")
	sb.WriteString("2. **基于关键技术位**: 在明显的支撑/阻力位外侧设置止损\n")
	sb.WriteString("   - 做多: 止损设在关键支撑位下方3-5%\n")
	sb.WriteString("   - 做空: 止损设在关键阻力位上方3-5%\n\n")
	sb.WriteString("3. **风险回报比计算（极其重要！）**:\n")
	sb.WriteString("   - 基于**当前市价**（或预期入场价）计算\n")
	sb.WriteString("   - 做多: 风险=(入场价-止损)/入场价 | 收益=(止盈-入场价)/入场价\n")
	sb.WriteString("   - 做空: 风险=(止损-入场价)/入场价 | 收益=(入场价-止盈)/入场价\n")
	sb.WriteString("   - **硬性要求**: 收益/风险 ≥ 3.0（冒1%赚3%+）\n\n")
	sb.WriteString("4. **止盈目标设置**:\n")
	sb.WriteString("   - 基于斐波那契扩展位（1.618, 2.618）\n")
	sb.WriteString("   - 基于前期高点/低点阻力/支撑\n")
	sb.WriteString("   - 确保止盈距离 ≥ 3倍止损距离\n\n")

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
	sb.WriteString("**持仓时长管理策略**:\n")
	sb.WriteString("- 盈利 < 1R（1倍风险）：继续持有，除非交易逻辑失效\n")
	sb.WriteString("- 盈利 1-2R：可考虑移至保本止损（将止损设为入场价）\n")
	sb.WriteString("- 盈利 > 2R：达到初始目标，可平仓或继续持有\n")
	sb.WriteString("- 持有 > 4小时且横盘无进展：考虑平仓释放资金\n")
	sb.WriteString("- 时间止损：持仓超过12小时仍未达目标，重新评估\n\n")
	sb.WriteString("**⚠️ 注意：系统不支持修改现有持仓的止损价格**\n")
	sb.WriteString("如果想调整止损，必须先平仓再重新开仓（不推荐，增加手续费）\n")
	sb.WriteString("因此开仓时就要设置合理的止损，预留足够空间\n\n")

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
	sb.WriteString("**资金费率交易策略**:\n")
	sb.WriteString("  - 极端正费率（>0.05%）+ 技术阻力位 = 考虑做空（市场过度看涨）\n")
	sb.WriteString("  - 极端负费率（<-0.05%）+ 技术支撑位 = 考虑做多（市场过度看跌）\n")
	sb.WriteString("  - 费率与价格背离（价格涨但费率转负）= 警惕反转\n")
	sb.WriteString("  - 费率持续极端（>0.1%）= 趋势可能接近尾声\n\n")

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
	sb.WriteString("**⚠️ 系统已自动过滤的币种**：\n")
	sb.WriteString("- 持仓价值（OI × 当前价格）< 15M USD的币种已被过滤\n")
	sb.WriteString("- 你看到的所有候选币种都已通过流动性检查\n")
	sb.WriteString("- 但仍需关注**成交量变化**：如果某币种成交量突然萎缩>50%，需谨慎\n\n")
	sb.WriteString("**OI Top 数据的应用方法**：\n")
	sb.WriteString("- OI快速增长（>10%/小时）+ 价格同向 = 趋势强化信号（高确定性）\n")
	sb.WriteString("- OI增长 + 价格逆向 = 潜在反转警告（谨慎）\n")
	sb.WriteString("- 净多/净空严重不平衡 = 参考情绪方向（可考虑逆向）\n")
	sb.WriteString("- OI_Top排名靠前的币种 = 市场关注度高，流动性好\n")
	sb.WriteString("- AI500+OI_Top双重信号 = 优先级最高的交易机会\n\n")
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
	sb.WriteString("**历史绩效数据的应用方法**:\n")
	sb.WriteString("你会收到最近的交易历史和绩效分析，请这样使用：\n\n")
	sb.WriteString("1. **识别表现最好的币种和策略**:\n")
	sb.WriteString("   - 哪些币种胜率高？优先关注这些币种\n")
	sb.WriteString("   - 做多还是做空表现更好？调整多空比例\n")
	sb.WriteString("   - 哪些技术形态成功率高？强化这些信号\n\n")
	sb.WriteString("2. **识别失败模式并避免**:\n")
	sb.WriteString("   - 哪些币种总是止损？暂时避开\n")
	sb.WriteString("   - 止损是否过窄？（频繁触发）→ 扩大止损\n")
	sb.WriteString("   - 是否过早平仓？（盈利<1R就平）→ 更耐心持仓\n")
	sb.WriteString("   - 是否持仓过久？（>12小时无进展）→ 更快决断\n\n")
	sb.WriteString("**⚠️ 连续止损保护机制（重要！）**:\n")
	sb.WriteString("从历史绩效数据中统计每个币种的止损次数：\n")
	sb.WriteString("- 同一币种**连续2次止损** → 暂停该币种交易至少6个周期（18分钟）\n")
	sb.WriteString("- 同一币种**连续3次止损** → 将该币种加入黑名单，至少24小时不交易\n")
	sb.WriteString("- 连续止损说明该币种当前不适合你的策略，避免重复犯错\n")
	sb.WriteString("- 如果历史数据中某币种胜率<30%，也应谨慎对待\n\n")
	sb.WriteString("3. **动态调整仓位管理**:\n")
	sb.WriteString("   - 胜率 >60% → 可适度增加仓位（在风控范围内）\n")
	sb.WriteString("   - 胜率 <40% → 减小仓位或停止交易\n")
	sb.WriteString("   - 平均盈亏比 <2:1 → 提高止盈目标或收紧止损\n\n")
	sb.WriteString("4. **学习周期模式**:\n")
	sb.WriteString("   - 某些时间段表现更好？（如波动大的时段）\n")
	sb.WriteString("   - 某些市场条件下表现差？（如横盘时）\n")
	sb.WriteString("   - 调整策略以适应市场节奏\n\n")
	sb.WriteString("# 🚨 极端市场条件应对\n\n")
	sb.WriteString("在特殊市场环境下，需要调整交易策略以保护资本：\n\n")
	sb.WriteString("**高波动期（ATR激增 >50%）**:\n")
	sb.WriteString("  - 减少杠杆至正常的50%（5x→2-3x）\n")
	sb.WriteString("  - 扩大止损距离（使用2.0-2.5倍ATR）\n")
	sb.WriteString("  - 减少持仓数量（3个→1-2个）\n")
	sb.WriteString("  - 降低仓位大小（正常的50-70%）\n\n")
	sb.WriteString("**流动性枯竭（成交量骤降 >50%）**:\n")
	sb.WriteString("  - 避免开新仓（滑点风险大）\n")
	sb.WriteString("  - 考虑提前平仓现有盈利持仓\n")
	sb.WriteString("  - 等待流动性恢复后再交易\n\n")
	sb.WriteString("**极端资金费率（绝对值 >0.1%）**:\n")
	sb.WriteString("  - 考虑反向交易机会（费率均值回归）\n")
	sb.WriteString("  - 警惕趋势即将反转\n")
	sb.WriteString("  - 持有顺向仓位的要警觉\n\n")
	sb.WriteString("**市场横盘震荡（价格波动 <2%/4小时）**:\n")
	sb.WriteString("  - 避免频繁交易（容易被止损扫来扫去）\n")
	sb.WriteString("  - 等待明确突破方向\n")
	sb.WriteString("  - 考虑平掉长期横盘的持仓\n\n")
	sb.WriteString("**BTC剧烈波动（>5%/小时）**:\n")
	sb.WriteString("  - BTC是市场风向标，剧烈波动会影响所有币种\n")
	sb.WriteString("  - 暂停山寨币交易，等待BTC稳定\n")
	sb.WriteString("  - 可考虑直接交易BTC捕捉主要趋势\n\n")

	// === 决策流程 ===
	sb.WriteString("# 📋 决策流程（按顺序执行）\n\n")
	sb.WriteString("**第1步：检查市场环境**\n")
	sb.WriteString("- BTC是否剧烈波动（>5%/小时）？→ 暂停山寨币交易\n")
	sb.WriteString("- ATR是否激增（>50%）？→ 减少杠杆和仓位\n")
	sb.WriteString("- 成交量是否骤降（>50%）？→ 避免开新仓\n")
	sb.WriteString("- 市场是否横盘震荡？→ 等待明确突破\n\n")
	sb.WriteString("**第2步：检查账户状态**\n")
	sb.WriteString("- 查看 available_balance，计算最大仓位价值\n")
	sb.WriteString("- 当前持仓数量和保证金使用率\n\n")
	sb.WriteString("**第3步：分析绩效反馈**\n")
	sb.WriteString("- 夏普比率如何？需要调整策略吗？\n")
	sb.WriteString("- 哪些币种表现好/差？有连续止损的币种吗？\n")
	sb.WriteString("- 整体胜率和盈亏比如何？\n\n")
	sb.WriteString("**第4步：评估现有持仓**\n")
	sb.WriteString("- 每个持仓的趋势是否改变？\n")
	sb.WriteString("- 是否达到止盈/止损条件？\n")
	sb.WriteString("- 持仓时长是否过长（>4小时横盘）？\n\n")
	sb.WriteString("**第5步：寻找新开仓机会**\n")
	sb.WriteString("- 有强信号（信心度≥75）吗？\n")
	sb.WriteString("- 多空都要考虑，不要有偏见\n")
	sb.WriteString("- 避开连续止损的币种\n")
	sb.WriteString("- 避开流动性不足的币种\n\n")
	sb.WriteString("**第6步：计算仓位和风险**\n")
	sb.WriteString("- 仓位大小：账户净值的10-30%\n")
	sb.WriteString("- 验证保证金：position_size_usd ÷ leverage ≤ available_balance\n")
	sb.WriteString("- 验证风险回报比：基于当前市价，确保 ≥ 1.5\n")
	sb.WriteString("- 设置合理止损（基于ATR或技术位）\n\n")
	sb.WriteString("**第7步：输出决策**\n")
	sb.WriteString("- 思维链分析（简洁，最多500字）\n")
	sb.WriteString("- 严格的JSON决策数组\n\n")

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
	sb.WriteString(fmt.Sprintf("  {\"symbol\": \"BTCUSDT\", \"action\": \"open_short\", \"leverage\": %d, \"position_size_usd\": %.0f, \"entry_price\": 95500, \"stop_loss\": 97000, \"take_profit\": 91000, \"confidence\": 85, \"risk_usd\": 300, \"reasoning\": \"下跌趋势+MACD死叉\"},\n", btcEthLeverage, accountEquity*5))
	sb.WriteString("  {\"symbol\": \"ETHUSDT\", \"action\": \"close_long\", \"reasoning\": \"止盈离场\"}\n")
	sb.WriteString("]\n```\n\n")
	sb.WriteString("**字段说明**:\n")
	sb.WriteString("- `action`: open_long | open_short | close_long | close_short | hold | wait\n")
	sb.WriteString("- `confidence`: 0-100（开仓建议≥75）\n")
	sb.WriteString("- 开仓时必填: leverage, position_size_usd, **entry_price**, stop_loss, take_profit, confidence, risk_usd, reasoning\n")
	sb.WriteString("- `entry_price`: **预期入场价格**（推荐使用当前市价，用于精确计算风险回报比）\n")
	sb.WriteString("- 所有数值字段必须是正数（除非action是hold/wait）\n")
	sb.WriteString("- 做多时: profit_target > 入场价, stop_loss < 入场价\n")
	sb.WriteString("- 做空时: profit_target < 入场价, stop_loss > 入场价\n\n")
	sb.WriteString("**⚠️ JSON 格式严格要求**:\n")
	sb.WriteString("- 必须是**有效的JSON数组**，严格遵守JSON语法规范\n")
	sb.WriteString("- 字符串必须用**双引号**，不能用单引号或中文引号\n")
	sb.WriteString("- 数值字段**不能包含字符串**（如leverage必须是5，不能是\"5\"）\n")
	sb.WriteString("- reasoning字段不要包含换行符，用空格或分号代替\n")
	sb.WriteString("- 不要在JSON中添加注释或额外的文本\n")
	sb.WriteString("- 每个决策对象用逗号分隔，最后一个对象后面不加逗号\n")
	sb.WriteString("- 确保所有括号、引号正确闭合\n\n")

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
	sb.WriteString("- 风险回报比1:1.5是底线\n\n")

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
func parseFullDecisionResponse(aiResponse string, accountEquity, availableBalance float64, btcEthLeverage, altcoinLeverage int) (*FullDecision, error) {
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
	if err := validateDecisions(decisions, accountEquity, availableBalance, btcEthLeverage, altcoinLeverage); err != nil {
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
func validateDecisions(decisions []Decision, accountEquity, availableBalance float64, btcEthLeverage, altcoinLeverage int) error {
	for i, decision := range decisions {
		if err := validateDecision(&decision, accountEquity, availableBalance, btcEthLeverage, altcoinLeverage); err != nil {
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
func validateDecision(d *Decision, accountEquity, availableBalance float64, btcEthLeverage, altcoinLeverage int) error {
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
		maxLeverage := altcoinLeverage // 山寨币使用配置的杠杆
		if d.Symbol == "BTCUSDT" || d.Symbol == "ETHUSDT" {
			maxLeverage = btcEthLeverage // BTC和ETH使用配置的杠杆
		}

		if d.Leverage <= 0 || d.Leverage > maxLeverage {
			return fmt.Errorf("杠杆必须在1-%d之间（%s，当前配置上限%d倍）: %d", maxLeverage, d.Symbol, maxLeverage, d.Leverage)
		}
		if d.PositionSizeUSD <= 0 {
			return fmt.Errorf("仓位大小必须大于0: %.2f", d.PositionSizeUSD)
		}

		// 验证最小仓位：至少为账户净值的5%（避免手续费占比过高）
		minPositionSize := accountEquity * 0.05
		if d.PositionSizeUSD < minPositionSize {
			return fmt.Errorf("仓位过小(%.2f USD)，建议至少为账户净值的5%%(%.2f USD)，否则手续费占比过高",
				d.PositionSizeUSD, minPositionSize)
		}

		// 验证信心度范围：必须在0-100之间
		if d.Confidence < 0 || d.Confidence > 100 {
			return fmt.Errorf("信心度必须在0-100之间: %d", d.Confidence)
		}

		// 验证信心度是否达到建议阈值
		if d.Confidence < 75 {
			return fmt.Errorf("信心度过低(%d)，建议≥75才开仓，当前信号强度不足", d.Confidence)
		}

		// ⚠️ 验证保证金约束（硬性约束）
		// 所需保证金 = 仓位价值 / 杠杆
		requiredMargin := d.PositionSizeUSD / float64(d.Leverage)
		if requiredMargin > availableBalance {
			return fmt.Errorf("保证金不足: 需要%.2f U，可用%.2f U [仓位%.2f ÷ 杠杆%d = %.2f]",
				requiredMargin, availableBalance, d.PositionSizeUSD, d.Leverage, requiredMargin)
		}

		// 额外建议：保证金使用率不要超过90%（留有余地）
		marginUsagePercent := (requiredMargin / availableBalance) * 100
		if marginUsagePercent > 90 {
			log.Printf("⚠️  保证金使用率较高(%.1f%%)，建议控制在90%%以内 [%s]", marginUsagePercent, d.Symbol)
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

		// 验证风险回报比（必须≥1:1.5）
		// 优先使用AI提供的entry_price，如果没有则估算
		var entryPrice float64
		if d.EntryPrice > 0 {
			// 使用AI提供的预期入场价
			entryPrice = d.EntryPrice
		} else {
			// 如果AI未提供entry_price，使用止损和止盈之间靠近止损侧的位置（1/4位置）估算
			if d.Action == "open_long" {
				// 做多：入场价在止损之上，接近止损（距离止损约25%）
				entryPrice = d.StopLoss + (d.TakeProfit-d.StopLoss)*0.25
			} else {
				// 做空：入场价在止损之下，接近止损（距离止损约25%）
				entryPrice = d.StopLoss - (d.StopLoss-d.TakeProfit)*0.25
			}
		}

		// 验证entry_price的合理性
		if d.Action == "open_long" {
			if entryPrice <= d.StopLoss || entryPrice >= d.TakeProfit {
				return fmt.Errorf("做多时入场价必须在止损和止盈之间: 入场价%.2f 止损%.2f 止盈%.2f",
					entryPrice, d.StopLoss, d.TakeProfit)
			}
		} else {
			if entryPrice >= d.StopLoss || entryPrice <= d.TakeProfit {
				return fmt.Errorf("做空时入场价必须在止损和止盈之间: 入场价%.2f 止损%.2f 止盈%.2f",
					entryPrice, d.StopLoss, d.TakeProfit)
			}
		}

		// 计算风险回报比
		var riskPercent, rewardPercent, riskRewardRatio float64
		if d.Action == "open_long" {
			riskPercent = (entryPrice - d.StopLoss) / entryPrice * 100
			rewardPercent = (d.TakeProfit - entryPrice) / entryPrice * 100
		} else {
			riskPercent = (d.StopLoss - entryPrice) / entryPrice * 100
			rewardPercent = (entryPrice - d.TakeProfit) / entryPrice * 100
		}

		// 验证风险和收益都必须大于0
		if riskPercent <= 0 {
			return fmt.Errorf("风险为零或负数(%.2f%%)，止损设置异常 [入场价:%.2f 止损:%.2f]",
				riskPercent, entryPrice, d.StopLoss)
		}
		if rewardPercent <= 0 {
			return fmt.Errorf("收益为零或负数(%.2f%%)，止盈设置异常 [入场价:%.2f 止盈:%.2f]",
				rewardPercent, entryPrice, d.TakeProfit)
		}

		// 计算风险回报比
		riskRewardRatio = rewardPercent / riskPercent

		// 硬约束：风险回报比必须≥1.5
		if riskRewardRatio < 1.5 {
			return fmt.Errorf("风险回报比过低(%.2f:1)，必须≥1.5:1 [风险:%.2f%% 收益:%.2f%%] [入场:%.2f 止损:%.2f 止盈:%.2f]",
				riskRewardRatio, riskPercent, rewardPercent, entryPrice, d.StopLoss, d.TakeProfit)
		}

		// 验证risk_usd字段的合理性（如果AI提供了）
		if d.RiskUSD > 0 {
			// risk_usd不应该超过账户净值的30%（单笔最大风险）
			maxRiskUSD := accountEquity * 0.30
			if d.RiskUSD > maxRiskUSD {
				return fmt.Errorf("单笔风险过大(%.2f USD)，不应超过账户净值的30%%(%.2f USD)",
					d.RiskUSD, maxRiskUSD)
			}

			// 验证risk_usd计算是否合理（应该约等于止损距离 × 仓位价值 / 入场价）
			expectedRiskUSD := riskPercent / 100 * d.PositionSizeUSD
			if d.RiskUSD > expectedRiskUSD*1.5 || d.RiskUSD < expectedRiskUSD*0.5 {
				// 允许50%误差范围
				log.Printf("⚠️  risk_usd(%.2f)与计算值(%.2f)偏差较大，请检查", d.RiskUSD, expectedRiskUSD)
			}
		}
	}

	return nil
}
