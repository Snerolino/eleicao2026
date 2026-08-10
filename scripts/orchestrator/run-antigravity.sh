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
HOOKS_FILE="$SNAPSHOT/.agents/hooks.json"
HOOK_GUARD="$SNAPSHOT/.agents/hooks/deny-async-subagents.sh"
SETTINGS="$REAL_HOME/.gemini/antigravity-cli/settings.json"

if [[ ! -s "$AGENT_FILE" ]]; then
  echo "agente Antigravity read-only ausente no snapshot: $AGENT_FILE" >&2
  exit 43
fi

if [[ ! -s "$HOOKS_FILE" || ! -s "$HOOK_GUARD" ]]; then
  echo "guard síncrono do Antigravity ausente no snapshot" >&2
  exit 45
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
# O custom agent expõe apenas ferramentas de leitura e um PreToolUse workspace
# bloqueia colaboração/subagentes assíncronos. Isso é necessário porque agy -p
# precisa devolver uma resposta final síncrona ao Hermes.
SAFE_PROMPT="Trabalhe somente no snapshot atual e siga integralmente o agente read-only selecionado. Resolva esta tarefa diretamente neste agente e devolva a resposta final no mesmo turno. Não invoque subagentes, research, self, background agents ou mensageria entre agentes. Não use terminal, shell ou command. Use apenas ferramentas de leitura disponibilizadas pelo agente. Tarefa: ${PROMPT}"

OUT="$(mktemp /tmp/eleicao2026-agy-out.XXXXXX)"
ERR="$(mktemp /tmp/eleicao2026-agy-err.XXXXXX)"
trap 'rm -f "$OUT" "$ERR"' EXIT

set +e
env HOME="$REAL_HOME" \
  timeout "${TIMEOUT_SECONDS}s" \
  agy \
    --agent "$AGENT" \
    --mode=plan \
    --sandbox \
    --print-timeout "${TIMEOUT_SECONDS}s" \
    --model "$MODEL" \
    -p "$SAFE_PROMPT" \
    >"$OUT" 2>"$ERR"
STATUS=$?
set -e

[[ -s "$ERR" ]] && cat "$ERR" >&2

if [[ $STATUS -ne 0 ]]; then
  [[ -s "$OUT" ]] && cat "$OUT" >&2
  exit "$STATUS"
fi

if [[ ! -s "$OUT" ]]; then
  echo "Antigravity encerrou sem resposta final." >&2
  exit 46
fi

if grep -Eqi 'launched .*subagent|launch(ed|ing) the .*subagent|awaiting (its|the) response|waiting for .*subagent' "$OUT"; then
  cat "$OUT" >&2
  echo "Antigravity devolveu estado intermediário de subagente; smoke rejeitado." >&2
  exit 47
fi

cat "$OUT"
