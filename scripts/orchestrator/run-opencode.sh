#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-/home/lourenco}"
MODEL="${OPENCODE_AGENT_MODEL:-opencode/deepseek-v4-flash-free}"
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

SNAPSHOT="$(bash "$ROOT/scripts/orchestrator/prepare-snapshot.sh" opencode)"
cd "$SNAPSHOT"

# Snapshot contém somente arquivos rastreados do HEAD. MCP é desligado e o agent
# plan nega edição/shell. Assim o executor barato não enxerga secrets, arquivos
# locais nem a worktree mutável.
exec env \
  HOME="$REAL_HOME" \
  OPENCODE_DISABLE_MCP=true \
  timeout "${TIMEOUT_SECONDS}s" \
  opencode run \
    --agent plan \
    -m "$MODEL" \
    --format json \
    "$PROMPT"
