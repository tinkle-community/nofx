package security

import "testing"

func TestValidateURLBlocksPrivateHostByDefault(t *testing.T) {
	t.Setenv(trustedPrivateAPIHostsEnv, "")
	if err := ValidateURL("http://127.0.0.1:8081/v1"); err == nil {
		t.Fatal("expected localhost URL to be blocked")
	}
}

func TestValidateURLAllowsTrustedPrivateHostByName(t *testing.T) {
	t.Setenv(trustedPrivateAPIHostsEnv, "chatgpt-codex-proxy,localhost")
	if err := ValidateURL("http://chatgpt-codex-proxy:8081/v1"); err != nil {
		t.Fatalf("expected trusted docker service hostname to be allowed, got %v", err)
	}
	if err := ValidateURL("http://localhost:8081/v1"); err != nil {
		t.Fatalf("expected trusted localhost to be allowed, got %v", err)
	}
}

func TestValidateURLAllowsTrustedPrivateCIDR(t *testing.T) {
	t.Setenv(trustedPrivateAPIHostsEnv, "127.0.0.0/8")
	if err := ValidateURL("http://127.0.0.1:8081/v1"); err != nil {
		t.Fatalf("expected trusted CIDR to be allowed, got %v", err)
	}
}
