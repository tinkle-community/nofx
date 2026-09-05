package provider

import (
	"net/http"

	"nofx/mcp"
)

func init() {
	mcp.RegisterProvider(mcp.ProviderAtlasCloud, func(opts ...mcp.ClientOption) mcp.AIClient {
		return NewAtlasCloudClientWithOptions(opts...)
	})
}

type AtlasCloudClient struct {
	*mcp.Client
}

func (c *AtlasCloudClient) BaseClient() *mcp.Client { return c.Client }

func NewAtlasCloudClient() mcp.AIClient {
	return NewAtlasCloudClientWithOptions()
}

func NewAtlasCloudClientWithOptions(opts ...mcp.ClientOption) mcp.AIClient {
	atlasOpts := []mcp.ClientOption{
		mcp.WithProvider(mcp.ProviderAtlasCloud),
		mcp.WithModel(mcp.DefaultAtlasCloudModel),
		mcp.WithBaseURL(mcp.DefaultAtlasCloudBaseURL),
	}

	allOpts := append(atlasOpts, opts...)
	baseClient := mcp.NewClient(allOpts...).(*mcp.Client)

	atlasClient := &AtlasCloudClient{
		Client: baseClient,
	}

	baseClient.Hooks = atlasClient
	return atlasClient
}

func (c *AtlasCloudClient) SetAPIKey(apiKey string, customURL string, customModel string) {
	c.APIKey = apiKey

	if len(apiKey) > 8 {
		c.Log.Infof("🔧 [MCP] Atlas Cloud API Key: %s...%s", apiKey[:4], apiKey[len(apiKey)-4:])
	}
	if customURL != "" {
		c.BaseURL = customURL
		c.Log.Infof("🔧 [MCP] Atlas Cloud using custom BaseURL: %s", customURL)
	} else {
		c.Log.Infof("🔧 [MCP] Atlas Cloud using default BaseURL: %s", c.BaseURL)
	}
	if customModel != "" {
		c.Model = customModel
		c.Log.Infof("🔧 [MCP] Atlas Cloud using custom Model: %s", customModel)
	} else {
		c.Log.Infof("🔧 [MCP] Atlas Cloud using default Model: %s", c.Model)
	}
}

func (c *AtlasCloudClient) SetAuthHeader(reqHeaders http.Header) {
	c.Client.SetAuthHeader(reqHeaders)
}
