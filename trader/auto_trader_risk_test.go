package trader

import (
	"fmt"
	"path/filepath"
	"sync"
	"testing"
	"time"

	"nofx/featureflag"
)

type fakeTrader struct{}

func newFakeTrader() *fakeTrader {
	return &fakeTrader{}
}

func (f *fakeTrader) GetBalance() (map[string]interface{}, error) {
	return map[string]interface{}{
		"totalWalletBalance":    1000.0,
		"availableBalance":      1000.0,
		"totalUnrealizedProfit": 0.0,
	}, nil
}

func (f *fakeTrader) GetPositions() ([]map[string]interface{}, error) {
	return nil, nil
}

func (f *fakeTrader) OpenLong(string, float64, int) (map[string]interface{}, error) {
	return map[string]interface{}{"orderId": int64(1)}, nil
}

func (f *fakeTrader) OpenShort(string, float64, int) (map[string]interface{}, error) {
	return map[string]interface{}{"orderId": int64(2)}, nil
}

func (f *fakeTrader) CloseLong(string, float64) (map[string]interface{}, error) {
	return map[string]interface{}{"orderId": int64(3)}, nil
}

func (f *fakeTrader) CloseShort(string, float64) (map[string]interface{}, error) {
	return map[string]interface{}{"orderId": int64(4)}, nil
}

func (f *fakeTrader) SetLeverage(string, int) error                        { return nil }
func (f *fakeTrader) GetMarketPrice(string) (float64, error)               { return 1, nil }
func (f *fakeTrader) SetStopLoss(string, string, float64, float64) error   { return nil }
func (f *fakeTrader) SetTakeProfit(string, string, float64, float64) error { return nil }
func (f *fakeTrader) CancelAllOrders(string) error                         { return nil }
func (f *fakeTrader) FormatQuantity(_ string, quantity float64) (string, error) {
	return fmt.Sprintf("%.4f", quantity), nil
}

func newTestAutoTrader(t *testing.T, flags *featureflag.RuntimeFlags) *AutoTrader {
	t.Helper()
	if flags == nil {
		flags = featureflag.NewRuntimeFlags(featureflag.State{
			EnableRiskEnforcement: true,
			EnableMutexProtection: true,
		})
	}

	cfg := AutoTraderConfig{
		ID:               "risk-test",
		Name:             "Risk Test Trader",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		ScanInterval:     time.Second,
		InitialBalance:   1000.0,
		BTCETHLeverage:   5,
		AltcoinLeverage:  5,
		MaxDailyLoss:     5.0,
		MaxDrawdown:      20.0,
		StopTradingTime:  time.Minute,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return newFakeTrader(), nil
		},
	}

	at, err := NewAutoTrader(cfg, nil, flags)
	if err != nil {
		t.Fatalf("failed to create auto trader: %v", err)
	}
	return at
}

func TestAutoTraderRiskEnforcement(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true, EnableMutexProtection: true})
	at := newTestAutoTrader(t, flags)

	baselineLoss := at.initialBalance * at.config.MaxDailyLoss / 100
	loss := baselineLoss + 50
	at.UpdateDailyPnL(-loss)

	ok, reason := at.CanTrade()
	if ok {
		t.Fatalf("expected trading to be halted after breaching limits")
	}
	if reason == "" {
		t.Fatalf("expected reason for trading pause")
	}

	stopUntil := at.GetStopUntil()
	if stopUntil.IsZero() || !stopUntil.After(time.Now()) {
		t.Fatalf("expected future stop deadline")
	}

	// Subsequent checks should remain paused until the deadline expires.
	if ok, _ := at.CanTrade(); ok {
		t.Fatalf("expected trading to remain paused while stopUntil is in the future")
	}
}

func TestAutoTraderRiskEnforcementDisabled(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: false, EnableMutexProtection: true})
	at := newTestAutoTrader(t, flags)

	// Exceed the nominal loss limit but expect trading to remain allowed.
	baselineLoss := at.initialBalance * at.config.MaxDailyLoss / 100
	at.UpdateDailyPnL(-(baselineLoss * 2))

	if ok, reason := at.CanTrade(); !ok {
		t.Fatalf("expected trading to remain allowed when enforcement is disabled, reason: %s", reason)
	}
}

func TestUpdateDailyPnLConcurrent(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: false, EnableMutexProtection: true})
	at := newTestAutoTrader(t, flags)

	var wg sync.WaitGroup
	workers := 8
	iterations := 500

	wg.Add(workers)
	for i := 0; i < workers; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < iterations; j++ {
				at.UpdateDailyPnL(1)
			}
		}()
	}
	wg.Wait()

	expected := float64(workers * iterations)
	if got := at.GetDailyPnL(); got != expected {
		t.Fatalf("expected daily pnl %.0f, got %.0f", expected, got)
	}
}

func TestRiskParameterAdjustments(t *testing.T) {
	t.Run("tolerance increases", func(t *testing.T) {
		at := newTestAutoTrader(t, featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true, EnableMutexProtection: true}))
		limits := at.riskEngine.Limits()
		limits.MaxDailyLoss *= 1.10
		at.riskEngine.UpdateLimits(limits)

		safeLoss := limits.MaxDailyLoss * 0.95
		at.UpdateDailyPnL(-safeLoss)

		if ok, reason := at.CanTrade(); !ok {
			t.Fatalf("expected trading to remain active after loosening limits, got reason: %s", reason)
		}
	})

	t.Run("tolerance tightens", func(t *testing.T) {
		at := newTestAutoTrader(t, featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true, EnableMutexProtection: true}))
		limits := at.riskEngine.Limits()
		limits.MaxDailyLoss *= 0.90
		at.riskEngine.UpdateLimits(limits)

		breachLoss := limits.MaxDailyLoss * 1.05
		at.UpdateDailyPnL(-breachLoss)

		if ok, reason := at.CanTrade(); ok {
			t.Fatalf("expected trading pause after tightening limits, reason: %s", reason)
		}
	})
}

func TestAutoTraderStopUntilGuard(t *testing.T) {
	at := newTestAutoTrader(t, featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: false, EnableMutexProtection: true}))

	future := time.Now().Add(5 * time.Minute)
	at.SetStopUntil(future)

	if ok, _ := at.CanTrade(); ok {
		t.Fatalf("expected trading to be paused when stopUntil is set in the future")
	}

	at.SetStopUntil(time.Now().Add(-time.Minute))

	if ok, reason := at.CanTrade(); !ok {
		t.Fatalf("expected trading to resume after stop elapsed, reason: %s", reason)
	}
}

func TestAutoTraderPersistenceRecovery(t *testing.T) {
	dir := t.TempDir()
	dbPath := filepath.Join(dir, "risk.db")

	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnablePersistence:     true,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:              "persist-test",
		Name:            "Persist Test",
		AIModel:         "deepseek",
		Exchange:        "binance",
		DeepSeekKey:     "test-key",
		ScanInterval:    time.Second,
		InitialBalance:  500.0,
		MaxDailyLoss:    5.0,
		MaxDrawdown:     10.0,
		StopTradingTime: time.Minute,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return newFakeTrader(), nil
		},
	}

	at, err := NewAutoTraderWithPersistence(cfg, dbPath, flags)
	if err != nil {
		t.Fatalf("failed to create persisted auto trader: %v", err)
	}

	at.UpdateDailyPnL(42)
	pauseUntil := time.Now().Add(10 * time.Minute).UTC().Round(time.Second)
	at.SetStopUntil(pauseUntil)
	at.Stop()

	restored, err := NewAutoTraderWithPersistence(cfg, dbPath, flags)
	if err != nil {
		t.Fatalf("failed to restore auto trader: %v", err)
	}
	defer restored.Stop()

	if got := restored.GetDailyPnL(); got != 42 {
		t.Fatalf("expected daily pnl 42, got %.2f", got)
	}

	restoredStop := restored.GetStopUntil()
	if restoredStop.IsZero() {
		t.Fatalf("expected non-zero stop until after recovery")
	}
	if !restoredStop.Equal(pauseUntil) {
		t.Fatalf("expected stop until %s, got %s", pauseUntil, restoredStop)
	}
}
