#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
MODEL="${LOCAL_AGENT_MODEL:-gpt-oss:20b}"
TIMEOUT_SECONDS="${ORCH_EXECUTOR_TIMEOUT:-600}"
PREFLIGHT_TIMEOUT_SECONDS="${ORCH_PREFLIGHT_TIMEOUT:-10}"
OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

if [[ -z "$REAL_HOME" || ! -d "$REAL_HOME" ]]; then
  echo 'home real não resolvido' >&2
  exit 41
fi

if [[ $# -gt 0 ]]; then
  PROMPT="$*"
else
  PROMPT="$(cat)"
fi

if [[ -z "${PROMPT//[[:space:]]/}" ]]; then
  echo 'prompt vazio' >&2
  exit 42
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo 'ollama não disponível' >&2
  exit 69
fi

set +e
OLLAMA_LIST="$(timeout --signal=TERM --kill-after=5s "${PREFLIGHT_TIMEOUT_SECONDS}s" ollama list 2>/dev/null)"
OLLAMA_STATUS=$?
set -e
if [[ $OLLAMA_STATUS -ne 0 ]]; then
  echo 'ollama não respondeu ao preflight dentro do prazo' >&2
  exit 69
fi

if ! printf '%s\n' "$OLLAMA_LIST" | awk 'NR>1 {print $1}' | grep -Fxq "$MODEL"; then
  echo "modelo local ausente: $MODEL" >&2
  exit 69
fi

RUNTIME="$ROOT/.orchestrator/runtime"
mkdir -p "$RUNTIME/locks"
exec 8>"$RUNTIME/locks/snapshot-local.lock"
flock 8

SNAPSHOT="$(ORCH_SNAPSHOT_LOCK_HELD=1 bash "$ROOT/scripts/orchestrator/prepare-snapshot.sh" local)"
cd "$SNAPSHOT"

printf '%s' "$PROMPT" | env \
  HOME="$REAL_HOME" \
  CODEX_HOME="$REAL_HOME/.codex" \
  timeout --signal=TERM --kill-after=10s "${TIMEOUT_SECONDS}s" \
  codex exec \
    --oss \
    --local-provider ollama \
    -m "$MODEL" \
    --sandbox read-only \
    --skip-git-repo-check \
    --ephemeral \
    --color never \
    -o "$OUT" \
    - >/dev/null

cat "$OUT"
