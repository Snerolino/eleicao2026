#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
MODEL="${OPENCODE_AGENT_MODEL:-opencode/deepseek-v4-flash-free}"
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

RUNTIME="$ROOT/.orchestrator/runtime"
mkdir -p "$RUNTIME/locks"
exec 8>"$RUNTIME/locks/snapshot-opencode.lock"
flock 8

SNAPSHOT="$(ORCH_SNAPSHOT_LOCK_HELD=1 bash "$ROOT/scripts/orchestrator/prepare-snapshot.sh" opencode)"
cd "$SNAPSHOT"

# O lock acima permanece aberto durante todo o processo OpenCode, impedindo que
# outra preparação com o mesmo nome apague o workspace de um reader em curso.
# O snapshot já foi sanitizado fisicamente e contém somente conteúdo permitido.
exec env \
  HOME="$REAL_HOME" \
  OPENCODE_DISABLE_MCP=true \
  timeout --signal=TERM --kill-after=10s "${TIMEOUT_SECONDS}s" \
  opencode run \
    --agent plan \
    -m "$MODEL" \
    --format json \
    "$PROMPT"
