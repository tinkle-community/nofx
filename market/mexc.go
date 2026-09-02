package market

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const defaultMEXCBaseURL = "https://api.mexc.com"

// MEXCSymbol is the public market summary used by the symbol picker.
type MEXCSymbol struct {
	Symbol         string
	LastPrice      float64
	QuoteVolume    float64
	Change24hPct   float64
	BasePrecision  int
	QuotePrecision int
}

// MEXCClient reads public MEXC Spot V3 market data. It never signs requests or
// calls an order endpoint.
type MEXCClient struct {
	baseURL string
	client  *http.Client
}

func NewMEXCClient() *MEXCClient {
	return &MEXCClient{
		baseURL: defaultMEXCBaseURL,
		client:  &http.Client{Timeout: 15 * time.Second},
	}
}

func newMEXCClient(baseURL string, client *http.Client) *MEXCClient {
	return &MEXCClient{baseURL: strings.TrimRight(baseURL, "/"), client: client}
}

func (c *MEXCClient) get(ctx context.Context, path string, query url.Values, target interface{}) error {
	requestURL := c.baseURL + path
	if encoded := query.Encode(); encoded != "" {
		requestURL += "?" + encoded
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "NOFX-MEXC-Paper/1.0")

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("MEXC public API request failed: %w", err)
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 16<<20))
	if err != nil {
		return fmt.Errorf("read MEXC response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("MEXC public API returned HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	if err := json.Unmarshal(body, target); err != nil {
		return fmt.Errorf("decode MEXC response: %w", err)
	}
	return nil
}

func normalizeMEXCSymbol(symbol string) string {
	return strings.ToUpper(strings.NewReplacer("/", "", "-", "", "_", "").Replace(strings.TrimSpace(symbol)))
}

func (c *MEXCClient) GetCurrentPrice(ctx context.Context, symbol string) (float64, error) {
	var response struct {
		Symbol string `json:"symbol"`
		Price  string `json:"price"`
	}
	err := c.get(ctx, "/api/v3/ticker/price", url.Values{"symbol": {normalizeMEXCSymbol(symbol)}}, &response)
	if err != nil {
		return 0, err
	}
	price, err := strconv.ParseFloat(response.Price, 64)
	if err != nil || price <= 0 {
		return 0, fmt.Errorf("invalid MEXC price for %s: %q", symbol, response.Price)
	}
	return price, nil
}

func (c *MEXCClient) GetKlines(ctx context.Context, symbol, interval string, limit int) ([]Kline, error) {
	if limit <= 0 {
		limit = 100
	}
	if limit > 1000 {
		limit = 1000
	}
	apiInterval, aggregateFactor, err := normalizeMEXCInterval(interval)
	if err != nil {
		return nil, err
	}
	requestLimit := limit * aggregateFactor
	if aggregateFactor > 1 {
		// Fetch enough leading rows to discard an incomplete first bucket while
		// still returning the requested number of aligned aggregate candles.
		requestLimit += aggregateFactor - 1
	}
	if requestLimit > 1000 {
		requestLimit = 1000
	}
	var response [][]json.RawMessage
	err = c.get(ctx, "/api/v3/klines", url.Values{
		"symbol":   {normalizeMEXCSymbol(symbol)},
		"interval": {apiInterval},
		"limit":    {strconv.Itoa(requestLimit)},
	}, &response)
	if err != nil {
		return nil, err
	}

	klines := make([]Kline, 0, len(response))
	for _, row := range response {
		if len(row) < 8 {
			return nil, fmt.Errorf("invalid MEXC kline row: expected at least 8 fields, got %d", len(row))
		}
		openTime, err := rawInt64(row[0])
		if err != nil {
			return nil, fmt.Errorf("parse MEXC kline open time: %w", err)
		}
		open, err := rawFloat(row[1])
		if err != nil {
			return nil, fmt.Errorf("parse MEXC kline open: %w", err)
		}
		high, err := rawFloat(row[2])
		if err != nil {
			return nil, fmt.Errorf("parse MEXC kline high: %w", err)
		}
		low, err := rawFloat(row[3])
		if err != nil {
			return nil, fmt.Errorf("parse MEXC kline low: %w", err)
		}
		closePrice, err := rawFloat(row[4])
		if err != nil {
			return nil, fmt.Errorf("parse MEXC kline close: %w", err)
		}
		volume, err := rawFloat(row[5])
		if err != nil {
			return nil, fmt.Errorf("parse MEXC kline volume: %w", err)
		}
		closeTime, err := rawInt64(row[6])
		if err != nil {
			return nil, fmt.Errorf("parse MEXC kline close time: %w", err)
		}
		quoteVolume, _ := rawFloat(row[7])
		klines = append(klines, Kline{
			OpenTime:    openTime,
			Open:        open,
			High:        high,
			Low:         low,
			Close:       closePrice,
			Volume:      volume,
			CloseTime:   closeTime,
			QuoteVolume: quoteVolume,
		})
	}
	if aggregateFactor > 1 {
		klines = aggregateMEXCKlines(klines, aggregateFactor)
	}
	if len(klines) > limit {
		klines = klines[len(klines)-limit:]
	}
	return klines, nil
}

func normalizeMEXCInterval(interval string) (apiInterval string, aggregateFactor int, err error) {
	switch interval {
	case "1m", "5m", "15m", "30m", "60m", "4h", "1d", "1W", "1M":
		return interval, 1, nil
	case "3m":
		return "1m", 3, nil
	case "10m":
		return "5m", 2, nil
	case "1h":
		return "60m", 1, nil
	case "2h":
		return "60m", 2, nil
	case "6h":
		return "60m", 6, nil
	case "8h":
		return "4h", 2, nil
	case "12h":
		return "4h", 3, nil
	case "3d":
		return "1d", 3, nil
	case "1w":
		return "1W", 1, nil
	default:
		return "", 0, fmt.Errorf("unsupported MEXC interval: %s", interval)
	}
}

func aggregateMEXCKlines(source []Kline, factor int) []Kline {
	if factor <= 1 || len(source) == 0 {
		return source
	}
	sourceDuration := source[0].CloseTime - source[0].OpenTime
	if sourceDuration <= 0 {
		return source
	}
	targetDuration := sourceDuration * int64(factor)
	result := make([]Kline, 0, (len(source)+factor-1)/factor)
	for _, item := range source {
		bucketOpen := item.OpenTime / targetDuration * targetDuration
		if len(result) == 0 || result[len(result)-1].OpenTime != bucketOpen {
			item.OpenTime = bucketOpen
			result = append(result, item)
			continue
		}

		combined := &result[len(result)-1]
		combined.High = math.Max(combined.High, item.High)
		combined.Low = math.Min(combined.Low, item.Low)
		combined.Close = item.Close
		combined.CloseTime = item.CloseTime
		combined.Volume += item.Volume
		combined.QuoteVolume += item.QuoteVolume
		combined.Trades += item.Trades
		combined.TakerBuyBaseVolume += item.TakerBuyBaseVolume
		combined.TakerBuyQuoteVolume += item.TakerBuyQuoteVolume
	}
	return result
}

func (c *MEXCClient) GetSymbols(ctx context.Context) ([]MEXCSymbol, error) {
	var info struct {
		Symbols []struct {
			Symbol         string `json:"symbol"`
			Status         string `json:"status"`
			QuoteAsset     string `json:"quoteAsset"`
			BasePrecision  int    `json:"baseAssetPrecision"`
			QuotePrecision int    `json:"quoteAssetPrecision"`
		} `json:"symbols"`
	}
	if err := c.get(ctx, "/api/v3/exchangeInfo", nil, &info); err != nil {
		return nil, err
	}

	var tickers []struct {
		Symbol             string `json:"symbol"`
		LastPrice          string `json:"lastPrice"`
		QuoteVolume        string `json:"quoteVolume"`
		PriceChangePercent string `json:"priceChangePercent"`
	}
	if err := c.get(ctx, "/api/v3/ticker/24hr", nil, &tickers); err != nil {
		return nil, err
	}
	tickerBySymbol := make(map[string]struct {
		last, volume, change float64
	}, len(tickers))
	for _, ticker := range tickers {
		last, _ := strconv.ParseFloat(ticker.LastPrice, 64)
		volume, _ := strconv.ParseFloat(ticker.QuoteVolume, 64)
		change, _ := strconv.ParseFloat(ticker.PriceChangePercent, 64)
		tickerBySymbol[ticker.Symbol] = struct {
			last, volume, change float64
		}{last: last, volume: volume, change: change}
	}

	symbols := make([]MEXCSymbol, 0, len(info.Symbols))
	for _, item := range info.Symbols {
		if item.Status != "1" || item.QuoteAsset != "USDT" {
			continue
		}
		ticker, ok := tickerBySymbol[item.Symbol]
		if !ok || ticker.last <= 0 {
			continue
		}
		symbols = append(symbols, MEXCSymbol{
			Symbol:         item.Symbol,
			LastPrice:      ticker.last,
			QuoteVolume:    ticker.volume,
			Change24hPct:   ticker.change,
			BasePrecision:  item.BasePrecision,
			QuotePrecision: item.QuotePrecision,
		})
	}
	return symbols, nil
}

func GetMEXCPrice(symbol string) (float64, error) {
	return NewMEXCClient().GetCurrentPrice(context.Background(), symbol)
}

func GetMEXCKlines(symbol, interval string, limit int) ([]Kline, error) {
	return NewMEXCClient().GetKlines(context.Background(), symbol, interval, limit)
}

func GetMEXCSymbols() ([]MEXCSymbol, error) {
	return NewMEXCClient().GetSymbols(context.Background())
}

func rawFloat(raw json.RawMessage) (float64, error) {
	var value interface{}
	if err := json.Unmarshal(raw, &value); err != nil {
		return 0, err
	}
	switch typed := value.(type) {
	case string:
		return strconv.ParseFloat(typed, 64)
	case float64:
		return typed, nil
	default:
		return 0, fmt.Errorf("unsupported number type %T", value)
	}
}

func rawInt64(raw json.RawMessage) (int64, error) {
	value, err := rawFloat(raw)
	return int64(value), err
}
