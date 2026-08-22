package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestValidateConfigRequiresAPIKey(t *testing.T) {
	if err := validateConfig(config{}); err == nil {
		t.Fatal("expected missing EXPECTED_API_KEY to fail validation")
	}
	if err := validateConfig(config{SharedAPIKey: "secret"}); err != nil {
		t.Fatalf("expected config with API key to pass validation, got %v", err)
	}
}

func TestBuildUpstreamRequestBody(t *testing.T) {
	temp := 0.25
	body, err := buildUpstreamRequestBody(chatCompletionRequest{
		Model:       "gpt-5.4-mini",
		Temperature: &temp,
		Messages: []chatMessage{
			{Role: "system", Content: "You are a trader."},
			{Role: "user", Content: "Analyze BTC."},
			{Role: "assistant", Content: []any{map[string]any{"type": "text", "text": "Need more data."}}},
		},
	})
	if err != nil {
		t.Fatalf("buildUpstreamRequestBody: %v", err)
	}
	if body["stream"] != true {
		t.Fatalf("expected stream=true, got %#v", body["stream"])
	}
	if body["store"] != false {
		t.Fatalf("expected store=false, got %#v", body["store"])
	}
	if _, ok := body["temperature"]; ok {
		t.Fatalf("expected temperature to be omitted for Codex responses API compatibility, got %#v", body["temperature"])
	}
	if got := body["instructions"]; got != "You are a trader." {
		t.Fatalf("unexpected instructions: %#v", got)
	}
	input := body["input"].([]map[string]any)
	if len(input) != 2 {
		t.Fatalf("expected 2 input messages, got %d", len(input))
	}
	if input[0]["role"] != "user" || input[1]["role"] != "assistant" {
		t.Fatalf("unexpected roles: %#v", input)
	}
}

func TestParseResponseStream(t *testing.T) {
	stream := strings.NewReader(strings.Join([]string{
		"event: response.created",
		"data: {\"type\":\"response.created\",\"response\":{\"id\":\"resp_123\",\"model\":\"gpt-5.4-mini\"}}",
		"",
		"event: response.output_text.delta",
		"data: {\"type\":\"response.output_text.delta\",\"delta\":\"pong\"}",
		"",
		"event: response.completed",
		"data: {\"type\":\"response.completed\",\"response\":{\"id\":\"resp_123\",\"model\":\"gpt-5.4-mini\",\"usage\":{\"input_tokens\":12,\"output_tokens\":3,\"total_tokens\":15}}}",
		"",
	}, "\n"))
	result, err := parseResponseStream(stream)
	if err != nil {
		t.Fatalf("parseResponseStream: %v", err)
	}
	if result.Text != "pong" {
		t.Fatalf("unexpected text: %q", result.Text)
	}
	if result.TotalTokens != 15 || result.PromptTokens != 12 || result.CompletionTokens != 3 {
		t.Fatalf("unexpected usage: %+v", result)
	}
}

func TestHandleHealthSupportsHead(t *testing.T) {
	server := &proxyServer{
		cfg: config{AuthFile: "/tmp/auth.json", ClientVersion: "0.133.0", ClientName: "codex_cli_rs"},
		loadCredential: func() (codexCredential, error) {
			return codexCredential{Label: "ChatGPT subscription", BaseURL: "https://chatgpt.com/backend-api/codex"}, nil
		},
	}

	req := httptest.NewRequest(http.MethodHead, "/healthz", nil)
	rec := httptest.NewRecorder()
	server.handleHealth(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("unexpected status: %d", rec.Code)
	}
	if rec.Body.Len() != 0 {
		t.Fatalf("expected empty body for HEAD, got %q", rec.Body.String())
	}
}

func TestHandleHealthReturns503WhenCredentialLoadFails(t *testing.T) {
	server := &proxyServer{
		cfg: config{AuthFile: "/tmp/auth.json", ClientVersion: "0.133.0", ClientName: "codex_cli_rs"},
		loadCredential: func() (codexCredential, error) {
			return codexCredential{}, errors.New("boom")
		},
	}

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()
	server.handleHealth(rec, req)
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status: %d body=%s", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "boom") {
		t.Fatalf("expected error details in body, got %s", rec.Body.String())
	}
}

func TestHandleChatCompletions(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.URL.RawQuery, "client_version=0.133.0") {
			t.Fatalf("missing client_version: %s", r.URL.RawQuery)
		}
		if got := r.Header.Get("Authorization"); got != "Bearer upstream-token" {
			t.Fatalf("unexpected upstream auth: %s", got)
		}
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("read upstream body: %v", err)
		}
		var payload map[string]any
		if err := json.Unmarshal(body, &payload); err != nil {
			t.Fatalf("parse upstream body: %v", err)
		}
		if payload["stream"] != true || payload["store"] != false {
			t.Fatalf("unexpected upstream flags: %#v", payload)
		}
		w.Header().Set("Content-Type", "text/event-stream")
		_, _ = io.WriteString(w, strings.Join([]string{
			"event: response.output_text.delta",
			"data: {\"type\":\"response.output_text.delta\",\"delta\":\"done\"}",
			"",
			"event: response.completed",
			"data: {\"type\":\"response.completed\",\"response\":{\"id\":\"resp_test\",\"model\":\"gpt-5.4-mini\",\"usage\":{\"input_tokens\":10,\"output_tokens\":2,\"total_tokens\":12}}}",
			"",
		}, "\n"))
	}))
	defer upstream.Close()

	server := &proxyServer{
		cfg: config{SharedAPIKey: "shared-secret", ClientVersion: "0.133.0", ClientName: "codex_cli_rs"},
		loadCredential: func() (codexCredential, error) {
			return codexCredential{AccessToken: "upstream-token", BaseURL: upstream.URL}, nil
		},
		httpClient: upstream.Client(),
	}

	req := httptest.NewRequest(http.MethodPost, "/v1/chat/completions", strings.NewReader(`{"model":"gpt-5.4-mini","messages":[{"role":"system","content":"Be terse."},{"role":"user","content":"Say done."}]}`))
	req.Header.Set("Authorization", "Bearer shared-secret")
	rec := httptest.NewRecorder()
	server.handleChatCompletions(rec, req.WithContext(context.Background()))

	if rec.Code != http.StatusOK {
		t.Fatalf("unexpected status: %d body=%s", rec.Code, rec.Body.String())
	}
	var response openAIChatCompletion
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("parse response: %v", err)
	}
	if response.Choices[0].Message.Content != "done" {
		t.Fatalf("unexpected content: %#v", response)
	}
	if response.Usage.TotalTokens != 12 {
		t.Fatalf("unexpected usage: %#v", response.Usage)
	}
}
