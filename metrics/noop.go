//go:build !metrics

package metrics

import "time"

func ObserveRiskDailyPnL(string, float64)           {}
func ObserveRiskDrawdown(string, float64)           {}
func SetRiskTradingPaused(string, bool)             {}
func IncRiskLimitBreaches(string)                   {}
func IncRiskStopLossFailures(string)                {}
func IncRiskPersistenceFailures(string)            {}
func IncRiskDataRaces(string)                       {}
func ObserveRiskCheckLatency(string, time.Duration) {}
func ObserveRiskPersistLatency(string, time.Duration) {}
