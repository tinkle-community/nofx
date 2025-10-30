package trader

import (
	"fmt"
	"testing"

	"nofx/decision"
	"nofx/featureflag"
	"nofx/risk"
)

type stopLossFailingTrader struct {
	*fakeTrader
	stopLossShouldFail bool
}

func newStopLossFailingTrader(shouldFail bool) *stopLossFailingTrader {
	return &stopLossFailingTrader{
		fakeTrader:         newFakeTrader(),
		stopLossShouldFail: shouldFail,
	}
}

func (t *stopLossFailingTrader) SetStopLoss(string, string, float64, float64) error {
	if t.stopLossShouldFail {
		return fmt.Errorf("simulated stop-loss placement failure")
	}
	return nil
}

func TestGuardedStopLoss_BlocksPositionWhenStopLossFails(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: true,
		EnableRiskEnforcement: false,
		EnableMutexProtection: true,
	})

	failingTrader := newStopLossFailingTrader(true)

	cfg := AutoTraderConfig{
		ID:               "test-guarded-stoploss",
		Name:             "Guarded Stop-Loss Test",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		InitialBalance:   1000.0,
		BTCETHLeverage:   5,
		AltcoinLeverage:  5,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return failingTrader, nil
		},
	}

	store := risk.NewStore()
	at, err := NewAutoTrader(cfg, store, flags)
	if err != nil {
		t.Fatalf("NewAutoTrader failed: %v", err)
	}

	dec := &decision.Decision{
		Action:     "open_long",
		Symbol:     "BTCUSDT",
		Leverage:   5,
		StopLoss:   40000.0,
		TakeProfit: 60000.0,
	}

	_, err = at.openPositionWithProtection(dec, 0.01)
	if err == nil {
		t.Fatal("expected error when stop-loss placement fails with guarded stop-loss enabled")
	}

	if err.Error() != "stop-loss placement failed: simulated stop-loss placement failure" {
		t.Errorf("unexpected error message: %v", err)
	}
}

func TestGuardedStopLoss_BlocksPositionWhenMissingStopLoss(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: true,
		EnableRiskEnforcement: false,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-missing-stoploss",
		Name:             "Missing Stop-Loss Test",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		InitialBalance:   1000.0,
		BTCETHLeverage:   5,
		AltcoinLeverage:  5,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return newFakeTrader(), nil
		},
	}

	store := risk.NewStore()
	at, err := NewAutoTrader(cfg, store, flags)
	if err != nil {
		t.Fatalf("NewAutoTrader failed: %v", err)
	}

	dec := &decision.Decision{
		Action:     "open_long",
		Symbol:     "BTCUSDT",
		Leverage:   5,
		StopLoss:   0,
		TakeProfit: 60000.0,
	}

	_, err = at.openPositionWithProtection(dec, 0.01)
	if err == nil {
		t.Fatal("expected error when stop-loss is missing with guarded stop-loss enabled")
	}

	expectedMsg := "guarded stop-loss enforcement requires stop-loss for BTCUSDT"
	if err.Error() != expectedMsg {
		t.Errorf("expected error message %q, got %q", expectedMsg, err.Error())
	}
}

func TestGuardedStopLoss_AllowsPositionWhenDisabled(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: false,
		EnableRiskEnforcement: false,
		EnableMutexProtection: true,
	})

	failingTrader := newStopLossFailingTrader(true)

	cfg := AutoTraderConfig{
		ID:               "test-disabled-guarded",
		Name:             "Disabled Guarded Stop-Loss Test",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		InitialBalance:   1000.0,
		BTCETHLeverage:   5,
		AltcoinLeverage:  5,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return failingTrader, nil
		},
	}

	store := risk.NewStore()
	at, err := NewAutoTrader(cfg, store, flags)
	if err != nil {
		t.Fatalf("NewAutoTrader failed: %v", err)
	}

	dec := &decision.Decision{
		Action:     "open_long",
		Symbol:     "BTCUSDT",
		Leverage:   5,
		StopLoss:   40000.0,
		TakeProfit: 60000.0,
	}

	order, err := at.openPositionWithProtection(dec, 0.01)
	if err != nil {
		t.Fatalf("expected success when guarded stop-loss disabled, got error: %v", err)
	}

	if order == nil {
		t.Fatal("expected non-nil order when guarded stop-loss disabled")
	}
}

func TestGuardedStopLoss_SuccessfulPlacement(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: true,
		EnableRiskEnforcement: false,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-successful-guarded",
		Name:             "Successful Guarded Stop-Loss Test",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		InitialBalance:   1000.0,
		BTCETHLeverage:   5,
		AltcoinLeverage:  5,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return newFakeTrader(), nil
		},
	}

	store := risk.NewStore()
	at, err := NewAutoTrader(cfg, store, flags)
	if err != nil {
		t.Fatalf("NewAutoTrader failed: %v", err)
	}

	dec := &decision.Decision{
		Action:     "open_long",
		Symbol:     "BTCUSDT",
		Leverage:   5,
		StopLoss:   40000.0,
		TakeProfit: 60000.0,
	}

	order, err := at.openPositionWithProtection(dec, 0.01)
	if err != nil {
		t.Fatalf("expected success with valid stop-loss, got error: %v", err)
	}

	if order == nil {
		t.Fatal("expected non-nil order with valid stop-loss")
	}
}
