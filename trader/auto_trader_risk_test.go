package trader

import (
	"fmt"
	"sync"
	"testing"
	"time"

	"nofx/featureflag"
	"nofx/risk"
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

	store := risk.NewStore()
	at, err := NewAutoTrader(cfg, store, flags)
	if err != nil {
		t.Fatalf("failed to create auto trader: %v", err)
	}
	return at
}

func TestAutoTraderRiskEnforcement(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true, EnableMutexProtection: true})
	at := newTestAutoTrader(t, flags)

	baselineLoss := at.initialBalance * at.config.MaxDailyLoss / 100
	loss := baselineLoss + 25
	at.UpdateDailyPnL(-loss)
	at.setCurrentBalance(at.initialBalance - loss)

	canTrade, reason := at.CanTrade()
	if canTrade {
		t.Fatalf("expected trading to pause after breaching risk limits, reason: %s", reason)
	}

	paused, until := at.riskEngine.TradingStatus()
	if !paused {
		t.Fatalf("risk engine should report trading paused")
	}
	if until.IsZero() {
		t.Fatalf("expected non-zero pause deadline")
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

	snapshot := at.riskEngine.Snapshot()
	expected := float64(workers * iterations)
	if snapshot.DailyPnL != expected {
		t.Fatalf("expected daily pnl %.0f, got %.0f", expected, snapshot.DailyPnL)
	}
}

func TestRiskParameterAdjustments(t *testing.T) {
	t.Run("tolerance increases", func(t *testing.T) {
		at := newTestAutoTrader(t, featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true, EnableMutexProtection: true}))
		params := at.riskEngine.Parameters()
		params.MaxDailyLossPct *= 1.10
		at.riskEngine.UpdateParameters(params)

		baselineLoss := at.initialBalance * at.config.MaxDailyLoss / 100
		loss := baselineLoss * 1.05
		at.UpdateDailyPnL(-loss)

		decision := at.riskEngine.Assess(at.initialBalance - loss)
		if decision.TradingPaused {
			t.Fatalf("expected trading to remain active after loosening limits")
		}
	})

	t.Run("tolerance tightens", func(t *testing.T) {
		at := newTestAutoTrader(t, featureflag.NewRuntimeFlags(featureflag.State{EnableRiskEnforcement: true, EnableMutexProtection: true}))
		params := at.riskEngine.Parameters()
		params.MaxDailyLossPct *= 0.90
		at.riskEngine.UpdateParameters(params)

		baselineLoss := at.initialBalance * at.config.MaxDailyLoss / 100
		loss := baselineLoss * 0.95
		at.UpdateDailyPnL(-loss)

		decision := at.riskEngine.Assess(at.initialBalance - loss)
		if !decision.TradingPaused {
			t.Fatalf("expected trading pause after tightening limits")
		}
	})
}
