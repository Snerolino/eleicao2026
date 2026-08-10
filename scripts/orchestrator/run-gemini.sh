#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-/home/lourenco}"
TIMEOUT_SECONDS="${ORCH_EXECUTOR_TIMEOUT:-480}"

if [[ ! -d "$REAL_HOME" ]]; then
  REAL_HOME="$(getent passwd "$(id -un)" | cut -d: -f6)"
fi

if [[ $# -gt 0 ]]; then
  PROMPT="$*"
else
  PROMPT="$(cat)"
fi

if [[ -z "${PROMPT//[[:space:]]/}" ]]; then
  echo '{"error":"prompt vazio"}' >&2
  exit 42
fi

ARGS=(
  --approval-mode=plan
  --skip-trust
  --output-format json
)

if [[ -n "${GEMINI_AGENT_MODEL:-}" ]]; then
  ARGS+=(--model "$GEMINI_AGENT_MODEL")
fi

cd "$ROOT"
exec env HOME="$REAL_HOME" \
  timeout "${TIMEOUT_SECONDS}s" \
  gemini "${ARGS[@]}" -p "$PROMPT"
