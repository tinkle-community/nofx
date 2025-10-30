package metrics

import (
	"testing"
	"time"
)

func mustNotPanic(t *testing.T, name string, fn func()) {
	t.Helper()
	defer func() {
		if r := recover(); r != nil {
			t.Fatalf("%s panicked: %v", name, r)
		}
	}()
	fn()
}

func TestNoopMetricsAreNoop(t *testing.T) {
	testCases := []struct {
		name string
		fn   func()
	}{
		{"ObserveRiskDailyPnL", func() { ObserveRiskDailyPnL("trader", 100.5) }},
		{"ObserveRiskDrawdown", func() { ObserveRiskDrawdown("trader", 12.34) }},
		{"SetRiskTradingPaused", func() { SetRiskTradingPaused("trader", true) }},
		{"IncRiskLimitBreaches", func() { IncRiskLimitBreaches("trader") }},
		{"IncRiskStopLossFailures", func() { IncRiskStopLossFailures("trader") }},
		{"IncRiskPersistenceFailures", func() { IncRiskPersistenceFailures("trader") }},
		{"IncRiskPersistenceFailuresWithBackend", func() { IncRiskPersistenceFailuresWithBackend("trader", BackendMemory) }},
		{"IncRiskPersistenceAttempts", func() { IncRiskPersistenceAttempts("trader") }},
		{"IncRiskPersistenceAttemptsWithBackend", func() { IncRiskPersistenceAttemptsWithBackend("trader", BackendMemory) }},
		{"IncRiskDataRaces", func() { IncRiskDataRaces("trader") }},
		{"ObserveRiskCheckLatency", func() { ObserveRiskCheckLatency("trader", 42*time.Millisecond) }},
		{"ObserveRiskPersistLatency", func() { ObserveRiskPersistLatency("trader", time.Second) }},
		{"ObserveRiskPersistLatencyWithBackend", func() { ObserveRiskPersistLatencyWithBackend("trader", time.Minute, BackendUnknown) }},
		{"SetFeatureFlag", func() { SetFeatureFlag("flag", true) }},
		{"SetFeatureFlags", func() { SetFeatureFlags(map[string]bool{"flag": true, "other": false}) }},
	}

	for _, tc := range testCases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			mustNotPanic(t, tc.name, func() {
				tc.fn()
				tc.fn()
			})
		})
	}
}
