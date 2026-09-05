package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestHandleGetSupportedModelsIncludesAtlasCloud(t *testing.T) {
	gin.SetMode(gin.TestMode)

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)

	server := &Server{}
	server.handleGetSupportedModels(ctx)

	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d, want %d", recorder.Code, http.StatusOK)
	}

	var models []map[string]string
	if err := json.Unmarshal(recorder.Body.Bytes(), &models); err != nil {
		t.Fatalf("decode supported models: %v", err)
	}

	for _, model := range models {
		if model["id"] != "atlascloud" {
			continue
		}
		if model["name"] != "Atlas Cloud" {
			t.Fatalf("Atlas Cloud name = %q", model["name"])
		}
		if model["provider"] != "atlascloud" {
			t.Fatalf("Atlas Cloud provider = %q", model["provider"])
		}
		if model["defaultModel"] != "qwen/qwen3.5-flash" {
			t.Fatalf("Atlas Cloud defaultModel = %q", model["defaultModel"])
		}
		return
	}

	t.Fatal("Atlas Cloud model was not included in supported models")
}
