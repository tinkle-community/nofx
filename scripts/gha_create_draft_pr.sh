#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not available" >&2
  exit 1
fi

require_env() {
  local var_name="$1"
  if [ -z "${!var_name:-}" ]; then
    echo "Missing required environment variable: ${var_name}" >&2
    exit 1
  fi
}

require_env "GITHUB_REPOSITORY"
require_env "SYNC_BRANCH"
require_env "SYNC_DIR"

SYNC_STRATEGY=${SYNC_STRATEGY:-unknown}
CONFLICT_COUNT=${CONFLICT_COUNT:-0}
REBASE_RESULT=${REBASE_RESULT:-unknown}
MERGE_RESULT=${MERGE_RESULT:-not_attempted}
GITHUB_RUN_ID=${GITHUB_RUN_ID:-local}

gh --version

existing=$(gh pr list --repo "${GITHUB_REPOSITORY}" --head "${SYNC_BRANCH}" --json number --jq '.[].number' || true)
if [ -n "$existing" ]; then
  echo "Draft PR already exists: #$existing"
  exit 0
fi

conflicts_file="${SYNC_DIR}/conflicts.txt"
if [ -s "$conflicts_file" ]; then
  conflict_lines=$(sed 's/^/- /' "$conflicts_file")
else
  conflict_lines="- None"
fi

resolution_log="${SYNC_DIR}/conflict_resolution.log"
if [ -s "$resolution_log" ]; then
  resolution_lines=$(sed 's/^/- /' "$resolution_log")
else
  resolution_lines="- No conflicts detected"
fi

branch_suffix="${SYNC_BRANCH##sync/}"
if [ -z "$branch_suffix" ]; then
  branch_suffix="$SYNC_BRANCH"
fi

title="chore: upstream sync ${branch_suffix}"
body=$(cat <<EOF
## Summary
- Automated upstream sync via GitHub Actions.
- Strategy: ${SYNC_STRATEGY}
- Rebase result: ${REBASE_RESULT}
- Merge result: ${MERGE_RESULT}
- Conflicts detected: ${CONFLICT_COUNT}

## Conflicts
${conflict_lines}

## Conflict Resolution Log
${resolution_lines}

## Next Steps
- [ ] Monitor automated test matrix.
- [ ] Review DIFF_REPORT.md artifact for additional context.
- [ ] Promote this PR upstream after validation completes.

> Generated automatically by workflow run ${GITHUB_RUN_ID}.
EOF
)

gh pr create \
  --repo "${GITHUB_REPOSITORY}" \
  --title "$title" \
  --body "$body" \
  --draft \
  --head "${SYNC_BRANCH}" \
  --base main
