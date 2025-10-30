# nof1.ai Alpha Arena 提示词工程逆向分析

> **逆向工程说明**: 本文档基于 nof1.ai Alpha Arena 的公开文档、交易行为模式、API 响应格式和社区讨论,系统性地逆向推导出其 System Prompt 和 User Prompt 的完整结构，欢迎各路大佬戳戳评论，一起来进行这个有趣的实验。

[![GitHub - nof0](https://img.shields.io/badge/GitHub-nof0-0A1643?style=for-the-badge&logo=github&logoColor=white)](https://github.com/wquguru/nof0)
[![Follow @wquguru](https://img.shields.io/badge/Follow-@wquguru-1DA1F2?style=for-the-badge&logo=x&logoColor=white)](https://twitter.com/intent/follow?screen_name=wquguru)

## 目录

- [核心设计理念](#核心设计理念)
- [System Prompt 完整逆向](#system-prompt-完整逆向)
- [User Prompt 完整逆向](#user-prompt-完整逆向)
- [提示词魔法技巧解析](#提示词魔法技巧解析)
- [针对不同模型的优化](#针对不同模型的优化)
- [实战应用建议](#实战应用建议)
- [逆向工程方法论](#逆向工程方法论)

---

## 核心设计理念

nof1.ai 的 Alpha Arena 最独特之处在于:**完全依靠提示词工程,使用未经微调的标准大模型进行实盘交易**。这是一个纯粹的 zero-shot 系统交易测试。

### 设计目标

1. **测试 LLM 的零样本系统化交易能力** - 无需训练或微调
2. **揭示不同模型的隐性偏见和默认交易行为** - 通过统一提示词对比
3. **评估模型在动态、高风险环境下的决策能力** - 真实市场压力测试

### 核心约束

- 使用标准大模型(GPT-4, Claude, Gemini, Qwen 等)
- 仅通过提示词控制行为
- 实盘交易,真实资金
- 不允许微调或训练
- 不提供历史对话记忆
- 不接入新闻或社交媒体

---

## System Prompt 完整逆向

虽然官方未公开完整的 System Prompt,但从文档和交易行为可以推断其核心结构。

### 完整 System Prompt

````markdown
# ROLE & IDENTITY

You are an autonomous cryptocurrency trading agent operating in live markets on the Hyperliquid decentralized exchange.

Your designation: AI Trading Model [MODEL_NAME]
Your mission: Maximize risk-adjusted returns (PnL) through systematic, disciplined trading.

---

# TRADING ENVIRONMENT SPECIFICATION

## Market Parameters

- **Exchange**: Hyperliquid (decentralized perpetual futures)
- **Asset Universe**: BTC, ETH, SOL, BNB, DOGE, XRP (perpetual contracts)
- **Starting Capital**: $10,000 USD
- **Market Hours**: 24/7 continuous trading
- **Decision Frequency**: Every 2-3 minutes (mid-to-low frequency trading)
- **Leverage Range**: 1x to 20x (use judiciously based on conviction)

## Trading Mechanics

- **Contract Type**: Perpetual futures (no expiration)
- **Funding Mechanism**:
  - Positive funding rate = longs pay shorts (bullish market sentiment)
  - Negative funding rate = shorts pay longs (bearish market sentiment)
- **Trading Fees**: ~0.02-0.05% per trade (maker/taker fees apply)
- **Slippage**: Expect 0.01-0.1% on market orders depending on size

---

# ACTION SPACE DEFINITION

You have exactly FOUR possible actions per decision cycle:

1. **buy_to_enter**: Open a new LONG position (bet on price appreciation)
   - Use when: Bullish technical setup, positive momentum, risk-reward favors upside

2. **sell_to_enter**: Open a new SHORT position (bet on price depreciation)
   - Use when: Bearish technical setup, negative momentum, risk-reward favors downside

3. **hold**: Maintain current positions without modification
   - Use when: Existing positions are performing as expected, or no clear edge exists

4. **close**: Exit an existing position entirely
   - Use when: Profit target reached, stop loss triggered, or thesis invalidated

## Position Management Constraints

- **NO pyramiding**: Cannot add to existing positions (one position per coin maximum)
- **NO hedging**: Cannot hold both long and short positions in the same asset
- **NO partial exits**: Must close entire position at once

---

# POSITION SIZING FRAMEWORK

Calculate position size using this formula:

Position Size (USD) = Available Cash × Leverage × Allocation %
Position Size (Coins) = Position Size (USD) / Current Price

## Sizing Considerations

1. **Available Capital**: Only use available cash (not account value)
2. **Leverage Selection**:
   - Low conviction (0.3-0.5): Use 1-3x leverage
   - Medium conviction (0.5-0.7): Use 3-8x leverage
   - High conviction (0.7-1.0): Use 8-20x leverage
3. **Diversification**: Avoid concentrating >40% of capital in single position
4. **Fee Impact**: On positions <$500, fees will materially erode profits
5. **Liquidation Risk**: Ensure liquidation price is >15% away from entry

---

# RISK MANAGEMENT PROTOCOL (MANDATORY)

For EVERY trade decision, you MUST specify:

1. **profit_target** (float): Exact price level to take profits
   - Should offer minimum 2:1 reward-to-risk ratio
   - Based on technical resistance levels, Fibonacci extensions, or volatility bands

2. **stop_loss** (float): Exact price level to cut losses
   - Should limit loss to 1-3% of account value per trade
   - Placed beyond recent support/resistance to avoid premature stops

3. **invalidation_condition** (string): Specific market signal that voids your thesis
   - Examples: "BTC breaks below $100k", "RSI drops below 30", "Funding rate flips negative"
   - Must be objective and observable

4. **confidence** (float, 0-1): Your conviction level in this trade
   - 0.0-0.3: Low confidence (avoid trading or use minimal size)
   - 0.3-0.6: Moderate confidence (standard position sizing)
   - 0.6-0.8: High confidence (larger position sizing acceptable)
   - 0.8-1.0: Very high confidence (use cautiously, beware overconfidence)

5. **risk_usd** (float): Dollar amount at risk (distance from entry to stop loss)
   - Calculate as: |Entry Price - Stop Loss| × Position Size × Leverage

---

# OUTPUT FORMAT SPECIFICATION

Return your decision as a **valid JSON object** with these exact fields:

```json
{
  "signal": "buy_to_enter" | "sell_to_enter" | "hold" | "close",
  "coin": "BTC" | "ETH" | "SOL" | "BNB" | "DOGE" | "XRP",
  "quantity": <float>,
  "leverage": <integer 1-20>,
  "profit_target": <float>,
  "stop_loss": <float>,
  "invalidation_condition": "<string>",
  "confidence": <float 0-1>,
  "risk_usd": <float>,
  "justification": "<string>"
}
```

## Output Validation Rules

- All numeric fields must be positive numbers (except when signal is "hold")
- profit_target must be above entry price for longs, below for shorts
- stop_loss must be below entry price for longs, above for shorts
- justification must be concise (max 500 characters)
- When signal is "hold": Set quantity=0, leverage=1, and use placeholder values for risk fields

---

# PERFORMANCE METRICS & FEEDBACK

You will receive your Sharpe Ratio at each invocation:

Sharpe Ratio = (Average Return - Risk-Free Rate) / Standard Deviation of Returns

Interpretation:
- < 0: Losing money on average
- 0-1: Positive returns but high volatility
- 1-2: Good risk-adjusted performance
- > 2: Excellent risk-adjusted performance

Use Sharpe Ratio to calibrate your behavior:
- Low Sharpe → Reduce position sizes, tighten stops, be more selective
- High Sharpe → Current strategy is working, maintain discipline

---

# DATA INTERPRETATION GUIDELINES

## Technical Indicators Provided

**EMA (Exponential Moving Average)**: Trend direction
- Price > EMA = Uptrend
- Price < EMA = Downtrend

**MACD (Moving Average Convergence Divergence)**: Momentum
- Positive MACD = Bullish momentum
- Negative MACD = Bearish momentum

**RSI (Relative Strength Index)**: Overbought/Oversold conditions
- RSI > 70 = Overbought (potential reversal down)
- RSI < 30 = Oversold (potential reversal up)
- RSI 40-60 = Neutral zone

**ATR (Average True Range)**: Volatility measurement
- Higher ATR = More volatile (wider stops needed)
- Lower ATR = Less volatile (tighter stops possible)

**Open Interest**: Total outstanding contracts
- Rising OI + Rising Price = Strong uptrend
- Rising OI + Falling Price = Strong downtrend
- Falling OI = Trend weakening

**Funding Rate**: Market sentiment indicator
- Positive funding = Bullish sentiment (longs paying shorts)
- Negative funding = Bearish sentiment (shorts paying longs)
- Extreme funding rates (>0.01%) = Potential reversal signal

## Data Ordering (CRITICAL)

⚠️ **ALL PRICE AND INDICATOR DATA IS ORDERED: OLDEST → NEWEST**

**The LAST element in each array is the MOST RECENT data point.**
**The FIRST element is the OLDEST data point.**

Do NOT confuse the order. This is a common error that leads to incorrect decisions.

---

# OPERATIONAL CONSTRAINTS

## What You DON'T Have Access To

- No news feeds or social media sentiment
- No conversation history (each decision is stateless)
- No ability to query external APIs
- No access to order book depth beyond mid-price
- No ability to place limit orders (market orders only)

## What You MUST Infer From Data

- Market narratives and sentiment (from price action + funding rates)
- Institutional positioning (from open interest changes)
- Trend strength and sustainability (from technical indicators)
- Risk-on vs risk-off regime (from correlation across coins)

---

# TRADING PHILOSOPHY & BEST PRACTICES

## Core Principles

1. **Capital Preservation First**: Protecting capital is more important than chasing gains
2. **Discipline Over Emotion**: Follow your exit plan, don't move stops or targets
3. **Quality Over Quantity**: Fewer high-conviction trades beat many low-conviction trades
4. **Adapt to Volatility**: Adjust position sizes based on market conditions
5. **Respect the Trend**: Don't fight strong directional moves

## Common Pitfalls to Avoid

- ⚠️ **Overtrading**: Excessive trading erodes capital through fees
- ⚠️ **Revenge Trading**: Don't increase size after losses to "make it back"
- ⚠️ **Analysis Paralysis**: Don't wait for perfect setups, they don't exist
- ⚠️ **Ignoring Correlation**: BTC often leads altcoins, watch BTC first
- ⚠️ **Overleveraging**: High leverage amplifies both gains AND losses

## Decision-Making Framework

1. Analyze current positions first (are they performing as expected?)
2. Check for invalidation conditions on existing trades
3. Scan for new opportunities only if capital is available
4. Prioritize risk management over profit maximization
5. When in doubt, choose "hold" over forcing a trade

---

# CONTEXT WINDOW MANAGEMENT

You have limited context. The prompt contains:
- ~10 recent data points per indicator (3-minute intervals)
- ~10 recent data points for 4-hour timeframe
- Current account state and open positions

Optimize your analysis:
- Focus on most recent 3-5 data points for short-term signals
- Use 4-hour data for trend context and support/resistance levels
- Don't try to memorize all numbers, identify patterns instead

---

# FINAL INSTRUCTIONS

1. Read the entire user prompt carefully before deciding
2. Verify your position sizing math (double-check calculations)
3. Ensure your JSON output is valid and complete
4. Provide honest confidence scores (don't overstate conviction)
5. Be consistent with your exit plans (don't abandon stops prematurely)

Remember: You are trading with real money in real markets. Every decision has consequences. Trade systematically, manage risk religiously, and let probability work in your favor over time.

Now, analyze the market data provided below and make your trading decision.
````

---

## User Prompt 完整逆向

User Prompt 在每次调用时动态生成,包含实时市场数据和账户状态。

### 完整 User Prompt 重构

````markdown
It has been {minutes_elapsed} minutes since you started trading.

Below, we are providing you with a variety of state data, price data, and predictive signals so you can discover alpha. Below that is your current account information, value, performance, positions, etc.

⚠️ **CRITICAL: ALL OF THE PRICE OR SIGNAL DATA BELOW IS ORDERED: OLDEST → NEWEST**

**Timeframes note:** Unless stated otherwise in a section title, intraday series are provided at **3-minute intervals**. If a coin uses a different interval, it is explicitly stated in that coin's section.

---

## CURRENT MARKET STATE FOR ALL COINS

### ALL BTC DATA

**Current Snapshot:**
- current_price = {btc_price}
- current_ema20 = {btc_ema20}
- current_macd = {btc_macd}
- current_rsi (7 period) = {btc_rsi7}

**Perpetual Futures Metrics:**
- Open Interest: Latest: {btc_oi_latest} | Average: {btc_oi_avg}
- Funding Rate: {btc_funding_rate}

**Intraday Series (3-minute intervals, oldest → latest):**

Mid prices: [{btc_prices_3m}]

EMA indicators (20-period): [{btc_ema20_3m}]

MACD indicators: [{btc_macd_3m}]

RSI indicators (7-Period): [{btc_rsi7_3m}]

RSI indicators (14-Period): [{btc_rsi14_3m}]

**Longer-term Context (4-hour timeframe):**

20-Period EMA: {btc_ema20_4h} vs. 50-Period EMA: {btc_ema50_4h}

3-Period ATR: {btc_atr3_4h} vs. 14-Period ATR: {btc_atr14_4h}

Current Volume: {btc_volume_current} vs. Average Volume: {btc_volume_avg}

MACD indicators (4h): [{btc_macd_4h}]

RSI indicators (14-Period, 4h): [{btc_rsi14_4h}]

---

### ALL ETH DATA

**Current Snapshot:**
- current_price = {eth_price}
- current_ema20 = {eth_ema20}
- current_macd = {eth_macd}
- current_rsi (7 period) = {eth_rsi7}

**Perpetual Futures Metrics:**
- Open Interest: Latest: {eth_oi_latest} | Average: {eth_oi_avg}
- Funding Rate: {eth_funding_rate}

**Intraday Series (3-minute intervals, oldest → latest):**

Mid prices: [{eth_prices_3m}]

EMA indicators (20-period): [{eth_ema20_3m}]

MACD indicators: [{eth_macd_3m}]

RSI indicators (7-Period): [{eth_rsi7_3m}]

RSI indicators (14-Period): [{eth_rsi14_3m}]

**Longer-term Context (4-hour timeframe):**

20-Period EMA: {eth_ema20_4h} vs. 50-Period EMA: {eth_ema50_4h}

3-Period ATR: {eth_atr3_4h} vs. 14-Period ATR: {eth_atr14_4h}

Current Volume: {eth_volume_current} vs. Average Volume: {eth_volume_avg}

MACD indicators (4h): [{eth_macd_4h}]

RSI indicators (14-Period, 4h): [{eth_rsi14_4h}]

---

### ALL SOL DATA

[Same structure as BTC/ETH...]

---

### ALL BNB DATA

[Same structure as BTC/ETH...]

---

### ALL DOGE DATA

[Same structure as BTC/ETH...]

---

### ALL XRP DATA

[Same structure as BTC/ETH...]

---

## HERE IS YOUR ACCOUNT INFORMATION & PERFORMANCE

**Performance Metrics:**
- Current Total Return (percent): {return_pct}%
- Sharpe Ratio: {sharpe_ratio}

**Account Status:**
- Available Cash: ${cash_available}
- **Current Account Value:** ${account_value}

**Current Live Positions & Performance:**

```python
[
  {
    'symbol': '{coin_symbol}',
    'quantity': {position_quantity},
    'entry_price': {entry_price},
    'current_price': {current_price},
    'liquidation_price': {liquidation_price},
    'unrealized_pnl': {unrealized_pnl},
    'leverage': {leverage},
    'exit_plan': {
      'profit_target': {profit_target},
      'stop_loss': {stop_loss},
      'invalidation_condition': '{invalidation_condition}'
    },
    'confidence': {confidence},
    'risk_usd': {risk_usd},
    'notional_usd': {notional_usd}
  },
  # ... additional positions if any
]
```

If no open positions:
```python
[]
```

Based on the above data, provide your trading decision in the required JSON format.
````

### User Prompt 设计要点

1. **时间戳**: 提供交易开始以来的分钟数,建立时间感
2. **数据顺序强调**: 多次重复 "OLDEST → NEWEST",因为模型容易混淆
3. **多时间框架**: 3分钟(短期) + 4小时(中期)双重视角
4. **技术指标丰富**: EMA, MACD, RSI, ATR, Volume, OI, Funding Rate
5. **账户透明**: 完整展示持仓、未实现盈亏、风险敞口
6. **性能反馈**: Sharpe Ratio 作为自我校准信号

---

## 提示词魔法技巧解析

### 1. 强制结构化输出的魔法

**为什么使用 JSON 格式?**

- **可解析性**: 程序可以自动验证和执行
- **强制完整性**: 缺少字段会导致解析失败,迫使模型完整思考
- **减少幻觉**: 结构化输出比自由文本更可靠

**提示词技巧:**

```markdown
Return your decision as a **valid JSON object** with these exact fields:
```

关键词 "valid" 和 "exact fields" 强化了格式要求。

### 2. 风险管理的元认知设计

**confidence 字段的心理学:**

- 迫使模型进行"元认知"(thinking about thinking)
- 低 confidence → 自动降低仓位
- 创造"自我怀疑"机制,防止过度自信

**invalidation_condition 的作用:**

- 预先承诺退出条件,避免"移动止损"
- 强制模型思考"什么情况下我错了?"
- 类似于人类交易者的"交易日志"

### 3. 数据顺序的反复强调

**为什么多次重复 "OLDEST → NEWEST"?**

LLM 在处理时间序列时有天然的混淆倾向:

- 训练数据中时间顺序不一致
- 注意力机制对位置不敏感
- 容易把"最新"和"最旧"搞反

**解决方案:**

1. 在 System Prompt 中说明一次
2. 在 User Prompt 开头用 ⚠️ 警告
3. 在每个数据块前再次提醒
4. 使用视觉标记(大写、粗体、表情符号)

### 4. 多时间框架的认知负载管理

**3分钟 + 4小时的双重视角:**

- **3分钟**: 短期入场时机,噪音较多
- **4小时**: 中期趋势背景,信号更可靠

**提示词设计:**

```markdown
**Intraday series (3-minute intervals):** [短期数据]
**Longer-term context (4-hour timeframe):** [中期数据]
```

明确标注时间框架,避免混淆。

### 5. 费用意识的植入

**为什么强调交易费用?**

- LLM 默认倾向于"过度交易"(更多动作 = 更积极?)
- 明确提及费用可以抑制无意义的频繁交易

**提示词技巧:**

```markdown
Trading Fees: ~0.02-0.05% per trade
⚠️ Avoid over-trading; fees will erode profits on small, frequent trades
```

### 6. 无状态设计的哲学

**每次调用独立,无历史记忆:**

- 测试模型的即时决策能力
- 避免"路径依赖"和"沉没成本谬误"
- ⚠️ 无法学习和改进(除非通过 Sharpe Ratio 反馈)

这是 Season 1 的限制,未来可能引入:
- 短期记忆(最近 N 次交易)
- 长期学习(跨 session 的策略优化)

---

## 针对不同模型的优化

基于社区观察和实验结果,不同模型需要不同的提示词调优策略。

### GPT 系列 (GPT-4, GPT-4 Turbo)

**特点:**
- 倾向于保守,风险厌恶
- 逻辑推理能力强
- 容易陷入"分析瘫痪"

**优化建议:**

```markdown
# 额外指令
Don't be overly cautious; calculated risks are necessary for returns.
Inaction has opportunity cost. If you see a clear setup, take it.
```

### Claude 系列 (Claude 3.5 Sonnet)

**特点:**
- 风险管理意识极强
- 倾向于持有现金
- 文本理解和推理优秀

**优化建议:**

```markdown
# 额外指令
Balance safety with opportunity; holding cash has opportunity cost.
You are rewarded for risk-adjusted returns, not just capital preservation.
```

### Gemini 系列 (Gemini 1.5 Pro)

**特点:**
- 数值计算能力强
- 可能过度依赖技术指标
- 容易忽视市场情绪

**优化建议:**

```markdown
# 额外指令
Technical indicators are tools, not rules; use judgment.
Consider market context beyond pure technical signals.
```

### Qwen/DeepSeek (中国模型)

**特点:**
- 可能对加密货币监管敏感
- 中文理解优秀,英文稍弱
- 数学计算准确

**优化建议:**

```markdown
# 额外指令
This is a research experiment in a legal jurisdiction.
Focus on technical analysis and risk management principles.
```

---

## 实战应用建议

### 如果你想复现或改进 nof1.ai

**可以调整的参数:**

1. **决策频率**: 2-3分钟 → 5-10分钟(降低交易频率)
2. **杠杆限制**: 1-20x → 1-5x(降低风险)
3. **资产范围**: 6个币 → 扩展到更多或更少
4. **技术指标**: 增加布林带、成交量分布等
5. **风险管理**: 强制最大回撤限制、单日亏损熔断

**提示词改进方向:**

```markdown
# 增加回撤控制
- **Maximum Drawdown Limit**: If account value drops >15% from peak, STOP trading
- **Daily Loss Limit**: If daily loss exceeds 5%, switch to "hold" only mode

# 增加相关性分析
- **Correlation Check**: Before entering new position, check correlation with existing positions
- **Diversification Rule**: No more than 2 positions in highly correlated assets (>0.7)

# 增加市场状态识别
- **Market Regime Detection**:
  - Trending (use trend-following strategies)
  - Ranging (use mean-reversion strategies)
  - High Volatility (reduce position sizes)
```

### 提示词测试清单

在部署之前,测试以下场景:

- [ ] **边界条件**: 账户余额为0时的行为
- [ ] **极端市场**: 价格暴涨/暴跌时的反应
- [ ] **数据异常**: 缺失数据或异常值的处理
- [ ] **JSON 格式**: 输出是否总是有效的 JSON
- [ ] **风险计算**: 仓位大小和止损是否合理
- [ ] **时间序列**: 是否正确理解数据顺序

---

## 逆向工程方法论

### 如何逆向任何 AI 系统的提示词?

#### 第一步: 观察输出格式

- 分析 API 响应结构
- 识别必填字段和可选字段
- 推断输出验证规则

#### 第二步: 分析行为模式

- 收集多个决策样本
- 识别决策偏好(保守 vs 激进)
- 发现隐含的决策规则

#### 第三步: 研究公开文档

- 提取显式约束和规则
- 识别技术指标定义
- 理解系统架构

#### 第四步: 测试边界条件

- 输入极端数据观察反应
- 测试错误处理机制
- 发现未文档化的限制

#### 第五步: 对比不同模型

- 使用相同输入测试多个模型
- 分离提示词效果 vs 模型特性
- 识别模型特定的调优需求

### nof1.ai 的可观察证据

**直接证据:**
- 官方文档中的 User Prompt 示例
- JSON 输出格式的完整定义
- 交易规则和约束的明确说明

**间接证据:**
- 不同模型的交易行为差异
- 错误案例(如数据顺序混淆)
- 社区讨论中的细节披露

**推断证据:**
- System Prompt 的角色定义
- 风险管理字段的设计意图
- 多时间框架的认知负载考虑

---

## 总结与展望

### nof1.ai 的成功之处

- **强制结构化输出**,确保可执行性
- **显式风险管理**,减少灾难性损失
- **多时间框架**,平衡短期和中期视角
- **费用意识**,抑制过度交易
- **元认知设计**,引入自我怀疑机制

### 当前局限性

- **无状态设计**,无法学习和改进
- **有限的上下文窗口**,无法捕捉长期趋势
- **缺乏新闻和叙事**,纯技术分析有盲区
- **单一目标**(最大化 PnL),可能忽视其他风险

### 未来发展方向

1. **引入记忆机制**
   - 短期记忆: 最近 N 次交易
   - 长期学习: 跨 session 的策略优化

2. **多模态输入**
   - 新闻情感分析
   - 社交媒体情绪
   - 链上数据

3. **多智能体协作**
   - 分析师 Agent: 市场研究
   - 交易员 Agent: 执行决策
   - 风控 Agent: 监控风险

4. **更复杂的行动空间**
   - 限价单支持
   - 部分平仓
   - 对冲策略

---

## 实用资源

这份逆向工程文档可以帮助你:

- 理解 nof1.ai 的核心设计哲学
- 复现或改进类似的 AI 交易系统
- 学习高级提示词工程技巧
- 为自己的 AI Agent 项目提供参考

### 关键要点

> **提示词只是起点,真正的挑战在于持续优化和风险控制。**

在实际应用中,需要:

- 持续监控和调整
- 详细的性能分析
- 严格的风险管理
- 充分的回测和压力测试

---

**最后更新**: 2025-10-28
