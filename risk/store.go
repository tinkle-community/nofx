package risk

import (
	"sync"
	"sync/atomic"
	"time"

	"nofx/featureflag"
	"nofx/metrics"
)

type state struct {
	mu            sync.Mutex
	dailyPnL      float64
	drawdownPct   float64
	currentEquity float64
	peakEquity    float64
	tradingPaused bool
	pausedUntil   time.Time
	dailyResetAt  time.Time
	lastUpdated   time.Time
}

func (s *state) mutate(useMutex bool, fn func()) Snapshot {
	if useMutex {
		s.mu.Lock()
		defer s.mu.Unlock()
	}
	fn()
	return s.snapshotUnsafe()
}

func (s *state) view(useMutex bool) Snapshot {
	if useMutex {
		s.mu.Lock()
		defer s.mu.Unlock()
	}
	return s.snapshotUnsafe()
}

func (s *state) snapshotUnsafe() Snapshot {
	return Snapshot{
		DailyPnL:      s.dailyPnL,
		DrawdownPct:   s.drawdownPct,
		CurrentEquity: s.currentEquity,
		PeakEquity:    s.peakEquity,
		TradingPaused: s.tradingPaused,
		PausedUntil:   s.pausedUntil,
		LastReset:     s.dailyResetAt,
	}
}

// Store keeps in-memory risk state for all traders and emits telemetry on
// every change.
type Store struct {
	mu      sync.RWMutex
	states  map[string]*state
	persist atomic.Value // PersistFunc
}

// NewStore constructs an empty risk store.
func NewStore() *Store {
	s := &Store{states: make(map[string]*state)}
	s.persist.Store(PersistFunc(nil))
	return s
}

// SetPersistFunc installs a persistence hook that receives every new snapshot.
func (s *Store) SetPersistFunc(fn PersistFunc) {
	s.persist.Store(fn)
}

func (s *Store) ensureState(traderID string, now time.Time) *state {
	s.mu.RLock()
	st, ok := s.states[traderID]
	s.mu.RUnlock()
	if ok {
		return st
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	if st, ok = s.states[traderID]; ok {
		return st
	}
	st = &state{dailyResetAt: now}
	s.states[traderID] = st
	return st
}

func useMutex(flags *featureflag.RuntimeFlags) bool {
	if flags == nil {
		return true
	}
	return flags.MutexProtectionEnabled()
}

// UpdateDailyPnL adjusts the tracked daily PnL and returns the latest value.
func (s *Store) UpdateDailyPnL(traderID string, delta float64, flags *featureflag.RuntimeFlags, now time.Time) float64 {
	st := s.ensureState(traderID, now)
	use := useMutex(flags)
	snapshot := st.mutate(use, func() {
		if st.dailyResetAt.IsZero() {
			st.dailyResetAt = now
		}
		if now.Sub(st.dailyResetAt) >= 24*time.Hour {
			st.dailyPnL = 0
			st.dailyResetAt = now
		}
		st.dailyPnL += delta
		st.lastUpdated = now
	})

	metrics.ObserveRiskDailyPnL(traderID, snapshot.DailyPnL)
	if !use {
		metrics.IncRiskDataRaces(traderID)
	}
	s.persistSnapshot(traderID, snapshot, flags)
	return snapshot.DailyPnL
}

// ResetDailyPnLIfNeeded resets the daily PnL when more than 24 hours elapsed
// since the last reset. It returns true when a reset occurred.
func (s *Store) ResetDailyPnLIfNeeded(traderID string, now time.Time, flags *featureflag.RuntimeFlags) bool {
	st := s.ensureState(traderID, now)
	use := useMutex(flags)
	reset := false
	snapshot := st.mutate(use, func() {
		if st.dailyResetAt.IsZero() {
			st.dailyResetAt = now
			return
		}
		if now.Sub(st.dailyResetAt) >= 24*time.Hour {
			st.dailyPnL = 0
			st.dailyResetAt = now
			reset = true
		}
	})

	if reset {
		metrics.ObserveRiskDailyPnL(traderID, snapshot.DailyPnL)
		s.persistSnapshot(traderID, snapshot, flags)
	}
	return reset
}

// RecordEquity updates the equity snapshot and returns the latest drawdown.
func (s *Store) RecordEquity(traderID string, equity float64, flags *featureflag.RuntimeFlags, now time.Time) float64 {
	st := s.ensureState(traderID, now)
	use := useMutex(flags)
	snapshot := st.mutate(use, func() {
		st.currentEquity = equity
		if equity > st.peakEquity {
			st.peakEquity = equity
		}
		if st.peakEquity <= 0 {
			st.drawdownPct = 0
			return
		}
		drawdown := (st.peakEquity - equity) / st.peakEquity * 100
		if drawdown < 0 {
			drawdown = 0
		}
		st.drawdownPct = drawdown
	})

	metrics.ObserveRiskDrawdown(traderID, snapshot.DrawdownPct)
	s.persistSnapshot(traderID, snapshot, flags)
	return snapshot.DrawdownPct
}

// SetTradingPaused toggles the paused state and records metrics.
func (s *Store) SetTradingPaused(traderID string, paused bool, until time.Time, flags *featureflag.RuntimeFlags) Snapshot {
	st := s.ensureState(traderID, time.Now())
	use := useMutex(flags)
	snapshot := st.mutate(use, func() {
		st.tradingPaused = paused
		st.pausedUntil = until
	})

	metrics.SetRiskTradingPaused(traderID, snapshot.TradingPaused)
	s.persistSnapshot(traderID, snapshot, flags)
	return snapshot
}

// TradingStatus returns whether trading is currently paused, and the deadline
// if applicable. It also auto-resumes trading once the pause expires.
func (s *Store) TradingStatus(traderID string, now time.Time, flags *featureflag.RuntimeFlags) (bool, time.Time) {
	st := s.ensureState(traderID, now)
	use := useMutex(flags)
	changed := false
	snapshot := st.mutate(use, func() {
		if st.tradingPaused && !st.pausedUntil.IsZero() && now.After(st.pausedUntil) {
			st.tradingPaused = false
			st.pausedUntil = time.Time{}
			changed = true
		}
	})

	if changed {
		metrics.SetRiskTradingPaused(traderID, false)
		s.persistSnapshot(traderID, snapshot, flags)
	}

	paused := snapshot.TradingPaused && (snapshot.PausedUntil.IsZero() || now.Before(snapshot.PausedUntil))
	return paused, snapshot.PausedUntil
}

// Snapshot returns a copy of the current risk state.
func (s *Store) Snapshot(traderID string, flags *featureflag.RuntimeFlags) Snapshot {
	st := s.ensureState(traderID, time.Now())
	use := useMutex(flags)
	return st.view(use)
}

func (s *Store) persistSnapshot(traderID string, snapshot Snapshot, flags *featureflag.RuntimeFlags) {
	if flags != nil && !flags.PersistenceEnabled() {
		return
	}

	start := time.Now()
	if fn, ok := s.persist.Load().(PersistFunc); ok && fn != nil {
		if err := fn(traderID, snapshot); err != nil {
			metrics.IncRiskPersistenceFailures(traderID)
		}
	}
	metrics.ObserveRiskPersistLatency(traderID, time.Since(start))
}
