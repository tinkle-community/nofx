#!/usr/bin/env bash

set -euo pipefail

report_skipped_tests() {
  local log_file="$1"
  local label="$2"

  if [ ! -f "$log_file" ]; then
    echo "  (no log captured for ${label})"
    return
  fi

  if grep -q "SKIP" "$log_file"; then
    echo "⚠️  Skipped tests detected during ${label}:"
    grep -n "SKIP" "$log_file"
  else
    echo "✓ No skipped tests detected during ${label}"
  fi
}

sanitize_go_flags_for_docker() {
  local raw_flags="${GOFLAGS:-}"
  if [[ "$raw_flags" != *"-tags=nodocker"* ]]; then
    return
  fi

  echo "🧪 Removing '-tags=nodocker' from GOFLAGS for Docker-backed run"
  local cleaned
  cleaned=$(echo "$raw_flags" | sed 's/-tags=nodocker//g' | xargs || true)
  if [ -z "$cleaned" ]; then
    unset GOFLAGS
    echo "  GOFLAGS cleared"
    return
  fi
  export GOFLAGS="$cleaned"
  echo "  GOFLAGS set to '$GOFLAGS'"
}

echo "═══════════════════════════════════════════════════════════════"
echo "  Running comprehensive test suite with coverage"
echo "═══════════════════════════════════════════════════════════════"
echo

COVERAGE_TARGET=${COVERAGE_TARGET:-90}
SKIP_RACE=${SKIP_RACE:-false}
TEST_TIMEOUT=${TEST_TIMEOUT:-10m}
WITH_DOCKER=${WITH_DOCKER:-false}

export TEST_DB_URL="${TEST_DB_URL:-}"

echo "Environment diagnostics:"
echo "  DISABLE_DB_TESTS=${DISABLE_DB_TESTS:-<unset>}"
echo "  SKIP_DOCKER_TESTS=${SKIP_DOCKER_TESTS:-<unset>}"
echo "  NO_DOCKER=${NO_DOCKER:-<unset>}"
echo "  GOFLAGS=${GOFLAGS:-<unset>}"
if [ -n "${TEST_DB_URL:-}" ]; then
  echo "  TEST_DB_URL=set"
else
  echo "  TEST_DB_URL=<unset>"
fi
echo "  WITH_DOCKER=${WITH_DOCKER}"
echo

go env GOMODCACHE GOCACHE GOFLAGS

echo

if [ "$WITH_DOCKER" = "true" ]; then
  if [ "${DISABLE_DB_TESTS:-0}" = "1" ] || [ "${SKIP_DOCKER_TESTS:-0}" = "1" ] || [ "${NO_DOCKER:-0}" = "1" ]; then
    echo "🧪 WITH_DOCKER=true but DB tests were disabled; clearing conflicting flags"
    unset DISABLE_DB_TESTS
    unset SKIP_DOCKER_TESTS
    unset NO_DOCKER
  fi
  sanitize_go_flags_for_docker
  echo "Post-sanitization flags for Docker job:"
  echo "  DISABLE_DB_TESTS=${DISABLE_DB_TESTS:-<unset>}"
  echo "  SKIP_DOCKER_TESTS=${SKIP_DOCKER_TESTS:-<unset>}"
  echo "  NO_DOCKER=${NO_DOCKER:-<unset>}"
  echo "  GOFLAGS=${GOFLAGS:-<unset>}"
  echo
fi

if [ "$SKIP_RACE" = "true" ]; then
  echo "⚠️  Race detector disabled (SKIP_RACE=true)"
  RACE_FLAG=""
else
  echo "✓ Race detector enabled"
  RACE_FLAG="-race"
fi

echo "✓ go test timeout: ${TEST_TIMEOUT}"

echo "TEST_DB_URL inspection:"
if [ -z "$TEST_DB_URL" ]; then
  echo "⚠️  TEST_DB_URL not set; database-dependent tests will auto-skip"
else
  echo "✓ TEST_DB_URL set; database tests enabled"
fi

SKIP_DB_PACKAGES=0
if [ "${DISABLE_DB_TESTS:-0}" = "1" ] || [ "${SKIP_DOCKER_TESTS:-0}" = "1" ] || [ "${NO_DOCKER:-0}" = "1" ]; then
  SKIP_DB_PACKAGES=1
fi

mapfile -t ALL_PACKAGES < <(go list ./...)
if [ ${#ALL_PACKAGES[@]} -eq 0 ]; then
  echo "❌ go list ./... returned no packages"
  exit 1
fi

echo "Discovered ${#ALL_PACKAGES[@]} packages via go list ./..."
for pkg in "${ALL_PACKAGES[@]}"; do
  echo "   • ${pkg}"
done

mapfile -t RAW_TEST_PACKAGES < <(go list -f '{{if or .TestGoFiles .XTestGoFiles}}{{.ImportPath}}{{end}}' ./...)
TEST_PACKAGES=()
for pkg in "${RAW_TEST_PACKAGES[@]}"; do
  if [ -n "$pkg" ]; then
    TEST_PACKAGES+=("$pkg")
  fi
done

echo
if [ ${#TEST_PACKAGES[@]} -eq 0 ]; then
  echo "⚠️  No packages contain *_test.go files"
else
  echo "Packages containing tests (${#TEST_PACKAGES[@]}):"
  for pkg in "${TEST_PACKAGES[@]}"; do
    echo "   • ${pkg}"
  done
fi

echo

PACKAGES=()
for pkg in "${ALL_PACKAGES[@]}"; do
  if [ "$SKIP_DB_PACKAGES" = "1" ] && [[ "$pkg" == "nofx/db" || "$pkg" == nofx/db/* ]]; then
    continue
  fi
  PACKAGES+=("$pkg")
done

if [ ${#PACKAGES[@]} -eq 0 ]; then
  echo "❌ No Go packages selected for testing after filtering"
  exit 1
fi

if [ "$SKIP_DB_PACKAGES" = "1" ]; then
  echo "⚠️  Database packages excluded from coverage (DISABLE_DB_TESTS mode)"
fi

COVERAGE_PACKAGES=("${PACKAGES[@]}")

if [ "$SKIP_DB_PACKAGES" = "1" ] && [ -z "${COVERAGE_FOCUS_PACKAGES:-}" ]; then
  COVERAGE_FOCUS_PACKAGES="nofx/risk nofx/featureflag"
fi

if [ -n "${COVERAGE_FOCUS_PACKAGES:-}" ]; then
  read -ra REQUESTED_COVERAGE <<< "${COVERAGE_FOCUS_PACKAGES}"
  tmp=()
  for pkg in "${REQUESTED_COVERAGE[@]}"; do
    if go list "$pkg" >/dev/null 2>&1; then
      tmp+=("$pkg")
    else
      echo "⚠️  Skipping requested coverage package '$pkg' (not found)"
    fi
  done
  if [ ${#tmp[@]} -gt 0 ]; then
    COVERAGE_PACKAGES=("${tmp[@]}")
  fi
fi

if [ ${#COVERAGE_PACKAGES[@]} -eq 0 ]; then
  echo "❌ No packages selected for coverage measurement"
  exit 1
fi

echo "✓ Selected ${#PACKAGES[@]} packages for testing"
echo "✓ Measuring coverage across ${#COVERAGE_PACKAGES[@]} packages:"
for pkg in "${COVERAGE_PACKAGES[@]}"; do
  echo "   • ${pkg}"
done

echo

COVERPKG=$(IFS=','; echo "${COVERAGE_PACKAGES[*]}")

echo "─────────────────────────────────────────────────────────────"
if [ -z "$RACE_FLAG" ]; then
  echo "  Running tests with coverage (race detector disabled)"
else
  echo "  Running tests with race detector and coverage"
fi
echo "─────────────────────────────────────────────────────────────"
echo

GO_TEST_ARGS=(go test)
if [ -n "$RACE_FLAG" ]; then
  GO_TEST_ARGS+=("$RACE_FLAG")
fi

if [ "$WITH_DOCKER" = "true" ]; then
  GO_TEST_ARGS+=(-p 2)
fi

GO_TEST_ARGS+=(
  -timeout "$TEST_TIMEOUT"
  -coverpkg="${COVERPKG}"
  -coverprofile=coverage.out
  -covermode=atomic
  -count=1
  -v
  "${COVERAGE_PACKAGES[@]}"
)

COVERAGE_TEST_LOG=$(mktemp -t gotest-coverage-XXXXXX.log)
echo "Running: ${GO_TEST_ARGS[*]}"
set +e
"${GO_TEST_ARGS[@]}" 2>&1 | tee "$COVERAGE_TEST_LOG"
TEST_EXIT=${PIPESTATUS[0]}
set -e
if [ "$TEST_EXIT" -ne 0 ]; then
  echo "❌ go test failed (exit code $TEST_EXIT)"
  report_skipped_tests "$COVERAGE_TEST_LOG" "coverage run"
  exit "$TEST_EXIT"
fi

report_skipped_tests "$COVERAGE_TEST_LOG" "coverage run"

declare -a REMAINING_PACKAGES=()
for pkg in "${PACKAGES[@]}"; do
  skip=0
  for covered in "${COVERAGE_PACKAGES[@]}"; do
    if [ "$pkg" = "$covered" ]; then
      skip=1
      break
    fi
  done
  if [ "$skip" -eq 0 ]; then
    REMAINING_PACKAGES+=("$pkg")
  fi
done

if [ ${#REMAINING_PACKAGES[@]} -gt 0 ]; then
  echo
  echo "─────────────────────────────────────────────────────────────"
  echo "  Running tests without coverage for ${#REMAINING_PACKAGES[@]} additional packages"
  echo "─────────────────────────────────────────────────────────────"
  echo

  REMAINING_ARGS=(go test)
  if [ -n "$RACE_FLAG" ]; then
    REMAINING_ARGS+=("$RACE_FLAG")
  fi
  if [ "$WITH_DOCKER" = "true" ]; then
    REMAINING_ARGS+=(-p 2)
  fi
  REMAINING_ARGS+=(
    -timeout "$TEST_TIMEOUT"
    -count=1
    -v
    "${REMAINING_PACKAGES[@]}"
  )
  REMAINING_TEST_LOG=$(mktemp -t gotest-remaining-XXXXXX.log)
  echo "Running: ${REMAINING_ARGS[*]}"
  set +e
  "${REMAINING_ARGS[@]}" 2>&1 | tee "$REMAINING_TEST_LOG"
  REMAINING_EXIT=${PIPESTATUS[0]}
  set -e
  if [ "$REMAINING_EXIT" -ne 0 ]; then
    echo "❌ go test (remaining packages) failed (exit code $REMAINING_EXIT)"
    report_skipped_tests "$REMAINING_TEST_LOG" "remaining packages run"
    exit "$REMAINING_EXIT"
  fi
  report_skipped_tests "$REMAINING_TEST_LOG" "remaining packages run"
fi

echo

echo "─────────────────────────────────────────────────────────────"
echo "  Packages containing tests (post-run confirmation)"
echo "─────────────────────────────────────────────────────────────"
for pkg in "${TEST_PACKAGES[@]}"; do
  echo "   • ${pkg}"
done

echo

echo "─────────────────────────────────────────────────────────────"
echo "  Analyzing coverage"
echo "─────────────────────────────────────────────────────────────"
echo

if [ ! -f coverage.out ]; then
  echo "❌ coverage.out not found"
  exit 1
fi

TOTAL_COV=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | sed 's/%//')

echo "Total coverage: ${TOTAL_COV}%"
echo "Coverage target: ${COVERAGE_TARGET}%"

if [ -z "$TOTAL_COV" ]; then
  echo "❌ Failed to extract coverage percentage"
  exit 1
fi

COVERAGE_OK=$(awk -v cov="$TOTAL_COV" -v target="$COVERAGE_TARGET" 'BEGIN { print (cov >= target ? "1" : "0") }')

if [ "$COVERAGE_OK" = "1" ]; then
  echo "✅ Coverage target met (${TOTAL_COV}% >= ${COVERAGE_TARGET}%)"
else
  echo "❌ Coverage below target (${TOTAL_COV}% < ${COVERAGE_TARGET}%)"
  exit 1
fi

echo

echo "─────────────────────────────────────────────────────────────"
echo "  Generating coverage report"
echo "─────────────────────────────────────────────────────────────"
echo

go tool cover -html=coverage.out -o coverage.html
echo "✓ Coverage HTML report: coverage.html"

echo

echo "═══════════════════════════════════════════════════════════════"
echo "  Test suite completed successfully"
echo "═══════════════════════════════════════════════════════════════"
