package scanner

import (
	"fmt"
	"log"
	"nofx/market"
	"sort"
	"sync"
	"time"
)

// TradingOpportunity AI识别的交易机会
type TradingOpportunity struct {
	Symbol          string
	Signal          market.SignalType
	Confidence      float64
	Reasoning       string
	EntryPrice      float64
	StopLoss        float64
	TakeProfit      float64
	CurrentPrice    float64
	Priority        int
	RiskRewardRatio float64
	AnalyzedAt      time.Time
}

// ScanConfig 扫描配置
type ScanConfig struct {
	MinConfidence      float64       // 最小信心度
	MaxConcurrent      int           // 最大并发数
	Timeout            time.Duration // 超时时间
	MinPriority        int           // 最小优先级
	EnableLong         bool          // 允许做多
	EnableShort        bool          // 允许做空
	MinRiskRewardRatio float64       // 最小风险回报比
}

var defaultScanConfig = ScanConfig{
	MinConfidence:      65.0,
	MaxConcurrent:      10,
	Timeout:            60 * time.Second,
	MinPriority:        60,
	EnableLong:         true,
	EnableShort:        true,
	MinRiskRewardRatio: 1.5,
}

// SetScanConfig 设置扫描配置
func SetScanConfig(config ScanConfig) {
	defaultScanConfig = config
}

// ScanMarket 扫描市场寻找交易机会
func ScanMarket(symbols []string) ([]*TradingOpportunity, error) {
	if len(symbols) == 0 {
		return nil, fmt.Errorf("币种列表为空")
	}

	log.Printf("🔍 开始扫描 %d 个币种...", len(symbols))
	startTime := time.Now()

	// 结果channel
	oppChan := make(chan *TradingOpportunity, len(symbols))
	errChan := make(chan error, len(symbols))

	// 并发控制
	semaphore := make(chan struct{}, defaultScanConfig.MaxConcurrent)
	var wg sync.WaitGroup

	// 并发扫描
	for _, symbol := range symbols {
		wg.Add(1)
		go func(sym string) {
			defer wg.Done()

			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			opp, err := scanSymbol(sym)
			if err != nil {
				errChan <- fmt.Errorf("%s: %v", sym, err)
				return
			}

			if opp != nil {
				oppChan <- opp
			}
		}(symbol)
	}

	// 等待完成
	go func() {
		wg.Wait()
		close(oppChan)
		close(errChan)
	}()

	// 收集结果
	var opportunities []*TradingOpportunity
	var errorCount int

	for {
		select {
		case opp, ok := <-oppChan:
			if !ok {
				oppChan = nil
			} else {
				opportunities = append(opportunities, opp)
			}
		case err, ok := <-errChan:
			if !ok {
				errChan = nil
			} else {
				errorCount++
				if errorCount <= 3 {
					log.Printf("⚠ %v", err)
				}
			}
		}

		if oppChan == nil && errChan == nil {
			break
		}
	}

	if errorCount > 3 {
		log.Printf("⚠ 还有 %d 个错误...", errorCount-3)
	}

	// 排序
	sort.Slice(opportunities, func(i, j int) bool {
		return opportunities[i].Priority > opportunities[j].Priority
	})

	elapsed := time.Since(startTime)
	log.Printf("✓ 扫描完成，耗时 %.1fs，找到 %d 个交易机会", elapsed.Seconds(), len(opportunities))

	return opportunities, nil
}

// scanSymbol 扫描单个币种
func scanSymbol(symbol string) (*TradingOpportunity, error) {
	// 1. 获取市场数据
	marketData, err := market.GetMarketData(symbol)
	if err != nil {
		return nil, err
	}

	// 2. 获取AI信号
	signal, err := market.GetAITradingSignal(symbol)
	if err != nil {
		return nil, err
	}

	// 3. 验证信号
	if !isValidTradingSignal(signal) {
		return nil, nil
	}

	// 4. 计算指标
	priority := calculatePriorityScore(signal, marketData)
	rrr := calculateRiskReward(signal)

	// 5. 过滤
	if priority < defaultScanConfig.MinPriority {
		return nil, nil
	}

	if rrr < defaultScanConfig.MinRiskRewardRatio {
		return nil, nil
	}

	return &TradingOpportunity{
		Symbol:          symbol,
		Signal:          signal.Signal,
		Confidence:      signal.Confidence,
		Reasoning:       signal.Reasoning,
		EntryPrice:      signal.EntryPrice,
		StopLoss:        signal.StopLoss,
		TakeProfit:      signal.TakeProfit,
		CurrentPrice:    marketData.CurrentPrice,
		Priority:        priority,
		RiskRewardRatio: rrr,
		AnalyzedAt:      time.Now(),
	}, nil
}

// isValidTradingSignal 验证信号有效性
func isValidTradingSignal(signal *market.TradingSignal) bool {
	// 1. 信心度检查
	if signal.Confidence < defaultScanConfig.MinConfidence {
		return false
	}

	// 2. 信号类型检查
	switch signal.Signal {
	case market.SignalOpenLong:
		if !defaultScanConfig.EnableLong {
			return false
		}
		// 做多：止损<入场<止盈
		if signal.StopLoss >= signal.EntryPrice || signal.TakeProfit <= signal.EntryPrice {
			return false
		}
	case market.SignalOpenShort:
		if !defaultScanConfig.EnableShort {
			return false
		}
		// 做空：止盈<入场<止损
		if signal.TakeProfit >= signal.EntryPrice || signal.StopLoss <= signal.EntryPrice {
			return false
		}
	default:
		// 其他信号类型不用于开仓
		return false
	}

	// 3. 价格合理性
	if signal.EntryPrice <= 0 || signal.StopLoss <= 0 || signal.TakeProfit <= 0 {
		return false
	}

	return true
}

// calculateRiskReward 计算风险回报比
func calculateRiskReward(signal *market.TradingSignal) float64 {
	var risk, reward float64

	if signal.Signal == market.SignalOpenLong {
		risk = signal.EntryPrice - signal.StopLoss
		reward = signal.TakeProfit - signal.EntryPrice
	} else if signal.Signal == market.SignalOpenShort {
		risk = signal.StopLoss - signal.EntryPrice
		reward = signal.EntryPrice - signal.TakeProfit
	}

	if risk > 0 {
		return reward / risk
	}
	return 0
}

// calculatePriorityScore 计算优先级评分
func calculatePriorityScore(signal *market.TradingSignal, data *market.MarketData) int {
	score := 0

	// 1. 信心度 (0-40分)
	score += int(signal.Confidence * 0.4)

	// 2. 风险回报比 (0-25分)
	rrr := calculateRiskReward(signal)
	if rrr >= 3.0 {
		score += 25
	} else if rrr >= 2.5 {
		score += 20
	} else if rrr >= 2.0 {
		score += 15
	} else if rrr >= 1.5 {
		score += 10
	}

	// 3. 技术指标确认 (0-25分)
	techScore := 0

	// RSI
	if signal.Signal == market.SignalOpenLong && data.CurrentRSI7 < 35 {
		techScore += 7 // 超卖做多
	} else if signal.Signal == market.SignalOpenShort && data.CurrentRSI7 > 65 {
		techScore += 7 // 超买做空
	} else if signal.Signal == market.SignalOpenLong && data.CurrentRSI7 < 45 {
		techScore += 3
	} else if signal.Signal == market.SignalOpenShort && data.CurrentRSI7 > 55 {
		techScore += 3
	}

	// MACD
	if signal.Signal == market.SignalOpenLong && data.CurrentMACD > 0 {
		techScore += 6
	} else if signal.Signal == market.SignalOpenShort && data.CurrentMACD < 0 {
		techScore += 6
	}

	// EMA趋势
	if signal.Signal == market.SignalOpenLong && data.CurrentPrice > data.CurrentEMA20 {
		techScore += 6
	} else if signal.Signal == market.SignalOpenShort && data.CurrentPrice < data.CurrentEMA20 {
		techScore += 6
	}

	// 资金费率
	if data.FundingRate != 0 {
		if signal.Signal == market.SignalOpenLong && data.FundingRate < -0.0001 {
			techScore += 6
		} else if signal.Signal == market.SignalOpenShort && data.FundingRate > 0.0001 {
			techScore += 6
		}
	}

	score += techScore

	// 4. 成交量 (0-10分)
	if data.LongerTermContext != nil && data.LongerTermContext.AverageVolume > 0 {
		volumeRatio := data.LongerTermContext.CurrentVolume / data.LongerTermContext.AverageVolume
		if volumeRatio > 2.0 {
			score += 10
		} else if volumeRatio > 1.5 {
			score += 7
		} else if volumeRatio > 1.2 {
			score += 4
		}
	}

	return score
}

// FilterTopN 筛选前N个机会
func FilterTopN(opportunities []*TradingOpportunity, n int) []*TradingOpportunity {
	if len(opportunities) <= n {
		return opportunities
	}
	return opportunities[:n]
}

// PrintOpportunity 打印交易机会
func PrintOpportunity(opp *TradingOpportunity, index int) {
	fmt.Printf("\n【机会 #%d】%s\n", index+1, opp.Symbol)
	fmt.Printf("  信号: %s\n", GetSignalText(opp.Signal))
	fmt.Printf("  信心度: %.1f%%  |  优先级: %d/100\n", opp.Confidence, opp.Priority)
	fmt.Printf("  当前价: %.4f USDT\n", opp.CurrentPrice)
	fmt.Printf("  入场价: %.4f USDT\n", opp.EntryPrice)
	fmt.Printf("  止损价: %.4f USDT  (风险: %.2f%%)\n", opp.StopLoss, calculateRiskPercent(opp))
	fmt.Printf("  止盈价: %.4f USDT  (收益: %.2f%%)\n", opp.TakeProfit, calculateRewardPercent(opp))
	fmt.Printf("  风险回报比: 1:%.2f\n", opp.RiskRewardRatio)
	fmt.Printf("  分析: %s\n", opp.Reasoning)
}

func GetSignalText(signal market.SignalType) string {
	switch signal {
	case market.SignalOpenLong:
		return "开多 🟢"
	case market.SignalOpenShort:
		return "开空 🔴"
	default:
		return string(signal)
	}
}

func calculateRiskPercent(opp *TradingOpportunity) float64 {
	if opp.Signal == market.SignalOpenLong {
		return ((opp.EntryPrice - opp.StopLoss) / opp.EntryPrice) * 100
	}
	return ((opp.StopLoss - opp.EntryPrice) / opp.EntryPrice) * 100
}

func calculateRewardPercent(opp *TradingOpportunity) float64 {
	if opp.Signal == market.SignalOpenLong {
		return ((opp.TakeProfit - opp.EntryPrice) / opp.EntryPrice) * 100
	}
	return ((opp.EntryPrice - opp.TakeProfit) / opp.EntryPrice) * 100
}
