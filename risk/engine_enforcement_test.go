package risk

import (
	"strings"
	"testing"
	"time"

	"nofx/featureflag"
)

func TestEngine_Assess_BreachPausesTradingWithEnforcement(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("enforcement-test-trader", 1000.0, limits, nil, flags)

	engine.UpdateDailyPnL(-60.0)
	decision := engine.Assess(940.0)

	if !decision.Breached {
		t.Fatal("expected breach when daily loss exceeds limit")
	}
	if !decision.TradingPaused {
		t.Fatal("expected trading to be paused when enforcement is enabled")
	}
	if decision.PausedUntil.IsZero() {
		t.Fatal("expected non-zero PausedUntil deadline")
	}
	if decision.Reason == "" {
		t.Error("expected non-empty breach reason")
	}
	t.Logf("Breach detected with reason: %s", decision.Reason)
}

func TestEngine_Assess_NoBreachWhenWithinLimits(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("no-breach-trader", 1000.0, limits, nil, flags)

	engine.UpdateDailyPnL(-30.0)
	decision := engine.Assess(970.0)

	if decision.Breached {
		t.Errorf("expected no breach when within limits, got breach: %s", decision.Reason)
	}
	if decision.TradingPaused {
		t.Error("expected trading not paused when within limits")
	}
}

func TestEngine_Assess_EnforcementDisabled_NoPause(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: false,
		EnableMutexProtection: true,
	})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("enforcement-disabled-trader", 1000.0, limits, nil, flags)

	engine.UpdateDailyPnL(-100.0)
	decision := engine.Assess(900.0)

	if decision.TradingPaused {
		t.Error("expected no trading pause when enforcement is disabled, even with breach")
	}
}

func TestEngine_CheckLimits_DailyLossBreach(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
	})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("daily-loss-breach-trader", 1000.0, limits, nil, flags)

	state := State{
		DailyPnL:       -50.01,
		PeakBalance:    1000.0,
		CurrentBalance: 949.99,
		LastResetTime:  time.Now(),
	}

	breached, reason := engine.CheckLimits(state)
	if !breached {
		t.Error("expected breach when daily loss exceeds limit")
	}
	if reason == "" {
		t.Error("expected non-empty breach reason")
	}
	if !strings.Contains(reason, "daily pnl") {
		t.Errorf("expected 'daily pnl' in breach reason, got: %s", reason)
	}
}

func TestEngine_CheckLimits_DrawdownBreach(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
	})
	limits := Limits{
		MaxDailyLoss:       100.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("drawdown-breach-trader", 1000.0, limits, nil, flags)

	state := State{
		DailyPnL:       -50.0,
		PeakBalance:    1000.0,
		CurrentBalance: 795.0,
		LastResetTime:  time.Now(),
	}

	breached, reason := engine.CheckLimits(state)
	if !breached {
		t.Error("expected breach when drawdown exceeds 20%")
	}
	if !strings.Contains(reason, "drawdown") {
		t.Errorf("expected 'drawdown' in breach reason, got: %s", reason)
	}
}

func TestEngine_CheckLimits_RuntimeToggle(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: false,
	})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("toggle-enforcement-trader", 1000.0, limits, nil, flags)

	state := State{
		DailyPnL:       -100.0,
		PeakBalance:    1000.0,
		CurrentBalance: 900.0,
		LastResetTime:  time.Now(),
	}

	breached, _ := engine.CheckLimits(state)
	if breached {
		t.Error("expected no breach when enforcement is disabled")
	}

	flags.SetRiskEnforcement(true)

	breached, reason := engine.CheckLimits(state)
	if !breached {
		t.Error("expected breach after enabling enforcement")
	}
	if reason == "" {
		t.Error("expected breach reason after enabling enforcement")
	}
}

func TestEngine_PauseTrading_ResetsAfterDuration(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 1,
	}
	engine := NewEngineWithContext("pause-reset-trader", 1000.0, limits, nil, flags)

	pauseUntil := time.Now().Add(100 * time.Millisecond)
	engine.PauseTrading(pauseUntil)

	paused, until := engine.TradingStatus()
	if !paused {
		t.Fatal("expected trading to be paused immediately")
	}
	if until.IsZero() {
		t.Error("expected non-zero pause deadline")
	}

	time.Sleep(150 * time.Millisecond)

	paused, _ = engine.TradingStatus()
	if paused {
		t.Error("expected trading to resume automatically after pause duration")
	}
}

func TestEngine_ResumeTrading_ClearsPause(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        20.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("resume-trader", 1000.0, limits, nil, flags)

	pauseUntil := time.Now().Add(10 * time.Minute)
	engine.PauseTrading(pauseUntil)

	paused, _ := engine.TradingStatus()
	if !paused {
		t.Fatal("expected trading to be paused")
	}

	engine.ResumeTrading()

	paused, until := engine.TradingStatus()
	if paused {
		t.Error("expected trading to be resumed after ResumeTrading")
	}
	if !until.IsZero() {
		t.Error("expected zero pause deadline after ResumeTrading")
	}
}

func TestEngine_DrawdownCalculation_PeakTracking(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})
	limits := Limits{
		MaxDailyLoss:       100.0,
		MaxDrawdown:        15.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("drawdown-tracking-trader", 1000.0, limits, nil, flags)

	engine.RecordEquity(1000.0)
	snapshot1 := engine.Snapshot()
	if snapshot1.PeakEquity != 1000.0 {
		t.Errorf("expected PeakEquity 1000.0, got %.2f", snapshot1.PeakEquity)
	}

	engine.RecordEquity(1200.0)
	snapshot2 := engine.Snapshot()
	if snapshot2.PeakEquity != 1200.0 {
		t.Errorf("expected PeakEquity 1200.0, got %.2f", snapshot2.PeakEquity)
	}

	engine.RecordEquity(1020.0)
	snapshot3 := engine.Snapshot()
	if snapshot3.PeakEquity != 1200.0 {
		t.Errorf("expected PeakEquity to remain 1200.0, got %.2f", snapshot3.PeakEquity)
	}

	expectedDrawdown := (1200.0 - 1020.0) / 1200.0 * 100
	if snapshot3.DrawdownPct < expectedDrawdown-0.01 || snapshot3.DrawdownPct > expectedDrawdown+0.01 {
		t.Errorf("expected DrawdownPct %.2f%%, got %.2f%%", expectedDrawdown, snapshot3.DrawdownPct)
	}
}

func TestEngine_CombinedBreachReasons(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})
	limits := Limits{
		MaxDailyLoss:       50.0,
		MaxDrawdown:        10.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("combined-breach-trader", 1000.0, limits, nil, flags)

	engine.RecordEquity(1100.0)
	engine.UpdateDailyPnL(-60.0)
	decision := engine.Assess(890.0)

	if !decision.Breached {
		t.Fatal("expected breach when both limits are violated")
	}
	if !strings.Contains(decision.Reason, "daily pnl") {
		t.Errorf("expected 'daily pnl' in combined breach reason, got: %s", decision.Reason)
	}
	if !strings.Contains(decision.Reason, "drawdown") {
		t.Errorf("expected 'drawdown' in combined breach reason, got: %s", decision.Reason)
	}
}

func TestEngine_CalculateStopDuration(t *testing.T) {
	tests := []struct {
		name               string
		stopTradingMinutes int
		expectedDuration   time.Duration
	}{
		{"explicit 45 minutes", 45, 45 * time.Minute},
		{"explicit 10 minutes", 10, 10 * time.Minute},
		{"default when zero", 0, 30 * time.Minute},
		{"default when negative", -5, 30 * time.Minute},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			limits := Limits{
				MaxDailyLoss:       50.0,
				MaxDrawdown:        20.0,
				StopTradingMinutes: tt.stopTradingMinutes,
			}
			engine := NewEngine(limits)

			duration := engine.CalculateStopDuration()
			if duration != tt.expectedDuration {
				t.Errorf("expected stop duration %v, got %v", tt.expectedDuration, duration)
			}
		})
	}
}

func TestEngine_ResetDailyPnL_Timing(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})
	limits := Limits{
		MaxDailyLoss:       100.0,
		MaxDrawdown:        50.0,
		StopTradingMinutes: 30,
	}
	engine := NewEngineWithContext("reset-timing-trader", 1000.0, limits, nil, flags)

	engine.UpdateDailyPnL(-50.0)
	snapshot1 := engine.Snapshot()
	if snapshot1.DailyPnL != -50.0 {
		t.Errorf("expected DailyPnL -50.0, got %.2f", snapshot1.DailyPnL)
	}

	reset := engine.ResetDailyPnLIfNeeded()
	if reset {
		t.Error("expected no reset immediately after setting")
	}

	mockNow := time.Now().Add(25 * time.Hour)
	engine.SetNowFn(func() time.Time { return mockNow })

	reset = engine.ResetDailyPnLIfNeeded()
	if !reset {
		t.Error("expected reset after 24+ hours")
	}

	snapshot2 := engine.Snapshot()
	if snapshot2.DailyPnL != 0 {
		t.Errorf("expected DailyPnL 0 after reset, got %.2f", snapshot2.DailyPnL)
	}
}
