package store

import "testing"

func TestMEXCPaperRequiresNoCredentials(t *testing.T) {
	missing := MissingRequiredExchangeCredentialFields("mexc_paper", "", "", "", "", "", "", "", "", "")
	if len(missing) != 0 {
		t.Fatalf("MEXC paper unexpectedly requires credentials: %v", missing)
	}
}
