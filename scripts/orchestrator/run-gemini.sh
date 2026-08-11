#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
TIMEOUT_SECONDS="${ORCH_EXECUTOR_TIMEOUT:-480}"

if [[ -z "$REAL_HOME" || ! -d "$REAL_HOME" ]]; then
  echo '{"error":"home real não resolvido"}' >&2
  exit 41
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

RUNTIME="$ROOT/.orchestrator/runtime"
mkdir -p "$RUNTIME/locks"
exec 8>"$RUNTIME/locks/snapshot-gemini-legacy.lock"
flock 8

# Mesmo sendo rota legacy, o lock permanece aberto durante todo o processo para
# impedir que outra preparação apague o snapshot que este reader está usando.
SNAPSHOT="$(ORCH_SNAPSHOT_LOCK_HELD=1 bash "$ROOT/scripts/orchestrator/prepare-snapshot.sh" gemini-legacy)"
cd "$SNAPSHOT"

exec env HOME="$REAL_HOME" \
  timeout "${TIMEOUT_SECONDS}s" \
  gemini "${ARGS[@]}" -p "$PROMPT"
