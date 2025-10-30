#!/usr/bin/env bash

set -euo pipefail

BASE_REF=${1:-upstream/main}
FORK_REF=${2:-origin/main}
RESOLUTION_DIR=${UPSTREAM_SYNC_DIR:-${RUNNER_TEMP:-/tmp}/upstream-sync}
LOG_FILE=${RESOLUTION_LOG:-${RESOLUTION_DIR}/conflict_resolution.log}

mkdir -p "${RESOLUTION_DIR}"
: >"${LOG_FILE}"

readarray -t CONFLICT_FILES < <(git diff --name-only --diff-filter=U)
if [ ${#CONFLICT_FILES[@]} -eq 0 ]; then
  echo "no conflicts detected" | tee -a "${LOG_FILE}"
  exit 0
fi

GOFMT_BIN=""
if command -v gofmt >/dev/null 2>&1; then
  GOFMT_BIN="$(command -v gofmt)"
fi

resolve_file() {
  local file="$1"
  local base_ref="$2"
  local fork_ref="$3"
  local log_file="$4"
  local resolution_dir="$5"

  local tmp_patch
  tmp_patch=$(mktemp -p "${resolution_dir}" "$(echo "${file}" | tr '/' '_').XXXX.patch")

  if ! git cat-file -e "${base_ref}:${file}" >/dev/null 2>&1; then
    # File introduced only in fork; keep fork version.
    git checkout --ours -- "${file}"
    if [[ -n "${GOFMT_BIN}" && "${file}" == *.go ]]; then
      "${GOFMT_BIN}" -w "${file}"
    fi
    git add "${file}"
    echo "${file}: retained fork version (absent in ${base_ref})" | tee -a "${log_file}"
    rm -f "${tmp_patch}"
    return
  fi

  if ! git cat-file -e "${fork_ref}:${file}" >/dev/null 2>&1; then
    # File removed in fork but present upstream; take upstream to preserve history.
    git restore --source="${base_ref}" -- "${file}"
    if [[ -n "${GOFMT_BIN}" && "${file}" == *.go ]]; then
      "${GOFMT_BIN}" -w "${file}"
    fi
    git add "${file}"
    echo "${file}: restored upstream version (missing from ${fork_ref})" | tee -a "${log_file}"
    rm -f "${tmp_patch}"
    return
  fi

  git diff "${base_ref}".."${fork_ref}" -- "${file}" >"${tmp_patch}" || true

  if [ ! -s "${tmp_patch}" ]; then
    git restore --source="${base_ref}" -- "${file}"
    if [[ -n "${GOFMT_BIN}" && "${file}" == *.go ]]; then
      "${GOFMT_BIN}" -w "${file}"
    fi
    git add "${file}"
    echo "${file}: adopted upstream version (no fork delta)" | tee -a "${log_file}"
    rm -f "${tmp_patch}"
    return
  fi

  git restore --source="${base_ref}" -- "${file}"
  if git apply --3way "${tmp_patch}"; then
    if [[ -n "${GOFMT_BIN}" && "${file}" == *.go ]]; then
      "${GOFMT_BIN}" -w "${file}"
    fi
    git add "${file}"
    echo "${file}: applied fork adjustments onto upstream" | tee -a "${log_file}"
    rm -f "${tmp_patch}"
    return
  fi

  git checkout --ours -- "${file}"
  if [[ -n "${GOFMT_BIN}" && "${file}" == *.go ]]; then
    "${GOFMT_BIN}" -w "${file}"
  fi
  git add "${file}"
  echo "${file}: kept fork version (3-way merge failed)" | tee -a "${log_file}"
  rm -f "${tmp_patch}"
}

for file in "${CONFLICT_FILES[@]}"; do
  resolve_file "${file}" "${BASE_REF}" "${FORK_REF}" "${LOG_FILE}" "${RESOLUTION_DIR}"
done

readarray -t REMAINING < <(git diff --name-only --diff-filter=U)
if [ ${#REMAINING[@]} -ne 0 ]; then
  echo "unresolved conflicts remain" | tee -a "${LOG_FILE}"
  printf '%s\n' "${REMAINING[@]}" | tee -a "${LOG_FILE}"
  exit 1
fi

echo "conflicts resolved" | tee -a "${LOG_FILE}"
