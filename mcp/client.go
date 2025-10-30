package mcp

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Provider AI提供商类型
type Provider string

const (
	ProviderDeepSeek Provider = "deepseek"
	ProviderQwen     Provider = "qwen"
	ProviderCustom   Provider = "custom"
)

// Config AI API配置
type Config struct {
	Provider  Provider
	APIKey    string
	SecretKey string // 阿里云需要
	BaseURL   string
	Model     string
	Timeout   time.Duration
	UseFullURL bool // 是否使用完整URL（不添加/chat/completions）
}

// 默认配置
var defaultConfig = Config{
	Provider: ProviderDeepSeek,
	BaseURL:  "https://api.deepseek.com/v1",
	Model:    "deepseek-chat",
	Timeout:  120 * time.Second, // 增加到120秒，因为AI需要分析大量数据
}

// SetDeepSeekAPIKey 设置DeepSeek API密钥
func SetDeepSeekAPIKey(apiKey string) {
	defaultConfig.Provider = ProviderDeepSeek
	defaultConfig.APIKey = apiKey
	defaultConfig.BaseURL = "https://api.deepseek.com/v1"
	defaultConfig.Model = "deepseek-chat"
}

// SetQwenAPIKey 设置阿里云Qwen API密钥
func SetQwenAPIKey(apiKey, secretKey string) {
	defaultConfig.Provider = ProviderQwen
	defaultConfig.APIKey = apiKey
	defaultConfig.SecretKey = secretKey
	defaultConfig.BaseURL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
	defaultConfig.Model = "qwen-plus" // 可选: qwen-turbo, qwen-plus, qwen-max
}

// SetCustomAPI 设置自定义OpenAI兼容API
func SetCustomAPI(apiURL, apiKey, modelName string) {
	defaultConfig.Provider = ProviderCustom
	defaultConfig.APIKey = apiKey

	// 检查URL是否以#结尾，如果是则使用完整URL（不添加/chat/completions）
	if strings.HasSuffix(apiURL, "#") {
		defaultConfig.BaseURL = strings.TrimSuffix(apiURL, "#")
		defaultConfig.UseFullURL = true
	} else {
		defaultConfig.BaseURL = apiURL
		defaultConfig.UseFullURL = false
	}

	defaultConfig.Model = modelName
	defaultConfig.Timeout = 120 * time.Second
}

// SetConfig 设置完整的AI配置（高级用户）
func SetConfig(config Config) {
	if config.Timeout == 0 {
		config.Timeout = 30 * time.Second
	}
	defaultConfig = config
}

// CallWithMessages 使用 system + user prompt 调用AI API（推荐）
func CallWithMessages(systemPrompt, userPrompt string) (string, error) {
	if defaultConfig.APIKey == "" {
		return "", fmt.Errorf("AI API密钥未设置，请先调用 SetDeepSeekAPIKey() 或 SetQwenAPIKey()")
	}

	// 重试配置
	maxRetries := 3
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt > 1 {
			fmt.Printf("⚠️  AI API调用失败，正在重试 (%d/%d)...\n", attempt, maxRetries)
		}

		result, err := callOnce(systemPrompt, userPrompt)
		if err == nil {
			if attempt > 1 {
				fmt.Printf("✓ AI API重试成功\n")
			}
			return result, nil
		}

		lastErr = err
		// 如果不是网络错误，不重试
		if !isRetryableError(err) {
			return "", err
		}

		// 重试前等待
		if attempt < maxRetries {
			waitTime := time.Duration(attempt) * 2 * time.Second
			fmt.Printf("⏳ 等待%v后重试...\n", waitTime)
			time.Sleep(waitTime)
		}
	}

	return "", fmt.Errorf("重试%d次后仍然失败: %w", maxRetries, lastErr)
}

// callOnce 单次调用AI API（内部使用）
func callOnce(systemPrompt, userPrompt string) (string, error) {
	// 构建 messages 数组
	messages := []map[string]string{}

	// 如果有 system prompt，添加 system message
	if systemPrompt != "" {
		messages = append(messages, map[string]string{
			"role":    "system",
			"content": systemPrompt,
		})
	}

	// 添加 user message
	messages = append(messages, map[string]string{
		"role":    "user",
		"content": userPrompt,
	})

	// 构建请求体
	requestBody := map[string]interface{}{
		"model":       defaultConfig.Model,
		"messages":    messages,
		"temperature": 0.5, // 降低temperature以提高JSON格式稳定性
		"max_tokens":  2000,
	}

	// 注意：response_format 参数仅 OpenAI 支持，DeepSeek/Qwen 不支持
	// 我们通过强化 prompt 和后处理来确保 JSON 格式正确

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("序列化请求失败: %w", err)
	}

	// 创建HTTP请求
	var url string
	if defaultConfig.UseFullURL {
		// 使用完整URL，不添加/chat/completions
		url = defaultConfig.BaseURL
	} else {
		// 默认行为：添加/chat/completions
		url = fmt.Sprintf("%s/chat/completions", defaultConfig.BaseURL)
	}
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	// 根据不同的Provider设置认证方式
	switch defaultConfig.Provider {
	case ProviderDeepSeek:
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", defaultConfig.APIKey))
	case ProviderQwen:
		// 阿里云Qwen使用API-Key认证
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", defaultConfig.APIKey))
		// 注意：如果使用的不是兼容模式，可能需要不同的认证方式
	default:
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", defaultConfig.APIKey))
	}

	// 发送请求
	client := &http.Client{Timeout: defaultConfig.Timeout}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("发送请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("读取响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API返回错误 (status %d): %s", resp.StatusCode, string(body))
	}

	// 解析响应
	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("解析响应失败: %w", err)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("API返回空响应")
	}

	return result.Choices[0].Message.Content, nil
}

// isRetryableError 判断错误是否可重试
func isRetryableError(err error) bool {
	errStr := err.Error()
	// 网络错误、超时、EOF等可以重试
	retryableErrors := []string{
		"EOF",
		"timeout",
		"connection reset",
		"connection refused",
		"temporary failure",
		"no such host",
	}
	for _, retryable := range retryableErrors {
		if strings.Contains(errStr, retryable) {
			return true
		}
	}
	return false
}
