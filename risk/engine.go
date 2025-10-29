package risk

import (
	"fmt"
	"sync/atomic"
	"time"

	"nofx/metrics"
	"nofx/runtimeflags"
)

// Engine evaluates risk state for a trader and coordinates pause/resume logic.
type Engine struct {
	traderID       string
	initialBalance float64
	store          *Store
	flags          *runtimeflags.Flags
	params         atomic.Value // Parameters
	nowFn          atomic.Pointer[func() time.Time]
}

// NewEngine wires a risk engine for a trader.
func NewEngine(traderID string, initialBalance float64, params Parameters, store *Store, flags *runtimeflags.Flags) *Engine {
	if store == nil {
		store = NewStore()
	}
	if flags == nil {
		flags = runtimeflags.New(runtimeflags.State{
			EnforceRiskLimits: true,
			UsePnLMutex:       true,
			TradingEnabled:    true,
		})
	}

	e := &Engine{
		traderID:       traderID,
		initialBalance: initialBalance,
		store:          store,
		flags:          flags,
	}
	e.params.Store(normalizeParameters(params))
	now := time.Now
	e.nowFn.Store(&now)
	return e
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

func normalizeParameters(p Parameters) Parameters {
	if p.StopTradingFor <= 0 {
		p.StopTradingFor = 30 * time.Minute
	}
	if p.MaxDailyLossPct < 0 {
		p.MaxDailyLossPct = 0
	}
	if p.MaxDrawdownPct < 0 {
		p.MaxDrawdownPct = 0
	}
	return p
}

// Parameters returns the current guard rails.
func (e *Engine) Parameters() Parameters {
	return e.params.Load().(Parameters)
}

// UpdateParameters swaps the guard rails at runtime.
func (e *Engine) UpdateParameters(p Parameters) {
	e.params.Store(normalizeParameters(p))
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

func (e *Engine) allowedDailyLoss(p Parameters) float64 {
	if p.MaxDailyLossPct <= 0 || e.initialBalance <= 0 {
		return 0
	}
	return e.initialBalance * p.MaxDailyLossPct / 100
}

// Assess evaluates the current risk state using the latest equity snapshot.
func (e *Engine) Assess(equity float64) Decision {
	start := e.now()
	params := e.Parameters()

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

	allowedLoss := e.allowedDailyLoss(params)
	if allowedLoss > 0 && snapshot.DailyPnL <= -allowedLoss {
		decision.Breached = true
		decision.Reason = fmt.Sprintf("daily pnl %.2f <= limit -%.2f", snapshot.DailyPnL, allowedLoss)
	}

	if params.MaxDrawdownPct > 0 && drawdown >= params.MaxDrawdownPct {
		decision.Breached = true
		if decision.Reason != "" {
			decision.Reason += "; "
		}
		decision.Reason += fmt.Sprintf("drawdown %.2f >= limit %.2f", drawdown, params.MaxDrawdownPct)
	}

	if decision.Breached && e.flags.EnforceRiskLimits() {
		pausedUntil = start.Add(params.StopTradingFor)
		snap := e.store.SetTradingPaused(e.traderID, true, pausedUntil, e.flags)
		decision.TradingPaused = snap.TradingPaused
		decision.PausedUntil = snap.PausedUntil
		metrics.IncRiskLimitBreaches(e.traderID)
	}

	metrics.ObserveRiskCheckLatency(e.traderID, time.Since(start))
	return decision
}
