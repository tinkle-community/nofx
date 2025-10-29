# Risk Metrics Monitoring Guide

The risk engine exposes a dedicated set of Prometheus metrics under the optional `metrics` build tag. When the tag is enabled (`go build -tags metrics`), the following series become available:

| Metric | Type | Description | Suggested Alert |
| --- | --- | --- | --- |
| `risk_daily_pnl{trader_id}` | Gauge | Latest per-trader daily realised PnL in quote currency. | Trigger a warning when the value drops past your max daily loss threshold; page if it exceeds 110% of policy loss. |
| `risk_drawdown{trader_id}` | Gauge | Current percentage drawdown from peak equity. | Warn above 70% of configured drawdown, page at 90%+. |
| `risk_trading_paused{trader_id}` | Gauge (0/1) | Indicates whether the risk engine has halted trading. | Page immediately when it flips to `1` so operators can investigate. |
| `risk_limit_breaches_total{trader_id}` | Counter | Cumulative number of risk limit violations. | Alert on sudden increases (e.g. more than 3 breaches over 30 minutes). |
| `risk_stop_loss_failures_total{trader_id}` | Counter | Count of failed stop-loss placements. | Warning on any sustained growth; page if the rate exceeds 5 failures/hour. |
| `risk_persistence_failures_total{trader_id}` | Counter | Failed attempts to persist risk state. | Page immediately; persistence gaps lead to blind spots. |
| `risk_data_races_total{trader_id}` | Counter | Updates applied without mutex protection (flag disabled). | Investigate when the counter increases—race conditions may corrupt state. |
| `risk_check_latency_ms{trader_id}` | Gauge | Milliseconds spent evaluating a risk cycle. | Alert if latency trends above 500 ms; high values indicate downstream pressure. |
| `risk_persist_latency_ms{trader_id}` | Gauge | Persistence latency in milliseconds. | Warn above 200 ms; page if persist latency exceeds 1 s.

## Operational Playbook

1. **Trading paused (`risk_trading_paused=1`):**
   * Correlate with `risk_limit_breaches_total` to confirm whether a limit forced the stop.
   * Check daily PnL and drawdown gauges; if limits are breached, consider injecting capital or adjusting runtime flags through `POST /admin/feature-flags` once the situation is understood.

2. **Stop-loss failures climbing:**
   * Inspect exchange connectivity.
   * Consider temporarily toggling the runtime flag to disable automated trading until order placement stabilises.

3. **Persistence failures:**
   * The risk engine is operating without durable state; pause trading via the admin API until storage recovers.

4. **High evaluation/persist latency:**
   * Monitor infrastructure load—latency spikes are early indicators of saturation.

> **Security note:** The admin feature-flag endpoint accepts an optional `ADMIN_API_TOKEN` (expected in the `X-Admin-Token` header). When unset, ensure perimeter access controls are in place before exposing the endpoint.
