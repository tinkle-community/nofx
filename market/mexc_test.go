package market

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestMEXCClientPublicMarketData(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/api/v3/ticker/price":
			if got := r.URL.Query().Get("symbol"); got != "BTCUSDT" {
				t.Fatalf("symbol = %q, want BTCUSDT", got)
			}
			_, _ = w.Write([]byte(`{"symbol":"BTCUSDT","price":"65000.25"}`))
		case "/api/v3/klines":
			switch r.URL.Query().Get("interval") {
			case "1m":
				if got := r.URL.Query().Get("limit"); got != "5" {
					t.Fatalf("1m limit = %q, want 5", got)
				}
				_, _ = w.Write([]byte(`[[0,"10","12","9","11","1",60000,"11"],[60000,"11","14","10","12","2",120000,"24"],[120000,"12","13","8","13","3",180000,"39"]]`))
			case "60m":
				_, _ = w.Write([]byte(`[[0,"10","12","9","11","3",3600000,"33"]]`))
			default:
				t.Fatalf("unexpected MEXC interval %q", r.URL.Query().Get("interval"))
			}
		case "/api/v3/exchangeInfo":
			_, _ = w.Write([]byte(`{"symbols":[{"symbol":"BTCUSDT","status":"1","quoteAsset":"USDT","baseAssetPrecision":8,"quoteAssetPrecision":2},{"symbol":"OFFUSDT","status":"0","quoteAsset":"USDT"},{"symbol":"BTCUSDC","status":"1","quoteAsset":"USDC"}]}`))
		case "/api/v3/ticker/24hr":
			_, _ = w.Write([]byte(`[{"symbol":"BTCUSDT","lastPrice":"65000.25","quoteVolume":"1234567.8","priceChangePercent":"2.5"}]`))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	client := newMEXCClient(server.URL, server.Client())
	price, err := client.GetCurrentPrice(context.Background(), "btc/usdt")
	if err != nil || price != 65000.25 {
		t.Fatalf("GetCurrentPrice = %v, %v", price, err)
	}

	klines, err := client.GetKlines(context.Background(), "BTC-USDT", "3m", 1)
	if err != nil {
		t.Fatalf("GetKlines: %v", err)
	}
	if len(klines) != 1 || klines[0].OpenTime != 0 || klines[0].CloseTime != 180000 || klines[0].Open != 10 || klines[0].High != 14 || klines[0].Low != 8 || klines[0].Close != 13 || klines[0].Volume != 6 || klines[0].QuoteVolume != 74 {
		t.Fatalf("unexpected klines: %+v", klines)
	}
	if _, err := client.GetKlines(context.Background(), "BTCUSDT", "1h", 1); err != nil {
		t.Fatalf("GetKlines 1h mapping: %v", err)
	}

	symbols, err := client.GetSymbols(context.Background())
	if err != nil {
		t.Fatalf("GetSymbols: %v", err)
	}
	if len(symbols) != 1 || symbols[0].Symbol != "BTCUSDT" || symbols[0].Change24hPct != 2.5 {
		t.Fatalf("unexpected symbols: %+v", symbols)
	}
}
