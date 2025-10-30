package risk

import (
	"testing"
	"time"
)

func TestNormalizeLimits(t *testing.T) {
	input := Limits{MaxDailyLoss: -10, MaxDrawdown: -5, StopTradingMinutes: 0}
	normalized := normalizeLimits(input)

	if normalized.MaxDailyLoss != 0 {
		t.Fatalf("expected MaxDailyLoss normalized to 0, got %v", normalized.MaxDailyLoss)
	}
	if normalized.MaxDrawdown != 0 {
		t.Fatalf("expected MaxDrawdown normalized to 0, got %v", normalized.MaxDrawdown)
	}
	if normalized.StopTradingMinutes != 30 {
		t.Fatalf("expected StopTradingMinutes default to 30, got %d", normalized.StopTradingMinutes)
	}
}

func TestSetNowFnOverridesAndResets(t *testing.T) {
	engine := NewEngine(Limits{})

	frozen := time.Unix(1700000000, 0)
	engine.SetNowFn(func() time.Time { return frozen })
	if got := engine.now(); !got.Equal(frozen) {
		t.Fatalf("expected custom now value, got %v", got)
	}

	engine.SetNowFn(nil)
	if got := engine.now(); got.Equal(frozen) {
		t.Fatalf("expected now() to reset away from frozen time")
	}
}

func TestNewEngineWithParametersConvertsLegacyValues(t *testing.T) {
	params := Parameters{
		MaxDailyLossPct: 5,
		MaxDrawdownPct:  18,
		StopTradingFor:  45 * time.Minute,
	}

	engine := NewEngineWithParameters("trader-1", 2000, params, nil, nil)
	limits := engine.Limits()

	if limits.MaxDailyLoss != 100 {
		t.Fatalf("expected MaxDailyLoss 100, got %.2f", limits.MaxDailyLoss)
	}
	if limits.MaxDrawdown != 18 {
		t.Fatalf("expected MaxDrawdown 18, got %.2f", limits.MaxDrawdown)
	}
	if limits.StopTradingMinutes != 45 {
		t.Fatalf("expected StopTradingMinutes 45, got %d", limits.StopTradingMinutes)
	}

	roundTrip := engine.Parameters()
	if roundTrip.MaxDailyLossPct != params.MaxDailyLossPct {
		t.Fatalf("round-trip daily loss mismatch: got %.2f want %.2f", roundTrip.MaxDailyLossPct, params.MaxDailyLossPct)
	}
	if roundTrip.MaxDrawdownPct != params.MaxDrawdownPct {
		t.Fatalf("round-trip drawdown mismatch: got %.2f want %.2f", roundTrip.MaxDrawdownPct, params.MaxDrawdownPct)
	}
	if roundTrip.StopTradingFor != params.StopTradingFor {
		t.Fatalf("round-trip stop duration mismatch: got %v want %v", roundTrip.StopTradingFor, params.StopTradingFor)
	}
}

func TestUpdateParametersAdjustsLimits(t *testing.T) {
	engine := NewEngineWithContext("trader-2", 1000, Limits{MaxDailyLoss: 100, MaxDrawdown: 25, StopTradingMinutes: 60}, nil, nil)

	update := Parameters{
		MaxDailyLossPct: 15,
		MaxDrawdownPct:  40,
		StopTradingFor:  12 * time.Minute,
	}
	engine.UpdateParameters(update)

	limits := engine.Limits()
	if limits.MaxDailyLoss != 150 {
		t.Fatalf("expected MaxDailyLoss 150, got %.2f", limits.MaxDailyLoss)
	}
	if limits.MaxDrawdown != 40 {
		t.Fatalf("expected MaxDrawdown 40, got %.2f", limits.MaxDrawdown)
	}
	if limits.StopTradingMinutes != 12 {
		t.Fatalf("expected StopTradingMinutes 12, got %d", limits.StopTradingMinutes)
	}
}

func TestUpdateParametersDefaultStopDuration(t *testing.T) {
	engine := NewEngineWithContext("trader-3", 500, Limits{}, nil, nil)
	engine.UpdateParameters(Parameters{MaxDailyLossPct: 2})

	limits := engine.Limits()
	if limits.MaxDailyLoss != 10 {
		t.Fatalf("expected MaxDailyLoss 10, got %.2f", limits.MaxDailyLoss)
	}
	if limits.StopTradingMinutes != 30 {
		t.Fatalf("expected StopTradingMinutes default to 30, got %d", limits.StopTradingMinutes)
	}
}

func TestCalculateStopDurationDefaults(t *testing.T) {
	engine := NewEngineWithContext("trader-4", 0, Limits{StopTradingMinutes: 5}, nil, nil)
	if got := engine.CalculateStopDuration(); got != 5*time.Minute {
		t.Fatalf("expected 5m, got %v", got)
	}

	engine.UpdateLimits(Limits{})
	if got := engine.CalculateStopDuration(); got != 30*time.Minute {
		t.Fatalf("expected default 30m, got %v", got)
	}
}

func TestAllowedDailyLossReflectsLimits(t *testing.T) {
	engine := NewEngineWithContext("trader-5", 0, Limits{MaxDailyLoss: 42}, nil, nil)
	if got := engine.allowedDailyLoss(); got != 42 {
		t.Fatalf("expected allowed loss 42, got %.2f", got)
	}

	engine.UpdateLimits(Limits{MaxDailyLoss: -1})
	if got := engine.allowedDailyLoss(); got != 0 {
		t.Fatalf("negative limits should normalize to 0, got %.2f", got)
	}
}
