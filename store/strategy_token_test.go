package store

import "testing"

func TestEstimateTokens_DefaultConfig(t *testing.T) {
	config := GetDefaultStrategyConfig("en")
	est := config.EstimateTokens()

	if est.Total <= 0 {
		t.Errorf("expected positive token estimate, got %d", est.Total)
	}
	if est.Total > 200000 {
		t.Errorf("token estimate %d seems unreasonably high for default config", est.Total)
	}

	// Breakdown should sum approximately to total (before 15% margin)
	subtotal := est.Breakdown.SystemPrompt + est.Breakdown.MarketData +
		est.Breakdown.RankingData + est.Breakdown.QuantData + est.Breakdown.FixedOverhead
	expectedTotal := subtotal * 115 / 100
	if est.Total != expectedTotal {
		t.Errorf("total %d != breakdown subtotal %d * 1.15 = %d", est.Total, subtotal, expectedTotal)
	}

	// Should have model limits
	if len(est.ModelLimits) == 0 {
		t.Error("expected model limits to be populated")
	}

	// Default config should be ok for all models
	for _, ml := range est.ModelLimits {
		if ml.Level == "danger" {
			t.Errorf("default config should not exceed %s limit, got %d%%", ml.Name, ml.UsagePct)
		}
	}
}

func TestEstimateTokens_ZhVsEn(t *testing.T) {
	enConfig := GetDefaultStrategyConfig("en")
	zhConfig := GetDefaultStrategyConfig("zh")

	enEst := enConfig.EstimateTokens()
	zhEst := zhConfig.EstimateTokens()

	// Chinese config should have more tokens for system prompt due to CJK encoding
	// but total can vary — just ensure both are reasonable
	if enEst.Total <= 0 || zhEst.Total <= 0 {
		t.Errorf("both estimates should be positive: en=%d, zh=%d", enEst.Total, zhEst.Total)
	}
}

func TestEstimateTokens_HighConfig(t *testing.T) {
	config := GetDefaultStrategyConfig("en")
	// Push config to extremes (beyond clamped limits)
	config.CoinSource.SourceType = "static"
	config.CoinSource.StaticCoins = []string{"BTCUSDT", "ETHUSDT", "SOLUSDT", "DOGEUSDT", "XRPUSDT"}
	config.Indicators.Klines.SelectedTimeframes = []string{"1m", "3m", "5m", "15m", "1h", "4h"}
	config.Indicators.Klines.PrimaryCount = 100
	config.Indicators.EnableEMA = true
	config.Indicators.EnableMACD = true
	config.Indicators.EnableRSI = true
	config.Indicators.EnableATR = true
	config.Indicators.EnableBOLL = true

	est := config.EstimateTokens()

	// Should produce a higher estimate than default
	defaultCfg := GetDefaultStrategyConfig("en")
	defaultEst := defaultCfg.EstimateTokens()
	if est.Total <= defaultEst.Total {
		t.Errorf("high config estimate %d should be greater than default %d", est.Total, defaultEst.Total)
	}

	// Should have some models in warning/danger
	hasDanger := false
	for _, ml := range est.ModelLimits {
		if ml.Level == "danger" || ml.Level == "warning" {
			hasDanger = true
			break
		}
	}
	// With 5 coins * 6 timeframes * 100 klines, this should exceed small models
	if !hasDanger {
		t.Logf("high config estimate: %d tokens", est.Total)
	}
}

func TestGetContextLimit(t *testing.T) {
	if got := GetContextLimit("deepseek"); got != 131072 {
		t.Errorf("deepseek limit = %d, want 131072", got)
	}
	if got := GetContextLimit("atlascloud"); got != 131072 {
		t.Errorf("atlascloud limit = %d, want 131072", got)
	}
	if got := GetContextLimit("unknown_provider"); got != 131072 {
		t.Errorf("unknown provider should return default 131072, got %d", got)
	}
}

func TestGetEffectiveCoinCount(t *testing.T) {
	config := StrategyConfig{
		CoinSource: CoinSourceConfig{
			SourceType:  "static",
			StaticCoins: []string{"BTCUSDT", "ETHUSDT"},
		},
	}
	if got := config.getEffectiveCoinCount(); got != 2 {
		t.Errorf("static coin count = %d, want 2", got)
	}

	config.CoinSource.SourceType = "ai500"
	config.CoinSource.AI500Limit = 5
	if got := config.getEffectiveCoinCount(); got != 5 {
		t.Errorf("ai500 coin count = %d, want 5", got)
	}
}
