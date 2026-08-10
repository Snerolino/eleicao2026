#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-/home/lourenco}"
MODEL="${ANTIGRAVITY_AGENT_MODEL:-Gemini 3.5 Flash (Low)}"
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

cd "$ROOT"

# Antigravity é usado como consultor. --sandbox mantém a execução de terminal
# isolada do host; a instrução proíbe edits/ações externas. Não use
# --dangerously-skip-permissions neste wrapper.
SAFE_PROMPT="Você é um executor consultivo read-only do projeto eleicao2026. Não edite arquivos, não escreva no host, não faça deploy, não altere Git, Supabase ou Cloudflare, não leia .env*, tokens, secrets, service role, PII ou documentos brutos. Leia apenas o necessário no workspace público/sanitizado e devolva achados objetivos com evidências de caminhos. Tarefa: ${PROMPT}"

exec env HOME="$REAL_HOME" \
  timeout "${TIMEOUT_SECONDS}s" \
  agy \
    --sandbox \
    --print-timeout "${TIMEOUT_SECONDS}s" \
    --model "$MODEL" \
    -p "$SAFE_PROMPT"
