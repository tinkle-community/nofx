package risk

import (
	"testing"
	"time"

	"nofx/featureflag"
)

func TestCheckLimits_DailyLoss(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("test-trader", 1000.0, limits, nil, flags)

	state := State{
		DailyPnL:       -50.0,
		PeakBalance:    1000.0,
		CurrentBalance: 950.0,
		LastResetTime:  time.Now(),
	}

	breached, reason := engine.CheckLimits(state)
	if !breached {
		t.Errorf("expected breach for daily loss of -50 (limit -50), got no breach")
	}
	if reason == "" {
		t.Errorf("expected non-empty reason for breach")
	}
	t.Logf("Breach reason: %s", reason)
}

func TestCheckLimits_Drawdown(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("test-trader", 1000.0, limits, nil, flags)

	state := State{
		DailyPnL:       -10.0,
		PeakBalance:    1000.0,
		CurrentBalance: 800.0,
		LastResetTime:  time.Now(),
	}

	breached, reason := engine.CheckLimits(state)
	if !breached {
		t.Errorf("expected breach for 20%% drawdown (limit 20%%), got no breach")
	}
	if reason == "" {
		t.Errorf("expected non-empty reason for breach")
	}
	t.Logf("Breach reason: %s", reason)
}

func TestCheckLimits_NoBreach(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("test-trader", 1000.0, limits, nil, flags)

	state := State{
		DailyPnL:       -30.0,
		PeakBalance:    1000.0,
		CurrentBalance: 970.0,
		LastResetTime:  time.Now(),
	}

	breached, reason := engine.CheckLimits(state)
	if breached {
		t.Errorf("expected no breach for state within limits, got breach: %s", reason)
	}
}

func TestCheckLimits_EnforcementDisabled(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: false})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("test-trader", 1000.0, limits, nil, flags)

	state := State{
		DailyPnL:       -100.0,
		PeakBalance:    1000.0,
		CurrentBalance: 500.0,
		LastResetTime:  time.Now(),
	}

	breached, reason := engine.CheckLimits(state)
	if breached {
		t.Errorf("expected no breach when enforcement is disabled, got breach: %s", reason)
	}
}

func TestCalculateStopDuration(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 45,
	}
	engine := NewEngineWithContext("test-trader", 1000.0, limits, nil, flags)

	duration := engine.CalculateStopDuration()
	expected := 45 * time.Minute
	if duration != expected {
		t.Errorf("expected stop duration %v, got %v", expected, duration)
	}
}

func TestCalculateStopDuration_DefaultValue(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 0,
	}
	engine := NewEngineWithContext("test-trader", 1000.0, limits, nil, flags)

	duration := engine.CalculateStopDuration()
	expected := 30 * time.Minute
	if duration != expected {
		t.Errorf("expected default stop duration %v, got %v", expected, duration)
	}
}

func TestParametersToLimitsConversion(t *testing.T) {
	params := Parameters{
		MaxDailyLossPct: 5.0,
		MaxDrawdownPct:  20.0,
		StopTradingFor:  45 * time.Minute,
	}
	initialBalance := 1000.0

	limits := parametersToLimits(params, initialBalance)

	if limits.MaxDailyLoss != 50.0 {
		t.Errorf("expected max daily loss 50.0, got %.2f", limits.MaxDailyLoss)
	}
	if limits.MaxDrawdown != 20.0 {
		t.Errorf("expected max drawdown 20.0, got %.2f", limits.MaxDrawdown)
	}
	if limits.StopTradingMinutes != 45 {
		t.Errorf("expected stop trading minutes 45, got %d", limits.StopTradingMinutes)
	}
}

func TestLimitsToParametersConversion(t *testing.T) {
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 45,
	}
	initialBalance := 1000.0

	params := limitsToParameters(limits, initialBalance)

	if params.MaxDailyLossPct != 5.0 {
		t.Errorf("expected max daily loss pct 5.0, got %.2f", params.MaxDailyLossPct)
	}
	if params.MaxDrawdownPct != 20.0 {
		t.Errorf("expected max drawdown pct 20.0, got %.2f", params.MaxDrawdownPct)
	}
	if params.StopTradingFor != 45*time.Minute {
		t.Errorf("expected stop trading for 45m, got %v", params.StopTradingFor)
	}
}

func TestNewEngine_PublicContract(t *testing.T) {
	limits := Limits{
		MaxDailyLoss:       100.0,
		MaxDrawdown:        30.0,
		StopTradingMinutes: 60,
	}
	engine := NewEngine(limits)

	if engine == nil {
		t.Fatal("expected non-nil engine")
	}

	returnedLimits := engine.Limits()
	if returnedLimits.MaxDailyLoss != limits.MaxDailyLoss {
		t.Errorf("expected MaxDailyLoss %.2f, got %.2f", limits.MaxDailyLoss, returnedLimits.MaxDailyLoss)
	}
	if returnedLimits.MaxDrawdown != limits.MaxDrawdown {
		t.Errorf("expected MaxDrawdown %.2f, got %.2f", limits.MaxDrawdown, returnedLimits.MaxDrawdown)
	}
	if returnedLimits.StopTradingMinutes != limits.StopTradingMinutes {
		t.Errorf("expected StopTradingMinutes %d, got %d", limits.StopTradingMinutes, returnedLimits.StopTradingMinutes)
	}
}

func TestUpdateLimits(t *testing.T) {
	initialLimits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngine(initialLimits)

	newLimits := Limits{
		MaxDailyLoss:       100.0,
		MaxDrawdown:        40.0,
		StopTradingMinutes: 60,
	}
	engine.UpdateLimits(newLimits)

	returnedLimits := engine.Limits()
	if returnedLimits.MaxDailyLoss != newLimits.MaxDailyLoss {
		t.Errorf("expected MaxDailyLoss %.2f after update, got %.2f", newLimits.MaxDailyLoss, returnedLimits.MaxDailyLoss)
	}
	if returnedLimits.MaxDrawdown != newLimits.MaxDrawdown {
		t.Errorf("expected MaxDrawdown %.2f after update, got %.2f", newLimits.MaxDrawdown, returnedLimits.MaxDrawdown)
	}
	if returnedLimits.StopTradingMinutes != newLimits.StopTradingMinutes {
		t.Errorf("expected StopTradingMinutes %d after update, got %d", newLimits.StopTradingMinutes, returnedLimits.StopTradingMinutes)
	}
}
