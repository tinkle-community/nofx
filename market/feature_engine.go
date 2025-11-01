package market

import (
	"fmt"
	"math"
	"time"
)

type FeatureEngine struct {
	alertThresholds AlertThresholds
}

func NewFeatureEngine(thresholds AlertThresholds) *FeatureEngine {
	return &FeatureEngine{
		alertThresholds: thresholds,
	}
}

func (e *FeatureEngine) CalculateFeatures(symbol string, klines []Kline) *SymbolFeatures {
	if len(klines) < 20 {
		return nil
	}

	features := &SymbolFeatures{
		Symbol:    symbol,
		Timestamp: time.Now(),
	}

	// 提取价格和交易量数据
	closes := make([]float64, len(klines))
	volumes := make([]float64, len(klines))
	highs := make([]float64, len(klines))
	lows := make([]float64, len(klines))

	for i, k := range klines {
		closes[i] = k.Close
		volumes[i] = k.Volume
		highs[i] = k.High
		lows[i] = k.Low
	}

	// 价格特征
	features.Price = closes[len(closes)-1]
	features.PriceChange15Min = (closes[len(closes)-1] - closes[len(closes)-2]) / closes[len(closes)-2]

	if len(closes) >= 5 {
		features.PriceChange1H = (closes[len(closes)-1] - closes[len(closes)-5]) / closes[len(closes)-5]
	}
	if len(closes) >= 17 {
		features.PriceChange4H = (closes[len(closes)-1] - closes[len(closes)-17]) / closes[len(closes)-17]
	}

	// 交易量特征
	currentVolume := volumes[len(volumes)-1]
	features.Volume = currentVolume

	// 5周期平均交易量
	if len(volumes) >= 6 {
		avgVolume5 := e.calculateAverage(volumes[len(volumes)-6 : len(volumes)-1])
		features.VolumeRatio5 = currentVolume / avgVolume5
	}

	// 20周期平均交易量
	if len(volumes) >= 21 {
		avgVolume20 := e.calculateAverage(volumes[len(volumes)-21 : len(volumes)-1])
		features.VolumeRatio20 = currentVolume / avgVolume20
	}

	// 交易量趋势
	if features.VolumeRatio20 > 0 {
		features.VolumeTrend = features.VolumeRatio5 / features.VolumeRatio20
	}

	// 技术指标
	features.RSI14 = e.calculateRSI(closes, 14)
	features.SMA5 = e.calculateSMA(closes, 5)
	features.SMA10 = e.calculateSMA(closes, 10)
	features.SMA20 = e.calculateSMA(closes, 20)

	// 波动特征
	currentHigh := highs[len(highs)-1]
	currentLow := lows[len(lows)-1]
	features.HighLowRatio = (currentHigh - currentLow) / features.Price
	features.Volatility20 = e.calculateVolatility(closes, 20)

	// 价格在区间中的位置
	if currentHigh != currentLow {
		features.PositionInRange = (features.Price - currentLow) / (currentHigh - currentLow)
	} else {
		features.PositionInRange = 0.5
	}

	return features
}

func (e *FeatureEngine) calculateAverage(values []float64) float64 {
	sum := 0.0
	for _, v := range values {
		sum += v
	}
	return sum / float64(len(values))
}

func (e *FeatureEngine) calculateSMA(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}
	return e.calculateAverage(prices[len(prices)-period:])
}

func (e *FeatureEngine) calculateRSI(prices []float64, period int) float64 {
	if len(prices) <= period {
		return 50
	}

	gains := make([]float64, 0)
	losses := make([]float64, 0)

	for i := 1; i < len(prices); i++ {
		change := prices[i] - prices[i-1]
		if change > 0 {
			gains = append(gains, change)
			losses = append(losses, 0)
		} else {
			gains = append(gains, 0)
			losses = append(losses, -change)
		}
	}

	// 只取最近period个数据点
	if len(gains) > period {
		gains = gains[len(gains)-period:]
		losses = losses[len(losses)-period:]
	}

	avgGain := e.calculateAverage(gains)
	avgLoss := e.calculateAverage(losses)

	if avgLoss == 0 {
		return 100
	}

	rs := avgGain / avgLoss
	return 100 - (100 / (1 + rs))
}

func (e *FeatureEngine) calculateVolatility(prices []float64, period int) float64 {
	if len(prices) < period {
		return 0
	}

	periodPrices := prices[len(prices)-period:]
	mean := e.calculateAverage(periodPrices)

	variance := 0.0
	for _, price := range periodPrices {
		variance += math.Pow(price-mean, 2)
	}
	variance /= float64(len(periodPrices))

	return math.Sqrt(variance) / mean
}

func (e *FeatureEngine) DetectAlerts(features *SymbolFeatures) []Alert {
	var alerts []Alert

	// 交易量放大检测
	if features.VolumeRatio5 > e.alertThresholds.VolumeSpike {
		alerts = append(alerts, Alert{
			Type:      "VOLUME_SPIKE",
			Symbol:    features.Symbol,
			Value:     features.VolumeRatio5,
			Threshold: e.alertThresholds.VolumeSpike,
			Message:   fmt.Sprintf("%s 交易量放大 %.2f 倍", features.Symbol, features.VolumeRatio5),
			Timestamp: time.Now(),
		})
	}

	// 15分钟价格异动
	if math.Abs(features.PriceChange15Min) > e.alertThresholds.PriceChange15Min {
		direction := "上涨"
		if features.PriceChange15Min < 0 {
			direction = "下跌"
		}
		alerts = append(alerts, Alert{
			Type:      "PRICE_CHANGE_15MIN",
			Symbol:    features.Symbol,
			Value:     features.PriceChange15Min,
			Threshold: e.alertThresholds.PriceChange15Min,
			Message:   fmt.Sprintf("%s 15分钟%s %.2f%%", features.Symbol, direction, features.PriceChange15Min*100),
			Timestamp: time.Now(),
		})
	}

	// 交易量趋势
	if features.VolumeTrend > e.alertThresholds.VolumeTrend {
		alerts = append(alerts, Alert{
			Type:      "VOLUME_TREND",
			Symbol:    features.Symbol,
			Value:     features.VolumeTrend,
			Threshold: e.alertThresholds.VolumeTrend,
			Message:   fmt.Sprintf("%s 交易量趋势增强 %.2f 倍", features.Symbol, features.VolumeTrend),
			Timestamp: time.Now(),
		})
	}

	// RSI超买超卖
	if features.RSI14 > e.alertThresholds.RSIOverbought {
		alerts = append(alerts, Alert{
			Type:      "RSI_OVERBOUGHT",
			Symbol:    features.Symbol,
			Value:     features.RSI14,
			Threshold: e.alertThresholds.RSIOverbought,
			Message:   fmt.Sprintf("%s RSI超买: %.2f", features.Symbol, features.RSI14),
			Timestamp: time.Now(),
		})
	} else if features.RSI14 < e.alertThresholds.RSIOversold {
		alerts = append(alerts, Alert{
			Type:      "RSI_OVERSOLD",
			Symbol:    features.Symbol,
			Value:     features.RSI14,
			Threshold: e.alertThresholds.RSIOversold,
			Message:   fmt.Sprintf("%s RSI超卖: %.2f", features.Symbol, features.RSI14),
			Timestamp: time.Now(),
		})
	}

	return alerts
}
