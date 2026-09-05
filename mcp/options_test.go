package mcp

import (
	"net/http"
	"testing"
	"time"
)

// ============================================================
// Test Basic Options
// ============================================================

func TestWithProvider(t *testing.T) {
	cfg := DefaultConfig()
	WithProvider("custom-provider")(cfg)

	if cfg.Provider != "custom-provider" {
		t.Errorf("expected 'custom-provider', got '%s'", cfg.Provider)
	}
}

func TestWithAPIKey(t *testing.T) {
	cfg := DefaultConfig()
	WithAPIKey("sk-test-key")(cfg)

	if cfg.APIKey != "sk-test-key" {
		t.Errorf("expected 'sk-test-key', got '%s'", cfg.APIKey)
	}
}

func TestWithBaseURL(t *testing.T) {
	cfg := DefaultConfig()
	WithBaseURL("https://api.test.com")(cfg)

	if cfg.BaseURL != "https://api.test.com" {
		t.Errorf("expected 'https://api.test.com', got '%s'", cfg.BaseURL)
	}
}

func TestWithModel(t *testing.T) {
	cfg := DefaultConfig()
	WithModel("test-model")(cfg)

	if cfg.Model != "test-model" {
		t.Errorf("expected 'test-model', got '%s'", cfg.Model)
	}
}

func TestWithMaxTokens(t *testing.T) {
	cfg := DefaultConfig()
	WithMaxTokens(4000)(cfg)

	if cfg.MaxTokens != 4000 {
		t.Errorf("expected 4000, got %d", cfg.MaxTokens)
	}
}

func TestWithTemperature(t *testing.T) {
	cfg := DefaultConfig()
	WithTemperature(0.8)(cfg)

	if cfg.Temperature != 0.8 {
		t.Errorf("expected 0.8, got %f", cfg.Temperature)
	}
}

func TestWithUseFullURL(t *testing.T) {
	cfg := DefaultConfig()
	WithUseFullURL(true)(cfg)

	if !cfg.UseFullURL {
		t.Error("UseFullURL should be true")
	}
}

func TestWithMaxRetries(t *testing.T) {
	cfg := DefaultConfig()
	WithMaxRetries(5)(cfg)

	if cfg.MaxRetries != 5 {
		t.Errorf("expected 5, got %d", cfg.MaxRetries)
	}
}

func TestWithTimeout(t *testing.T) {
	cfg := DefaultConfig()
	WithTimeout(60 * time.Second)(cfg)

	if cfg.Timeout != 60*time.Second {
		t.Errorf("expected 60s, got %v", cfg.Timeout)
	}
}

func TestWithLogger(t *testing.T) {
	cfg := DefaultConfig()
	mockLogger := NewMockLogger()
	WithLogger(mockLogger)(cfg)

	if cfg.Logger != mockLogger {
		t.Error("Logger should be set to mockLogger")
	}
}

func TestWithHTTPClient(t *testing.T) {
	cfg := DefaultConfig()
	customClient := &http.Client{Timeout: 30 * time.Second}
	WithHTTPClient(customClient)(cfg)

	if cfg.HTTPClient != customClient {
		t.Error("HTTPClient should be set to customClient")
	}

	if cfg.HTTPClient.Timeout != 30*time.Second {
		t.Errorf("expected 30s, got %v", cfg.HTTPClient.Timeout)
	}
}

// ============================================================
// Test Preset Configuration Options
// ============================================================

func TestWithDeepSeekConfig(t *testing.T) {
	cfg := DefaultConfig()
	WithDeepSeekConfig("sk-deepseek-key")(cfg)

	if cfg.Provider != ProviderDeepSeek {
		t.Errorf("Provider should be '%s', got '%s'", ProviderDeepSeek, cfg.Provider)
	}

	if cfg.APIKey != "sk-deepseek-key" {
		t.Errorf("APIKey should be 'sk-deepseek-key', got '%s'", cfg.APIKey)
	}

	if cfg.BaseURL != DefaultDeepSeekBaseURL {
		t.Errorf("BaseURL should be '%s', got '%s'", DefaultDeepSeekBaseURL, cfg.BaseURL)
	}

	if cfg.Model != DefaultDeepSeekModel {
		t.Errorf("Model should be '%s', got '%s'", DefaultDeepSeekModel, cfg.Model)
	}
}

func TestWithQwenConfig(t *testing.T) {
	cfg := DefaultConfig()
	WithQwenConfig("sk-qwen-key")(cfg)

	if cfg.Provider != ProviderQwen {
		t.Errorf("Provider should be '%s', got '%s'", ProviderQwen, cfg.Provider)
	}

	if cfg.APIKey != "sk-qwen-key" {
		t.Errorf("APIKey should be 'sk-qwen-key', got '%s'", cfg.APIKey)
	}

	if cfg.BaseURL != DefaultQwenBaseURL {
		t.Errorf("BaseURL should be '%s', got '%s'", DefaultQwenBaseURL, cfg.BaseURL)
	}

	if cfg.Model != DefaultQwenModel {
		t.Errorf("Model should be '%s', got '%s'", DefaultQwenModel, cfg.Model)
	}
}

func TestWithAtlasCloudConfig(t *testing.T) {
	cfg := DefaultConfig()
	WithAtlasCloudConfig("sk-atlas-key")(cfg)

	if cfg.Provider != ProviderAtlasCloud {
		t.Errorf("Provider should be '%s', got '%s'", ProviderAtlasCloud, cfg.Provider)
	}

	if cfg.APIKey != "sk-atlas-key" {
		t.Errorf("APIKey should be 'sk-atlas-key', got '%s'", cfg.APIKey)
	}

	if cfg.BaseURL != DefaultAtlasCloudBaseURL {
		t.Errorf("BaseURL should be '%s', got '%s'", DefaultAtlasCloudBaseURL, cfg.BaseURL)
	}

	if cfg.Model != DefaultAtlasCloudModel {
		t.Errorf("Model should be '%s', got '%s'", DefaultAtlasCloudModel, cfg.Model)
	}
}

// ============================================================
// Test Options Combination
// ============================================================

func TestMultipleOptions(t *testing.T) {
	mockLogger := NewMockLogger()

	cfg := DefaultConfig()

	// Apply multiple options
	options := []ClientOption{
		WithProvider("test-provider"),
		WithAPIKey("sk-test-key"),
		WithBaseURL("https://api.test.com"),
		WithModel("test-model"),
		WithMaxTokens(4000),
		WithTemperature(0.8),
		WithLogger(mockLogger),
		WithTimeout(60 * time.Second),
	}

	for _, opt := range options {
		opt(cfg)
	}

	// Verify all options are applied
	if cfg.Provider != "test-provider" {
		t.Error("Provider should be set")
	}

	if cfg.APIKey != "sk-test-key" {
		t.Error("APIKey should be set")
	}

	if cfg.BaseURL != "https://api.test.com" {
		t.Error("BaseURL should be set")
	}

	if cfg.Model != "test-model" {
		t.Error("Model should be set")
	}

	if cfg.MaxTokens != 4000 {
		t.Error("MaxTokens should be 4000")
	}

	if cfg.Temperature != 0.8 {
		t.Error("Temperature should be 0.8")
	}

	if cfg.Logger != mockLogger {
		t.Error("Logger should be mockLogger")
	}

	if cfg.Timeout != 60*time.Second {
		t.Error("Timeout should be 60s")
	}
}

func TestOptionsOverride(t *testing.T) {
	cfg := DefaultConfig()

	// First apply DeepSeek configuration
	WithDeepSeekConfig("sk-deepseek-key")(cfg)

	// Then override some options
	WithModel("custom-model")(cfg)
	WithMaxTokens(5000)(cfg)

	// Verify override succeeded
	if cfg.Model != "custom-model" {
		t.Errorf("Model should be overridden to 'custom-model', got '%s'", cfg.Model)
	}

	if cfg.MaxTokens != 5000 {
		t.Errorf("MaxTokens should be overridden to 5000, got %d", cfg.MaxTokens)
	}

	// Verify other DeepSeek configurations remain unchanged
	if cfg.Provider != ProviderDeepSeek {
		t.Error("Provider should still be DeepSeek")
	}

	if cfg.BaseURL != DefaultDeepSeekBaseURL {
		t.Error("BaseURL should still be DeepSeek default")
	}
}

// ============================================================
// Test Integration with Client
// ============================================================

func TestOptionsWithNewClient(t *testing.T) {
	mockLogger := NewMockLogger()

	client := NewClient(
		WithProvider("test-provider"),
		WithAPIKey("sk-test-key"),
		WithModel("test-model"),
		WithLogger(mockLogger),
		WithMaxTokens(4000),
	)

	c := client.(*Client)

	// Verify options are correctly applied to client
	if c.Provider != "test-provider" {
		t.Error("Provider should be set from options")
	}

	if c.APIKey != "sk-test-key" {
		t.Error("APIKey should be set from options")
	}

	if c.Model != "test-model" {
		t.Error("Model should be set from options")
	}

	if c.Log != mockLogger {
		t.Error("Log should be set from options")
	}

	if c.MaxTokens != 4000 {
		t.Error("MaxTokens should be 4000")
	}
}

// Provider-specific option tests are in mcp/provider/options_test.go
