package provider

import (
	"testing"

	"nofx/mcp"
)

func TestAtlasCloudClientDefaults(t *testing.T) {
	client := NewAtlasCloudClientWithOptions(mcp.WithAPIKey("sk-atlas-test"))
	atlasClient := client.(*AtlasCloudClient)

	if atlasClient.Provider != mcp.ProviderAtlasCloud {
		t.Fatalf("Provider = %q, want %q", atlasClient.Provider, mcp.ProviderAtlasCloud)
	}
	if atlasClient.BaseURL != mcp.DefaultAtlasCloudBaseURL {
		t.Fatalf("BaseURL = %q, want %q", atlasClient.BaseURL, mcp.DefaultAtlasCloudBaseURL)
	}
	if atlasClient.Model != mcp.DefaultAtlasCloudModel {
		t.Fatalf("Model = %q, want %q", atlasClient.Model, mcp.DefaultAtlasCloudModel)
	}
	if atlasClient.APIKey != "sk-atlas-test" {
		t.Fatalf("APIKey = %q, want sk-atlas-test", atlasClient.APIKey)
	}
}

func TestAtlasCloudClientSetAPIKeyOverrides(t *testing.T) {
	client := NewAtlasCloudClientWithOptions()
	atlasClient := client.(*AtlasCloudClient)

	atlasClient.SetAPIKey("sk-atlas-test", "https://proxy.example.com/v1", "deepseek-ai/deepseek-v4-pro")

	if atlasClient.APIKey != "sk-atlas-test" {
		t.Fatalf("APIKey = %q, want sk-atlas-test", atlasClient.APIKey)
	}
	if atlasClient.BaseURL != "https://proxy.example.com/v1" {
		t.Fatalf("BaseURL = %q, want custom proxy URL", atlasClient.BaseURL)
	}
	if atlasClient.Model != "deepseek-ai/deepseek-v4-pro" {
		t.Fatalf("Model = %q, want deepseek-ai/deepseek-v4-pro", atlasClient.Model)
	}
}
