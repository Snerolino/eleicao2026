#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
TIMEOUT_SECONDS="${ORCH_EXECUTOR_TIMEOUT:-480}"
# Limite por modelo: um provedor indisponível não pode consumir o tick inteiro.
# O timeout externo continua protegendo o pool como um todo.
MODEL_TIMEOUT_MS="${ORCH_MODEL_TIMEOUT_MS:-60000}"
# Cadeia consultiva GRATUITA. Não inclui modelos pagos por padrão.
FREE_MODELS="${ORCH_FREE_MODELS:-opencode/deepseek-v4-flash-free,opencode/nemotron-3-ultra-free,opencode/laguna-s-2.1-free,opencode/ling-3.0-tiny-free,opencode/mimo-v2.5-free}"

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

if ! command -v opencode >/dev/null 2>&1; then
  echo 'opencode não disponível; free pool indisponível' >&2
  exit 69
fi

RUNTIME="$ROOT/.orchestrator/runtime"
mkdir -p "$RUNTIME/locks"
exec 8>"$RUNTIME/locks/snapshot-free-pool.lock"
flock 8

SNAPSHOT="$(ORCH_SNAPSHOT_LOCK_HELD=1 bash "$ROOT/scripts/orchestrator/prepare-snapshot.sh" free-pool)"
cd "$SNAPSHOT"

# O free pool é consultivo/read-only. O wrapper de OpenCode usa agent plan,
# MCP desligado e permissões de opencode.jsonc versionadas no snapshot.
exec env \
  HOME="$REAL_HOME" \
  OPENCODE_DISABLE_MCP=true \
  MOA_MODELS="$FREE_MODELS" \
  MOA_MODEL_TIMEOUT_MS="$MODEL_TIMEOUT_MS" \
  timeout --signal=TERM --kill-after=10s "${TIMEOUT_SECONDS}s" \
  node "$SNAPSHOT/scripts/moa-run.mjs" \
    --agent=plan \
    "$PROMPT"
