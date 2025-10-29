package risk

import (
	"fmt"
	"strings"
	"sync/atomic"
	"time"

	"nofx/featureflag"
	"nofx/metrics"
)

// Limits defines the guard rails enforced by the risk engine.
type Limits struct {
	MaxDailyLoss       float64
	MaxDrawdown        float64
	StopTradingMinutes int
}

// State captures the input required to assess risk limits.
type State struct {
	DailyPnL       float64
	PeakBalance    float64
	CurrentBalance float64
	LastResetTime  time.Time
}

// Engine evaluates risk state for a trader and returns breach decisions.
type Engine struct {
	traderID string
	limits   atomic.Value // Limits
	flags    *featureflag.RuntimeFlags
	nowFn    atomic.Pointer[func() time.Time]
}

// NewEngine wires a risk engine for the provided trader identifier.
func NewEngine(traderID string, limits Limits, flags *featureflag.RuntimeFlags) *Engine {
	if flags == nil {
		flags = featureflag.NewRuntimeFlags(featureflag.State{})
	}

	e := &Engine{
		traderID: traderID,
		flags:    flags,
	}
	e.limits.Store(normalizeLimits(limits))
	now := time.Now
	e.nowFn.Store(&now)
	return e
}

// SetNowFn overrides the time provider (useful for deterministic tests).
func (e *Engine) SetNowFn(fn func() time.Time) {
	if fn == nil {
		now := time.Now
		e.nowFn.Store(&now)
		return
	}
	e.nowFn.Store(&fn)
}

func (e *Engine) now() time.Time {
	if ptr := e.nowFn.Load(); ptr != nil {
		return (*ptr)()
	}
	return time.Now()
}

// UpdateLimits swaps the enforced limits at runtime.
func (e *Engine) UpdateLimits(l Limits) {
	if e == nil {
		return
	}
	e.limits.Store(normalizeLimits(l))
}

// Limits exposes the currently enforced guard rails.
func (e *Engine) Limits() Limits {
	if e == nil {
		return Limits{}
	}
	if value := e.limits.Load(); value != nil {
		return value.(Limits)
	}
	return Limits{}
}

// CheckLimits evaluates the supplied risk state against the configured limits.
// It returns true when trading may continue alongside an optional explanatory
// string when limits are breached.
func (e *Engine) CheckLimits(state State) (bool, string) {
	if e == nil {
		return true, ""
	}

	start := e.now()
	limits := e.Limits()
	var reasons []string

	if limits.MaxDailyLoss > 0 && state.DailyPnL <= -limits.MaxDailyLoss {
		reasons = append(reasons, fmt.Sprintf("daily pnl %.2f below limit %.2f", state.DailyPnL, -limits.MaxDailyLoss))
	}

	if limits.MaxDrawdown > 0 && state.PeakBalance > 0 {
		drawdown := (state.PeakBalance - state.CurrentBalance) / state.PeakBalance * 100
		if drawdown < 0 {
			drawdown = 0
		}
		if drawdown >= limits.MaxDrawdown {
			reasons = append(reasons, fmt.Sprintf("drawdown %.2f%% exceeds limit %.2f%%", drawdown, limits.MaxDrawdown))
		}
		if e.traderID != "" {
			metrics.ObserveRiskDrawdown(e.traderID, drawdown)
		}
	}

	defer metrics.ObserveRiskCheckLatency(e.traderID, e.now().Sub(start))

	if len(reasons) == 0 {
		return true, ""
	}

	return false, strings.Join(reasons, "; ")
}

// CalculateStopDuration converts the configured stop minutes into a duration.
func (e *Engine) CalculateStopDuration() time.Duration {
	if e == nil {
		return 0
	}
	limits := e.Limits()
	if limits.StopTradingMinutes <= 0 {
		return 0
	}
	return time.Duration(limits.StopTradingMinutes) * time.Minute
}

func normalizeLimits(l Limits) Limits {
	if l.MaxDailyLoss < 0 {
		l.MaxDailyLoss = 0
	}
	if l.MaxDrawdown < 0 {
		l.MaxDrawdown = 0
	}
	if l.StopTradingMinutes <= 0 {
		l.StopTradingMinutes = 30
	}
	return l
}
