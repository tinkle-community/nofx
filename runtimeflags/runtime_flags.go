package runtimeflags

import "sync/atomic"

// Flags holds mutable runtime switches that can be flipped while the
// application is running. Atomic primitives ensure immediate visibility for
// all goroutines without expensive locks.
type Flags struct {
	enforceRisk    atomic.Bool
	usePnLMutex    atomic.Bool
	tradingEnabled atomic.Bool
}

// State is a snapshot of all runtime flags. It can also be used as the
// payload for API responses.
type State struct {
	EnforceRiskLimits bool `json:"enforce_risk_limits"`
	UsePnLMutex       bool `json:"use_pnl_mutex"`
	TradingEnabled    bool `json:"trading_enabled"`
}

// Update represents a partial change to the runtime flags. Nil pointers mean
// "leave untouched" so callers can toggle a subset of fields.
type Update struct {
	EnforceRiskLimits *bool `json:"enforce_risk_limits"`
	UsePnLMutex       *bool `json:"use_pnl_mutex"`
	TradingEnabled    *bool `json:"trading_enabled"`
}

// New constructs a Flags container using the provided defaults.
func New(initial State) *Flags {
	f := &Flags{}
	f.SetEnforceRiskLimits(initial.EnforceRiskLimits)
	f.SetUsePnLMutex(initial.UsePnLMutex)
	f.SetTradingEnabled(initial.TradingEnabled)
	return f
}

// SetEnforceRiskLimits toggles risk-limit enforcement.
func (f *Flags) SetEnforceRiskLimits(enabled bool) {
	f.enforceRisk.Store(enabled)
}

// EnforceRiskLimits returns the instant value of the enforcement flag.
func (f *Flags) EnforceRiskLimits() bool {
	return f.enforceRisk.Load()
}

// SetUsePnLMutex toggles usage of the risk-state mutex.
func (f *Flags) SetUsePnLMutex(enabled bool) {
	f.usePnLMutex.Store(enabled)
}

// UsePnLMutex reports whether risk-state updates should use the mutex guard.
func (f *Flags) UsePnLMutex() bool {
	return f.usePnLMutex.Load()
}

// SetTradingEnabled toggles whether traders are allowed to run execution
// cycles at all.
func (f *Flags) SetTradingEnabled(enabled bool) {
	f.tradingEnabled.Store(enabled)
}

// TradingEnabled returns whether trading loops may operate.
func (f *Flags) TradingEnabled() bool {
	return f.tradingEnabled.Load()
}

// Apply atomically updates the runtime flags according to the supplied
// partial update and returns the resulting state snapshot.
func (f *Flags) Apply(update Update) State {
	if update.EnforceRiskLimits != nil {
		f.SetEnforceRiskLimits(*update.EnforceRiskLimits)
	}
	if update.UsePnLMutex != nil {
		f.SetUsePnLMutex(*update.UsePnLMutex)
	}
	if update.TradingEnabled != nil {
		f.SetTradingEnabled(*update.TradingEnabled)
	}
	return f.State()
}

// State returns a consistent snapshot of all runtime flags.
func (f *Flags) State() State {
	return State{
		EnforceRiskLimits: f.EnforceRiskLimits(),
		UsePnLMutex:       f.UsePnLMutex(),
		TradingEnabled:    f.TradingEnabled(),
	}
}
