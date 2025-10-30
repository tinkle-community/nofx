package risk

import "time"

// Parameters defines the guard rails enforced by the risk engine.
type Parameters struct {
	MaxDailyLossPct float64
	MaxDrawdownPct  float64
	StopTradingFor  time.Duration
}

// Decision captures the outcome of a risk evaluation.
type Decision struct {
	Breached      bool
	Reason        string
	TradingPaused bool
	PausedUntil   time.Time
	DailyPnL      float64
	DrawdownPct   float64
}

// Snapshot is a read-only view of the current risk state for a trader.
type Snapshot struct {
	DailyPnL      float64
	DrawdownPct   float64
	CurrentEquity float64
	PeakEquity    float64
	TradingPaused bool
	PausedUntil   time.Time
	LastReset     time.Time
}

// PersistFunc allows plugging persistence for risk state changes.
type PersistFunc func(traderID string, snapshot Snapshot) error
