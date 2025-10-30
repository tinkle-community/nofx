package featureflag

import (
	"encoding/json"
	"testing"
)

func TestDefaultStateAndMap(t *testing.T) {
	state := DefaultState()
	if !state.EnableGuardedStopLoss || !state.EnableMutexProtection || !state.EnablePersistence || !state.EnableRiskEnforcement {
		t.Fatalf("default state should enable all flags: %+v", state)
	}

	mapped := state.Map()
	expected := map[string]bool{
		canonicalGuardedStopLoss: true,
		canonicalMutexProtection: true,
		canonicalPersistence:     true,
		canonicalRiskEnforcement: true,
	}
	if len(mapped) != len(expected) {
		t.Fatalf("unexpected map length: %+v", mapped)
	}
	for key, want := range expected {
		if got, ok := mapped[key]; !ok || got != want {
			t.Fatalf("map mismatch for %s: got %v want %v", key, got, want)
		}
	}
}

func TestStateUnmarshalJSONAppliesDefaultsAndLegacyKeys(t *testing.T) {
	payload := `{
        "enable_guarded_stop_loss": true,
        "enable_guard_clauses": false,
        "enable_mutex_protection": false,
        "enable_persistence": true,
        "enable_risk_enforcement": true,
        "EnforceRiskLimits": false,
        "UsePnLMutex": true,
        "TradingEnabled": true
    }`

	var state State
	if err := json.Unmarshal([]byte(payload), &state); err != nil {
		t.Fatalf("unmarshal failed: %v", err)
	}

	if !state.EnableGuardedStopLoss {
		t.Fatalf("guarded stop-loss should end up true after legacy overrides")
	}
	if !state.EnableMutexProtection {
		t.Fatalf("mutex protection should be true after legacy override")
	}
	if !state.EnablePersistence {
		t.Fatalf("persistence should remain true")
	}
	if state.EnableRiskEnforcement {
		t.Fatalf("risk enforcement should be false after legacy override")
	}
}

func TestStateMarshalJSONCanonicalKeys(t *testing.T) {
	state := State{
		EnableGuardedStopLoss: true,
		EnableMutexProtection: false,
		EnablePersistence:     true,
		EnableRiskEnforcement: false,
	}

	data, err := state.MarshalJSON()
	if err != nil {
		t.Fatalf("marshal failed: %v", err)
	}

	var decoded map[string]bool
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("re-unmarshal failed: %v", err)
	}

	expected := state.Map()
	if len(decoded) != len(expected) {
		t.Fatalf("unexpected key count: got %d want %d", len(decoded), len(expected))
	}
	for key, want := range expected {
		if got := decoded[key]; got != want {
			t.Fatalf("mismatch for %s: got %v want %v", key, got, want)
		}
	}
}

func TestStateUnmarshalJSONHandlesNullAndWhitespace(t *testing.T) {
	var state State
	if err := state.UnmarshalJSON([]byte("null")); err != nil {
		t.Fatalf("null should produce defaults: %v", err)
	}
	if state != DefaultState() {
		t.Fatalf("expected default state after null")
	}

	if err := state.UnmarshalJSON([]byte("   ")); err != nil {
		t.Fatalf("whitespace should produce defaults: %v", err)
	}

	if err := state.UnmarshalJSON([]byte("{}")); err != nil {
		t.Fatalf("empty object should succeed: %v", err)
	}

	var nilState *State
	if err := nilState.UnmarshalJSON([]byte("{}")); err != nil {
		t.Fatalf("nil receiver should ignore input: %v", err)
	}
}

func TestUpdateUnmarshalJSONHandlesAliases(t *testing.T) {
	payload := `{
        "enable_mutex_protection": true,
        "enable_guard_clauses": true,
        "EnforceRiskLimits": false
    }`

	var update Update
	if err := json.Unmarshal([]byte(payload), &update); err != nil {
		t.Fatalf("unmarshal failed: %v", err)
	}

	if update.EnableGuardedStopLoss == nil || *update.EnableGuardedStopLoss != true {
		t.Fatalf("guarded stop-loss should be set via guard clauses alias")
	}
	if update.EnableMutexProtection == nil || *update.EnableMutexProtection != true {
		t.Fatalf("mutex protection should be set true")
	}
	if update.EnableRiskEnforcement == nil || *update.EnableRiskEnforcement != false {
		t.Fatalf("risk enforcement should be set false via legacy key")
	}
}

func TestUpdateUnmarshalJSONHandlesNull(t *testing.T) {
	var update Update
	if err := update.UnmarshalJSON([]byte("null")); err != nil {
		t.Fatalf("null payload should reset to zero value: %v", err)
	}
	if update != (Update{}) {
		t.Fatalf("expected zero-value update after null input")
	}

	var nilUpdate *Update
	if err := nilUpdate.UnmarshalJSON([]byte("{}")); err != nil {
		t.Fatalf("nil receiver should ignore input: %v", err)
	}
}

func TestRuntimeFlagsApplyAndSnapshot(t *testing.T) {
	flags := NewRuntimeFlags(DefaultState())

	flags.SetGuardedStopLoss(false)
	flags.SetMutexProtection(false)
	flags.SetPersistence(false)
	flags.SetRiskEnforcement(false)

	snapshot := flags.Snapshot()
	if snapshot.EnableGuardedStopLoss || snapshot.EnableMutexProtection || snapshot.EnablePersistence || snapshot.EnableRiskEnforcement {
		t.Fatalf("snapshot should reflect setter mutations: %+v", snapshot)
	}

	update := Update{
		EnableGuardedStopLoss: ptr(false),
		EnableMutexProtection: ptr(true),
		EnablePersistence:     ptr(true),
		EnableRiskEnforcement: ptr(true),
	}
	applied := flags.Apply(update)

	if applied.EnableGuardedStopLoss {
		t.Fatalf("apply should keep guarded stop-loss false when explicitly set")
	}
	if !applied.EnableMutexProtection || !applied.EnablePersistence || !applied.EnableRiskEnforcement {
		t.Fatalf("apply should update other flags: %+v", applied)
	}

	if !flags.MutexProtectionEnabled() || !flags.PersistenceEnabled() || !flags.RiskEnforcementEnabled() {
		t.Fatalf("flags should report enabled after apply")
	}
}

func TestRuntimeFlagsNilSafety(t *testing.T) {
	var flags *RuntimeFlags

	if flags.GuardedStopLossEnabled() || flags.MutexProtectionEnabled() || flags.PersistenceEnabled() || flags.RiskEnforcementEnabled() {
		t.Fatalf("nil receiver should report false for all flags")
	}

	flags.SetGuardedStopLoss(true)
	flags.SetMutexProtection(true)
	flags.SetPersistence(true)
	flags.SetRiskEnforcement(true)

	if snapshot := flags.Snapshot(); snapshot != (State{}) {
		t.Fatalf("nil receiver snapshot should be zero value, got %+v", snapshot)
	}

	update := Update{EnablePersistence: ptr(true)}
	if applied := flags.Apply(update); applied != (State{}) {
		t.Fatalf("nil receiver apply should return zero state, got %+v", applied)
	}
}

func TestWithEnvOverridesRespectsPrecedence(t *testing.T) {
	base := State{
		EnableGuardedStopLoss: true,
		EnableMutexProtection: true,
		EnablePersistence:     true,
		EnableRiskEnforcement: true,
	}

	t.Setenv("ENABLE_GUARD_CLAUSES", "true")
	t.Setenv("TRADING_ENABLED", "false")
	t.Setenv("ENABLE_GUARDED_STOP_LOSS", "false")
	t.Setenv("USE_PNL_MUTEX", "0")
	t.Setenv("ENABLE_MUTEX_PROTECTION", "1")
	t.Setenv("ENABLE_PERSISTENCE", "false")
	t.Setenv("ENFORCE_RISK_LIMITS", "1")
	t.Setenv("ENABLE_RISK_ENFORCEMENT", "0")

	applied := WithEnvOverrides(base)

	if applied.EnableGuardedStopLoss {
		t.Fatalf("canonical guard flag should win and set false")
	}
	if !applied.EnableMutexProtection {
		t.Fatalf("canonical mutex override should enable protection")
	}
	if applied.EnablePersistence {
		t.Fatalf("persistence should be disabled via env override")
	}
	if applied.EnableRiskEnforcement {
		t.Fatalf("canonical risk override should disable enforcement")
	}
}

func TestWithEnvOverridesIgnoresInvalidBoolean(t *testing.T) {
	base := State{
		EnableGuardedStopLoss: false,
		EnableMutexProtection: true,
		EnablePersistence:     true,
		EnableRiskEnforcement: true,
	}

	t.Setenv("ENABLE_MUTEX_PROTECTION", "maybe")

	applied := WithEnvOverrides(base)
	if !applied.EnableMutexProtection {
		t.Fatalf("invalid env boolean should leave mutex protection unchanged")
	}
}

func TestParseEnvBoolVariants(t *testing.T) {
	const key = "FEATURE_FLAG_TEST_BOOL"

	if value, raw, ok, err := parseEnvBool(key); value || raw != "" || ok || err != nil {
		t.Fatalf("parseEnvBool should report not set when env missing")
	}

	t.Setenv(key, "   ")
	if value, raw, ok, err := parseEnvBool(key); value || raw != "" || ok || err != nil {
		t.Fatalf("blank env should be ignored: value=%v raw=%q ok=%v err=%v", value, raw, ok, err)
	}

	t.Setenv(key, "true")
	if value, raw, ok, err := parseEnvBool(key); !value || raw != "true" || !ok || err != nil {
		t.Fatalf("expected true parse, got value=%v raw=%q ok=%v err=%v", value, raw, ok, err)
	}

	t.Setenv(key, "nope")
	if value, raw, ok, err := parseEnvBool(key); value || raw != "nope" || !ok || err == nil {
		t.Fatalf("invalid bool should surface error: value=%v raw=%q ok=%v err=%v", value, raw, ok, err)
	}
}

func ptr[T any](v T) *T {
	return &v
}
