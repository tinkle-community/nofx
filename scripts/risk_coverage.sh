#!/usr/bin/env bash
# Run targeted coverage for the risk package. Fails if coverage <95%.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="${ROOT}/coverage-risk.out"

go test -covermode=atomic -coverpkg=./risk -coverprofile="${PROFILE}" ./...

coverage=$(go tool cover -func="${PROFILE}" | awk '/^total:/ {gsub("%","", $3); print $3}')
rm -f "${PROFILE}"

if [[ -z "${coverage}" ]]; then
    echo "failed to parse risk coverage" >&2
    exit 1
fi

cmp=$(awk -v cov="${coverage}" -v th=95.0 'BEGIN { if (cov+0 < th) print 1; else print 0 }')
if [[ "${cmp}" -eq 1 ]]; then
    echo "risk coverage ${coverage}% is below required 95%" >&2
    exit 1
fi

echo "risk coverage ${coverage}%"
