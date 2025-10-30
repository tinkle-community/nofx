package risk

import "time"

// Limits defines the risk guard rails enforced by the risk engine.
// This is the public API contract for configuring risk parameters.
//
// API Contract:
//   - MaxDailyLoss: Absolute currency limit (e.g., 50 USDT), not a percentage.
//   - MaxDrawdown: Percentage limit (0-100) from peak balance.
//   - StopTradingMinutes: Duration (in minutes) to pause trading after breach.
//
// Integration:
//   - Use Engine.CheckLimits to evaluate a State against these limits.
//   - Use Engine.CalculateStopDuration to determine pause duration.
//   - Respect enable_risk_enforcement flag; when disabled, all checks are bypassed.
//
// Rollback Path:
//   - The legacy Parameters type remains available for backward compatibility.
//   - Conversion helpers (parametersToLimits, limitsToParameters) bridge the APIs.
//   - Disabling enable_risk_enforcement restores pre-gating behavior.
type Limits struct {
	MaxDailyLoss       float64 // Maximum daily loss in absolute currency units
	MaxDrawdown        float64 // Maximum drawdown percentage (0-100)
	StopTradingMinutes int     // Duration to pause trading when limits are breached
}

// State represents the current risk state of a trader for evaluation.
// This is the public API contract for passing state to CheckLimits.
//
// API Contract:
//   - DailyPnL: Current accumulated profit/loss for the day (negative = loss).
//   - PeakBalance: Highest balance achieved (used for drawdown calculation).
//   - CurrentBalance: Current account balance.
//   - LastResetTime: When the daily PnL was last reset (typically 24h cycle).
//
// Integration:
//   - Construct State from your trader's current snapshot.
//   - Pass to Engine.CheckLimits to determine if limits are breached.
//   - Breaches return (true, reason); no breach returns (false, "").
type State struct {
	DailyPnL       float64   // Current daily profit/loss in currency units
	PeakBalance    float64   // Peak balance achieved (for drawdown calculation)
	CurrentBalance float64   // Current account balance
	LastResetTime  time.Time // Timestamp of last daily PnL reset
}

// Parameters defines the guard rails enforced by the risk engine.
// Deprecated: Use Limits instead. This type is maintained for backward compatibility
// with existing code. It will be removed in a future version.
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
