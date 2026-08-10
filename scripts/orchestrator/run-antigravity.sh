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
SETTINGS="$REAL_HOME/.gemini/antigravity-cli/settings.json"

if [[ ! -s "$AGENT_FILE" ]]; then
  echo "agente Antigravity read-only ausente no snapshot: $AGENT_FILE" >&2
  exit 43
fi

# O Antigravity 1.1.x trata o snapshot como externo ao default-cli-project.
# Para headless, a leitura precisa estar explicitamente allowlisted. A escrita
# no mesmo snapshot deve estar explicitamente negada. O configurador faz backup
# e adiciona somente essas duas regras estreitas.
if ! SNAPSHOT="$SNAPSHOT" SETTINGS="$SETTINGS" node <<'NODE'
import fs from 'node:fs';
const settingsPath = process.env.SETTINGS;
const snapshot = process.env.SNAPSHOT;
if (!fs.existsSync(settingsPath)) process.exit(2);
const cfg = JSON.parse(fs.readFileSync(settingsPath, 'utf8') || '{}');
const allow = cfg?.permissions?.allow ?? [];
const deny = cfg?.permissions?.deny ?? [];
const ask = cfg?.permissions?.ask ?? [];
if (ask.includes('read_file(*)')) process.exit(3);
if (!allow.includes(`read_file(${snapshot})`)) process.exit(4);
if (!deny.includes(`write_file(${snapshot})`)) process.exit(5);
NODE
then
  echo "Antigravity ainda não possui a política read-only do snapshot." >&2
  echo "Rode: npm run orch:configure-google" >&2
  exit 44
fi

cd "$SNAPSHOT"

# O executor Google recebe somente um snapshot dos arquivos rastreados do HEAD.
# O custom agent versionado expõe apenas view_file + grep_search e desliga shell.
# --mode=plan é obrigatório no headless. --sandbox é defesa adicional.
# Nunca usar --dangerously-skip-permissions.
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
