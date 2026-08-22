# ChatGPT Codex Proxy

This sidecar lets NOFX use a ChatGPT subscription authenticated through the Codex CLI without changing NOFX's OpenAI provider code.

## What it does

- Reads the ChatGPT/Codex OAuth access token from a Codex `auth.json` file.
- Calls the ChatGPT Codex backend at `https://chatgpt.com/backend-api/codex`.
- Translates NOFX's OpenAI-style `POST /v1/chat/completions` request into the upstream `responses` SSE protocol.
- Reassembles the streamed upstream response back into a normal OpenAI-style chat completion JSON response.

## Current constraints

- Downstream streaming is not implemented yet. NOFX must call it with `stream=false` or omit `stream`.
- The proxy currently depends on an access token that Codex CLI has already obtained. If the token expires, run `codex login` again on the host that owns the `auth.json` file.
- By default, NOFX's SSRF guard rejects localhost/private destinations. To use this proxy over the internal Docker network, set `NOFX_TRUSTED_PRIVATE_API_HOSTS=chatgpt-codex-proxy` (or another explicit allowlist value) on the NOFX service.

## Environment

- `PROXY_ADDR`:
  default `:8081`
- `EXPECTED_API_KEY`:
  shared bearer token NOFX will send to the proxy; required, and the proxy refuses to start without it
- `CODEX_AUTH_FILE`:
  path to the Codex auth file, default `/opt/data/auth.json`
- `CODEX_CLIENT_VERSION`:
  default `0.133.0`
- `CODEX_CLIENT_NAME`:
  default `codex_cli_rs`
- `CODEX_BASE_URL`:
  optional override for the upstream base URL
- `NOFX_TRUSTED_PRIVATE_API_HOSTS`:
  comma-separated hostname/IP/CIDR allowlist for NOFX custom model URLs that are allowed to resolve to private addresses; use `chatgpt-codex-proxy` for the default Docker Compose setup

## Recommended deployment shape

### Option A — same Docker network as NOFX (simplest)

1. Start the sidecar with the `chatgpt-codex-proxy` Compose profile enabled:

   ```bash
   docker compose --profile chatgpt-codex-proxy up -d --build nofx chatgpt-codex-proxy
   ```

2. Set `CHATGPT_PROXY_SHARED_SECRET` to a non-empty random value and `NOFX_TRUSTED_PRIVATE_API_HOSTS=chatgpt-codex-proxy` on the NOFX/backend compose environment.
3. Set `CHATGPT_PROXY_AUTH_FILE` to the host path of the Codex `auth.json` file.
4. In NOFX model settings, configure the existing `OpenAI` provider with:
   - `api_key`: the shared secret from `EXPECTED_API_KEY`
   - `custom_api_url`: `http://chatgpt-codex-proxy:8081/v1`
   - `custom_model_name`: a model visible from the Codex backend such as `gpt-5.4` or `gpt-5.4-mini`

### Option B — public HTTPS hostname

1. Run `chatgpt-codex-proxy` on the same host as NOFX.
2. Put it behind a public HTTPS reverse proxy such as Caddy, Nginx, or Cloudflare Tunnel.
3. Leave `NOFX_TRUSTED_PRIVATE_API_HOSTS` unset.
4. In NOFX model settings, configure the existing `OpenAI` provider with:
   - `api_key`: the shared secret from `EXPECTED_API_KEY`
   - `custom_api_url`: `https://your-public-hostname.example/v1`
   - `custom_model_name`: a model visible from the Codex backend such as `gpt-5.4` or `gpt-5.4-mini`

## Smoke test

```bash
curl -sS http://chatgpt-codex-proxy:8081/healthz

curl -sS http://chatgpt-codex-proxy:8081/v1/models \
  -H "Authorization: Bearer YOUR_SHARED_SECRET"

curl -sS http://chatgpt-codex-proxy:8081/v1/chat/completions \
  -H "Authorization: Bearer YOUR_SHARED_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [
      {"role": "system", "content": "You are terse."},
      {"role": "user", "content": "Reply with exactly pong."}
    ]
  }'
```

## Why this is low-touch

NOFX already supports:

- provider `openai`
- a custom API base URL
- a custom model name
- a bearer token in the `api_key` field

Because of that, the integration point stays outside NOFX core request code. This proxy is the compatibility shim.
