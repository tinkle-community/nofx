# Custom AI API Usage Guide

## Feature Description

NOFX now supports any OpenAI format-compatible API, including:
- Official OpenAI API (gpt-4o, gpt-4-turbo, etc.)
- OpenRouter (access to multiple models)
- Locally deployed models (Ollama, LM Studio, etc.)
- Other OpenAI format-compatible API services

## Configuration Method

Add a trader using custom API in `config.json`:

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

## Configuration Field Description

| Field | Type | Required | Description |
|-----|------|------|------|
| `ai_model` | string | ✅ | Set to `"custom"` to enable custom API |
| `custom_api_url` | string | ✅ | API Base URL (without `/chat/completions`). Special usage: If ending with `#`, uses complete URL (no automatic path append) |
| `custom_api_key` | string | ✅ | API key |
| `custom_model_name` | string | ✅ | Model name (e.g., `gpt-4o`, `claude-3-5-sonnet`, etc.) |

## Usage Examples

### 1. Official OpenAI API

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

### 3. Local Ollama

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

### 5. Using Complete Custom Path (append # at the end)

For certain special API endpoints that already include the complete path (including `/chat/completions` or other custom paths), you can append `#` at the end of the URL to force using the complete URL:

```json
{
  "ai_model": "custom",
  "custom_api_url": "https://api.example.com/v2/ai/chat/completions#",
  "custom_api_key": "your-api-key",
  "custom_model_name": "custom-model"
}
```

**Note**: The `#` will be automatically removed, and the actual request will be sent to `https://api.example.com/v2/ai/chat/completions`

## Compatibility Requirements

Custom API must:
1. Support OpenAI Chat Completions format
2. Accept `POST` requests to `/chat/completions` endpoint (or append `#` to URL to use custom path)
3. Support `Authorization: Bearer {api_key}` authentication
4. Return standard OpenAI response format

## Important Notes

1. **URL Format**: `custom_api_url` should be the Base URL, system will automatically append `/chat/completions`
   - ✅ Correct: `https://api.openai.com/v1`
   - ❌ Wrong: `https://api.openai.com/v1/chat/completions`
   - 🔧 **Special Usage**: If you need to use a complete custom path (without automatically appending `/chat/completions`), you can append `#` at the end of the URL
     - Example: `https://api.example.com/custom/path/chat/completions#`
     - System will automatically remove `#` and directly use that complete URL

2. **Model Name**: Ensure `custom_model_name` exactly matches the model name supported by the API provider

3. **API Key**: Some locally deployed models may not require a real API key, you can fill in any string

4. **Timeout Settings**: Default timeout is 120 seconds, may need adjustment if model response is slow

## Multi-AI Comparison Trading

You can configure multiple traders with different AIs simultaneously for comparison:

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

## Troubleshooting

### Issue: Configuration Validation Failed

**Error Message**: `Must configure custom_api_url when using custom API`

**Solution**: After setting `ai_model: "custom"`, ensure you've also configured:
- `custom_api_url`
- `custom_api_key`
- `custom_model_name`

### Issue: API Call Failed

**Possible Causes**:
1. Incorrect URL format
   - Normal usage: Should not include `/chat/completions` (system will add automatically)
   - Special usage: If complete path needed, remember to append `#` at URL end
2. Invalid API key
3. Incorrect model name
4. Network connection issues

**Debug Method**: Check error messages in logs, usually includes HTTP status code and error details

## Backward Compatibility

Existing `deepseek` and `qwen` configurations remain completely unaffected and can continue to be used:

```json
{
  "ai_model": "deepseek",
  "deepseek_key": "sk-xxxxx"
}
```

or

```json
{
  "ai_model": "qwen",
  "qwen_key": "sk-xxxxx"
}
```
