package pool

import (
	"testing"
)

func TestNormalizeSymbolToOKX(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Binance format BTCUSDT",
			input:    "BTCUSDT",
			expected: "BTC-USDT-SWAP",
		},
		{
			name:     "Binance format ETHUSDT",
			input:    "ETHUSDT",
			expected: "ETH-USDT-SWAP",
		},
		{
			name:     "Lowercase btcusdt",
			input:    "btcusdt",
			expected: "BTC-USDT-SWAP",
		},
		{
			name:     "Already OKX SWAP format",
			input:    "BTC-USDT-SWAP",
			expected: "BTC-USDT-SWAP",
		},
		{
			name:     "Symbol without USDT",
			input:    "BTC",
			expected: "BTC-USDT-SWAP",
		},
		{
			name:     "Multi-letter coin SOLUSDT",
			input:    "SOLUSDT",
			expected: "SOL-USDT-SWAP",
		},
		{
			name:     "XXX-USDT format PENGU-USDT (fix double dash bug)",
			input:    "PENGU-USDT",
			expected: "PENGU-USDT-SWAP",
		},
		{
			name:     "XXX-USDT format BTC-USDT",
			input:    "BTC-USDT",
			expected: "BTC-USDT-SWAP",
		},
		{
			name:     "XXX-USDT format lowercase doge-usdt",
			input:    "doge-usdt",
			expected: "DOGE-USDT-SWAP",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := normalizeSymbolToOKX(tt.input)
			if result != tt.expected {
				t.Errorf("normalizeSymbolToOKX(%q) = %q, expected %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestConvertSymbolsToCoins(t *testing.T) {
	input := []string{"BTCUSDT", "ETHUSDT", "btc", "SOL-USDT-SWAP"}
	expected := []string{"BTC-USDT-SWAP", "ETH-USDT-SWAP", "BTC-USDT-SWAP", "SOL-USDT-SWAP"}

	coins := convertSymbolsToCoins(input)

	if len(coins) != len(expected) {
		t.Fatalf("Expected %d coins, got %d", len(expected), len(coins))
	}

	for i, coin := range coins {
		if coin.Pair != expected[i] {
			t.Errorf("coins[%d].Pair = %q, expected %q", i, coin.Pair, expected[i])
		}
		if !coin.IsAvailable {
			t.Errorf("coins[%d].IsAvailable = false, expected true", i)
		}
	}
}
