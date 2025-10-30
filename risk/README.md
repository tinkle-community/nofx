# Risk Engine API Documentation

## Overview

The risk engine provides trading safety controls through configurable limits on daily loss and drawdown. When limits are breached, trading is automatically paused for a configurable duration.

## Public API Contract

### Types

#### `Limits`

Defines the risk guard rails enforced by the risk engine.

```go
type Limits struct {
    MaxDailyLoss       float64 // Maximum daily loss in absolute currency units (e.g., 50 USDT)
    MaxDrawdown        float64 // Maximum drawdown percentage (0-100) from peak balance
    StopTradingMinutes int     // Duration (in minutes) to pause trading after breach
}
```

#### `State`

Represents the current risk state of a trader for evaluation.

```go
type State struct {
    DailyPnL       float64   // Current daily profit/loss in currency units (negative = loss)
    PeakBalance    float64   // Peak balance achieved (used for drawdown calculation)
    CurrentBalance float64   // Current account balance
    LastResetTime  time.Time // When the daily PnL was last reset (typically 24h cycle)
}
```

### Core Methods

#### `NewEngine(l Limits) *Engine`

Constructs a new risk engine with default in-memory store and runtime flags.

```go
limits := risk.Limits{
    MaxDailyLoss:       100.0,  // Lose max 100 USDT per day
    MaxDrawdown:        20.0,   // 20% drawdown limit
    StopTradingMinutes: 30,     // Pause for 30 minutes on breach
}
engine := risk.NewEngine(limits)
```

#### `NewEngineWithContext(traderID, initialBalance, limits, store, flags) *Engine`

Constructs a risk engine with trader context, shared store, and feature flags. Use this when wiring the trading stack.

```go
limits := risk.Limits{
    MaxDailyLoss:       100.0,
    MaxDrawdown:        20.0,
    StopTradingMinutes: 30,
}
engine := risk.NewEngineWithContext("trader-1", 1000.0, limits, sharedStore, flags)
```

#### `CheckLimits(s State) (bool, string)`

Evaluates a risk state against configured limits. Returns `(true, reason)` if breached, `(false, "")` otherwise.

```go
state := risk.State{
    DailyPnL:       -120.0,
    PeakBalance:    1000.0,
    CurrentBalance: 880.0,
    LastResetTime:  time.Now().Add(-2 * time.Hour),
}

breached, reason := engine.CheckLimits(state)
if breached {
    log.Printf("RISK LIMIT BREACHED: %s", reason)
    // Pause trading for configured duration
}
```

#### `CalculateStopDuration() time.Duration`

Returns the configured pause duration when limits are breached.

```go
duration := engine.CalculateStopDuration()
pauseUntil := time.Now().Add(duration)
```

## Integration with AutoTrader

The `AutoTrader.CanTrade()` method integrates the risk engine's `CheckLimits` and `CalculateStopDuration` APIs:

```go
func (at *AutoTrader) CanTrade() (bool, string) {
    // ... existing pause window check ...
    
    // Build current state
    state := risk.State{
        DailyPnL:       snapshot.DailyPnL,
        PeakBalance:    snapshot.PeakEquity,
        CurrentBalance: snapshot.CurrentEquity,
        LastResetTime:  snapshot.LastReset,
    }

    // Check limits
    breached, reason := at.riskEngine.CheckLimits(state)
    if breached {
        log.Printf("RISK LIMIT BREACHED [%s]: %s", at.name, reason)
        
        // Calculate and set pause duration
        stopDuration := at.riskEngine.CalculateStopDuration()
        pausedUntil := now.Add(stopDuration)
        at.SetStopUntil(pausedUntil)
        
        // Emit metrics
        metrics.IncRiskLimitBreaches(at.id)
        
        return false, reason
    }

    return true, ""
}
```

## Feature Flag Gating

The risk engine respects the `enable_risk_enforcement` feature flag:

- **When enabled (true)**: All risk checks are active, and breaches pause trading.
- **When disabled (false)**: `CheckLimits` always returns `(false, "")`, restoring legacy behavior.

```go
// Disable risk enforcement
flags.SetRiskEnforcement(false)

// Now CheckLimits will always return (false, "")
breached, reason := engine.CheckLimits(state)
// breached == false regardless of actual state
```

## Logs and Metrics

### Logs

When limits are breached, the exact phrase **"RISK LIMIT BREACHED"** is logged:

```
RISK LIMIT BREACHED [trader-1]: daily pnl -120.00 <= limit -100.00
```

### Metrics

- `risk.limit_breaches`: Counter incremented on each breach
- `risk.trading_paused`: Gauge set when trading is paused/resumed
- `risk.check_latency`: Histogram of risk check durations

## Backward Compatibility

### Legacy Types

The previous `Parameters` and `Snapshot` types remain available but are deprecated:

```go
// Deprecated: Use Limits instead
type Parameters struct {
    MaxDailyLossPct float64
    MaxDrawdownPct  float64
    StopTradingFor  time.Duration
}
```

### Legacy Constructor

```go
// Deprecated: Use NewEngineWithContext with Limits instead
func NewEngineWithParameters(traderID string, initialBalance float64, params Parameters, store *Store, flags *featureflag.RuntimeFlags) *Engine
```

### Conversion Helpers

Internal conversion helpers bridge the old and new APIs:

```go
// Convert Parameters -> Limits
limits := parametersToLimits(params, initialBalance)

// Convert Limits -> Parameters
params := limitsToParameters(limits, initialBalance)
```

## Rollback Path

If issues arise, you can restore legacy behavior via feature flag:

1. Set `enable_risk_enforcement=false` in config or environment
2. Risk checks are bypassed, trading proceeds normally
3. Logs and metrics continue to fire but do not gate trading

## Configuration

Risk parameters are loaded from the JSON config:

```json
{
  "max_daily_loss": 5.0,        // Percentage (converted to absolute amount)
  "max_drawdown": 20.0,         // Percentage
  "stop_trading_minutes": 30,   // Minutes
  "feature_flags": {
    "enable_risk_enforcement": true
  }
}
```

The AutoTrader constructor converts percentage-based config to absolute limits:

```go
maxDailyLossAbs := initialBalance * config.MaxDailyLoss / 100
stopMinutes := int(config.StopTradingTime / time.Minute)

riskLimits := risk.Limits{
    MaxDailyLoss:       maxDailyLossAbs,
    MaxDrawdown:        config.MaxDrawdown,
    StopTradingMinutes: stopMinutes,
}
```

## Examples

### Example 1: Basic Risk Check

```go
engine := risk.NewEngine(risk.Limits{
    MaxDailyLoss:       50.0,
    MaxDrawdown:        20.0,
    StopTradingMinutes: 30,
})

state := risk.State{
    DailyPnL:       -60.0,  // Lost 60 USDT today
    PeakBalance:    1000.0,
    CurrentBalance: 940.0,
    LastResetTime:  time.Now().Add(-4 * time.Hour),
}

breached, reason := engine.CheckLimits(state)
// breached == true
// reason == "daily pnl -60.00 <= limit -50.00"
```

### Example 2: Drawdown Check

```go
state := risk.State{
    DailyPnL:       -20.0,
    PeakBalance:    1000.0,
    CurrentBalance: 750.0,  // 25% drawdown
    LastResetTime:  time.Now(),
}

breached, reason := engine.CheckLimits(state)
// breached == true
// reason == "drawdown 25.00% >= limit 20.00%"
```

### Example 3: No Breach

```go
state := risk.State{
    DailyPnL:       -30.0,  // Within limit
    PeakBalance:    1000.0,
    CurrentBalance: 970.0,  // Only 3% drawdown
    LastResetTime:  time.Now(),
}

breached, reason := engine.CheckLimits(state)
// breached == false
// reason == ""
```

## Testing

The risk engine includes comprehensive tests in `risk/api_test.go`:

```bash
go test ./risk/... -v
```

Key test coverage:
- Daily loss breach detection
- Drawdown breach detection
- No breach scenarios
- Feature flag gating
- Stop duration calculation
- Type conversions (Parameters ↔ Limits)

## Summary

The aligned risk engine API provides:

1. **Clean public contract**: `Limits`, `State`, `CheckLimits`, `CalculateStopDuration`
2. **Feature flag gating**: `enable_risk_enforcement` controls all checks
3. **Backward compatibility**: Legacy types and constructors remain functional
4. **AutoTrader integration**: `CanTrade()` uses new API with exact log phrase
5. **Rollback path**: Disable flag to restore legacy behavior
6. **Clear documentation**: Contract, examples, and migration guide
