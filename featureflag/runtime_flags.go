package featureflag

import "sync/atomic"

// RuntimeFlags exposes feature toggles that can be flipped without restarting
// the process. Atomic primitives guarantee visibility across goroutines without
// requiring heavyweight locks.
type RuntimeFlags struct {
	guardClauses    atomic.Bool
	mutexProtection atomic.Bool
	persistence     atomic.Bool
	riskEnforcement atomic.Bool
}

// State is a materialized snapshot of the current feature flag values.
type State struct {
	EnableGuardClauses    bool `json:"enable_guard_clauses"`
	EnableMutexProtection bool `json:"enable_mutex_protection"`
	EnablePersistence     bool `json:"enable_persistence"`
	EnableRiskEnforcement bool `json:"enable_risk_enforcement"`
}

// Update represents a partial mutation to the runtime flags. Nil values mean
// "leave untouched" so callers can update a subset of flags.
type Update struct {
	EnableGuardClauses    *bool `json:"enable_guard_clauses"`
	EnableMutexProtection *bool `json:"enable_mutex_protection"`
	EnablePersistence     *bool `json:"enable_persistence"`
	EnableRiskEnforcement *bool `json:"enable_risk_enforcement"`
}

// NewRuntimeFlags constructs a RuntimeFlags container initialized with the
// provided defaults.
func NewRuntimeFlags(initial State) *RuntimeFlags {
	flags := &RuntimeFlags{}
	flags.SetGuardClauses(initial.EnableGuardClauses)
	flags.SetMutexProtection(initial.EnableMutexProtection)
	flags.SetPersistence(initial.EnablePersistence)
	flags.SetRiskEnforcement(initial.EnableRiskEnforcement)
	return flags
}

// GuardClausesEnabled reports whether guard clauses should run before opening
// positions.
func (f *RuntimeFlags) GuardClausesEnabled() bool {
	if f == nil {
		return false
	}
	return f.guardClauses.Load()
}

// SetGuardClauses toggles guard clause enforcement.
func (f *RuntimeFlags) SetGuardClauses(enabled bool) {
	if f == nil {
		return
	}
	f.guardClauses.Store(enabled)
}

// MutexProtectionEnabled reports whether risk-state mutations should use the
// mutex guard to avoid data races.
func (f *RuntimeFlags) MutexProtectionEnabled() bool {
	if f == nil {
		return false
	}
	return f.mutexProtection.Load()
}

// SetMutexProtection toggles the risk-state mutex usage.
func (f *RuntimeFlags) SetMutexProtection(enabled bool) {
	if f == nil {
		return
	}
	f.mutexProtection.Store(enabled)
}

// PersistenceEnabled reports whether risk snapshots should be persisted.
func (f *RuntimeFlags) PersistenceEnabled() bool {
	if f == nil {
		return false
	}
	return f.persistence.Load()
}

// SetPersistence toggles whether risk snapshots should be persisted.
func (f *RuntimeFlags) SetPersistence(enabled bool) {
	if f == nil {
		return
	}
	f.persistence.Store(enabled)
}

// RiskEnforcementEnabled reports whether risk enforcement routines may pause
// trading when guard rails are breached.
func (f *RuntimeFlags) RiskEnforcementEnabled() bool {
	if f == nil {
		return false
	}
	return f.riskEnforcement.Load()
}

// SetRiskEnforcement toggles risk enforcement.
func (f *RuntimeFlags) SetRiskEnforcement(enabled bool) {
	if f == nil {
		return
	}
	f.riskEnforcement.Store(enabled)
}

// Snapshot takes a consistent snapshot of all flags.
func (f *RuntimeFlags) Snapshot() State {
	if f == nil {
		return State{}
	}
	return State{
		EnableGuardClauses:    f.GuardClausesEnabled(),
		EnableMutexProtection: f.MutexProtectionEnabled(),
		EnablePersistence:     f.PersistenceEnabled(),
		EnableRiskEnforcement: f.RiskEnforcementEnabled(),
	}
}

// Apply atomically updates the flags according to the supplied patch and
// returns the resulting snapshot.
func (f *RuntimeFlags) Apply(update Update) State {
	if f == nil {
		return State{}
	}
	if update.EnableGuardClauses != nil {
		f.SetGuardClauses(*update.EnableGuardClauses)
	}
	if update.EnableMutexProtection != nil {
		f.SetMutexProtection(*update.EnableMutexProtection)
	}
	if update.EnablePersistence != nil {
		f.SetPersistence(*update.EnablePersistence)
	}
	if update.EnableRiskEnforcement != nil {
		f.SetRiskEnforcement(*update.EnableRiskEnforcement)
	}
	return f.Snapshot()
}
