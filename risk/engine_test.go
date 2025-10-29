package risk

import (
	"strings"
	"testing"
	"time"
)

func TestEngineCheckLimitsWithinBounds(t *testing.T) {
	engine := NewEngine("trader", Limits{MaxDailyLoss: 100, MaxDrawdown: 25, StopTradingMinutes: 15}, nil)
	state := State{DailyPnL: -50, PeakBalance: 2000, CurrentBalance: 1850}

	ok, reason := engine.CheckLimits(state)
	if !ok {
		t.Fatalf("expected trading to be allowed, got reason: %s", reason)
	}
	if reason != "" {
		t.Fatalf("expected empty reason when within limits, got %s", reason)
	}
}

func TestEngineCheckLimitsDailyLoss(t *testing.T) {
	engine := NewEngine("trader", Limits{MaxDailyLoss: 100, MaxDrawdown: 50, StopTradingMinutes: 30}, nil)
	state := State{DailyPnL: -150}

	ok, reason := engine.CheckLimits(state)
	if ok {
		t.Fatal("expected trading to be halted due to daily loss limit")
	}
	if !strings.Contains(reason, "daily pnl") {
		t.Fatalf("expected reason to mention daily pnl, got %s", reason)
	}
}

func TestEngineCheckLimitsDrawdown(t *testing.T) {
	engine := NewEngine("trader", Limits{MaxDailyLoss: 200, MaxDrawdown: 10, StopTradingMinutes: 45}, nil)
	state := State{DailyPnL: -50, PeakBalance: 1000, CurrentBalance: 850}

	ok, reason := engine.CheckLimits(state)
	if ok {
		t.Fatal("expected trading to halt due to drawdown")
	}
	if !strings.Contains(reason, "drawdown") {
		t.Fatalf("expected drawdown in reason, got %s", reason)
	}
}

func TestEngineCalculateStopDuration(t *testing.T) {
	engine := NewEngine("trader", Limits{StopTradingMinutes: 0}, nil)
	if duration := engine.CalculateStopDuration(); duration != 30*time.Minute {
		t.Fatalf("expected default stop duration 30m, got %v", duration)
	}

	engine.UpdateLimits(Limits{StopTradingMinutes: 5})
	if duration := engine.CalculateStopDuration(); duration != 5*time.Minute {
		t.Fatalf("expected updated stop duration 5m, got %v", duration)
	}
}
