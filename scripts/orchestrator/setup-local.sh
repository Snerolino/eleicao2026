#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
PROFILE="${HERMES_ORCH_PROFILE:-eleicao2026}"
ALIAS="${HERMES_ORCH_ALIAS:-h-eleicao2026}"

if [[ -z "$REAL_HOME" || ! -d "$REAL_HOME" ]]; then
  echo "home real não resolvido" >&2
  exit 12
fi

cd "$ROOT"

if ! command -v hermes >/dev/null 2>&1; then
  echo "Hermes não encontrado no PATH." >&2
  exit 10
fi

if ! command -v codex >/dev/null 2>&1; then
  echo "Codex não encontrado no PATH." >&2
  exit 11
fi

if env HOME="$REAL_HOME" hermes profile show "$PROFILE" >/dev/null 2>&1; then
  echo "perfil Hermes $PROFILE já existe"
else
  env HOME="$REAL_HOME" hermes profile create "$PROFILE" \
    --description "Control plane do VotoPraQuem RS: contexto, roteamento multi-CLI, gates e handoffs."
fi

env HOME="$REAL_HOME" hermes profile alias "$PROFILE" --name "$ALIAS"
env HOME="$REAL_HOME" hermes -p "$PROFILE" config set terminal.backend local
env HOME="$REAL_HOME" hermes -p "$PROFILE" config set terminal.home_mode real

HERMES_REAL_HOME="$REAL_HOME" HERMES_ORCH_PROFILE="$PROFILE" bash scripts/orchestrator/install-hermes-skill.sh

if env HOME="$REAL_HOME" hermes -p "$PROFILE" mcp list 2>/dev/null | grep -qi 'codex'; then
  echo "Codex MCP já registrado no perfil $PROFILE"
else
  env HOME="$REAL_HOME" hermes -p "$PROFILE" mcp add codex --preset codex
fi

printf '\nConfiguração estrutural concluída.\n'
printf 'Próximos gates interativos:\n'
printf '  1. HOME=%s hermes -p %s model   # escolher OpenAI Codex/OAuth\n' "$REAL_HOME" "$PROFILE"
printf '  2. codex login status   # confirmar ChatGPT OAuth\n'
printf '  3. agy                  # confirmar Google OAuth, se necessário\n'
printf '  4. opencode             # /connect OpenCode Zen, se necessário\n'
printf '\nDepois rode: npm run orch:doctor -- --smoke\n'
