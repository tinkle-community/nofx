package provider

import (
	"testing"

	"nofx/mcp"
)

func TestOptionsWithDeepSeekClient(t *testing.T) {
	logger := mcp.NewNoopLogger()

	client := NewDeepSeekClientWithOptions(
		mcp.WithAPIKey("sk-deepseek-key"),
		mcp.WithLogger(logger),
		mcp.WithMaxTokens(5000),
	)

	dsClient := client.(*DeepSeekClient)

	// Verify DeepSeek default values
	if dsClient.Provider != mcp.ProviderDeepSeek {
		t.Error("Provider should be DeepSeek")
	}

	if dsClient.BaseURL != mcp.DefaultDeepSeekBaseURL {
		t.Error("BaseURL should be DeepSeek default")
	}

	if dsClient.Model != mcp.DefaultDeepSeekModel {
		t.Error("Model should be DeepSeek default")
	}

	// Verify custom options
	if dsClient.APIKey != "sk-deepseek-key" {
		t.Error("APIKey should be set from options")
	}

	if dsClient.Log != logger {
		t.Error("Log should be set from options")
	}

	if dsClient.MaxTokens != 5000 {
		t.Error("MaxTokens should be 5000")
	}
}

func TestOptionsWithQwenClient(t *testing.T) {
	logger := mcp.NewNoopLogger()

	client := NewQwenClientWithOptions(
		mcp.WithAPIKey("sk-qwen-key"),
		mcp.WithLogger(logger),
		mcp.WithMaxTokens(6000),
	)

	qwenClient := client.(*QwenClient)

	// Verify Qwen default values
	if qwenClient.Provider != mcp.ProviderQwen {
		t.Error("Provider should be Qwen")
	}

	if qwenClient.BaseURL != mcp.DefaultQwenBaseURL {
		t.Error("BaseURL should be Qwen default")
	}

	if qwenClient.Model != mcp.DefaultQwenModel {
		t.Error("Model should be Qwen default")
	}

	// Verify custom options
	if qwenClient.APIKey != "sk-qwen-key" {
		t.Error("APIKey should be set from options")
	}

	if qwenClient.Log != logger {
		t.Error("Log should be set from options")
	}

	if qwenClient.MaxTokens != 6000 {
		t.Error("MaxTokens should be 6000")
	}
}

func TestOptionsWithAtlasCloudClient(t *testing.T) {
	logger := mcp.NewNoopLogger()

	client := NewAtlasCloudClientWithOptions(
		mcp.WithAPIKey("sk-atlas-key"),
		mcp.WithLogger(logger),
		mcp.WithMaxTokens(7000),
	)

	atlasClient := client.(*AtlasCloudClient)

	if atlasClient.Provider != mcp.ProviderAtlasCloud {
		t.Error("Provider should be Atlas Cloud")
	}

	if atlasClient.BaseURL != mcp.DefaultAtlasCloudBaseURL {
		t.Error("BaseURL should be Atlas Cloud default")
	}

	if atlasClient.Model != mcp.DefaultAtlasCloudModel {
		t.Error("Model should be Atlas Cloud default")
	}

	if atlasClient.APIKey != "sk-atlas-key" {
		t.Error("APIKey should be set from options")
	}

	if atlasClient.Log != logger {
		t.Error("Log should be set from options")
	}

	if atlasClient.MaxTokens != 7000 {
		t.Error("MaxTokens should be 7000")
	}
}
