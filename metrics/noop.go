//go:build !metrics

package metrics

import "time"

const (
	BackendUnknown  = "unknown"
	BackendMemory   = "memory"
	BackendPostgres = "postgres"
)

func ObserveRiskDailyPnL(string, float64)                                {}
func ObserveRiskDrawdown(string, float64)                                {}
func SetRiskTradingPaused(string, bool)                                  {}
func IncRiskLimitBreaches(string)                                        {}
func IncRiskStopLossFailures(string)                                     {}
func IncRiskPersistenceFailures(string)                                  {}
func IncRiskPersistenceFailuresWithBackend(string, string)               {}
func IncRiskPersistenceAttempts(string)                                  {}
func IncRiskPersistenceAttemptsWithBackend(string, string)               {}
func IncRiskDataRaces(string)                                            {}
func ObserveRiskCheckLatency(string, time.Duration)                      {}
func ObserveRiskPersistLatency(string, time.Duration)                    {}
func ObserveRiskPersistLatencyWithBackend(string, time.Duration, string) {}
func SetFeatureFlag(string, bool)                                        {}
func SetFeatureFlags(map[string]bool)                                    {}
