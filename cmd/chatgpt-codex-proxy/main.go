package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"time"
)

const (
	defaultAddr          = ":8081"
	defaultAuthFile      = "/opt/data/auth.json"
	defaultClientVersion = "0.133.0"
	defaultClientName    = "codex_cli_rs"
)

type config struct {
	Addr          string
	SharedAPIKey  string
	AuthFile      string
	ClientVersion string
	ClientName    string
	BaseURL       string
	HTTPTimeout   time.Duration
}

type authFile struct {
	CredentialPool map[string][]codexCredential `json:"credential_pool"`
}

type codexCredential struct {
	ID           string `json:"id"`
	Label        string `json:"label"`
	AuthType     string `json:"auth_type"`
	Priority     int    `json:"priority"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	BaseURL      string `json:"base_url"`
}

type proxyServer struct {
	cfg            config
	loadCredential func() (codexCredential, error)
	httpClient     *http.Client
}

type chatCompletionRequest struct {
	Model               string            `json:"model"`
	Messages            []chatMessage     `json:"messages"`
	Temperature         *float64          `json:"temperature,omitempty"`
	MaxCompletionTokens *int              `json:"max_completion_tokens,omitempty"`
	Stream              bool              `json:"stream,omitempty"`
	Tools               []json.RawMessage `json:"tools,omitempty"`
	ToolChoice          any               `json:"tool_choice,omitempty"`
}

type chatMessage struct {
	Role    string `json:"role"`
	Content any    `json:"content"`
}

type openAIChatCompletion struct {
	ID      string                   `json:"id"`
	Object  string                   `json:"object"`
	Created int64                    `json:"created"`
	Model   string                   `json:"model"`
	Choices []openAICompletionChoice `json:"choices"`
	Usage   openAIUsage              `json:"usage"`
}

type openAICompletionChoice struct {
	Index        int           `json:"index"`
	Message      openAIMessage `json:"message"`
	FinishReason string        `json:"finish_reason"`
}

type openAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type upstreamResult struct {
	ResponseID       string
	Model            string
	Text             string
	PromptTokens     int
	CompletionTokens int
	TotalTokens      int
}

func main() {
	cfg := loadConfigFromEnv()
	if err := validateConfig(cfg); err != nil {
		log.Fatal(err)
	}
	server := &proxyServer{
		cfg:            cfg,
		loadCredential: credentialLoader(cfg),
		httpClient: &http.Client{
			Timeout: cfg.HTTPTimeout,
		},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", server.handleHealth)
	mux.HandleFunc("/v1/models", server.handleModels)
	mux.HandleFunc("/v1/chat/completions", server.handleChatCompletions)

	httpServer := &http.Server{
		Addr:              cfg.Addr,
		Handler:           logRequest(mux),
		ReadHeaderTimeout: 15 * time.Second,
	}

	log.Printf("chatgpt-codex-proxy listening on %s", cfg.Addr)
	if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

func loadConfigFromEnv() config {
	return config{
		Addr:          envOrDefault("PROXY_ADDR", defaultAddr),
		SharedAPIKey:  os.Getenv("EXPECTED_API_KEY"),
		AuthFile:      envOrDefault("CODEX_AUTH_FILE", defaultAuthFile),
		ClientVersion: envOrDefault("CODEX_CLIENT_VERSION", defaultClientVersion),
		ClientName:    envOrDefault("CODEX_CLIENT_NAME", defaultClientName),
		BaseURL:       strings.TrimRight(os.Getenv("CODEX_BASE_URL"), "/"),
		HTTPTimeout:   120 * time.Second,
	}
}

func validateConfig(cfg config) error {
	if strings.TrimSpace(cfg.SharedAPIKey) == "" {
		return errors.New("EXPECTED_API_KEY must be set; refusing to run an unauthenticated proxy")
	}
	return nil
}

func credentialLoader(cfg config) func() (codexCredential, error) {
	return func() (codexCredential, error) {
		body, err := os.ReadFile(cfg.AuthFile)
		if err != nil {
			return codexCredential{}, fmt.Errorf("read auth file: %w", err)
		}
		var af authFile
		if err := json.Unmarshal(body, &af); err != nil {
			return codexCredential{}, fmt.Errorf("parse auth file: %w", err)
		}
		creds := af.CredentialPool["openai-codex"]
		if len(creds) == 0 {
			return codexCredential{}, errors.New("no openai-codex credentials found")
		}
		sort.SliceStable(creds, func(i, j int) bool {
			return creds[i].Priority < creds[j].Priority
		})
		for _, cred := range creds {
			if strings.TrimSpace(cred.AccessToken) == "" {
				continue
			}
			if cfg.BaseURL != "" {
				cred.BaseURL = cfg.BaseURL
			}
			if strings.TrimSpace(cred.BaseURL) == "" {
				return codexCredential{}, errors.New("credential missing base_url")
			}
			cred.BaseURL = strings.TrimRight(cred.BaseURL, "/")
			return cred, nil
		}
		return codexCredential{}, errors.New("no usable openai-codex credential with access_token")
	}
}

func (s *proxyServer) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	cred, err := s.loadCredential()
	statusCode := http.StatusOK
	status := map[string]any{
		"ok":             err == nil,
		"auth_file":      s.cfg.AuthFile,
		"client_name":    s.cfg.ClientName,
		"client_version": s.cfg.ClientVersion,
	}
	if err == nil {
		status["base_url"] = cred.BaseURL
		status["credential_label"] = cred.Label
	} else {
		statusCode = http.StatusServiceUnavailable
		status["error"] = err.Error()
	}
	if r.Method == http.MethodHead {
		w.WriteHeader(statusCode)
		return
	}
	writeJSON(w, statusCode, status)
}

func (s *proxyServer) handleModels(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if !s.authorizeRequest(r) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}
	cred, err := s.loadCredential()
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}
	url := fmt.Sprintf("%s/models?client_version=%s", cred.BaseURL, s.cfg.ClientVersion)
	if s.cfg.ClientName != "" {
		url += "&client_name=" + s.cfg.ClientName
	}
	upstreamReq, err := http.NewRequestWithContext(r.Context(), http.MethodGet, url, nil)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	upstreamReq.Header.Set("Authorization", "Bearer "+cred.AccessToken)
	upstreamReq.Header.Set("Accept", "application/json")
	upstreamReq.Header.Set("User-Agent", "chatgpt-codex-proxy/0.1")

	resp, err := s.httpClient.Do(upstreamReq)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}
	defer resp.Body.Close()
	forwardJSONBody(w, resp)
}

func (s *proxyServer) handleChatCompletions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if !s.authorizeRequest(r) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	var req chatCompletionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("invalid JSON: %v", err)})
		return
	}
	if req.Stream {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "streaming downstream is not supported; send stream=false or omit it"})
		return
	}
	result, err := s.completeChat(r.Context(), req)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}

	completion := openAIChatCompletion{
		ID:      result.ResponseID,
		Object:  "chat.completion",
		Created: time.Now().Unix(),
		Model:   result.Model,
		Choices: []openAICompletionChoice{{
			Index: 0,
			Message: openAIMessage{
				Role:    "assistant",
				Content: result.Text,
			},
			FinishReason: "stop",
		}},
		Usage: openAIUsage{
			PromptTokens:     result.PromptTokens,
			CompletionTokens: result.CompletionTokens,
			TotalTokens:      result.TotalTokens,
		},
	}
	writeJSON(w, http.StatusOK, completion)
}

func (s *proxyServer) completeChat(ctx context.Context, req chatCompletionRequest) (*upstreamResult, error) {
	cred, err := s.loadCredential()
	if err != nil {
		return nil, err
	}
	body, err := buildUpstreamRequestBody(req)
	if err != nil {
		return nil, err
	}
	payload, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("marshal upstream request: %w", err)
	}
	url := fmt.Sprintf("%s/responses?client_version=%s", cred.BaseURL, s.cfg.ClientVersion)
	if s.cfg.ClientName != "" {
		url += "&client_name=" + s.cfg.ClientName
	}
	upstreamReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	upstreamReq.Header.Set("Authorization", "Bearer "+cred.AccessToken)
	upstreamReq.Header.Set("Accept", "text/event-stream")
	upstreamReq.Header.Set("Content-Type", "application/json")
	upstreamReq.Header.Set("User-Agent", "chatgpt-codex-proxy/0.1")

	resp, err := s.httpClient.Do(upstreamReq)
	if err != nil {
		return nil, fmt.Errorf("upstream request failed: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 16<<10))
		return nil, fmt.Errorf("upstream returned %s: %s", resp.Status, strings.TrimSpace(string(body)))
	}
	return parseResponseStream(resp.Body)
}

func buildUpstreamRequestBody(req chatCompletionRequest) (map[string]any, error) {
	if strings.TrimSpace(req.Model) == "" {
		return nil, errors.New("model is required")
	}
	instructions := []string{}
	input := make([]map[string]any, 0, len(req.Messages))
	for _, msg := range req.Messages {
		text := extractMessageText(msg.Content)
		if strings.TrimSpace(text) == "" {
			continue
		}
		role := strings.ToLower(strings.TrimSpace(msg.Role))
		if role == "" {
			role = "user"
		}
		if role == "system" {
			instructions = append(instructions, text)
			continue
		}
		input = append(input, map[string]any{
			"role": role,
			"content": []map[string]string{{
				"type": "input_text",
				"text": text,
			}},
		})
	}
	if len(input) == 0 {
		return nil, errors.New("at least one non-system message with text content is required")
	}
	instructionText := strings.TrimSpace(strings.Join(instructions, "\n\n"))
	if instructionText == "" {
		instructionText = "You are a helpful assistant."
	}
	body := map[string]any{
		"model":        req.Model,
		"instructions": instructionText,
		"input":        input,
		"stream":       true,
		"store":        false,
		"text": map[string]any{
			"format": map[string]string{"type": "text"},
		},
	}
	// ChatGPT Codex's responses endpoint rejects OpenAI chat-completions
	// compatibility fields such as temperature. Keep the upstream payload to the
	// minimum supported shape and let Codex use its own defaults.
	return body, nil
}

func parseResponseStream(r io.Reader) (*upstreamResult, error) {
	scanner := bufio.NewScanner(r)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	var dataLines []string
	result := &upstreamResult{}
	var sawDelta bool

	flush := func() error {
		if len(dataLines) == 0 {
			return nil
		}
		payload := strings.Join(dataLines, "\n")
		dataLines = nil
		return applyEventPayload(payload, result, &sawDelta)
	}

	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			if err := flush(); err != nil {
				return nil, err
			}
			continue
		}
		if strings.HasPrefix(line, "data: ") {
			dataLines = append(dataLines, strings.TrimPrefix(line, "data: "))
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("read upstream stream: %w", err)
	}
	if err := flush(); err != nil {
		return nil, err
	}
	if strings.TrimSpace(result.Text) == "" {
		return nil, errors.New("upstream stream completed without text output")
	}
	return result, nil
}

func applyEventPayload(payload string, result *upstreamResult, sawDelta *bool) error {
	if strings.TrimSpace(payload) == "[DONE]" || strings.TrimSpace(payload) == "" {
		return nil
	}
	var envelope map[string]any
	if err := json.Unmarshal([]byte(payload), &envelope); err != nil {
		return fmt.Errorf("parse upstream event: %w", err)
	}
	eventType, _ := envelope["type"].(string)
	switch eventType {
	case "response.output_text.delta":
		if delta, _ := envelope["delta"].(string); delta != "" {
			result.Text += delta
			*sawDelta = true
		}
	case "response.output_text.done":
		if !*sawDelta {
			if text, _ := envelope["text"].(string); text != "" {
				result.Text = text
			}
		}
	case "response.completed":
		response, _ := envelope["response"].(map[string]any)
		if response == nil {
			return nil
		}
		if id, _ := response["id"].(string); id != "" {
			result.ResponseID = id
		}
		if model, _ := response["model"].(string); model != "" {
			result.Model = model
		}
		usage, _ := response["usage"].(map[string]any)
		if usage != nil {
			result.PromptTokens = intFromAny(usage["input_tokens"])
			result.CompletionTokens = intFromAny(usage["output_tokens"])
			result.TotalTokens = intFromAny(usage["total_tokens"])
		}
	case "response.failed", "error":
		return fmt.Errorf("upstream error event: %s", payload)
	}
	return nil
}

func extractMessageText(content any) string {
	switch v := content.(type) {
	case string:
		return v
	case []any:
		parts := make([]string, 0, len(v))
		for _, item := range v {
			obj, ok := item.(map[string]any)
			if !ok {
				continue
			}
			text, _ := obj["text"].(string)
			if text != "" {
				parts = append(parts, text)
			}
		}
		return strings.Join(parts, "\n")
	default:
		return ""
	}
}

func (s *proxyServer) authorizeRequest(r *http.Request) bool {
	if s.cfg.SharedAPIKey == "" {
		return true
	}
	const prefix = "Bearer "
	auth := r.Header.Get("Authorization")
	if !strings.HasPrefix(auth, prefix) {
		return false
	}
	return strings.TrimSpace(strings.TrimPrefix(auth, prefix)) == s.cfg.SharedAPIKey
}

func forwardJSONBody(w http.ResponseWriter, resp *http.Response) {
	body, err := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	_, _ = w.Write(body)
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func envOrDefault(name, fallback string) string {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		return fallback
	}
	return value
}

func intFromAny(v any) int {
	switch n := v.(type) {
	case float64:
		return int(n)
	case int:
		return n
	default:
		return 0
	}
}

func logRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start).Round(time.Millisecond))
	})
}
