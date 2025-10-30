# 自定义 AI API 使用指南

## 功能说明

现在 NOFX 支持使用任何 OpenAI 格式兼容的 API，包括：
- OpenAI 官方 API (gpt-4o, gpt-4-turbo 等)
- OpenRouter (可访问多种模型)
- 本地部署的模型 (Ollama, LM Studio 等)
- 其他兼容 OpenAI 格式的 API 服务

## 配置方式

在 `config.json` 中添加使用自定义 API 的 trader：

```json
{
  "traders": [
    {
      "id": "trader_custom",
      "name": "My Custom AI Trader",
      "ai_model": "custom",
      "exchange": "binance",

      "binance_api_key": "your_binance_api_key",
      "binance_secret_key": "your_binance_secret_key",

      "custom_api_url": "https://api.openai.com/v1",
      "custom_api_key": "sk-your-openai-api-key",
      "custom_model_name": "gpt-4o",

      "initial_balance": 1000,
      "scan_interval_minutes": 3
    }
  ]
}
```

## 配置字段说明

| 字段 | 类型 | 必需 | 说明 |
|-----|------|------|------|
| `ai_model` | string | ✅ | 设置为 `"custom"` 启用自定义 API |
| `custom_api_url` | string | ✅ | API 的 Base URL (不含 `/chat/completions`) |
| `custom_api_key` | string | ✅ | API 密钥 |
| `custom_model_name` | string | ✅ | 模型名称 (如 `gpt-4o`, `claude-3-5-sonnet` 等) |

## 使用示例

### 1. OpenAI 官方 API

```json
{
  "ai_model": "custom",
  "custom_api_url": "https://api.openai.com/v1",
  "custom_api_key": "sk-proj-xxxxx",
  "custom_model_name": "gpt-4o"
}
```

### 2. OpenRouter

```json
{
  "ai_model": "custom",
  "custom_api_url": "https://openrouter.ai/api/v1",
  "custom_api_key": "sk-or-xxxxx",
  "custom_model_name": "anthropic/claude-3.5-sonnet"
}
```

### 3. 本地 Ollama

```json
{
  "ai_model": "custom",
  "custom_api_url": "http://localhost:11434/v1",
  "custom_api_key": "ollama",
  "custom_model_name": "llama3.1:70b"
}
```

### 4. Azure OpenAI

```json
{
  "ai_model": "custom",
  "custom_api_url": "https://your-resource.openai.azure.com/openai/deployments/your-deployment",
  "custom_api_key": "your-azure-api-key",
  "custom_model_name": "gpt-4"
}
```

## 兼容性要求

自定义 API 必须：
1. 支持 OpenAI Chat Completions 格式
2. 接受 `POST /chat/completions` 端点
3. 支持 `Authorization: Bearer {api_key}` 认证
4. 返回标准的 OpenAI 响应格式

## 注意事项

1. **URL 格式**：`custom_api_url` 应该是 Base URL，系统会自动添加 `/chat/completions`
   - ✅ 正确：`https://api.openai.com/v1`
   - ❌ 错误：`https://api.openai.com/v1/chat/completions`

2. **模型名称**：确保 `custom_model_name` 与 API 提供商支持的模型名称完全一致

3. **API 密钥**：某些本地部署的模型可能不需要真实的 API 密钥，可以填写任意字符串

4. **超时设置**：默认超时时间为 120 秒，如果模型响应较慢可能需要调整

## 多 AI 对比交易

你可以同时配置多个不同 AI 的 trader 进行对比：

```json
{
  "traders": [
    {
      "id": "deepseek_trader",
      "ai_model": "deepseek",
      "deepseek_key": "sk-xxxxx",
      ...
    },
    {
      "id": "gpt4_trader",
      "ai_model": "custom",
      "custom_api_url": "https://api.openai.com/v1",
      "custom_api_key": "sk-xxxxx",
      "custom_model_name": "gpt-4o",
      ...
    },
    {
      "id": "claude_trader",
      "ai_model": "custom",
      "custom_api_url": "https://openrouter.ai/api/v1",
      "custom_api_key": "sk-or-xxxxx",
      "custom_model_name": "anthropic/claude-3.5-sonnet",
      ...
    }
  ]
}
```

## 故障排除

### 问题：配置验证失败

**错误信息**：`使用自定义API时必须配置custom_api_url`

**解决方案**：确保设置了 `ai_model: "custom"` 后，同时配置了：
- `custom_api_url`
- `custom_api_key`
- `custom_model_name`

### 问题：API 调用失败

**可能原因**：
1. URL 格式错误（检查是否包含了 `/chat/completions`）
2. API 密钥无效
3. 模型名称错误
4. 网络连接问题

**调试方法**：查看日志中的错误信息，通常会包含 HTTP 状态码和错误详情

## 向后兼容性

现有的 `deepseek` 和 `qwen` 配置完全不受影响，可以继续使用：

```json
{
  "ai_model": "deepseek",
  "deepseek_key": "sk-xxxxx"
}
```

或

```json
{
  "ai_model": "qwen",
  "qwen_key": "sk-xxxxx"
}
```
