#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-/home/lourenco}"
MODEL="${ANTIGRAVITY_AGENT_MODEL:-Gemini 3.5 Flash (Low)}"
AGENT="${ANTIGRAVITY_AGENT_NAME:-eleicao2026-reader}"
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
  echo 'prompt vazio' >&2
  exit 42
fi

SNAPSHOT="$(bash "$ROOT/scripts/orchestrator/prepare-snapshot.sh" antigravity)"
AGENT_FILE="$SNAPSHOT/.agents/agents/$AGENT/agent.md"

if [[ ! -s "$AGENT_FILE" ]]; then
  echo "agente Antigravity read-only ausente no snapshot: $AGENT_FILE" >&2
  exit 43
fi

cd "$SNAPSHOT"

# O executor Google recebe somente um snapshot dos arquivos rastreados do HEAD.
# O custom agent versionado expõe apenas view_file + grep_search e desliga shell.
# --mode=plan é obrigatório no headless: é a superfície oficial do agy para
# investigação com ferramentas de leitura antes de qualquer alteração.
# --sandbox permanece como defesa adicional. Nunca usar --dangerously-skip-permissions.
SAFE_PROMPT="Trabalhe somente no snapshot atual e siga integralmente o agente read-only selecionado. Não use terminal, shell ou command. Use apenas ferramentas de leitura disponibilizadas pelo agente. Tarefa: ${PROMPT}"

exec env HOME="$REAL_HOME" \
  timeout "${TIMEOUT_SECONDS}s" \
  agy \
    --agent "$AGENT" \
    --mode=plan \
    --sandbox \
    --print-timeout "${TIMEOUT_SECONDS}s" \
    --model "$MODEL" \
    -p "$SAFE_PROMPT"
