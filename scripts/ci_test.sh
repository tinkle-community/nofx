#!/usr/bin/env bash

set -euo pipefail

echo "═══════════════════════════════════════════════════════════════"
echo "  Running comprehensive test suite with coverage"
echo "═══════════════════════════════════════════════════════════════"
echo

COVERAGE_TARGET=${COVERAGE_TARGET:-90}
SKIP_RACE=${SKIP_RACE:-false}
TEST_TIMEOUT=${TEST_TIMEOUT:-10m}
WITH_DOCKER=${WITH_DOCKER:-false}

export TEST_DB_URL="${TEST_DB_URL:-}"

if [ "$SKIP_RACE" = "true" ]; then
  echo "⚠️  Race detector disabled (SKIP_RACE=true)"
  RACE_FLAG=""
else
  echo "✓ Race detector enabled"
  RACE_FLAG="-race"
fi

echo "✓ go test timeout: ${TEST_TIMEOUT}"

if [ "$WITH_DOCKER" = "true" ]; then
  echo "✓ Docker-backed PostgreSQL tests enabled"
fi

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

COVERPKG=$(IFS=','; echo "${COVERAGE_PACKAGES[*]}")

echo
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

echo "Running: ${GO_TEST_ARGS[*]}"
"${GO_TEST_ARGS[@]}"

REMAINING_PACKAGES=()
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
  echo "Running: ${REMAINING_ARGS[*]}"
  "${REMAINING_ARGS[@]}"
fi

echo
echo "─────────────────────────────────────────────────────────────"
echo "  Analyzing coverage"
echo "─────────────────────────────────────────────────────────────"
echo

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
