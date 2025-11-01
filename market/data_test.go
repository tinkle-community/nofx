package market

import (
	"testing"
)

func TestNormalize(t *testing.T) {
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
			name:     "Binance format lowercase btcusdt",
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
			name:     "XXX-USDT format PEPE-USDT (fix double dash bug)",
			input:    "PEPE-USDT",
			expected: "PEPE-USDT-SWAP",
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
			result := Normalize(tt.input)
			if result != tt.expected {
				t.Errorf("Normalize(%q) = %q, expected %q", tt.input, result, tt.expected)
			}
		})
	}
}
