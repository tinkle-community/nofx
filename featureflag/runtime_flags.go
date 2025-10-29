package featureflag

import (
	"encoding/json"
	"log"
	"os"
	"strconv"
	"strings"
	"sync/atomic"
)

const (
	canonicalGuardedStopLoss = "enable_guarded_stop_loss"
	canonicalMutexProtection = "enable_mutex_protection"
	canonicalPersistence     = "enable_persistence"
	canonicalRiskEnforcement = "enable_risk_enforcement"
)

// LegacyKeyMapping exposes backwards-compatible mappings from legacy flag names
// to their canonical replacements.
var LegacyKeyMapping = map[string]string{
	"EnforceRiskLimits": canonicalRiskEnforcement,
	"UsePnLMutex":       canonicalMutexProtection,
	"TradingEnabled":    canonicalGuardedStopLoss,
}

// RuntimeFlags exposes feature toggles that can be flipped without restarting
// the process. Atomic primitives guarantee visibility across goroutines without
// requiring heavyweight locks.
type RuntimeFlags struct {
	guardedStopLoss atomic.Bool
	mutexProtection atomic.Bool
	persistence     atomic.Bool
	riskEnforcement atomic.Bool
}

// State is a materialized snapshot of the current feature flag values.
type State struct {
	EnableGuardedStopLoss bool `json:"enable_guarded_stop_loss"`
	EnableMutexProtection bool `json:"enable_mutex_protection"`
	EnablePersistence     bool `json:"enable_persistence"`
	EnableRiskEnforcement bool `json:"enable_risk_enforcement"`
}

// Update represents a partial mutation to the runtime flags. Nil values mean
// "leave untouched" so callers can update a subset of flags.
type Update struct {
	EnableGuardedStopLoss *bool `json:"enable_guarded_stop_loss"`
	EnableMutexProtection *bool `json:"enable_mutex_protection"`
	EnablePersistence     *bool `json:"enable_persistence"`
	EnableRiskEnforcement *bool `json:"enable_risk_enforcement"`
}

// DefaultState returns the canonical defaults for all feature flags.
func DefaultState() State {
	return State{
		EnableGuardedStopLoss: true,
		EnableMutexProtection: true,
		EnablePersistence:     true,
		EnableRiskEnforcement: true,
	}
}

// Map exposes the state's values keyed by their canonical flag names.
func (s State) Map() map[string]bool {
	return map[string]bool{
		canonicalGuardedStopLoss: s.EnableGuardedStopLoss,
		canonicalMutexProtection: s.EnableMutexProtection,
		canonicalPersistence:     s.EnablePersistence,
		canonicalRiskEnforcement: s.EnableRiskEnforcement,
	}
}

// MarshalJSON ensures we only emit canonical keys.
func (s State) MarshalJSON() ([]byte, error) {
	type alias State
	return json.Marshal(alias(s))
}

// UnmarshalJSON hydrates the state while applying defaults, canonical aliases
// and legacy mappings.
func (s *State) UnmarshalJSON(data []byte) error {
	if s == nil {
		return nil
	}

	trimmed := strings.TrimSpace(string(data))
	if trimmed == "" || trimmed == "null" {
		*s = DefaultState()
		return nil
	}

	type rawState struct {
		EnableGuardedStopLoss *bool `json:"enable_guarded_stop_loss"`
		EnableGuardClauses    *bool `json:"enable_guard_clauses"`
		EnableMutexProtection *bool `json:"enable_mutex_protection"`
		EnablePersistence     *bool `json:"enable_persistence"`
		EnableRiskEnforcement *bool `json:"enable_risk_enforcement"`

		LegacyEnforceRiskLimits *bool `json:"EnforceRiskLimits"`
		LegacyUsePnLMutex       *bool `json:"UsePnLMutex"`
		LegacyTradingEnabled    *bool `json:"TradingEnabled"`
	}

	var raw rawState
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	state := DefaultState()

	if raw.EnableGuardedStopLoss != nil {
		state.EnableGuardedStopLoss = *raw.EnableGuardedStopLoss
	}
	if raw.EnableGuardClauses != nil {
		logDeprecatedKey("enable_guard_clauses", canonicalGuardedStopLoss)
		state.EnableGuardedStopLoss = *raw.EnableGuardClauses
	}

	if raw.EnableMutexProtection != nil {
		state.EnableMutexProtection = *raw.EnableMutexProtection
	}

	if raw.EnablePersistence != nil {
		state.EnablePersistence = *raw.EnablePersistence
	}

	if raw.EnableRiskEnforcement != nil {
		state.EnableRiskEnforcement = *raw.EnableRiskEnforcement
	}

	if raw.LegacyEnforceRiskLimits != nil {
		logDeprecatedKey("EnforceRiskLimits", canonicalRiskEnforcement)
		state.EnableRiskEnforcement = *raw.LegacyEnforceRiskLimits
	}

	if raw.LegacyUsePnLMutex != nil {
		logDeprecatedKey("UsePnLMutex", canonicalMutexProtection)
		state.EnableMutexProtection = *raw.LegacyUsePnLMutex
	}

	if raw.LegacyTradingEnabled != nil {
		logDeprecatedKey("TradingEnabled", canonicalGuardedStopLoss)
		state.EnableGuardedStopLoss = *raw.LegacyTradingEnabled
	}

	*s = state
	return nil
}

// UnmarshalJSON allows accepting legacy keys when patching flags via the API.
func (u *Update) UnmarshalJSON(data []byte) error {
	if u == nil {
		return nil
	}

	trimmed := strings.TrimSpace(string(data))
	if trimmed == "" || trimmed == "null" {
		*u = Update{}
		return nil
	}

	type rawUpdate struct {
		EnableGuardedStopLoss *bool `json:"enable_guarded_stop_loss"`
		EnableGuardClauses    *bool `json:"enable_guard_clauses"`
		EnableMutexProtection *bool `json:"enable_mutex_protection"`
		EnablePersistence     *bool `json:"enable_persistence"`
		EnableRiskEnforcement *bool `json:"enable_risk_enforcement"`

		LegacyEnforceRiskLimits *bool `json:"EnforceRiskLimits"`
		LegacyUsePnLMutex       *bool `json:"UsePnLMutex"`
		LegacyTradingEnabled    *bool `json:"TradingEnabled"`
	}

	var raw rawUpdate
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	update := Update{
		EnableGuardedStopLoss: raw.EnableGuardedStopLoss,
		EnableMutexProtection: raw.EnableMutexProtection,
		EnablePersistence:     raw.EnablePersistence,
		EnableRiskEnforcement: raw.EnableRiskEnforcement,
	}

	if raw.EnableGuardClauses != nil {
		logDeprecatedKey("enable_guard_clauses", canonicalGuardedStopLoss)
		update.EnableGuardedStopLoss = raw.EnableGuardClauses
	}

	if raw.LegacyEnforceRiskLimits != nil {
		logDeprecatedKey("EnforceRiskLimits", canonicalRiskEnforcement)
		update.EnableRiskEnforcement = raw.LegacyEnforceRiskLimits
	}

	if raw.LegacyUsePnLMutex != nil {
		logDeprecatedKey("UsePnLMutex", canonicalMutexProtection)
		update.EnableMutexProtection = raw.LegacyUsePnLMutex
	}

	if raw.LegacyTradingEnabled != nil {
		logDeprecatedKey("TradingEnabled", canonicalGuardedStopLoss)
		update.EnableGuardedStopLoss = raw.LegacyTradingEnabled
	}

	*u = update
	return nil
}

// NewRuntimeFlags constructs a RuntimeFlags container initialized with the
// provided defaults.
func NewRuntimeFlags(initial State) *RuntimeFlags {
	flags := &RuntimeFlags{}
	flags.SetGuardedStopLoss(initial.EnableGuardedStopLoss)
	flags.SetMutexProtection(initial.EnableMutexProtection)
	flags.SetPersistence(initial.EnablePersistence)
	flags.SetRiskEnforcement(initial.EnableRiskEnforcement)
	return flags
}

// GuardedStopLossEnabled reports whether guard rails around stop-loss placement
// should be enforced prior to opening positions.
func (f *RuntimeFlags) GuardedStopLossEnabled() bool {
	if f == nil {
		return false
	}
	return f.guardedStopLoss.Load()
}

// SetGuardedStopLoss toggles guarded stop-loss enforcement.
func (f *RuntimeFlags) SetGuardedStopLoss(enabled bool) {
	if f == nil {
		return
	}
	f.guardedStopLoss.Store(enabled)
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
		EnableGuardedStopLoss: f.GuardedStopLossEnabled(),
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
	if update.EnableGuardedStopLoss != nil {
		f.SetGuardedStopLoss(*update.EnableGuardedStopLoss)
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

// WithEnvOverrides applies environment overrides to the provided state. Canonical
// environment variables take precedence over legacy ones.
func WithEnvOverrides(state State) State {
	result := state

	apply := func(envKey, canonical string, deprecated bool, setter func(*State, bool)) {
		value, raw, ok, err := parseEnvBool(envKey)
		if !ok {
			return
		}
		if err != nil {
			log.Printf("⚠️  ignoring feature flag override: %s has invalid boolean value %q", envKey, raw)
			return
		}
		if deprecated {
			logDeprecatedEnv(envKey, canonical)
		}
		log.Printf("🔧 feature flag override: %s=%s -> %s=%t", envKey, raw, canonical, value)
		setter(&result, value)
	}

	apply("ENABLE_GUARD_CLAUSES", canonicalGuardedStopLoss, true, func(s *State, v bool) {
		s.EnableGuardedStopLoss = v
	})
	apply("TRADING_ENABLED", canonicalGuardedStopLoss, true, func(s *State, v bool) {
		s.EnableGuardedStopLoss = v
	})
	apply("ENABLE_GUARDED_STOP_LOSS", canonicalGuardedStopLoss, false, func(s *State, v bool) {
		s.EnableGuardedStopLoss = v
	})

	apply("USE_PNL_MUTEX", canonicalMutexProtection, true, func(s *State, v bool) {
		s.EnableMutexProtection = v
	})
	apply("ENABLE_MUTEX_PROTECTION", canonicalMutexProtection, false, func(s *State, v bool) {
		s.EnableMutexProtection = v
	})

	apply("ENABLE_PERSISTENCE", canonicalPersistence, false, func(s *State, v bool) {
		s.EnablePersistence = v
	})

	apply("ENFORCE_RISK_LIMITS", canonicalRiskEnforcement, true, func(s *State, v bool) {
		s.EnableRiskEnforcement = v
	})
	apply("ENABLE_RISK_ENFORCEMENT", canonicalRiskEnforcement, false, func(s *State, v bool) {
		s.EnableRiskEnforcement = v
	})

	return result
}

func parseEnvBool(key string) (bool, string, bool, error) {
	raw, ok := os.LookupEnv(key)
	if !ok {
		return false, "", false, nil
	}
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return false, raw, false, nil
	}
	value, err := strconv.ParseBool(raw)
	if err != nil {
		return false, raw, true, err
	}
	return value, raw, true, nil
}

func logDeprecatedKey(oldKey, newKey string) {
	log.Printf("⚠️  feature flag '%s' is deprecated; use '%s' instead", oldKey, newKey)
}

func logDeprecatedEnv(oldKey, canonical string) {
	log.Printf("⚠️  feature flag env '%s' is deprecated; use '%s' instead", oldKey, strings.ToUpper(canonical))
}
