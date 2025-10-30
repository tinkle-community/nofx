package config

import (
	"os"
	"path/filepath"
	"testing"
)

func writeTempConfig(t *testing.T, content string) string {
	t.Helper()

	dir := t.TempDir()
	path := filepath.Join(dir, "config.json")
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatalf("failed to write temp config: %v", err)
	}
	return path
}

func TestLoadConfigAppliesDefaults(t *testing.T) {
	configJSON := `{
        "traders": [
            {
                "id": "t-1",
                "name": "Trader One",
                "ai_model": "deepseek",
                "exchange": "binance",
                "binance_api_key": "api-key",
                "binance_secret_key": "secret",
                "deepseek_key": "deep-key",
                "initial_balance": 1000,
                "scan_interval_minutes": 3
            }
        ],
        "use_default_coins": false,
        "coin_pool_api_url": "",
        "api_server_port": 0,
        "leverage": {
            "btc_eth_leverage": 0,
            "altcoin_leverage": 0
        }
    }`

	path := writeTempConfig(t, configJSON)

	cfg, err := LoadConfig(path)
	if err != nil {
		t.Fatalf("LoadConfig returned error: %v", err)
	}

	if !cfg.UseDefaultCoins {
		t.Fatalf("expected UseDefaultCoins to default to true when no API provided")
	}

	if cfg.APIServerPort != 8080 {
		t.Fatalf("expected default API port 8080, got %d", cfg.APIServerPort)
	}

	if cfg.Leverage.BTCETHLeverage != 5 {
		t.Fatalf("expected default BTC/ETH leverage of 5, got %d", cfg.Leverage.BTCETHLeverage)
	}

	if cfg.Leverage.AltcoinLeverage != 5 {
		t.Fatalf("expected default altcoin leverage of 5, got %d", cfg.Leverage.AltcoinLeverage)
	}

	if cfg.PersistenceBackend != "memory" {
		t.Fatalf("expected persistence backend to default to memory, got %q", cfg.PersistenceBackend)
	}

	flags := cfg.FeatureFlags
	if !flags.EnableGuardedStopLoss || !flags.EnableMutexProtection || !flags.EnablePersistence || !flags.EnableRiskEnforcement {
		t.Fatalf("expected default feature flags to be enabled, got %+v", flags)
	}
}

func TestLoadConfigHonorsEnvOverrides(t *testing.T) {
	t.Setenv("POSTGRES_URL", "postgres://env-user:env-pass@localhost:5432/env-db?sslmode=disable")
	t.Setenv("PERSISTENCE_BACKEND", "POSTGRES ")
	t.Setenv("POSTGRES_SSLMODE", "require")
	t.Setenv("ENABLE_GUARDED_STOP_LOSS", "false")
	t.Setenv("USE_PNL_MUTEX", "0")
	t.Setenv("ENABLE_PERSISTENCE", "false")
	t.Setenv("ENFORCE_RISK_LIMITS", "1")
	t.Setenv("ENABLE_RISK_ENFORCEMENT", "false")

	configJSON := `{
        "traders": [
            {
                "id": "t-env",
                "name": "Env Trader",
                "ai_model": "deepseek",
                "exchange": "binance",
                "binance_api_key": "api",
                "binance_secret_key": "secret",
                "deepseek_key": "key",
                "initial_balance": 500,
                "scan_interval_minutes": 3
            }
        ],
        "feature_flags": {
            "enable_guarded_stop_loss": true,
            "enable_mutex_protection": true,
            "enable_persistence": true,
            "enable_risk_enforcement": true
        }
    }`

	path := writeTempConfig(t, configJSON)

	cfg, err := LoadConfig(path)
	if err != nil {
		t.Fatalf("LoadConfig returned error: %v", err)
	}

	if cfg.PostgresURL != "postgres://env-user:env-pass@localhost:5432/env-db?sslmode=disable" {
		t.Fatalf("expected PostgresURL to be overridden by environment, got %q", cfg.PostgresURL)
	}

	if cfg.PersistenceBackend != "postgres" {
		t.Fatalf("expected persistence backend to be normalized to 'postgres', got %q", cfg.PersistenceBackend)
	}

	if cfg.PostgresSSLMode != "require" {
		t.Fatalf("expected PostgresSSLMode to be 'require', got %q", cfg.PostgresSSLMode)
	}

	flags := cfg.FeatureFlags
	if flags.EnableGuardedStopLoss {
		t.Fatalf("expected guarded stop-loss to be disabled via env override")
	}
	if flags.EnableMutexProtection {
		t.Fatalf("expected mutex protection to be disabled via env override")
	}
	if flags.EnablePersistence {
		t.Fatalf("expected persistence flag to be disabled via env override")
	}
	if flags.EnableRiskEnforcement {
		t.Fatalf("expected risk enforcement to be disabled via env override")
	}
}
