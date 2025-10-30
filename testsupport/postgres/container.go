package postgres

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

var (
	ErrDockerUnavailable = errors.New("docker unavailable for tests")
	ErrDockerDisabled    = errors.New("docker-based tests disabled via env")
)

// Instance models a managed PostgreSQL test container. Call Terminate when done.
type Instance struct {
	container testcontainers.Container
	dsn       string
}

// ConnectionString exposes the configured DSN (sslmode=disable).
func (i *Instance) ConnectionString() string {
	if i == nil {
		return ""
	}
	return i.dsn
}

// Terminate stops the underlying container. It is safe to call multiple times.
func (i *Instance) Terminate(ctx context.Context) error {
	if i == nil || i.container == nil {
		return nil
	}
	return i.container.Terminate(ctx)
}

// Start launches a disposable PostgreSQL container tailored for integration
// tests. Call Terminate on the returned instance to release resources.
func Start(ctx context.Context) (*Instance, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	if os.Getenv("SKIP_DOCKER_TESTS") == "1" {
		return nil, ErrDockerDisabled
	}

	container, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("timescale/timescaledb:latest-pg16"),
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("testuser"),
		postgres.WithPassword("testpass"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(75*time.Second)),
	)
	if err != nil {
		return nil, fmt.Errorf("start postgres test container: %w", err)
	}

	dsn, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		_ = container.Terminate(context.Background())
		return nil, fmt.Errorf("resolve postgres connection string: %w", err)
	}

	return &Instance{container: container, dsn: dsn}, nil
}
