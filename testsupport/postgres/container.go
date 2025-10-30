package postgres

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

var (
	ErrDockerUnavailable = errors.New("docker unavailable for tests")
	ErrDockerDisabled    = errors.New("docker-based tests disabled via env")
)

const (
	defaultStartupTimeout   = 120 * time.Second
	defaultReadyTimeout     = 2 * time.Minute
	defaultReadyDialTimeout = 5 * time.Second
	defaultReadyAttempts    = 8
	defaultReadyBaseDelay   = 500 * time.Millisecond
	defaultReadyMaxBackoff  = 10 * time.Second
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

	if _, ok := os.LookupEnv("TESTCONTAINERS_RYUK_DISABLED"); !ok {
		_ = os.Setenv("TESTCONTAINERS_RYUK_DISABLED", "false")
	}

	container, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("timescale/timescaledb:latest-pg16"),
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("testuser"),
		postgres.WithPassword("testpass"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(120*time.Second)),
	)
	if err != nil {
		return nil, fmt.Errorf("start postgres test container: %w", err)
	}

	dsn, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		_ = container.Terminate(context.Background())
		return nil, fmt.Errorf("resolve postgres connection string: %w", err)
	}

	// Verify connection with exponential backoff
	readyCtx, readyCancel := context.WithTimeout(context.Background(), defaultReadyTimeout)
	defer readyCancel()

	if err := WaitForReady(readyCtx, dsn); err != nil {
		_ = container.Terminate(context.Background())
		return nil, fmt.Errorf("verify postgres connection: %w", err)
	}

	return &Instance{container: container, dsn: dsn}, nil
}

// waitForConnection attempts to connect to the database with exponential backoff
func waitForConnection(ctx context.Context, dsn string, maxAttempts int, baseDelay time.Duration) error {
	var lastErr error
	for attempt := 0; attempt < maxAttempts; attempt++ {
		if attempt > 0 {
			delay := baseDelay * time.Duration(1<<uint(attempt-1))
			if delay > defaultReadyMaxBackoff {
				delay = defaultReadyMaxBackoff
			}
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(delay):
			}
		}

		// Use a short timeout per connection attempt
		connCtx, connCancel := context.WithTimeout(ctx, defaultReadyDialTimeout)
		pool, err := pgxpool.New(connCtx, dsn)
		connCancel()

		if err != nil {
			lastErr = fmt.Errorf("attempt %d: %w", attempt+1, err)
			if strings.Contains(err.Error(), "context deadline exceeded") {
				lastErr = fmt.Errorf("attempt %d: connection timeout", attempt+1)
			}
			continue
		}

		// Ping with a timeout
		pingCtx, pingCancel := context.WithTimeout(ctx, defaultReadyDialTimeout)
		pingErr := pool.Ping(pingCtx)
		pingCancel()

		if pingErr != nil {
			pool.Close()
			lastErr = fmt.Errorf("attempt %d ping: %w", attempt+1, pingErr)
			continue
		}

		pool.Close()
		return nil
	}
	return fmt.Errorf("failed after %d attempts (last error: %w)", maxAttempts, lastErr)
}

// WaitForReady blocks until the database at the given DSN is ready to accept connections
func WaitForReady(ctx context.Context, dsn string) error {
	if strings.TrimSpace(dsn) == "" {
		return errors.New("empty connection string")
	}
	if ctx == nil {
		ctx = context.Background()
	}
	if _, hasDeadline := ctx.Deadline(); !hasDeadline {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, defaultReadyTimeout)
		defer cancel()
	}
	return waitForConnection(ctx, dsn, defaultReadyAttempts, defaultReadyBaseDelay)
}
