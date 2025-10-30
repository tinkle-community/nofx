package risk

import (
	"fmt"
	"sync/atomic"
	"time"

	"nofx/featureflag"
	"nofx/metrics"
)

// Engine evaluates risk state for a trader and coordinates pause/resume logic.
type Engine struct {
	traderID       string
	initialBalance float64
	store          *Store
	flags          *featureflag.RuntimeFlags
	limits         atomic.Value // Limits
	nowFn          atomic.Pointer[func() time.Time]
}

// NewEngine constructs a risk engine using the public Limits contract. The
// engine starts with default in-memory store/runtime flags. Callers wiring the
// trading stack should prefer NewEngineWithContext to supply trader metadata,
// shared stores, and feature flag handles.
func NewEngine(l Limits) *Engine {
	store := NewStore()
	flags := featureflag.NewRuntimeFlags(featureflag.DefaultState())

	e := &Engine{
		store: store,
		flags: flags,
	}
	e.limits.Store(normalizeLimits(l))
	now := time.Now
	e.nowFn.Store(&now)
	return e
}

// NewEngineWithContext wires a risk engine for a trader while honouring the
// public Limits contract. store/flags may be shared across traders; nil inputs
// fall back to internal defaults.
func NewEngineWithContext(traderID string, initialBalance float64, limits Limits, store *Store, flags *featureflag.RuntimeFlags) *Engine {
	if store == nil {
		store = NewStore()
	}
	if flags == nil {
		flags = featureflag.NewRuntimeFlags(featureflag.DefaultState())
	}

	e := &Engine{
		traderID:       traderID,
		initialBalance: initialBalance,
		store:          store,
		flags:          flags,
	}
	e.limits.Store(normalizeLimits(limits))
	now := time.Now
	e.nowFn.Store(&now)
	return e
}

// NewEngineWithParameters adapts the legacy Parameters contract onto the new
// public interface.
//
// Deprecated: Use NewEngineWithContext with Limits instead.
func NewEngineWithParameters(traderID string, initialBalance float64, params Parameters, store *Store, flags *featureflag.RuntimeFlags) *Engine {
	limits := parametersToLimits(params, initialBalance)
	return NewEngineWithContext(traderID, initialBalance, limits, store, flags)
}

// normalizeLimits guarantees sane guard-rail defaults.
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

// SetNowFn overrides the time provider (useful for tests).
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

// Limits returns the current guard rails using the public contract.
func (e *Engine) Limits() Limits {
	if e == nil {
		return Limits{}
	}
	value, _ := e.limits.Load().(Limits)
	return value
}

// UpdateLimits swaps the guard rails at runtime using the public contract.
func (e *Engine) UpdateLimits(l Limits) {
	if e == nil {
		return
	}
	e.limits.Store(normalizeLimits(l))
}

// Parameters exposes the legacy contract for backwards compatibility.
//
// Deprecated: Use Limits instead.
func (e *Engine) Parameters() Parameters {
	limits := e.Limits()
	return limitsToParameters(limits, e.initialBalance)
}

// UpdateParameters adapts the legacy contract onto the new API.
//
// Deprecated: Use UpdateLimits instead.
func (e *Engine) UpdateParameters(p Parameters) {
	limits := parametersToLimits(p, e.initialBalance)
	e.UpdateLimits(limits)
}

// Snapshot exposes the latest risk state.
func (e *Engine) Snapshot() Snapshot {
	return e.store.Snapshot(e.traderID, e.flags)
}

// UpdateDailyPnL updates the tracked daily PnL and returns the new value.
func (e *Engine) UpdateDailyPnL(delta float64) float64 {
	return e.store.UpdateDailyPnL(e.traderID, delta, e.flags, e.now())
}

// ResetDailyPnLIfNeeded resets the daily PnL if a 24h window elapsed.
func (e *Engine) ResetDailyPnLIfNeeded() bool {
	return e.store.ResetDailyPnLIfNeeded(e.traderID, e.now(), e.flags)
}

// RecordEquity updates the stored equity snapshot.
func (e *Engine) RecordEquity(equity float64) float64 {
	return e.store.RecordEquity(e.traderID, equity, e.flags, e.now())
}

// TradingStatus reports whether trading is paused alongside the deadline.
func (e *Engine) TradingStatus() (bool, time.Time) {
	return e.store.TradingStatus(e.traderID, e.now(), e.flags)
}

// PauseTrading marks trading as paused until the provided deadline while
// emitting metrics and persisting the snapshot.
func (e *Engine) PauseTrading(until time.Time) Snapshot {
	return e.store.SetTradingPaused(e.traderID, true, until, e.flags)
}

// ResumeTrading clears any trading pause and updates metrics.
func (e *Engine) ResumeTrading() Snapshot {
	return e.store.SetTradingPaused(e.traderID, false, time.Time{}, e.flags)
}

func (e *Engine) allowedDailyLoss() float64 {
	limits := e.Limits()
	if limits.MaxDailyLoss <= 0 {
		return 0
	}
	return limits.MaxDailyLoss
}

// Assess evaluates the current risk state using the latest equity snapshot.
func (e *Engine) Assess(equity float64) Decision {
	start := e.now()
	limits := e.Limits()

	drawdown := e.store.RecordEquity(e.traderID, equity, e.flags, start)
	snapshot := e.store.Snapshot(e.traderID, e.flags)

	decision := Decision{
		DrawdownPct: snapshot.DrawdownPct,
		DailyPnL:    snapshot.DailyPnL,
	}

	paused, pausedUntil := e.store.TradingStatus(e.traderID, start, e.flags)
	decision.TradingPaused = paused
	decision.PausedUntil = pausedUntil

	// If we are already paused and the window has not elapsed, skip re-evaluation.
	if paused && (pausedUntil.IsZero() || start.Before(pausedUntil)) {
		metrics.ObserveRiskCheckLatency(e.traderID, time.Since(start))
		return decision
	}

	allowedLoss := e.allowedDailyLoss()
	if allowedLoss > 0 && snapshot.DailyPnL <= -allowedLoss {
		decision.Breached = true
		decision.Reason = fmt.Sprintf("daily pnl %.2f <= limit -%.2f", snapshot.DailyPnL, allowedLoss)
	}

	if limits.MaxDrawdown > 0 && drawdown >= limits.MaxDrawdown {
		decision.Breached = true
		if decision.Reason != "" {
			decision.Reason += "; "
		}
		decision.Reason += fmt.Sprintf("drawdown %.2f >= limit %.2f", drawdown, limits.MaxDrawdown)
	}

	if decision.Breached && e.flags.RiskEnforcementEnabled() {
		pausedUntil = start.Add(e.CalculateStopDuration())
		snap := e.store.SetTradingPaused(e.traderID, true, pausedUntil, e.flags)
		decision.TradingPaused = snap.TradingPaused
		decision.PausedUntil = snap.PausedUntil
		metrics.IncRiskLimitBreaches(e.traderID)
	}

	metrics.ObserveRiskCheckLatency(e.traderID, time.Since(start))
	return decision
}

// CheckLimits evaluates the provided risk state against configured limits.
// Returns (true, reason) if limits are breached, (false, "") otherwise.
func (e *Engine) CheckLimits(s State) (bool, string) {
	if e == nil {
		return false, ""
	}

	if e.flags != nil && !e.flags.RiskEnforcementEnabled() {
		return false, ""
	}

	limits := e.Limits()

	if limits.MaxDailyLoss > 0 && s.DailyPnL <= -limits.MaxDailyLoss {
		return true, fmt.Sprintf("daily pnl %.2f <= limit -%.2f", s.DailyPnL, limits.MaxDailyLoss)
	}

	if limits.MaxDrawdown > 0 && s.PeakBalance > 0 {
		drawdownPct := (s.PeakBalance - s.CurrentBalance) / s.PeakBalance * 100
		if drawdownPct < 0 {
			drawdownPct = 0
		}
		if drawdownPct >= limits.MaxDrawdown {
			return true, fmt.Sprintf("drawdown %.2f%% >= limit %.2f%%", drawdownPct, limits.MaxDrawdown)
		}
	}

	return false, ""
}

// CalculateStopDuration returns the configured pause duration when limits are breached.
func (e *Engine) CalculateStopDuration() time.Duration {
	if e == nil {
		return 0
	}
	limits := e.Limits()
	if limits.StopTradingMinutes <= 0 {
		return 30 * time.Minute
	}
	return time.Duration(limits.StopTradingMinutes) * time.Minute
}

// parametersToLimits converts the internal Parameters to the public Limits API.
func parametersToLimits(p Parameters, initialBalance float64) Limits {
	maxDailyLoss := 0.0
	if p.MaxDailyLossPct > 0 && initialBalance > 0 {
		maxDailyLoss = initialBalance * p.MaxDailyLossPct / 100
	}

	stopMinutes := int(p.StopTradingFor.Minutes())
	if stopMinutes <= 0 {
		stopMinutes = 30
	}

	return Limits{
		MaxDailyLoss:       maxDailyLoss,
		MaxDrawdown:        p.MaxDrawdownPct,
		StopTradingMinutes: stopMinutes,
	}
}

// limitsToParameters converts the public Limits API to internal Parameters using
// the engine's initial balance to obtain percentage thresholds.
func limitsToParameters(l Limits, initialBalance float64) Parameters {
	maxDailyLossPct := 0.0
	if l.MaxDailyLoss > 0 && initialBalance > 0 {
		maxDailyLossPct = (l.MaxDailyLoss / initialBalance) * 100
	}

	stopDuration := time.Duration(l.StopTradingMinutes) * time.Minute
	if stopDuration <= 0 {
		stopDuration = 30 * time.Minute
	}

	return Parameters{
		MaxDailyLossPct: maxDailyLossPct,
		MaxDrawdownPct:  l.MaxDrawdown,
		StopTradingFor:  stopDuration,
	}
}
