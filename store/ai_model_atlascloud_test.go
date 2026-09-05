package store

import (
	"testing"
)

func TestHasUsableAPIKeyUsesAtlasCloudEnv(t *testing.T) {
	t.Setenv("ATLASCLOUD_API_KEY", "sk-atlas-test")

	model := AIModel{
		Provider: "atlascloud",
		Enabled:  true,
	}

	if !hasUsableAPIKey(model) {
		t.Fatal("expected ATLASCLOUD_API_KEY to make Atlas Cloud model usable")
	}
}
