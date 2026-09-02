package market

import (
	"encoding/json"
	"fmt"
	"io"
	"math"
	"nofx/logger"
	"nofx/provider/hyperliquid"
	"strconv"
	"strings"
	"sync"
	"time"
)

// FundingRateCache is the funding rate cache structure
// Binance Funding Rate only updates every 8 hours, using 1-hour cache can significantly reduce API calls
type FundingRateCache struct {
	Rate      float64
	UpdatedAt time.Time
}

var (
	fundingRateMap sync.Map // map[string]*FundingRateCache
	frCacheTTL     = 1 * time.Hour
)

// Get retrieves market data for the specified token (uses Binance data by default)
func Get(symbol string) (*Data, error) {
	return GetWithExchange(symbol, "binance")
}

// GetWithExchange retrieves market data for the specified token using exchange-specific data
func GetWithExchange(symbol, exchange string) (*Data, error) {
	var klines3m, klines4h []Kline
	var err error
	// Normalize symbol
	symbol = Normalize(symbol)

	// Check if this is an xyz dex asset (use Hyperliquid API)
	isXyzAsset := IsXyzDexAsset(symbol)

	exchangeLower := strings.ToLower(exchange)

	// For hyperliquid exchange, also use Hyperliquid API
	useHyperliquidAPI := isXyzAsset || strings.ToLower(exchange) == "hyperliquid"
	useMEXCAPI := exchangeLower == "mexc_paper"

	// Get 3-minute K-line data (or 5-minute for xyz assets as 3m may not be available)
	if useHyperliquidAPI {
		// Use Hyperliquid API for xyz dex assets (use 5m since 3m may not be available)
		klines3m, err = getKlinesFromHyperliquid(symbol, "5m", 100)
		if err != nil {
			return nil, fmt.Errorf("Failed to get 5-minute K-line from Hyperliquid: %v", err)
		}
	} else if useMEXCAPI {
		klines3m, err = GetMEXCKlines(symbol, "3m", 100)
		if err != nil {
			return nil, fmt.Errorf("Failed to get 3-minute K-line from MEXC: %v", err)
		}
	} else {
		// Use CoinAnk for regular crypto assets with exchange-specific data
		klines3m, err = getKlinesFromCoinAnk(symbol, "3m", exchange, 100)
		if err != nil {
			return nil, fmt.Errorf("Failed to get 3-minute K-line from CoinAnk (%s): %v", exchange, err)
		}
	}

	// Data staleness detection: Prevent DOGEUSDT-style price freeze issues
	if isStaleData(klines3m, symbol) {
		logger.Infof("⚠️  WARNING: %s detected stale data (consecutive price freeze), skipping symbol", symbol)
		return nil, fmt.Errorf("%s data is stale, possible cache failure", symbol)
	}

	// Get 4-hour K-line data
	if useHyperliquidAPI {
		klines4h, err = getKlinesFromHyperliquid(symbol, "4h", 100)
		if err != nil {
			return nil, fmt.Errorf("Failed to get 4-hour K-line from Hyperliquid: %v", err)
		}
	} else if useMEXCAPI {
		klines4h, err = GetMEXCKlines(symbol, "4h", 100)
		if err != nil {
			return nil, fmt.Errorf("Failed to get 4-hour K-line from MEXC: %v", err)
		}
	} else {
		klines4h, err = getKlinesFromCoinAnk(symbol, "4h", exchange, 100)
		if err != nil {
			return nil, fmt.Errorf("Failed to get 4-hour K-line from CoinAnk (%s): %v", exchange, err)
		}
	}

	// Check if data is empty
	if len(klines3m) == 0 {
		return nil, fmt.Errorf("3-minute K-line data is empty")
	}
	if len(klines4h) == 0 {
		return nil, fmt.Errorf("4-hour K-line data is empty")
	}

	// Calculate current indicators (based on 3-minute latest data)
	currentPrice := klines3m[len(klines3m)-1].Close
	currentEMA20 := calculateEMA(klines3m, 20)
	currentMACD := calculateMACD(klines3m)
	currentRSI7 := calculateRSI(klines3m, 7)

	// Calculate price change percentage
	// 1-hour price change = price from 20 3-minute K-lines ago
	priceChange1h := 0.0
	if len(klines3m) >= 21 { // Need at least 21 K-lines (current + 20 previous)
		price1hAgo := klines3m[len(klines3m)-21].Close
		if price1hAgo > 0 {
			priceChange1h = ((currentPrice - price1hAgo) / price1hAgo) * 100
		}
	}

	// 4-hour price change = price from 1 4-hour K-line ago
	priceChange4h := 0.0
	if len(klines4h) >= 2 {
		price4hAgo := klines4h[len(klines4h)-2].Close
		if price4hAgo > 0 {
			priceChange4h = ((currentPrice - price4hAgo) / price4hAgo) * 100
		}
	}

	// Get OI data
	oiData, err := getOpenInterestData(symbol)
	if err != nil {
		// OI failure doesn't affect overall result, use default values
		oiData = &OIData{Latest: 0, Average: 0}
	}

	// Get Funding Rate
	fundingRate, _ := getFundingRate(symbol)

	// Calculate intraday series data
	intradayData := calculateIntradaySeries(klines3m)

	// Calculate longer-term data
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

// GetWithTimeframes retrieves market data for specified multiple timeframes
// timeframes: list of timeframes, e.g. ["5m", "15m", "1h", "4h"]
// primaryTimeframe: primary timeframe (used for calculating current indicators), defaults to timeframes[0]
// count: number of K-lines for each timeframe
func GetWithTimeframes(symbol string, timeframes []string, primaryTimeframe string, count int) (*Data, error) {
	return GetWithTimeframesForExchange(symbol, timeframes, primaryTimeframe, count, "binance")
}

// GetWithTimeframesForExchange retrieves multi-timeframe data from the
// selected execution venue when a native public market-data adapter exists.
func GetWithTimeframesForExchange(symbol string, timeframes []string, primaryTimeframe string, count int, exchange string) (*Data, error) {
	symbol = Normalize(symbol)

	if len(timeframes) == 0 {
		return nil, fmt.Errorf("at least one timeframe is required")
	}

	// If primary timeframe is not specified, use the first one
	if primaryTimeframe == "" {
		primaryTimeframe = timeframes[0]
	}

	// Ensure primary timeframe is in the list
	hasPrimary := false
	for _, tf := range timeframes {
		if tf == primaryTimeframe {
			hasPrimary = true
			break
		}
	}
	if !hasPrimary {
		timeframes = append([]string{primaryTimeframe}, timeframes...)
	}

	// Store data for all timeframes
	timeframeData := make(map[string]*TimeframeSeriesData)
	var primaryKlines []Kline

	// Check if this is an xyz dex asset (use Hyperliquid API)
	isXyzAsset := IsXyzDexAsset(symbol)
	exchangeLower := strings.ToLower(strings.TrimSpace(exchange))
	useHyperliquidAPI := isXyzAsset || exchangeLower == "hyperliquid"
	useMEXCAPI := exchangeLower == "mexc_paper"

	// Get K-line data for each timeframe
	for _, tf := range timeframes {
		var klines []Kline
		var err error

		if useHyperliquidAPI {
			// Use Hyperliquid API for xyz dex assets
			klines, err = getKlinesFromHyperliquid(symbol, tf, 200)
			if err != nil {
				logger.Infof("⚠️ Failed to get %s %s K-line from Hyperliquid: %v", symbol, tf, err)
				continue
			}
		} else if useMEXCAPI {
			klines, err = GetMEXCKlines(symbol, tf, 200)
			if err != nil {
				logger.Infof("⚠️ Failed to get %s %s K-line from MEXC: %v", symbol, tf, err)
				continue
			}
		} else {
			// Use CoinAnk for regular crypto assets.
			klines, err = getKlinesFromCoinAnk(symbol, tf, exchangeLower, 200)
			if err != nil {
				logger.Infof("⚠️ Failed to get %s %s K-line from CoinAnk: %v", symbol, tf, err)
				continue
			}
		}

		if len(klines) == 0 {
			logger.Infof("⚠️ %s %s K-line data is empty", symbol, tf)
			continue
		}

		// Save primary timeframe K-lines for calculating base indicators
		if tf == primaryTimeframe {
			primaryKlines = klines
		}

		// Calculate series data for this timeframe (use count from config)
		seriesData := calculateTimeframeSeries(klines, tf, count)
		timeframeData[tf] = seriesData
	}

	// If primary timeframe data is empty, return error
	if len(primaryKlines) == 0 {
		return nil, fmt.Errorf("Primary timeframe %s K-line data is empty", primaryTimeframe)
	}

	// Data staleness detection
	if isStaleData(primaryKlines, symbol) {
		logger.Infof("⚠️  WARNING: %s detected stale data (consecutive price freeze), skipping symbol", symbol)
		return nil, fmt.Errorf("%s data is stale, possible cache failure", symbol)
	}

	// Calculate current indicators (based on primary timeframe latest data)
	currentPrice := primaryKlines[len(primaryKlines)-1].Close
	currentEMA20 := calculateEMA(primaryKlines, 20)
	currentMACD := calculateMACD(primaryKlines)
	currentRSI7 := calculateRSI(primaryKlines, 7)

	// Calculate price changes
	priceChange1h := calculatePriceChangeByBars(primaryKlines, primaryTimeframe, 60)  // 1 hour
	priceChange4h := calculatePriceChangeByBars(primaryKlines, primaryTimeframe, 240) // 4 hours

	// Get OI data
	oiData, err := getOpenInterestData(symbol)
	if err != nil {
		oiData = &OIData{Latest: 0, Average: 0}
	}

	// Get Funding Rate
	fundingRate, _ := getFundingRate(symbol)

	return &Data{
		Symbol:        symbol,
		CurrentPrice:  currentPrice,
		PriceChange1h: priceChange1h,
		PriceChange4h: priceChange4h,
		CurrentEMA20:  currentEMA20,
		CurrentMACD:   currentMACD,
		CurrentRSI7:   currentRSI7,
		OpenInterest:  oiData,
		FundingRate:   fundingRate,
		TimeframeData: timeframeData,
	}, nil
}

// getOpenInterestData retrieves OI data
func getOpenInterestData(symbol string) (*OIData, error) {
	url := fmt.Sprintf("https://fapi.binance.com/fapi/v1/openInterest?symbol=%s", symbol)

	apiClient := NewAPIClient()
	resp, err := apiClient.client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
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
		Average: oi * 0.999, // Approximate average
	}, nil
}

// getFundingRate retrieves funding rate (optimized: uses 1-hour cache)
func getFundingRate(symbol string) (float64, error) {
	// Check cache (1-hour validity)
	// Funding Rate only updates every 8 hours, 1-hour cache is very reasonable
	if cached, ok := fundingRateMap.Load(symbol); ok {
		cache := cached.(*FundingRateCache)
		if time.Since(cache.UpdatedAt) < frCacheTTL {
			// Cache hit, return directly
			return cache.Rate, nil
		}
	}

	// Cache expired or doesn't exist, call API
	url := fmt.Sprintf("https://fapi.binance.com/fapi/v1/premiumIndex?symbol=%s", symbol)

	apiClient := NewAPIClient()
	resp, err := apiClient.client.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
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

	// Update cache
	fundingRateMap.Store(symbol, &FundingRateCache{
		Rate:      rate,
		UpdatedAt: time.Now(),
	})

	return rate, nil
}

// Format formats and outputs market data
func Format(data *Data) string {
	var sb strings.Builder

	// Format price with dynamic precision
	priceStr := formatPriceWithDynamicPrecision(data.CurrentPrice)
	sb.WriteString(fmt.Sprintf("current_price = %s, current_ema20 = %.3f, current_macd = %.3f, current_rsi (7 period) = %.3f\n\n",
		priceStr, data.CurrentEMA20, data.CurrentMACD, data.CurrentRSI7))

	sb.WriteString(fmt.Sprintf("In addition, here is the latest %s open interest and funding rate for perps:\n\n",
		data.Symbol))

	if data.OpenInterest != nil {
		// Format OI data with dynamic precision
		oiLatestStr := formatPriceWithDynamicPrecision(data.OpenInterest.Latest)
		oiAverageStr := formatPriceWithDynamicPrecision(data.OpenInterest.Average)
		sb.WriteString(fmt.Sprintf("Open Interest: Latest: %s Average: %s\n\n",
			oiLatestStr, oiAverageStr))
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

		if len(data.IntradaySeries.Volume) > 0 {
			sb.WriteString(fmt.Sprintf("Volume: %s\n\n", formatFloatSlice(data.IntradaySeries.Volume)))
		}

		sb.WriteString(fmt.Sprintf("3m ATR (14‑period): %.3f\n\n", data.IntradaySeries.ATR14))
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

	// Multi-timeframe data (new)
	if len(data.TimeframeData) > 0 {
		// Output sorted by timeframe
		timeframeOrder := []string{"1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w"}
		for _, tf := range timeframeOrder {
			if tfData, ok := data.TimeframeData[tf]; ok {
				sb.WriteString(fmt.Sprintf("=== %s Timeframe ===\n\n", strings.ToUpper(tf)))
				formatTimeframeData(&sb, tfData)
			}
		}
	}

	return sb.String()
}

// formatTimeframeData formats data for a single timeframe
func formatTimeframeData(sb *strings.Builder, data *TimeframeSeriesData) {
	// Use OHLCV table format if kline data is available
	if len(data.Klines) > 0 {
		sb.WriteString("Time(UTC)      Open      High      Low       Close     Volume\n")
		for i, k := range data.Klines {
			t := time.Unix(k.Time/1000, 0).UTC()
			timeStr := t.Format("01-02 15:04")
			marker := ""
			if i == len(data.Klines)-1 {
				marker = "  <- current"
			}
			sb.WriteString(fmt.Sprintf("%-14s %-9.4f %-9.4f %-9.4f %-9.4f %-12.2f%s\n",
				timeStr, k.Open, k.High, k.Low, k.Close, k.Volume, marker))
		}
		sb.WriteString("\n")
	} else if len(data.MidPrices) > 0 {
		// Fallback to old format for backward compatibility
		sb.WriteString(fmt.Sprintf("Mid prices: %s\n\n", formatFloatSlice(data.MidPrices)))
		if len(data.Volume) > 0 {
			sb.WriteString(fmt.Sprintf("Volume: %s\n\n", formatFloatSlice(data.Volume)))
		}
	}

	// Technical indicators
	if len(data.EMA20Values) > 0 {
		sb.WriteString(fmt.Sprintf("EMA20: %s\n", formatFloatSlice(data.EMA20Values)))
	}

	if len(data.EMA50Values) > 0 {
		sb.WriteString(fmt.Sprintf("EMA50: %s\n", formatFloatSlice(data.EMA50Values)))
	}

	if len(data.MACDValues) > 0 {
		sb.WriteString(fmt.Sprintf("MACD: %s\n", formatFloatSlice(data.MACDValues)))
	}

	if len(data.RSI7Values) > 0 {
		sb.WriteString(fmt.Sprintf("RSI7: %s\n", formatFloatSlice(data.RSI7Values)))
	}

	if len(data.RSI14Values) > 0 {
		sb.WriteString(fmt.Sprintf("RSI14: %s\n", formatFloatSlice(data.RSI14Values)))
	}

	if data.ATR14 > 0 {
		sb.WriteString(fmt.Sprintf("ATR14: %.4f\n", data.ATR14))
	}

	sb.WriteString("\n")
}

// formatPriceWithDynamicPrecision dynamically selects precision based on price range
// This perfectly supports all coins from ultra-low price meme coins (< 0.0001) to BTC/ETH
func formatPriceWithDynamicPrecision(price float64) string {
	switch {
	case price < 0.0001:
		// Ultra-low price meme coins: 1000SATS, 1000WHY, DOGS
		// 0.00002070 → "0.00002070" (8 decimal places)
		return fmt.Sprintf("%.8f", price)
	case price < 0.001:
		// Low price meme coins: NEIRO, HMSTR, HOT, NOT
		// 0.00015060 → "0.000151" (6 decimal places)
		return fmt.Sprintf("%.6f", price)
	case price < 0.01:
		// Mid-low price coins: PEPE, SHIB, MEME
		// 0.00556800 → "0.005568" (6 decimal places)
		return fmt.Sprintf("%.6f", price)
	case price < 1.0:
		// Low price coins: ASTER, DOGE, ADA, TRX
		// 0.9954 → "0.9954" (4 decimal places)
		return fmt.Sprintf("%.4f", price)
	case price < 100:
		// Mid price coins: SOL, AVAX, LINK, MATIC
		// 23.4567 → "23.4567" (4 decimal places)
		return fmt.Sprintf("%.4f", price)
	default:
		// High price coins: BTC, ETH (save tokens)
		// 45678.9123 → "45678.91" (2 decimal places)
		return fmt.Sprintf("%.2f", price)
	}
}

// formatFloatSlice formats float64 slice to string (using dynamic precision)
func formatFloatSlice(values []float64) string {
	strValues := make([]string, len(values))
	for i, v := range values {
		strValues[i] = formatPriceWithDynamicPrecision(v)
	}
	return "[" + strings.Join(strValues, ", ") + "]"
}

// xyz dex assets that should NOT get USDT suffix
var xyzDexAssets = map[string]bool{
	// Stocks
	"TSLA": true, "NVDA": true, "AAPL": true, "MSFT": true, "META": true,
	"AMZN": true, "GOOGL": true, "AMD": true, "COIN": true, "NFLX": true,
	"PLTR": true, "HOOD": true, "INTC": true, "MSTR": true, "TSM": true,
	"ORCL": true, "MU": true, "RIVN": true, "COST": true, "LLY": true,
	"CRCL": true, "SKHX": true, "SNDK": true,
	// Forex
	"EUR": true, "JPY": true,
	// Commodities
	"GOLD": true, "SILVER": true,
	// Index
	"XYZ100": true,
}

// IsXyzDexAsset checks if a symbol is an xyz dex asset
func IsXyzDexAsset(symbol string) bool {
	base := strings.ToUpper(symbol)
	if strings.HasSuffix(base, "-USDC") || strings.HasPrefix(strings.ToLower(base), "xyz:") {
		return hyperliquid.IsXYZAsset(base)
	}
	// Remove any prefix/suffix
	base = strings.TrimPrefix(base, "XYZ:")
	for _, suffix := range []string{"USDT", "USD", "-USDC"} {
		if strings.HasSuffix(base, suffix) {
			base = strings.TrimSuffix(base, suffix)
			break
		}
	}
	return xyzDexAssets[base] || hyperliquid.IsXYZAsset(base)
}

// Normalize normalizes symbol
// For crypto: ensures it's a USDT trading pair
// For xyz dex assets (stocks, forex, commodities): uses xyz: prefix without USDT suffix
func Normalize(symbol string) string {
	symbol = strings.ToUpper(symbol)
	if strings.HasSuffix(symbol, "-USDC") {
		return hyperliquid.FormatCoinForAPI(symbol)
	}

	// Check if this is an xyz dex asset
	if IsXyzDexAsset(symbol) {
		return hyperliquid.FormatCoinForAPI(symbol)
	}

	// Remove exchange-specific separators (Gate uses BTC_USDT, OKX uses BTC-USDT-SWAP)
	symbol = strings.ReplaceAll(symbol, "_", "")
	symbol = strings.ReplaceAll(symbol, "-SWAP", "")
	symbol = strings.ReplaceAll(symbol, "-", "")

	// For regular crypto assets
	if strings.HasSuffix(symbol, "USDT") {
		return symbol
	}
	return symbol + "USDT"
}

// parseFloat parses float value
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

// BuildDataFromKlines constructs market data snapshot from preloaded K-line series.
func BuildDataFromKlines(symbol string, primary []Kline, longer []Kline) (*Data, error) {
	if len(primary) == 0 {
		return nil, fmt.Errorf("primary series is empty")
	}

	symbol = Normalize(symbol)
	current := primary[len(primary)-1]
	currentPrice := current.Close

	data := &Data{
		Symbol:            symbol,
		CurrentPrice:      currentPrice,
		CurrentEMA20:      calculateEMA(primary, 20),
		CurrentMACD:       calculateMACD(primary),
		CurrentRSI7:       calculateRSI(primary, 7),
		PriceChange1h:     priceChangeFromSeries(primary, time.Hour),
		PriceChange4h:     priceChangeFromSeries(primary, 4*time.Hour),
		OpenInterest:      &OIData{Latest: 0, Average: 0},
		FundingRate:       0,
		IntradaySeries:    calculateIntradaySeries(primary),
		LongerTermContext: nil,
	}

	if len(longer) > 0 {
		data.LongerTermContext = calculateLongerTermData(longer)
	}

	return data, nil
}

func priceChangeFromSeries(series []Kline, duration time.Duration) float64 {
	if len(series) == 0 || duration <= 0 {
		return 0
	}
	last := series[len(series)-1]
	target := last.CloseTime - duration.Milliseconds()
	for i := len(series) - 1; i >= 0; i-- {
		if series[i].CloseTime <= target {
			price := series[i].Close
			if price > 0 {
				return ((last.Close - price) / price) * 100
			}
			break
		}
	}
	return 0
}

// isStaleData detects stale data (consecutive price freeze)
// Fix DOGEUSDT-style issue: consecutive N periods with completely unchanged prices indicate data source anomaly
func isStaleData(klines []Kline, symbol string) bool {
	if len(klines) < 5 {
		return false // Insufficient data to determine
	}

	// Detection threshold: 5 consecutive 3-minute periods with unchanged price (15 minutes without fluctuation)
	const stalePriceThreshold = 5
	const priceTolerancePct = 0.0001 // 0.01% fluctuation tolerance (avoid false positives)

	// Take the last stalePriceThreshold K-lines
	recentKlines := klines[len(klines)-stalePriceThreshold:]
	firstPrice := recentKlines[0].Close

	// Check if all prices are within tolerance
	for i := 1; i < len(recentKlines); i++ {
		priceDiff := math.Abs(recentKlines[i].Close-firstPrice) / firstPrice
		if priceDiff > priceTolerancePct {
			return false // Price fluctuation exists, data is normal
		}
	}

	// Additional check: MACD and volume
	// If price is unchanged but MACD/volume shows normal fluctuation, it might be a real market situation (extremely low volatility)
	// Check if volume is also 0 (data completely frozen)
	allVolumeZero := true
	for _, k := range recentKlines {
		if k.Volume > 0 {
			allVolumeZero = false
			break
		}
	}

	if allVolumeZero {
		logger.Infof("⚠️  %s stale data confirmed: price freeze + zero volume", symbol)
		return true
	}

	// Price frozen but has volume: might be extremely low volatility market, allow but log warning
	logger.Infof("⚠️  %s detected extreme price stability (no fluctuation for %d consecutive periods), but volume is normal", symbol, stalePriceThreshold)
	return false
}
