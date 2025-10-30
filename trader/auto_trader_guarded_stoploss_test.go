package trader

import (
	"errors"
	"testing"
	"time"

	"nofx/decision"
	"nofx/featureflag"
	"nofx/risk"
)

type mockTraderWithStopLossFailure struct {
	*fakeTrader
	shouldFailStopLoss bool
}

func (m *mockTraderWithStopLossFailure) SetStopLoss(symbol, side string, quantity, price float64) error {
	if m.shouldFailStopLoss {
		return errors.New("simulated stop-loss placement failure")
	}
	return nil
}

type mockTraderOpenFailure struct {
	*fakeTrader
	cancelCalls int
	err         error
}

func (m *mockTraderOpenFailure) OpenLong(symbol string, quantity float64, leverage int) (map[string]interface{}, error) {
	if m.err == nil {
		return nil, errors.New("open error not provided")
	}
	return nil, m.err
}

func (m *mockTraderOpenFailure) OpenShort(symbol string, quantity float64, leverage int) (map[string]interface{}, error) {
	return m.OpenLong(symbol, quantity, leverage)
}

func (m *mockTraderOpenFailure) CancelAllOrders(symbol string) error {
	m.cancelCalls++
	return nil
}

func TestAutoTrader_GuardedStopLoss_PreventOpenOnMissingStopLoss(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: true,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-guarded-missing-sl",
		Name:             "Guarded Missing SL",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		ScanInterval:     time.Minute,
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

	decision := decision.Decision{
		Symbol:          "BTCUSDT",
		Action:          "open_long",
		Leverage:        5,
		PositionSizeUSD: 100.0,
		StopLoss:        0,
		TakeProfit:      50000.0,
	}

	_, err = at.openPositionWithProtection(&decision, 0.002)
	if err == nil {
		t.Fatal("expected error when opening position without stop-loss with guarded enforcement")
	}
	if err.Error() != "guarded stop-loss enforcement requires stop-loss for BTCUSDT" {
		t.Errorf("unexpected error message: %v", err)
	}
}

func TestAutoTrader_GuardedStopLoss_BlockOnStopLossPlacementFailure(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: true,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-guarded-sl-fail",
		Name:             "Guarded SL Failure",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		ScanInterval:     time.Minute,
		InitialBalance:   1000.0,
		BTCETHLeverage:   5,
		AltcoinLeverage:  5,
		MaxDailyLoss:     5.0,
		MaxDrawdown:      20.0,
		StopTradingTime:  time.Minute,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return &mockTraderWithStopLossFailure{
				fakeTrader:         newFakeTrader(),
				shouldFailStopLoss: true,
			}, nil
		},
	}

	store := risk.NewStore()
	at, err := NewAutoTrader(cfg, store, flags)
	if err != nil {
		t.Fatalf("failed to create auto trader: %v", err)
	}

	dec := decision.Decision{
		Symbol:          "BTCUSDT",
		Action:          "open_long",
		Leverage:        5,
		PositionSizeUSD: 100.0,
		StopLoss:        45000.0,
		TakeProfit:      50000.0,
	}

	_, err = at.openPositionWithProtection(&dec, 0.002)
	if err == nil {
		t.Fatal("expected error when stop-loss placement fails with guarded enforcement")
	}
	if err.Error() != "stop-loss placement failed: simulated stop-loss placement failure" {
		t.Errorf("unexpected error message: %v", err)
	}
}

func TestAutoTrader_GuardedStopLoss_RollbackOnOpenFailure(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: true,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	failureErr := errors.New("simulated open failure")
	failingTrader := &mockTraderOpenFailure{
		fakeTrader: newFakeTrader(),
		err:        failureErr,
	}

	cfg := AutoTraderConfig{
		ID:               "test-guarded-sl-open-fail",
		Name:             "Guarded SL Open Failure",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		ScanInterval:     time.Minute,
		InitialBalance:   1000.0,
		BTCETHLeverage:   5,
		AltcoinLeverage:  5,
		MaxDailyLoss:     5.0,
		MaxDrawdown:      20.0,
		StopTradingTime:  time.Minute,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return failingTrader, nil
		},
	}

	store := risk.NewStore()
	at, err := NewAutoTrader(cfg, store, flags)
	if err != nil {
		t.Fatalf("failed to create auto trader: %v", err)
	}

	dec := decision.Decision{
		Symbol:          "BTCUSDT",
		Action:          "open_long",
		Leverage:        5,
		PositionSizeUSD: 100.0,
		StopLoss:        45000.0,
		TakeProfit:      50000.0,
	}

	order, err := at.openPositionWithProtection(&dec, 0.002)
	if err == nil {
		t.Fatal("expected open position error when exchange rejects order")
	}
	if !errors.Is(err, failureErr) {
		t.Fatalf("expected failure error %v, got %v", failureErr, err)
	}
	if order != nil {
		t.Fatalf("expected nil order on failure, got %v", order)
	}
	if failingTrader.cancelCalls != 1 {
		t.Fatalf("expected CancelAllOrders to be invoked once, got %d calls", failingTrader.cancelCalls)
	}
}

func TestAutoTrader_GuardedStopLoss_SuccessWhenStopLossSet(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: true,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-guarded-sl-success",
		Name:             "Guarded SL Success",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		ScanInterval:     time.Minute,
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

	dec := decision.Decision{
		Symbol:          "BTCUSDT",
		Action:          "open_long",
		Leverage:        5,
		PositionSizeUSD: 100.0,
		StopLoss:        45000.0,
		TakeProfit:      50000.0,
	}

	order, err := at.openPositionWithProtection(&dec, 0.002)
	if err != nil {
		t.Fatalf("expected success when stop-loss is properly set, got error: %v", err)
	}
	if order == nil {
		t.Fatal("expected non-nil order")
	}
}

func TestAutoTrader_GuardedStopLoss_DisabledBypass(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: false,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-guarded-disabled",
		Name:             "Guarded Disabled",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		ScanInterval:     time.Minute,
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

	dec := decision.Decision{
		Symbol:          "BTCUSDT",
		Action:          "open_long",
		Leverage:        5,
		PositionSizeUSD: 100.0,
		StopLoss:        0,
		TakeProfit:      50000.0,
	}

	order, err := at.openPositionWithProtection(&dec, 0.002)
	if err != nil {
		t.Fatalf("expected success when guarded stop-loss is disabled, got error: %v", err)
	}
	if order == nil {
		t.Fatal("expected non-nil order when guarded stop-loss is disabled")
	}
}

func TestAutoTrader_GuardedStopLoss_PausedByRiskEngine_NoOpen(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableGuardedStopLoss: true,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-guarded-paused",
		Name:             "Guarded Paused",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		ScanInterval:     time.Minute,
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

	maxLoss := at.initialBalance * at.config.MaxDailyLoss / 100
	at.UpdateDailyPnL(-(maxLoss + 10))
	at.setCurrentBalance(at.initialBalance - (maxLoss + 10))

	canTrade, reason := at.CanTrade()
	if canTrade {
		t.Fatalf("expected trading to be blocked by risk engine, got canTrade=true, reason=%s", reason)
	}
}
