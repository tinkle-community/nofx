//go:build metrics

package metrics

import (
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

var (
	riskDailyPnLGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "risk_daily_pnl",
		Help: "risk.daily_pnl – most recent daily PnL in quote currency",
	}, []string{"trader_id"})

	riskDrawdownGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "risk_drawdown",
		Help: "risk.drawdown – percentage drawdown from peak equity",
	}, []string{"trader_id"})

	riskTradingPausedGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "risk_trading_paused",
		Help: "risk.trading_paused – 1 when trading is paused by risk engine",
	}, []string{"trader_id"})

	riskLimitBreachesCounter = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "risk_limit_breaches_total",
		Help: "risk.limit_breaches – cumulative count of risk limit violations",
	}, []string{"trader_id"})

	riskStopLossFailuresCounter = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "risk_stop_loss_failures_total",
		Help: "risk.stop_loss_failures – failed attempts to place/update stop loss orders",
	}, []string{"trader_id"})

	riskPersistenceAttemptsCounter = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "risk_persistence_attempts_total",
		Help: "risk.persistence_attempts – attempts to persist risk state",
	}, []string{"trader_id"})

	riskPersistenceFailuresCounter = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "risk_persistence_failures_total",
		Help: "risk.persistence_failures – errors persisting risk state",
	}, []string{"trader_id"})

	riskDataRacesCounter = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "risk_data_races_total",
		Help: "risk.data_races – number of risk updates performed without mutex protection",
	}, []string{"trader_id"})

	riskCheckLatencyGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "risk_check_latency_ms",
		Help: "risk.check_latency_ms – duration of the latest risk evaluation",
	}, []string{"trader_id"})

	riskPersistLatencyGauge = prometheus.NewGaugeVec(prometheus.GaugeOpts{
		Name: "risk_persist_latency_ms",
		Help: "risk.persist_latency_ms – time spent persisting risk state",
	}, []string{"trader_id"})
)

func init() {
	prometheus.MustRegister(
		riskDailyPnLGauge,
		riskDrawdownGauge,
		riskTradingPausedGauge,
		riskLimitBreachesCounter,
		riskStopLossFailuresCounter,
		riskPersistenceAttemptsCounter,
		riskPersistenceFailuresCounter,
		riskDataRacesCounter,
		riskCheckLatencyGauge,
		riskPersistLatencyGauge,
	)
}

func ObserveRiskDailyPnL(traderID string, value float64) {
	riskDailyPnLGauge.WithLabelValues(traderID).Set(value)
}

func ObserveRiskDrawdown(traderID string, value float64) {
	riskDrawdownGauge.WithLabelValues(traderID).Set(value)
}

func SetRiskTradingPaused(traderID string, paused bool) {
	if paused {
		riskTradingPausedGauge.WithLabelValues(traderID).Set(1)
		return
	}
	riskTradingPausedGauge.WithLabelValues(traderID).Set(0)
}

func IncRiskLimitBreaches(traderID string) {
	riskLimitBreachesCounter.WithLabelValues(traderID).Inc()
}

func IncRiskStopLossFailures(traderID string) {
	riskStopLossFailuresCounter.WithLabelValues(traderID).Inc()
}

func IncRiskPersistenceAttempts(traderID string) {
	riskPersistenceAttemptsCounter.WithLabelValues(traderID).Inc()
}

func IncRiskPersistenceFailures(traderID string) {
	riskPersistenceFailuresCounter.WithLabelValues(traderID).Inc()
}

func IncRiskDataRaces(traderID string) {
	riskDataRacesCounter.WithLabelValues(traderID).Inc()
}

func ObserveRiskCheckLatency(traderID string, duration time.Duration) {
	riskCheckLatencyGauge.WithLabelValues(traderID).Set(duration.Seconds() * 1000)
}

func ObserveRiskPersistLatency(traderID string, duration time.Duration) {
	riskPersistLatencyGauge.WithLabelValues(traderID).Set(duration.Seconds() * 1000)
}
