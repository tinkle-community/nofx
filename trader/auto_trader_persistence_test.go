package trader

import (
	"context"
	"errors"
	"os"
	"strings"
	"testing"
	"time"

	"nofx/featureflag"
	"nofx/risk"
	testpg "nofx/testsupport/postgres"
)

func TestNewAutoTraderWithPersistence_Disabled(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnablePersistence:     false,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-persist-disabled",
		Name:             "Persistence Disabled",
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

	at, err := NewAutoTraderWithPersistence(cfg, "postgres://invalid", flags)
	if err != nil {
		t.Fatalf("NewAutoTraderWithPersistence failed: %v", err)
	}

	if at == nil {
		t.Fatal("expected non-nil AutoTrader")
	}

	if at.persistStore != nil {
		t.Error("persistence should be disabled")
	}
}

func TestNewAutoTraderWithPersistence_InvalidDB(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnablePersistence:     true,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-invalid-db",
		Name:             "Invalid DB Test",
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

	at, err := NewAutoTraderWithPersistence(cfg, "postgres://invalid:5432/nonexistent?connect_timeout=1", flags)
	if err != nil {
		t.Fatalf("expected graceful degradation on db failure, got: %v", err)
	}

	if at == nil {
		t.Fatal("expected non-nil AutoTrader even with invalid db")
	}

	if at.persistStore != nil {
		t.Error("persistence should gracefully degrade on db failure")
	}
}

func TestAutoTrader_CanTrade(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-can-trade",
		Name:             "Can Trade Test",
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
		t.Fatalf("NewAutoTrader failed: %v", err)
	}

	canTrade, reason := at.CanTrade()
	if !canTrade {
		t.Errorf("expected trading to be allowed initially, got reason: %s", reason)
	}

	at.SetStopUntil(time.Now().Add(10 * time.Minute))
	canTrade, reason = at.CanTrade()
	if canTrade {
		t.Error("expected trading to be blocked when stopUntil is set")
	}
	if reason == "" {
		t.Error("expected non-empty reason when trading is blocked")
	}
}

func TestAutoTrader_CanTrade_RiskEnforcementDisabled(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: false,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-can-trade-disabled",
		Name:             "Risk Enforcement Disabled",
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
		t.Fatalf("NewAutoTrader failed: %v", err)
	}

	at.UpdateDailyPnL(-200.0)

	canTrade, _ := at.CanTrade()
	if !canTrade {
		t.Error("expected trading to be allowed when risk enforcement is disabled")
	}
}

func TestAutoTrader_CanTrade_RiskBreach(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-risk-breach",
		Name:             "Risk Breach Test",
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
		t.Fatalf("NewAutoTrader failed: %v", err)
	}

	at.setCurrentBalance(900.0)
	at.UpdateDailyPnL(-100.0)

	canTrade, reason := at.CanTrade()
	if canTrade {
		t.Error("expected trading to be blocked after risk breach")
	}
	if reason == "" {
		t.Error("expected non-empty reason after risk breach")
	}
}

func TestAutoTrader_ClosePersistence(t *testing.T) {
	cfg := AutoTraderConfig{
		ID:               "test-close-persist",
		Name:             "Close Persistence Test",
		AIModel:          "deepseek",
		Exchange:         "binance",
		BinanceAPIKey:    "key",
		BinanceSecretKey: "secret",
		DeepSeekKey:      "test-key",
		ScanInterval:     time.Minute,
		InitialBalance:   1000.0,
		BTCETHLeverage:   5,
		AltcoinLeverage:  5,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return newFakeTrader(), nil
		},
	}

	at, err := NewAutoTrader(cfg, nil, nil)
	if err != nil {
		t.Fatalf("NewAutoTrader failed: %v", err)
	}

	at.ClosePersistence()
	at.ClosePersistence()
}

func skipIfNoPostgres(t *testing.T) string {
	t.Helper()
	connStr := os.Getenv("TEST_DB_URL")
	if connStr == "" {
		if ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute); ctx.Err() == nil {
			defer cancel()
			instance, err := testpg.Start(ctx)
			if err != nil {
				if errors.Is(err, testpg.ErrDockerDisabled) {
					t.Skip("Skipping test: SKIP_DOCKER_TESTS=1")
				}
				if errors.Is(err, testpg.ErrDockerUnavailable) {
					t.Skipf("Skipping test: %v", err)
				}
				if strings.Contains(err.Error(), "Cannot connect") {
					t.Skipf("Skipping test: %v", err)
				}
				t.Fatalf("start postgres container: %v", err)
			}
			t.Cleanup(func() { instance.Terminate(context.Background()) })
			return instance.ConnectionString()
		}
		t.Skip("Skipping test: no TEST_DB_URL provided")
	}
	return connStr
}

func TestAutoTrader_PersistenceIntegration(t *testing.T) {
	dbURL := skipIfNoPostgres(t)

	flags := featureflag.NewRuntimeFlags(featureflag.State{
		EnablePersistence:     true,
		EnableRiskEnforcement: true,
		EnableMutexProtection: true,
	})

	cfg := AutoTraderConfig{
		ID:               "test-persist-integration",
		Name:             "Persistence Integration",
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
		FeatureFlags:     flags,
		TraderFactory: func(AutoTraderConfig) (Trader, error) {
			return newFakeTrader(), nil
		},
	}

	at, err := NewAutoTraderWithPersistence(cfg, dbURL, flags)
	if err != nil {
		t.Fatalf("NewAutoTraderWithPersistence failed: %v", err)
	}
	defer at.ClosePersistence()

	if at.persistStore == nil {
		t.Fatal("expected persistence to be enabled")
	}

	at.UpdateDailyPnL(-25.0)
	time.Sleep(200 * time.Millisecond)

	at.ClosePersistence()

	at2, err := NewAutoTraderWithPersistence(cfg, dbURL, flags)
	if err != nil {
		t.Fatalf("NewAutoTraderWithPersistence (second instance) failed: %v", err)
	}
	defer at2.ClosePersistence()

	dailyPnL := at2.GetDailyPnL()
	if dailyPnL != -25.0 {
		t.Errorf("expected restored dailyPnL to be -25.0, got %.2f", dailyPnL)
	}
}
