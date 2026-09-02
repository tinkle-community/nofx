package api

import (
	"context"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"nofx/logger"
	"nofx/market"
	"nofx/provider/alpaca"
	"nofx/provider/coinank/coinank_api"
	"nofx/provider/coinank/coinank_enum"
	"nofx/provider/hyperliquid"
	"nofx/provider/twelvedata"

	"github.com/gin-gonic/gin"
)

// handleKlines K-line data (supports multiple exchanges via coinank)
func (s *Server) handleKlines(c *gin.Context) {
	// Get query parameters
	symbol := c.Query("symbol")
	if symbol == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "symbol parameter is required"})
		return
	}

	interval := c.DefaultQuery("interval", "5m")
	exchange := c.DefaultQuery("exchange", "binance") // Default to binance for backward compatibility
	limitStr := c.DefaultQuery("limit", "1000")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 1000
	}

	// Coinank API has a maximum limit of 1500 klines per request
	if limit > 1500 {
		limit = 1500
	}

	var klines []market.Kline
	exchangeLower := strings.ToLower(exchange)

	// Route to appropriate data source based on exchange type
	switch exchangeLower {
	case "mexc_paper":
		klines, err = market.GetMEXCKlines(symbol, interval, limit)
		if err != nil {
			SafeInternalError(c, "Get klines from MEXC", err)
			return
		}
	case "alpaca":
		// US Stocks via Alpaca
		klines, err = s.getKlinesFromAlpaca(symbol, interval, limit)
		if err != nil {
			SafeInternalError(c, "Get klines from Alpaca", err)
			return
		}
	case "forex", "metals":
		// Forex and Metals via Twelve Data
		klines, err = s.getKlinesFromTwelveData(symbol, interval, limit)
		if err != nil {
			SafeInternalError(c, "Get klines from TwelveData", err)
			return
		}
	case "hyperliquid", "hyperliquid-xyz", "xyz":
		// Hyperliquid native API - supports both crypto perps and stock perps (xyz dex)
		klines, err = s.getKlinesFromHyperliquid(symbol, interval, limit)
		if err != nil {
			SafeInternalError(c, "Get klines from Hyperliquid", err)
			return
		}
	default:
		// Crypto exchanges via CoinAnk
		symbol = market.Normalize(symbol)
		klines, err = s.getKlinesFromCoinank(symbol, interval, exchange, limit)
		if err != nil {
			SafeInternalError(c, "Get klines from CoinAnk", err)
			return
		}
	}

	c.JSON(http.StatusOK, klines)
}

// getKlinesFromCoinank fetches kline data from coinank free/open API for multiple exchanges
func (s *Server) getKlinesFromCoinank(symbol, interval, exchange string, limit int) ([]market.Kline, error) {
	// Map exchange string to coinank enum
	var coinankExchange coinank_enum.Exchange
	switch strings.ToLower(exchange) {
	case "binance":
		coinankExchange = coinank_enum.Binance
	case "bybit":
		coinankExchange = coinank_enum.Bybit
	case "okx":
		coinankExchange = coinank_enum.Okex
	case "bitget":
		coinankExchange = coinank_enum.Bitget
	case "gate":
		coinankExchange = coinank_enum.Gate
	case "aster":
		coinankExchange = coinank_enum.Aster
	case "lighter":
		// Lighter doesn't have direct CoinAnk support, use Binance data as fallback
		coinankExchange = coinank_enum.Binance
	case "kucoin":
		// KuCoin doesn't have direct CoinAnk support, use Binance data as fallback
		coinankExchange = coinank_enum.Binance
	default:
		// For any unknown exchange, default to Binance
		logger.Warnf("⚠️ Unknown exchange '%s', defaulting to Binance for CoinAnk", exchange)
		coinankExchange = coinank_enum.Binance
	}

	// Map interval string to coinank enum
	var coinankInterval coinank_enum.Interval
	switch interval {
	case "1s":
		coinankInterval = coinank_enum.Second1
	case "5s":
		coinankInterval = coinank_enum.Second5
	case "10s":
		coinankInterval = coinank_enum.Second10
	case "30s":
		coinankInterval = coinank_enum.Second30
	case "1m":
		coinankInterval = coinank_enum.Minute1
	case "3m":
		coinankInterval = coinank_enum.Minute3
	case "5m":
		coinankInterval = coinank_enum.Minute5
	case "10m":
		coinankInterval = coinank_enum.Minute10
	case "15m":
		coinankInterval = coinank_enum.Minute15
	case "30m":
		coinankInterval = coinank_enum.Minute30
	case "1h":
		coinankInterval = coinank_enum.Hour1
	case "2h":
		coinankInterval = coinank_enum.Hour2
	case "4h":
		coinankInterval = coinank_enum.Hour4
	case "6h":
		coinankInterval = coinank_enum.Hour6
	case "8h":
		coinankInterval = coinank_enum.Hour8
	case "12h":
		coinankInterval = coinank_enum.Hour12
	case "1d":
		coinankInterval = coinank_enum.Day1
	case "3d":
		coinankInterval = coinank_enum.Day3
	case "1w":
		coinankInterval = coinank_enum.Week1
	case "1M":
		coinankInterval = coinank_enum.Month1
	default:
		return nil, fmt.Errorf("unsupported interval for coinank: %s", interval)
	}

	// Convert symbol format for different exchanges
	// OKX uses "BTC-USDT-SWAP" format instead of "BTCUSDT"
	apiSymbol := symbol
	if coinankExchange == coinank_enum.Okex {
		// Convert BTCUSDT -> BTC-USDT-SWAP
		if strings.HasSuffix(symbol, "USDT") {
			base := strings.TrimSuffix(symbol, "USDT")
			apiSymbol = fmt.Sprintf("%s-USDT-SWAP", base)
		}
	}

	// Call coinank free/open API (no authentication required)
	ctx := context.Background()
	ts := time.Now().UnixMilli()
	// Use "To" side to search backward from current time (get historical klines)
	coinankKlines, err := coinank_api.Kline(ctx, apiSymbol, coinankExchange, ts, coinank_enum.To, limit, coinankInterval)
	if err != nil {
		// Free API doesn't support all exchanges (e.g., OKX, Bitget)
		// Fallback to Binance data as reference
		if coinankExchange != coinank_enum.Binance {
			logger.Warnf("⚠️ CoinAnk free API doesn't support %s, falling back to Binance data", coinankExchange)
			coinankKlines, err = coinank_api.Kline(ctx, symbol, coinank_enum.Binance, ts, coinank_enum.To, limit, coinankInterval)
			if err != nil {
				return nil, fmt.Errorf("coinank API error (fallback): %w", err)
			}
		} else {
			return nil, fmt.Errorf("coinank API error: %w", err)
		}
	}

	// Convert coinank kline format to market.Kline format
	// Coinank: Volume = BTC quantity, Quantity = USDT turnover
	klines := make([]market.Kline, len(coinankKlines))
	for i, ck := range coinankKlines {
		klines[i] = market.Kline{
			OpenTime:    ck.StartTime,
			Open:        ck.Open,
			High:        ck.High,
			Low:         ck.Low,
			Close:       ck.Close,
			Volume:      ck.Volume,   // BTC quantity
			QuoteVolume: ck.Quantity, // USDT turnover
			CloseTime:   ck.EndTime,
		}
	}

	return klines, nil
}

// getKlinesFromAlpaca fetches kline data from Alpaca API for US stocks
func (s *Server) getKlinesFromAlpaca(symbol, interval string, limit int) ([]market.Kline, error) {
	// Create Alpaca client
	client := alpaca.NewClient()

	// Map interval to Alpaca timeframe format
	timeframe := alpaca.MapTimeframe(interval)

	// Fetch bars from Alpaca
	ctx := context.Background()
	bars, err := client.GetBars(ctx, symbol, timeframe, limit)
	if err != nil {
		return nil, fmt.Errorf("alpaca API error: %w", err)
	}

	// Convert Alpaca bars to market.Kline format
	klines := make([]market.Kline, len(bars))
	for i, bar := range bars {
		klines[i] = market.Kline{
			OpenTime:    bar.Timestamp.UnixMilli(),
			Open:        bar.Open,
			High:        bar.High,
			Low:         bar.Low,
			Close:       bar.Close,
			Volume:      float64(bar.Volume),             // share count
			QuoteVolume: float64(bar.Volume) * bar.Close, // turnover = shares * close price (USD)
			CloseTime:   bar.Timestamp.UnixMilli(),
		}
	}

	return klines, nil
}

// getKlinesFromTwelveData fetches kline data from Twelve Data API for forex and metals
func (s *Server) getKlinesFromTwelveData(symbol, interval string, limit int) ([]market.Kline, error) {
	// Create Twelve Data client
	client := twelvedata.NewClient()

	// Map interval to Twelve Data timeframe format
	timeframe := twelvedata.MapTimeframe(interval)

	// Fetch time series from Twelve Data
	ctx := context.Background()
	result, err := client.GetTimeSeries(ctx, symbol, timeframe, limit)
	if err != nil {
		return nil, fmt.Errorf("twelvedata API error: %w", err)
	}

	// Convert Twelve Data bars to market.Kline format
	// Note: Twelve Data returns bars in reverse order (newest first)
	klines := make([]market.Kline, len(result.Values))
	for i, bar := range result.Values {
		open, high, low, close, volume, timestamp, err := twelvedata.ParseBar(bar)
		if err != nil {
			logger.Warnf("⚠️ Failed to parse TwelveData bar: %v", err)
			continue
		}

		// Reverse order: put oldest first
		idx := len(result.Values) - 1 - i
		klines[idx] = market.Kline{
			OpenTime:  timestamp,
			Open:      open,
			High:      high,
			Low:       low,
			Close:     close,
			Volume:    volume,
			CloseTime: timestamp,
		}
	}

	return klines, nil
}

// getKlinesFromHyperliquid fetches kline data from Hyperliquid API
// Supports both crypto perps (default dex) and stock perps/forex/commodities (xyz dex)
func (s *Server) getKlinesFromHyperliquid(symbol, interval string, limit int) ([]market.Kline, error) {
	// Create Hyperliquid client
	client := hyperliquid.NewClient()

	// Map interval to Hyperliquid format
	timeframe := hyperliquid.MapTimeframe(interval)

	// Fetch candles from Hyperliquid
	// FormatCoinForAPI will automatically add xyz: prefix for stock perps
	ctx := context.Background()
	candles, err := client.GetCandles(ctx, symbol, timeframe, limit)
	if err != nil {
		return nil, fmt.Errorf("hyperliquid API error: %w", err)
	}

	// Convert Hyperliquid candles to market.Kline format
	klines := make([]market.Kline, len(candles))
	for i, candle := range candles {
		open, _ := strconv.ParseFloat(candle.Open, 64)
		high, _ := strconv.ParseFloat(candle.High, 64)
		low, _ := strconv.ParseFloat(candle.Low, 64)
		close, _ := strconv.ParseFloat(candle.Close, 64)
		volume, _ := strconv.ParseFloat(candle.Volume, 64)

		klines[i] = market.Kline{
			OpenTime:    candle.OpenTime,
			Open:        open,
			High:        high,
			Low:         low,
			Close:       close,
			Volume:      volume,         // contract quantity
			QuoteVolume: volume * close, // turnover (USD)
			CloseTime:   candle.CloseTime,
		}
	}

	return klines, nil
}

func hyperliquidXYZDisplayBase(baseSymbol string) string {
	baseSymbol = strings.ToUpper(strings.TrimSpace(baseSymbol))
	// User-facing names should be product names, not exchange shorthand tickers.
	// Keep the internal symbol separate because Hyperliquid's xyz dex still routes
	// orders/candles by the short coin name (for example xyz:SMSN).
	fullNames := map[string]string{
		"XYZ100":    "XYZ100",
		"TSLA":      "TESLA",
		"NVDA":      "NVIDIA",
		"GOLD":      "GOLD",
		"HOOD":      "ROBINHOOD",
		"INTC":      "INTEL",
		"PLTR":      "PALANTIR",
		"COIN":      "COINBASE",
		"META":      "META",
		"AAPL":      "APPLE",
		"MSFT":      "MICROSOFT",
		"ORCL":      "ORACLE",
		"GOOGL":     "GOOGLE",
		"AMZN":      "AMAZON",
		"AMD":       "AMD",
		"MU":        "MICRON",
		"SNDK":      "SANDISK",
		"MSTR":      "MICROSTRATEGY",
		"CRCL":      "CIRCLE",
		"NFLX":      "NETFLIX",
		"COST":      "COSTCO",
		"LLY":       "ELI-LILLY",
		"SKHX":      "SK-HYNIX",
		"TSM":       "TSMC",
		"JPY":       "JPY",
		"EUR":       "EUR",
		"SILVER":    "SILVER",
		"RIVN":      "RIVIAN",
		"BABA":      "ALIBABA",
		"CL":        "CRUDE-OIL",
		"COPPER":    "COPPER",
		"NATGAS":    "NATURAL-GAS",
		"URANIUM":   "URANIUM",
		"ALUMINIUM": "ALUMINIUM",
		"SMSN":      "SAMSUNG",
		"PLATINUM":  "PLATINUM",
		"USAR":      "USA-RARE-EARTH",
		"CRWV":      "COREWEAVE",
		"URNM":      "URNM",
		"PALLADIUM": "PALLADIUM",
		"DXY":       "DOLLAR-INDEX",
		"GME":       "GAMESTOP",
		"KR200":     "KOREA-200",
		"SOFTBANK":  "SOFTBANK",
		"JP225":     "JAPAN-225",
		"HYUNDAI":   "HYUNDAI",
		"KIOXIA":    "KIOXIA",
		"EWY":       "SOUTH-KOREA-ETF",
		"EWJ":       "JAPAN-ETF",
		"BRENTOIL":  "BRENT-OIL",
		"VIX":       "VIX",
		"HIMS":      "HIMS-HERS",
		"SP500":     "S&P-500",
		"DKNG":      "DRAFTKINGS",
		"LITE":      "LITECOIN",
		"CORN":      "CORN",
		"XLE":       "ENERGY-SECTOR-ETF",
		"WHEAT":     "WHEAT",
		"TTF":       "TTF-GAS",
		"BX":        "BLACKSTONE",
		"PURRDAT":   "PURRDAT",
		"MRVL":      "MARVELL",
		"RKLB":      "ROCKET-LAB",
		"BIRD":      "BIRD",
		"VOL":       "VOLATILITY",
		"DRAM":      "DRAM",
		"CBRS":      "COINBASE-PRE-IPO",
		"EWZ":       "BRAZIL-ETF",
		"KRW":       "KRW",
		"ZM":        "ZOOM",
		"EBAY":      "EBAY",
		"H100":      "H100",
		"NIFTY":     "NIFTY-50",
		"ARM":       "ARM",
		"EWT":       "TAIWAN-ETF",
		"GBP":       "GBP",
		"SPCX":      "SPACEX-PRE-IPO",
		"IBOV":      "IBOVESPA",
		"ASML":      "ASML",
	}
	if fullName, ok := fullNames[baseSymbol]; ok {
		return fullName
	}
	return baseSymbol
}

func hyperliquidXYZCategory(baseSymbol string) string {
	baseSymbol = strings.ToUpper(strings.TrimSpace(baseSymbol))
	switch baseSymbol {
	case "GOLD", "SILVER", "CL", "COPPER", "NATGAS", "URANIUM", "ALUMINIUM", "PLATINUM", "PALLADIUM", "BRENTOIL", "CORN", "WHEAT", "TTF":
		return "commodity"
	case "XYZ100", "SP500", "JP225", "KR200", "DXY", "VIX", "XLE", "EWY", "EWJ", "EWZ", "EWT", "NIFTY", "IBOV":
		return "index"
	case "EUR", "JPY", "GBP", "KRW":
		return "forex"
	case "SPCX", "BIRD", "PURRDAT", "H100", "CBRS":
		return "pre_ipo"
	default:
		return "stock"
	}
}

func hyperliquidCategoryOrder(category string) int {
	switch category {
	case "stock":
		return 0
	case "commodity":
		return 1
	case "index":
		return 2
	case "forex":
		return 3
	case "pre_ipo":
		return 4
	case "crypto":
		return 5
	default:
		return 99
	}
}

// handleSymbols returns available symbols for a given exchange
func (s *Server) handleSymbols(c *gin.Context) {
	exchange := c.DefaultQuery("exchange", "hyperliquid")

	type SymbolInfo struct {
		Symbol       string  `json:"symbol"`
		Display      string  `json:"display"`
		Name         string  `json:"name"`
		Category     string  `json:"category"` // crypto, stock, forex, commodity, index
		Exchange     string  `json:"exchange"`
		Volume24h    float64 `json:"volume_24h"`
		MarkPrice    float64 `json:"mark_price"`
		PrevDayPrice float64 `json:"prev_day_price,omitempty"`
		Change24hPct float64 `json:"change_24h_pct,omitempty"`
		MaxLeverage  int     `json:"maxLeverage,omitempty"`
		SzDecimals   int     `json:"sz_decimals,omitempty"`
	}

	var symbols []SymbolInfo

	exchangeLower := strings.ToLower(exchange)
	switch exchangeLower {
	case "mexc_paper":
		mexcSymbols, err := market.GetMEXCSymbols()
		if err != nil {
			SafeInternalError(c, "Get MEXC symbols", err)
			return
		}
		for _, item := range mexcSymbols {
			base := strings.TrimSuffix(item.Symbol, "USDT")
			symbols = append(symbols, SymbolInfo{
				Symbol:       item.Symbol,
				Display:      base + "/USDT",
				Name:         base,
				Category:     "crypto",
				Exchange:     "mexc_paper",
				Volume24h:    item.QuoteVolume,
				MarkPrice:    item.LastPrice,
				Change24hPct: item.Change24hPct,
				MaxLeverage:  20,
				SzDecimals:   item.BasePrecision,
			})
		}
	case "hyperliquid", "hyperliquid-xyz", "xyz":
		ctx := context.Background()

		// hyperliquid-xyz returns the full USDC trading board in product order:
		// stocks → commodities → indices → forex → pre-IPO → crypto.
		if exchangeLower == "hyperliquid-xyz" || exchangeLower == "xyz" {
			xyzCoins, err := hyperliquid.GetPerpDexCoins(ctx, hyperliquid.XYZDex)
			if err != nil {
				SafeInternalError(c, "Get Hyperliquid XYZ symbols", err)
				return
			}
			for _, coin := range xyzCoins {
				baseSymbol := strings.TrimPrefix(coin.Symbol, "xyz:")
				displayBase := hyperliquidXYZDisplayBase(baseSymbol)
				displaySymbol := displayBase + "-USDC"
				tradeSymbol := baseSymbol + "-USDC"
				symbols = append(symbols, SymbolInfo{
					Symbol:       tradeSymbol,
					Display:      displaySymbol,
					Name:         displayBase,
					Category:     hyperliquidXYZCategory(baseSymbol),
					Exchange:     "hyperliquid-xyz",
					Volume24h:    coin.Volume24h,
					MarkPrice:    coin.MarkPrice,
					PrevDayPrice: coin.PrevDayPrice,
					Change24hPct: coin.Change24hPct,
					MaxLeverage:  coin.MaxLeverage,
					SzDecimals:   coin.SzDecimals,
				})
			}
		}

		// Crypto perps are shown last; only include them on the combined Hyperliquid board.
		if exchangeLower == "hyperliquid" || exchangeLower == "hyperliquid-xyz" {
			coins, err := hyperliquid.GetProvider().GetAllCoins(ctx)
			if err != nil {
				SafeInternalError(c, "Get Hyperliquid symbols", err)
				return
			}
			for _, coin := range coins {
				symbols = append(symbols, SymbolInfo{
					Symbol:       coin.Symbol,
					Display:      coin.Symbol,
					Name:         coin.Symbol,
					Category:     "crypto",
					Exchange:     "hyperliquid",
					Volume24h:    coin.Volume24h,
					MarkPrice:    coin.MarkPrice,
					PrevDayPrice: coin.PrevDayPrice,
					Change24hPct: coin.Change24hPct,
					MaxLeverage:  coin.MaxLeverage,
					SzDecimals:   coin.SzDecimals,
				})
			}
		}

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported exchange for symbol listing"})
		return
	}

	sort.SliceStable(symbols, func(i, j int) bool {
		ci := hyperliquidCategoryOrder(symbols[i].Category)
		cj := hyperliquidCategoryOrder(symbols[j].Category)
		if ci != cj {
			return ci < cj
		}
		return symbols[i].Volume24h > symbols[j].Volume24h
	})

	c.JSON(http.StatusOK, gin.H{
		"exchange": exchange,
		"symbols":  symbols,
		"count":    len(symbols),
	})
}
