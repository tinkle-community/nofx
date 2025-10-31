package market

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
)

// Data 市场数据结构
type Data struct {
	Symbol            string
	CurrentPrice      float64
	PriceChange1h     float64 // 1小时价格变化百分比
	PriceChange4h     float64 // 4小时价格变化百分比
	CurrentEMA20      float64
	CurrentMACD       float64
	CurrentRSI7       float64
	OpenInterest      *OIData
	FundingRate       float64
	IntradaySeries    *IntradayData
	LongerTermContext *LongerTermData
}

// OIData Open Interest数据
type OIData struct {
	Latest  float64
	Average float64
}

// IntradayData 日内数据(3分钟间隔)
type IntradayData struct {
	MidPrices   []float64
	EMA20Values []float64
	MACDValues  []float64
	RSI7Values  []float64
	RSI14Values []float64
}

// LongerTermData 长期数据(4小时时间框架)
type LongerTermData struct {
	EMA20         float64
	EMA50         float64
	ATR3          float64
	ATR14         float64
	CurrentVolume float64
	AverageVolume float64
	MACDValues    []float64
	RSI14Values   []float64
}

// Kline K线数据
type Kline struct {
	OpenTime  int64
	Open      float64
	High      float64
	Low       float64
	Close     float64
	Volume    float64
	CloseTime int64
}

// Get 获取指定代币的市场数据
func Get(symbol string) (*Data, error) {
	// 标准化symbol
	symbol = Normalize(symbol)

	// 获取3分钟K线数据 (最近10个)
	klines3m, err := getKlines(symbol, "3m", 40) // 多获取一些用于计算
	if err != nil {
		log.Printf("OKX K Lines error:%+v", err)
		return nil, fmt.Errorf("获取3分钟K线失败: %v", err)
	}

	// 获取4小时K线数据 (最近10个)
	klines4h, err := getKlines(symbol, "4h", 60) // 多获取用于计算指标
	if err != nil {
		log.Printf("Binance K Lines error:%+v", err)
		return nil, fmt.Errorf("获取4小时K线失败: %v", err)
	}

	// 计算当前指标 (基于3分钟最新数据)
	currentPrice := klines3m[len(klines3m)-1].Close
	currentEMA20 := calculateEMA(klines3m, 20)
	currentMACD := calculateMACD(klines3m)
	currentRSI7 := calculateRSI(klines3m, 7)

	// 计算价格变化百分比
	// 1小时价格变化 = 20个3分钟K线前的价格
	priceChange1h := 0.0
	if len(klines3m) >= 21 { // 至少需要21根K线 (当前 + 20根前)
		price1hAgo := klines3m[len(klines3m)-21].Close
		if price1hAgo > 0 {
			priceChange1h = ((currentPrice - price1hAgo) / price1hAgo) * 100
		}
	}

	// 4小时价格变化 = 1个4小时K线前的价格
	priceChange4h := 0.0
	if len(klines4h) >= 2 {
		price4hAgo := klines4h[len(klines4h)-2].Close
		if price4hAgo > 0 {
			priceChange4h = ((currentPrice - price4hAgo) / price4hAgo) * 100
		}
	}

	// 获取OI数据
	oiData, err := getOpenInterestData(symbol)
	if err != nil {
		// OI失败不影响整体,使用默认值
		oiData = &OIData{Latest: 0, Average: 0}
	}

	// 获取Funding Rate
	fundingRate, _ := getFundingRate(symbol)

	// 计算日内系列数据
	intradayData := calculateIntradaySeries(klines3m)

	// 计算长期数据
	longerTermData := calculateLongerTermData(klines4h)

	return &Data{
		Symbol:            symbol,
		CurrentPrice:      currentPrice,
		PriceChange1h:     priceChange1h,
		PriceChange4h:     priceChange4h,
		CurrentEMA20:      currentEMA20,
		CurrentMACD:       currentMACD,
		CurrentRSI7:       currentRSI7,
		OpenInterest:      oiData,
		FundingRate:       fundingRate,
		IntradaySeries:    intradayData,
		LongerTermContext: longerTermData,
	}, nil
}

// getKlines 获取K线数据（支持 Binance 和 OKX）
func getKlines(symbol, interval string, limit int) ([]Kline, error) {
	// 根据 symbol 格式判断交易所
	// OKX 格式: BTC-USDT-SWAP (带连字符和SWAP后缀)
	// Binance 格式: BTCUSDT (无连字符)
	// if strings.Contains(symbol, "-") && strings.HasSuffix(symbol, "-SWAP") {
	// 	return getKlinesOKX(symbol, interval, limit)
	// }
	// return getKlinesBinance(symbol, interval, limit)
	return getKlinesOKX(symbol, interval, limit)
}

// getKlinesBinance 从Binance获取K线数据
func getKlinesBinance(symbol, interval string, limit int) ([]Kline, error) {
	url := fmt.Sprintf("https://fapi.binance.com/fapi/v1/klines?symbol=%s&interval=%s&limit=%d",
		symbol, interval, limit)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var rawData [][]interface{}
	if err := json.Unmarshal(body, &rawData); err != nil {
		return nil, fmt.Errorf("解析Binance响应失败: %w, body: %s", err, string(body))
	}

	klines := make([]Kline, len(rawData))
	for i, item := range rawData {
		openTime := int64(item[0].(float64))
		open, _ := parseFloat(item[1])
		high, _ := parseFloat(item[2])
		low, _ := parseFloat(item[3])
		close, _ := parseFloat(item[4])
		volume, _ := parseFloat(item[5])
		closeTime := int64(item[6].(float64))

		klines[i] = Kline{
			OpenTime:  openTime,
			Open:      open,
			High:      high,
			Low:       low,
			Close:     close,
			Volume:    volume,
			CloseTime: closeTime,
		}
	}

	return klines, nil
}

// getKlinesOKX 从OKX获取K线数据
func getKlinesOKX(symbol, interval string, limit int) ([]Kline, error) {
	// 转换时间间隔格式：3m -> 3m, 4h -> 4H (OKX要求大写H)
	okxInterval := interval
	if strings.HasSuffix(interval, "h") {
		okxInterval = strings.TrimSuffix(interval, "h") + "H"
	}

	url := fmt.Sprintf("https://www.okx.com/api/v5/market/candles?instId=%s&bar=%s&limit=%d",
		symbol, okxInterval, limit)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// OKX 返回格式: {"code":"0","msg":"","data":[[...],[...]]}
	var okxResp struct {
		Code string          `json:"code"`
		Msg  string          `json:"msg"`
		Data [][]interface{} `json:"data"`
	}

	if err := json.Unmarshal(body, &okxResp); err != nil {
		return nil, fmt.Errorf("解析OKX响应失败: %w, body: %s", err, string(body))
	}

	if okxResp.Code != "0" {
		return nil, fmt.Errorf("OKX API错误: code=%s, msg=%s", okxResp.Code, okxResp.Msg)
	}

	if len(okxResp.Data) == 0 {
		return nil, fmt.Errorf("OKX返回空数据")
	}

	// OKX K线数据格式: [timestamp, open, high, low, close, volume, volCcy, volCcyQuote, confirm]
	// 时间是从新到旧，需要反转
	klines := make([]Kline, len(okxResp.Data))
	for i, item := range okxResp.Data {
		if len(item) < 7 {
			continue
		}

		timestamp, _ := parseFloat(item[0])
		open, _ := parseFloat(item[1])
		high, _ := parseFloat(item[2])
		low, _ := parseFloat(item[3])
		close, _ := parseFloat(item[4])
		volume, _ := parseFloat(item[5])

		// OKX返回的是从新到旧，需要反转索引
		reverseIdx := len(okxResp.Data) - 1 - i
		klines[reverseIdx] = Kline{
			OpenTime:  int64(timestamp),
			Open:      open,
			High:      high,
			Low:       low,
			Close:     close,
			Volume:    volume,
			CloseTime: int64(timestamp), // OKX 只有一个时间戳
		}
	}

	return klines, nil
}

// calculateEMA 计算EMA
func calculateEMA(klines []Kline, period int) float64 {
	if len(klines) < period {
		return 0
	}

	// 计算SMA作为初始EMA
	sum := 0.0
	for i := 0; i < period; i++ {
		sum += klines[i].Close
	}
	ema := sum / float64(period)

	// 计算EMA
	multiplier := 2.0 / float64(period+1)
	for i := period; i < len(klines); i++ {
		ema = (klines[i].Close-ema)*multiplier + ema
	}

	return ema
}

// calculateMACD 计算MACD
func calculateMACD(klines []Kline) float64 {
	if len(klines) < 26 {
		return 0
	}

	// 计算12期和26期EMA
	ema12 := calculateEMA(klines, 12)
	ema26 := calculateEMA(klines, 26)

	// MACD = EMA12 - EMA26
	return ema12 - ema26
}

// calculateRSI 计算RSI
func calculateRSI(klines []Kline, period int) float64 {
	if len(klines) <= period {
		return 0
	}

	gains := 0.0
	losses := 0.0

	// 计算初始平均涨跌幅
	for i := 1; i <= period; i++ {
		change := klines[i].Close - klines[i-1].Close
		if change > 0 {
			gains += change
		} else {
			losses += -change
		}
	}

	avgGain := gains / float64(period)
	avgLoss := losses / float64(period)

	// 使用Wilder平滑方法计算后续RSI
	for i := period + 1; i < len(klines); i++ {
		change := klines[i].Close - klines[i-1].Close
		if change > 0 {
			avgGain = (avgGain*float64(period-1) + change) / float64(period)
			avgLoss = (avgLoss * float64(period-1)) / float64(period)
		} else {
			avgGain = (avgGain * float64(period-1)) / float64(period)
			avgLoss = (avgLoss*float64(period-1) + (-change)) / float64(period)
		}
	}

	if avgLoss == 0 {
		return 100
	}

	rs := avgGain / avgLoss
	rsi := 100 - (100 / (1 + rs))

	return rsi
}

// calculateATR 计算ATR
func calculateATR(klines []Kline, period int) float64 {
	if len(klines) <= period {
		return 0
	}

	trs := make([]float64, len(klines))
	for i := 1; i < len(klines); i++ {
		high := klines[i].High
		low := klines[i].Low
		prevClose := klines[i-1].Close

		tr1 := high - low
		tr2 := math.Abs(high - prevClose)
		tr3 := math.Abs(low - prevClose)

		trs[i] = math.Max(tr1, math.Max(tr2, tr3))
	}

	// 计算初始ATR
	sum := 0.0
	for i := 1; i <= period; i++ {
		sum += trs[i]
	}
	atr := sum / float64(period)

	// Wilder平滑
	for i := period + 1; i < len(klines); i++ {
		atr = (atr*float64(period-1) + trs[i]) / float64(period)
	}

	return atr
}

// calculateIntradaySeries 计算日内系列数据
func calculateIntradaySeries(klines []Kline) *IntradayData {
	data := &IntradayData{
		MidPrices:   make([]float64, 0, 10),
		EMA20Values: make([]float64, 0, 10),
		MACDValues:  make([]float64, 0, 10),
		RSI7Values:  make([]float64, 0, 10),
		RSI14Values: make([]float64, 0, 10),
	}

	// 获取最近10个数据点
	start := len(klines) - 10
	if start < 0 {
		start = 0
	}

	for i := start; i < len(klines); i++ {
		data.MidPrices = append(data.MidPrices, klines[i].Close)

		// 计算每个点的EMA20
		if i >= 19 {
			ema20 := calculateEMA(klines[:i+1], 20)
			data.EMA20Values = append(data.EMA20Values, ema20)
		}

		// 计算每个点的MACD
		if i >= 25 {
			macd := calculateMACD(klines[:i+1])
			data.MACDValues = append(data.MACDValues, macd)
		}

		// 计算每个点的RSI
		if i >= 7 {
			rsi7 := calculateRSI(klines[:i+1], 7)
			data.RSI7Values = append(data.RSI7Values, rsi7)
		}
		if i >= 14 {
			rsi14 := calculateRSI(klines[:i+1], 14)
			data.RSI14Values = append(data.RSI14Values, rsi14)
		}
	}

	return data
}

// calculateLongerTermData 计算长期数据
func calculateLongerTermData(klines []Kline) *LongerTermData {
	data := &LongerTermData{
		MACDValues:  make([]float64, 0, 10),
		RSI14Values: make([]float64, 0, 10),
	}

	// 计算EMA
	data.EMA20 = calculateEMA(klines, 20)
	data.EMA50 = calculateEMA(klines, 50)

	// 计算ATR
	data.ATR3 = calculateATR(klines, 3)
	data.ATR14 = calculateATR(klines, 14)

	// 计算成交量
	if len(klines) > 0 {
		data.CurrentVolume = klines[len(klines)-1].Volume
		// 计算平均成交量
		sum := 0.0
		for _, k := range klines {
			sum += k.Volume
		}
		data.AverageVolume = sum / float64(len(klines))
	}

	// 计算MACD和RSI序列
	start := len(klines) - 10
	if start < 0 {
		start = 0
	}

	for i := start; i < len(klines); i++ {
		if i >= 25 {
			macd := calculateMACD(klines[:i+1])
			data.MACDValues = append(data.MACDValues, macd)
		}
		if i >= 14 {
			rsi14 := calculateRSI(klines[:i+1], 14)
			data.RSI14Values = append(data.RSI14Values, rsi14)
		}
	}

	return data
}

// getOpenInterestData 获取OI数据（支持 Binance 和 OKX）
func getOpenInterestData(symbol string) (*OIData, error) {
	// 根据 symbol 格式判断交易所
	if strings.Contains(symbol, "-") && strings.HasSuffix(symbol, "-SWAP") {
		return getOpenInterestDataOKX(symbol)
	}
	return getOpenInterestDataBinance(symbol)
}

// getOpenInterestDataBinance 从 Binance 获取OI数据
func getOpenInterestDataBinance(symbol string) (*OIData, error) {
	url := fmt.Sprintf("https://fapi.binance.com/fapi/v1/openInterest?symbol=%s", symbol)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result struct {
		OpenInterest string `json:"openInterest"`
		Symbol       string `json:"symbol"`
		Time         int64  `json:"time"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	oi, _ := strconv.ParseFloat(result.OpenInterest, 64)

	return &OIData{
		Latest:  oi,
		Average: oi * 0.999, // 近似平均值
	}, nil
}

// getOpenInterestDataOKX 从 OKX 获取OI数据
func getOpenInterestDataOKX(symbol string) (*OIData, error) {
	url := fmt.Sprintf("https://www.okx.com/api/v5/public/open-interest?instType=SWAP&instId=%s", symbol)

	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var okxResp struct {
		Code string `json:"code"`
		Msg  string `json:"msg"`
		Data []struct {
			InstId string `json:"instId"`
			Oi     string `json:"oi"`
			OiCcy  string `json:"oiCcy"`
			Ts     string `json:"ts"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &okxResp); err != nil {
		return nil, err
	}

	if okxResp.Code != "0" || len(okxResp.Data) == 0 {
		return nil, fmt.Errorf("OKX OI API错误: code=%s", okxResp.Code)
	}

	oi, _ := strconv.ParseFloat(okxResp.Data[0].Oi, 64)

	return &OIData{
		Latest:  oi,
		Average: oi * 0.999, // 近似平均值
	}, nil
}

// getFundingRate 获取资金费率（支持 Binance 和 OKX）
func getFundingRate(symbol string) (float64, error) {
	// 根据 symbol 格式判断交易所
	if strings.Contains(symbol, "-") && strings.HasSuffix(symbol, "-SWAP") {
		return getFundingRateOKX(symbol)
	}
	return getFundingRateBinance(symbol)
}

// getFundingRateBinance 从 Binance 获取资金费率
func getFundingRateBinance(symbol string) (float64, error) {
	url := fmt.Sprintf("https://fapi.binance.com/fapi/v1/premiumIndex?symbol=%s", symbol)

	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var result struct {
		Symbol          string `json:"symbol"`
		MarkPrice       string `json:"markPrice"`
		IndexPrice      string `json:"indexPrice"`
		LastFundingRate string `json:"lastFundingRate"`
		NextFundingTime int64  `json:"nextFundingTime"`
		InterestRate    string `json:"interestRate"`
		Time            int64  `json:"time"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return 0, err
	}

	rate, _ := strconv.ParseFloat(result.LastFundingRate, 64)
	return rate, nil
}

// getFundingRateOKX 从 OKX 获取资金费率
func getFundingRateOKX(symbol string) (float64, error) {
	url := fmt.Sprintf("https://www.okx.com/api/v5/public/funding-rate?instId=%s", symbol)

	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var okxResp struct {
		Code string `json:"code"`
		Msg  string `json:"msg"`
		Data []struct {
			InstId      string `json:"instId"`
			FundingRate string `json:"fundingRate"`
			FundingTime string `json:"fundingTime"`
		} `json:"data"`
	}

	if err := json.Unmarshal(body, &okxResp); err != nil {
		return 0, err
	}

	if okxResp.Code != "0" || len(okxResp.Data) == 0 {
		return 0, fmt.Errorf("OKX Funding Rate API错误: code=%s", okxResp.Code)
	}

	rate, _ := strconv.ParseFloat(okxResp.Data[0].FundingRate, 64)
	return rate, nil
}

// Format 格式化输出市场数据
func Format(data *Data) string {
	var sb strings.Builder

	sb.WriteString(fmt.Sprintf("current_price = %.2f, current_ema20 = %.3f, current_macd = %.3f, current_rsi (7 period) = %.3f\n\n",
		data.CurrentPrice, data.CurrentEMA20, data.CurrentMACD, data.CurrentRSI7))

	sb.WriteString(fmt.Sprintf("In addition, here is the latest %s open interest and funding rate for perps:\n\n",
		data.Symbol))

	if data.OpenInterest != nil {
		sb.WriteString(fmt.Sprintf("Open Interest: Latest: %.2f Average: %.2f\n\n",
			data.OpenInterest.Latest, data.OpenInterest.Average))
	}

	sb.WriteString(fmt.Sprintf("Funding Rate: %.2e\n\n", data.FundingRate))

	if data.IntradaySeries != nil {
		sb.WriteString("Intraday series (3‑minute intervals, oldest → latest):\n\n")

		if len(data.IntradaySeries.MidPrices) > 0 {
			sb.WriteString(fmt.Sprintf("Mid prices: %s\n\n", formatFloatSlice(data.IntradaySeries.MidPrices)))
		}

		if len(data.IntradaySeries.EMA20Values) > 0 {
			sb.WriteString(fmt.Sprintf("EMA indicators (20‑period): %s\n\n", formatFloatSlice(data.IntradaySeries.EMA20Values)))
		}

		if len(data.IntradaySeries.MACDValues) > 0 {
			sb.WriteString(fmt.Sprintf("MACD indicators: %s\n\n", formatFloatSlice(data.IntradaySeries.MACDValues)))
		}

		if len(data.IntradaySeries.RSI7Values) > 0 {
			sb.WriteString(fmt.Sprintf("RSI indicators (7‑Period): %s\n\n", formatFloatSlice(data.IntradaySeries.RSI7Values)))
		}

		if len(data.IntradaySeries.RSI14Values) > 0 {
			sb.WriteString(fmt.Sprintf("RSI indicators (14‑Period): %s\n\n", formatFloatSlice(data.IntradaySeries.RSI14Values)))
		}
	}

	if data.LongerTermContext != nil {
		sb.WriteString("Longer‑term context (4‑hour timeframe):\n\n")

		sb.WriteString(fmt.Sprintf("20‑Period EMA: %.3f vs. 50‑Period EMA: %.3f\n\n",
			data.LongerTermContext.EMA20, data.LongerTermContext.EMA50))

		sb.WriteString(fmt.Sprintf("3‑Period ATR: %.3f vs. 14‑Period ATR: %.3f\n\n",
			data.LongerTermContext.ATR3, data.LongerTermContext.ATR14))

		sb.WriteString(fmt.Sprintf("Current Volume: %.3f vs. Average Volume: %.3f\n\n",
			data.LongerTermContext.CurrentVolume, data.LongerTermContext.AverageVolume))

		if len(data.LongerTermContext.MACDValues) > 0 {
			sb.WriteString(fmt.Sprintf("MACD indicators: %s\n\n", formatFloatSlice(data.LongerTermContext.MACDValues)))
		}

		if len(data.LongerTermContext.RSI14Values) > 0 {
			sb.WriteString(fmt.Sprintf("RSI indicators (14‑Period): %s\n\n", formatFloatSlice(data.LongerTermContext.RSI14Values)))
		}
	}

	return sb.String()
}

// formatFloatSlice 格式化float64切片为字符串
func formatFloatSlice(values []float64) string {
	strValues := make([]string, len(values))
	for i, v := range values {
		strValues[i] = fmt.Sprintf("%.3f", v)
	}
	return "[" + strings.Join(strValues, ", ") + "]"
}

// Normalize 标准化symbol,转换为OKX SWAP格式
func Normalize(symbol string) string {
	symbol = strings.ToUpper(symbol)

	// 如果已经是 OKX SWAP 格式（如 BTC-USDT-SWAP），直接返回
	if strings.Contains(symbol, "-") && strings.HasSuffix(symbol, "-SWAP") {
		return symbol
	}

	// 将 Binance 格式（如 BTCUSDT）转换为 OKX SWAP 格式（如 BTC-USDT-SWAP）
	// 1. 先确保以 USDT 结尾
	if !strings.HasSuffix(symbol, "USDT") {
		symbol = symbol + "USDT"
	}

	// 2. 提取基础货币（去掉USDT后缀）
	baseCurrency := strings.TrimSuffix(symbol, "USDT")

	// 3. 转换为 OKX SWAP 格式：{BASE}-USDT-SWAP
	return baseCurrency + "-USDT-SWAP"
}

// parseFloat 解析float值
func parseFloat(v interface{}) (float64, error) {
	switch val := v.(type) {
	case string:
		return strconv.ParseFloat(val, 64)
	case float64:
		return val, nil
	case int:
		return float64(val), nil
	case int64:
		return float64(val), nil
	default:
		return 0, fmt.Errorf("unsupported type: %T", v)
	}
}
