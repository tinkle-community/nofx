package testsupport

import (
	"sync"
	"testing"
	"time"

	"nofx/featureflag"
)

type FlagMutator func(*featureflag.State)

func RuntimeFlags(t testing.TB, mutators ...FlagMutator) *featureflag.RuntimeFlags {
	t.Helper()

	state := featureflag.DefaultState()
	for _, mutate := range mutators {
		if mutate == nil {
			continue
		}
		mutate(&state)
	}

	flags := featureflag.NewRuntimeFlags(state)
	snapshot := flags.Snapshot()

	t.Cleanup(func() {
		update := featureflag.Update{
			EnableGuardedStopLoss: boolPtr(snapshot.EnableGuardedStopLoss),
			EnableMutexProtection: boolPtr(snapshot.EnableMutexProtection),
			EnablePersistence:     boolPtr(snapshot.EnablePersistence),
			EnableRiskEnforcement: boolPtr(snapshot.EnableRiskEnforcement),
		}
		flags.Apply(update)
	})

	return flags
}

func RunConcurrently(t testing.TB, workers int, task func(worker int)) {
	t.Helper()

	if workers <= 0 {
		t.Fatalf("RunConcurrently requires at least one worker, got %d", workers)
	}
	if task == nil {
		t.Fatalf("RunConcurrently requires a task function")
	}

	var wg sync.WaitGroup
	wg.Add(workers)

	for worker := 0; worker < workers; worker++ {
		w := worker
		go func() {
			defer wg.Done()
			task(w)
		}()
	}

	waitWithTimeout(t, &wg, 5*time.Second)
}

func RunConcurrentTasks(t testing.TB, tasks ...func()) {
	t.Helper()

	if len(tasks) == 0 {
		t.Fatalf("RunConcurrentTasks requires at least one task")
	}

	var wg sync.WaitGroup
	wg.Add(len(tasks))

	for _, task := range tasks {
		fn := task
		go func() {
			defer wg.Done()
			if fn != nil {
				fn()
			}
		}()
	}

	waitWithTimeout(t, &wg, 5*time.Second)
}

func waitWithTimeout(t testing.TB, wg *sync.WaitGroup, timeout time.Duration) {
	t.Helper()

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		return
	case <-time.After(timeout):
		t.Fatalf("timed out after %s waiting for goroutines to complete", timeout)
	}
}

func boolPtr(v bool) *bool {
	b := v
	return &b
}
