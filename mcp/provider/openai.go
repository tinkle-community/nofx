package provider

import (
	"net/http"

	"nofx/mcp"
)

const (
	DefaultOpenAIBaseURL = "https://api.openai.com/v1"
	DefaultOpenAIModel   = "gpt-5.6"
)

func init() {
	mcp.RegisterProvider(mcp.ProviderOpenAI, func(opts ...mcp.ClientOption) mcp.AIClient {
		return NewOpenAIClientWithOptions(opts...)
	})
}

type OpenAIClient struct {
	*mcp.Client
}

func (c *OpenAIClient) BaseClient() *mcp.Client { return c.Client }

// NewOpenAIClient creates OpenAI client (backward compatible)
func NewOpenAIClient() mcp.AIClient {
	return NewOpenAIClientWithOptions()
}

// NewOpenAIClientWithOptions creates OpenAI client (supports options pattern)
func NewOpenAIClientWithOptions(opts ...mcp.ClientOption) mcp.AIClient {
	openaiOpts := []mcp.ClientOption{
		mcp.WithProvider(mcp.ProviderOpenAI),
		mcp.WithModel(DefaultOpenAIModel),
		mcp.WithBaseURL(DefaultOpenAIBaseURL),
	}

	allOpts := append(openaiOpts, opts...)
	baseClient := mcp.NewClient(allOpts...).(*mcp.Client)

	openaiClient := &OpenAIClient{
		Client: baseClient,
	}

	baseClient.Hooks = openaiClient
	return openaiClient
}

func (c *OpenAIClient) SetAPIKey(apiKey string, customURL string, customModel string) {
	c.APIKey = apiKey

	if len(apiKey) > 8 {
		c.Log.Infof("🔧 [MCP] OpenAI API Key: %s...%s", apiKey[:4], apiKey[len(apiKey)-4:])
	}
	if customURL != "" {
		c.BaseURL = customURL
		c.Log.Infof("🔧 [MCP] OpenAI using custom BaseURL: %s", customURL)
	} else {
		c.Log.Infof("🔧 [MCP] OpenAI using default BaseURL: %s", c.BaseURL)
	}
	if customModel != "" {
		c.Model = customModel
		c.Log.Infof("🔧 [MCP] OpenAI using custom Model: %s", customModel)
	} else {
		c.Log.Infof("🔧 [MCP] OpenAI using default Model: %s", c.Model)
	}
}

// OpenAI uses standard Bearer auth
func (c *OpenAIClient) SetAuthHeader(reqHeaders http.Header) {
	c.Client.SetAuthHeader(reqHeaders)
}
