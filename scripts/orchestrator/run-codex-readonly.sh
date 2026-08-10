#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-/home/lourenco}"
MODEL="${CODEX_AGENT_MODEL:-gpt-5.6-luna}"
TIMEOUT_SECONDS="${ORCH_EXECUTOR_TIMEOUT:-600}"
SCHEMA="$ROOT/.orchestrator/schemas/executor-result.schema.json"
OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

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

cd "$ROOT"
printf '%s' "$PROMPT" | env \
  HOME="$REAL_HOME" \
  CODEX_HOME="$REAL_HOME/.codex" \
  timeout "${TIMEOUT_SECONDS}s" \
  codex exec \
    -m "$MODEL" \
    --sandbox read-only \
    --ephemeral \
    --color never \
    --output-schema "$SCHEMA" \
    -o "$OUT" \
    - >/dev/null

cat "$OUT"
