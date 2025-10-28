package market

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// SignalType 交易信号类型
type SignalType string

const (
	SignalOpenLong   SignalType = "OPEN_LONG"   // 开多仓
	SignalOpenShort  SignalType = "OPEN_SHORT"  // 开空仓
	SignalCloseLong  SignalType = "CLOSE_LONG"  // 平多仓
	SignalCloseShort SignalType = "CLOSE_SHORT" // 平空仓
	SignalHold       SignalType = "HOLD"        // 持仓不动
	SignalWait       SignalType = "WAIT"        // 观望
)

// TradingSignal AI返回的交易信号
type TradingSignal struct {
	Symbol     string     `json:"symbol"`      // 币种符号
	Signal     SignalType `json:"signal"`      // 信号类型
	Confidence float64    `json:"confidence"`  // 信心度 (0-100)
	Reasoning  string     `json:"reasoning"`   // 分析理由
	EntryPrice float64    `json:"entry_price"` // 建议入场价格
	StopLoss   float64    `json:"stop_loss"`   // 建议止损价格
	TakeProfit float64    `json:"take_profit"` // 建议止盈价格
	Timestamp  time.Time  `json:"timestamp"`   // 信号生成时间
}

// AIProvider AI提供商类型
type AIProvider string

const (
	ProviderDeepSeek AIProvider = "deepseek"
	ProviderQwen     AIProvider = "qwen"
)

// AIConfig AI API配置
type AIConfig struct {
	Provider  AIProvider
	APIKey    string
	SecretKey string // 阿里云需要
	BaseURL   string
	Model     string
	Timeout   time.Duration
}

// 默认配置
var defaultConfig = AIConfig{
	Provider: ProviderDeepSeek,
	BaseURL:  "https://api.deepseek.com/v1",
	Model:    "deepseek-chat",
	Timeout:  120 * time.Second, // 增加到120秒，因为AI需要分析大量数据
}

// SetDeepSeekAPIKey 设置DeepSeek API密钥
func SetDeepSeekAPIKey(apiKey string) {
	defaultConfig.Provider = ProviderDeepSeek
	defaultConfig.APIKey = apiKey
	defaultConfig.BaseURL = "https://api.deepseek.com/v1"
	defaultConfig.Model = "deepseek-chat"
}

// SetQwenAPIKey 设置阿里云Qwen API密钥
func SetQwenAPIKey(apiKey, secretKey string) {
	defaultConfig.Provider = ProviderQwen
	defaultConfig.APIKey = apiKey
	defaultConfig.SecretKey = secretKey
	defaultConfig.BaseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
	defaultConfig.Model = "qwen-plus" // 可选: qwen-turbo, qwen-plus, qwen-max
}

// SetAIConfig 设置完整的AI配置（高级用户）
func SetAIConfig(config AIConfig) {
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	defaultConfig = config
}

// DeepSeekConfig 兼容旧代码
type DeepSeekConfig = AIConfig

// SetDeepSeekConfig 兼容旧代码
func SetDeepSeekConfig(config DeepSeekConfig) {
	SetAIConfig(config)
}

// GetAITradingSignal 获取AI交易信号
func GetAITradingSignal(symbol string) (*TradingSignal, error) {
	// 1. 获取市场数据
	marketData, err := GetMarketData(symbol)
	if err != nil {
		return nil, fmt.Errorf("获取市场数据失败: %w", err)
	}

	// 2. 格式化为AI提示
	prompt := formatMarketDataForAI(marketData)

	// 3. 调用DeepSeek API
	aiResponse, err := callDeepSeekAPI(prompt)
	if err != nil {
		return nil, fmt.Errorf("调用DeepSeek API失败: %w", err)
	}

	// 4. 解析AI响应
	signal, err := parseAIResponse(aiResponse, marketData)
	if err != nil {
		return nil, fmt.Errorf("解析AI响应失败: %w", err)
	}

	signal.Symbol = marketData.Symbol
	signal.Timestamp = time.Now()

	return signal, nil
}

// formatMarketDataForAI 将市场数据格式化为AI提示
func formatMarketDataForAI(data *MarketData) string {
	var sb strings.Builder

	sb.WriteString("你是一位专业的加密货币交易员，请根据以下市场数据分析并给出交易建议。\n\n")
	sb.WriteString(fmt.Sprintf("【币种】%s\n\n", data.Symbol))

	// 当前指标
	sb.WriteString("【当前实时指标】(基于3分钟K线)\n")
	sb.WriteString(fmt.Sprintf("• 当前价格: %.4f USDT\n", data.CurrentPrice))
	sb.WriteString(fmt.Sprintf("• EMA20: %.4f (价格%s均线)\n", data.CurrentEMA20,
		pricePosition(data.CurrentPrice, data.CurrentEMA20)))
	sb.WriteString(fmt.Sprintf("• MACD: %.4f (%s)\n", data.CurrentMACD, macdTrend(data.CurrentMACD)))
	sb.WriteString(fmt.Sprintf("• RSI(7期): %.2f (%s)\n\n", data.CurrentRSI7, rsiStatus(data.CurrentRSI7)))

	// 持仓量和资金费率
	if data.OpenInterest != nil {
		oiChange := ((data.OpenInterest.Latest - data.OpenInterest.Average) / data.OpenInterest.Average) * 100
		sb.WriteString("【持仓量与资金费率】\n")
		sb.WriteString(fmt.Sprintf("• 当前持仓量: %.2f (较平均%+.2f%%)\n",
			data.OpenInterest.Latest, oiChange))
		sb.WriteString(fmt.Sprintf("• 资金费率: %.6f (%s)\n\n",
			data.FundingRate, fundingRateStatus(data.FundingRate)))
	}

	// 日内趋势
	if data.IntradaySeries != nil && len(data.IntradaySeries.MACDValues) > 0 {
		sb.WriteString("【日内趋势】(3分钟K线最近10个点)\n")
		sb.WriteString(fmt.Sprintf("• 价格序列: %s\n", formatFloatArray(data.IntradaySeries.MidPrices)))
		sb.WriteString(fmt.Sprintf("• MACD序列: %s (%s)\n",
			formatFloatArray(data.IntradaySeries.MACDValues),
			seriesTrend(data.IntradaySeries.MACDValues)))
		sb.WriteString(fmt.Sprintf("• RSI(7期)序列: %s (%s)\n\n",
			formatFloatArray(data.IntradaySeries.RSI7Values),
			rsiSeriesTrend(data.IntradaySeries.RSI7Values)))
	}

	// 长期背景
	if data.LongerTermContext != nil {
		sb.WriteString("【长期背景】(4小时K线)\n")
		sb.WriteString(fmt.Sprintf("• EMA20: %.2f vs EMA50: %.2f (%s)\n",
			data.LongerTermContext.EMA20, data.LongerTermContext.EMA50,
			emaCross(data.LongerTermContext.EMA20, data.LongerTermContext.EMA50)))
		sb.WriteString(fmt.Sprintf("• ATR(3期): %.2f vs ATR(14期): %.2f (波动率%s)\n",
			data.LongerTermContext.ATR3, data.LongerTermContext.ATR14,
			atrStatus(data.LongerTermContext.ATR3, data.LongerTermContext.ATR14)))
		sb.WriteString(fmt.Sprintf("• 当前成交量: %.2f vs 平均成交量: %.2f (%s)\n",
			data.LongerTermContext.CurrentVolume, data.LongerTermContext.AverageVolume,
			volumeStatus(data.LongerTermContext.CurrentVolume, data.LongerTermContext.AverageVolume)))

		if len(data.LongerTermContext.RSI14Values) > 0 {
			sb.WriteString(fmt.Sprintf("• 4小时RSI(14期): %.2f (%s)\n\n",
				data.LongerTermContext.RSI14Values[len(data.LongerTermContext.RSI14Values)-1],
				rsiStatus(data.LongerTermContext.RSI14Values[len(data.LongerTermContext.RSI14Values)-1])))
		}
	}

	// AI指令
	sb.WriteString("【交易建议要求】\n")
	sb.WriteString("你是一位**激进型交易员**，善于捕捉市场机会。请基于以上数据，给出一个**明确的交易信号**。\n\n")
	sb.WriteString("**重要原则：**\n")
	sb.WriteString("1. 优先给出 OPEN_LONG 或 OPEN_SHORT 信号，而不是观望\n")
	sb.WriteString("2. 即使信号不完美，也要找出最可能的方向\n")
	sb.WriteString("3. RSI超买可能是强势延续，RSI超卖可能是抄底机会\n")
	sb.WriteString("4. MACD负值转正 = 买入信号，正值转负 = 卖出信号\n")
	sb.WriteString("5. 价格突破EMA20 = 趋势确认\n")
	sb.WriteString("6. 持仓量增加 + 价格上涨 = 多头强势\n")
	sb.WriteString("7. 只有在多空完全平衡、无法判断时才给 WAIT\n\n")
	sb.WriteString("请严格按照以下JSON格式返回：\n\n")
	sb.WriteString("```json\n")
	sb.WriteString("{\n")
	sb.WriteString("  \"signal\": \"OPEN_LONG | OPEN_SHORT | CLOSE_LONG | CLOSE_SHORT | HOLD | WAIT\",\n")
	sb.WriteString("  \"confidence\": 85.5,\n")
	sb.WriteString("  \"reasoning\": \"详细分析理由（200字以内）\",\n")
	sb.WriteString("  \"entry_price\": 1.234,\n")
	sb.WriteString("  \"stop_loss\": 1.100,\n")
	sb.WriteString("  \"take_profit\": 1.450\n")
	sb.WriteString("}\n")
	sb.WriteString("```\n\n")
	sb.WriteString("注意：\n")
	sb.WriteString("1. signal必须是以下之一: OPEN_LONG(开多), OPEN_SHORT(开空), CLOSE_LONG(平多), CLOSE_SHORT(平空), HOLD(持有), WAIT(观望)\n")
	sb.WriteString("2. confidence是信心度(0-100)，即使是中等信号也应该给出\n")
	sb.WriteString("3. reasoning要简洁有力，说明最关键的交易依据\n")
	sb.WriteString("4. entry_price是建议入场价格（可以略高于或低于当前价）\n")
	sb.WriteString("5. stop_loss和take_profit要合理，建议风险回报比至少1:2\n")

	return sb.String()
}

// callDeepSeekAPI 调用AI API（支持DeepSeek和Qwen），带重试机制
func callDeepSeekAPI(prompt string) (string, error) {
	if defaultConfig.APIKey == "" {
		return "", fmt.Errorf("AI API密钥未设置，请先调用 SetDeepSeekAPIKey() 或 SetQwenAPIKey()")
	}

	// 重试配置
	maxRetries := 3
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt > 1 {
			fmt.Printf("⚠️  AI API调用失败，正在重试 (%d/%d)...\n", attempt, maxRetries)
		}

		result, err := callDeepSeekAPIOnce(prompt)
		if err == nil {
			if attempt > 1 {
				fmt.Printf("✓ AI API重试成功\n")
			}
			return result, nil
		}

		lastErr = err
		// 如果不是网络错误，不重试
		if !isRetryableError(err) {
			return "", err
		}

		// 重试前等待
		if attempt < maxRetries {
			waitTime := time.Duration(attempt) * 2 * time.Second
			fmt.Printf("⏳ 等待%v后重试...\n", waitTime)
			time.Sleep(waitTime)
		}
	}

	return "", fmt.Errorf("重试%d次后仍然失败: %w", maxRetries, lastErr)
}

// callDeepSeekAPIOnce 单次调用AI API
func callDeepSeekAPIOnce(prompt string) (string, error) {
	// 构建请求体
	requestBody := map[string]interface{}{
		"model": defaultConfig.Model,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
		"temperature": 0.7,
		"max_tokens":  2000,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("序列化请求失败: %w", err)
	}

	// 创建HTTP请求
	url := fmt.Sprintf("%s/chat/completions", defaultConfig.BaseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// 根据不同的Provider设置认证方式
	switch defaultConfig.Provider {
	case ProviderDeepSeek:
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", defaultConfig.APIKey))
	case ProviderQwen:
		// 阿里云Qwen使用API-Key认证
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", defaultConfig.APIKey))
		// 注意：如果使用的不是兼容模式，可能需要不同的认证方式
	default:
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", defaultConfig.APIKey))
	}

	// 发送请求
	client := &http.Client{Timeout: defaultConfig.Timeout}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("发送请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("读取响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API返回错误 (status %d): %s", resp.StatusCode, string(body))
	}

	// 解析响应
	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("解析响应失败: %w", err)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("API返回空响应")
	}

	return result.Choices[0].Message.Content, nil
}

// isRetryableError 判断错误是否可重试
func isRetryableError(err error) bool {
	errStr := err.Error()
	// 网络错误、超时、EOF等可以重试
	retryableErrors := []string{
		"EOF",
		"timeout",
		"connection reset",
		"connection refused",
		"temporary failure",
		"no such host",
	}
	for _, retryable := range retryableErrors {
		if strings.Contains(errStr, retryable) {
			return true
		}
	}
	return false
}

// parseAIResponse 解析AI响应
func parseAIResponse(aiResponse string, marketData *MarketData) (*TradingSignal, error) {
	// 尝试从响应中提取JSON
	jsonStart := strings.Index(aiResponse, "```json")
	jsonEnd := strings.Index(aiResponse, "```\n")

	// 如果没找到结束标记，尝试找第二个```
	if jsonEnd == -1 || jsonEnd <= jsonStart {
		// 从jsonStart之后找第一个```
		jsonEnd = strings.Index(aiResponse[jsonStart+7:], "```")
		if jsonEnd != -1 {
			jsonEnd += jsonStart + 7
		}
	}

	var jsonContent string
	if jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart {
		jsonContent = aiResponse[jsonStart+7 : jsonEnd]
	} else {
		// 如果没有markdown代码块，尝试查找第一个完整的JSON对象
		jsonStart = strings.Index(aiResponse, "{")
		if jsonStart == -1 {
			return nil, fmt.Errorf("无法从AI响应中提取JSON: %s", aiResponse)
		}

		// 找到匹配的右括号
		braceCount := 0
		jsonEnd = -1
		for i := jsonStart; i < len(aiResponse); i++ {
			if aiResponse[i] == '{' {
				braceCount++
			} else if aiResponse[i] == '}' {
				braceCount--
				if braceCount == 0 {
					jsonEnd = i + 1
					break
				}
			}
		}

		if jsonEnd == -1 {
			return nil, fmt.Errorf("无法找到完整的JSON对象")
		}
		jsonContent = aiResponse[jsonStart:jsonEnd]
	}

	// 解析JSON
	var signal TradingSignal
	if err := json.Unmarshal([]byte(jsonContent), &signal); err != nil {
		return nil, fmt.Errorf("解析JSON失败: %w, JSON内容: %s", err, jsonContent)
	}

	// 验证信号类型
	validSignals := map[SignalType]bool{
		SignalOpenLong:   true,
		SignalOpenShort:  true,
		SignalCloseLong:  true,
		SignalCloseShort: true,
		SignalHold:       true,
		SignalWait:       true,
	}

	if !validSignals[signal.Signal] {
		return nil, fmt.Errorf("无效的信号类型: %s", signal.Signal)
	}

	// 验证信心度范围
	if signal.Confidence < 0 || signal.Confidence > 100 {
		signal.Confidence = 50 // 默认值
	}

	return &signal, nil
}

// 辅助函数：价格与均线位置
func pricePosition(price, ema float64) string {
	if price > ema {
		return "位于上方"
	}
	return "位于下方"
}

// 辅助函数：MACD趋势
func macdTrend(macd float64) string {
	if macd > 0 {
		return "多头"
	}
	return "空头"
}

// 辅助函数：RSI状态
func rsiStatus(rsi float64) string {
	if rsi >= 70 {
		return "超买"
	} else if rsi <= 30 {
		return "超卖"
	}
	return "中性"
}

// 辅助函数：价格趋势（基于1h和4h变化）
func priceTrend(change1h, change4h float64) string {
	if change1h > 2 && change4h > 5 {
		return "强势上涨"
	} else if change1h > 0 && change4h > 0 {
		return "温和上涨"
	} else if change1h < -2 && change4h < -5 {
		return "强势下跌"
	} else if change1h < 0 && change4h < 0 {
		return "温和下跌"
	} else {
		return "震荡"
	}
}

// 辅助函数：资金费率信号（交易机会解读）
func fundingRateSignal(rate float64) string {
	if rate > 0.001 {
		return "多头拥挤，考虑做空"
	} else if rate > 0.0005 {
		return "多头占优"
	} else if rate < -0.001 {
		return "空头拥挤，考虑做多"
	} else if rate < -0.0005 {
		return "空头占优"
	}
	return "中性"
}

// 辅助函数：资金费率状态
func fundingRateStatus(rate float64) string {
	if rate > 0.0005 {
		return "多头占优，费率偏高"
	} else if rate < -0.0005 {
		return "空头占优，费率为负"
	}
	return "费率中性"
}

// 辅助函数：EMA交叉状态
func emaCross(ema20, ema50 float64) string {
	if ema20 > ema50 {
		return "金叉，多头趋势"
	}
	return "死叉，空头趋势"
}

// 辅助函数：ATR状态
func atrStatus(atr3, atr14 float64) string {
	if atr3 > atr14*1.2 {
		return "急剧上升"
	} else if atr3 < atr14*0.8 {
		return "逐渐下降"
	}
	return "稳定"
}

// 辅助函数：成交量状态
func volumeStatus(current, average float64) string {
	ratio := current / average
	if ratio > 1.5 {
		return "放量明显"
	} else if ratio < 0.5 {
		return "缩量明显"
	}
	return "正常水平"
}

// 辅助函数：序列趋势
func seriesTrend(values []float64) string {
	if len(values) < 2 {
		return "数据不足"
	}

	recent := values[len(values)-1]
	prev := values[len(values)-2]

	if recent > prev*1.1 {
		return "强势上升"
	} else if recent > prev {
		return "小幅上升"
	} else if recent < prev*0.9 {
		return "快速下降"
	} else if recent < prev {
		return "小幅下降"
	}
	return "横盘整理"
}

// 辅助函数：RSI序列趋势
func rsiSeriesTrend(values []float64) string {
	if len(values) < 2 {
		return "数据不足"
	}

	recent := values[len(values)-1]
	prev := values[len(values)-2]

	if recent > 70 && prev > 70 {
		return "持续超买"
	} else if recent < 30 && prev < 30 {
		return "持续超卖"
	} else if recent > prev {
		return "强度上升"
	} else if recent < prev {
		return "强度下降"
	}
	return "稳定"
}

// 辅助函数：格式化浮点数组
func formatFloatArray(values []float64) string {
	if len(values) == 0 {
		return "[]"
	}

	var sb strings.Builder
	sb.WriteString("[")
	for i, v := range values {
		if i > 0 {
			sb.WriteString(", ")
		}
		sb.WriteString(fmt.Sprintf("%.3f", v))
	}
	sb.WriteString("]")
	return sb.String()
}
