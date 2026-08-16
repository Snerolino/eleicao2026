#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
MODEL="${ANTIGRAVITY_AGENT_MODEL:-Gemini 3.5 Flash (Low)}"
AGENT="${ANTIGRAVITY_AGENT_NAME:-eleicao2026-reader}"
TIMEOUT_SECONDS="${ORCH_EXECUTOR_TIMEOUT:-480}"

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

RUNTIME="$ROOT/.orchestrator/runtime"
mkdir -p "$RUNTIME/locks"
exec 8>"$RUNTIME/locks/snapshot-antigravity.lock"
flock 8

SNAPSHOT="$(ORCH_SNAPSHOT_LOCK_HELD=1 bash "$ROOT/scripts/orchestrator/prepare-snapshot.sh" antigravity)"
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

# O lock do snapshot permanece aberto durante toda a execução. Assim outra
# chamada não consegue recriar/apagar o workspace enquanto este reader o usa.
# A política local é fail-closed: nenhuma leitura fora do snapshot é aceita.
if ! SNAPSHOT="$SNAPSHOT" SETTINGS="$SETTINGS" node <<'NODE'
import fs from 'node:fs';
const settingsPath = process.env.SETTINGS;
const snapshot = process.env.SNAPSHOT;
if (!fs.existsSync(settingsPath)) process.exit(2);
const cfg = JSON.parse(fs.readFileSync(settingsPath, 'utf8') || '{}');
const allow = cfg?.permissions?.allow ?? [];
const deny = cfg?.permissions?.deny ?? [];
const ask = cfg?.permissions?.ask ?? [];
const allowRule = `read_file(${snapshot})`;
if (allow.some((rule) => /^read_file\(/.test(rule) && rule !== allowRule)) process.exit(6);
if (ask.some((rule) => /^read_file\(/.test(rule))) process.exit(7);
if (!allow.includes(allowRule)) process.exit(4);
if (!deny.includes(`write_file(${snapshot})`)) process.exit(5);
NODE
then
  echo "Antigravity não possui uma política read-only exclusiva para o snapshot." >&2
  echo "Remova permissões read_file externas/dinâmicas e rode: npm run orch:configure-google" >&2
  exit 44
fi

cd "$SNAPSHOT"

# Não inclua paths absolutos no texto enviado ao provedor externo. O workspace
# já foi adicionado localmente por --add-dir; o modelo só precisa de referências
# relativas ao workspace sanitizado.
SAFE_PROMPT="/goal Trabalhe somente no workspace explicitamente adicionado. O arquivo AGENTS.md alvo está na raiz desse workspace. Resolva esta tarefa diretamente neste agente e devolva a resposta final no mesmo turno. Não procure em HOME, customizations globais, scratch ou outros projetos. Não invoque subagentes, research, self, background agents ou mensageria entre agentes. Não use terminal, shell ou command. Use apenas ferramentas de leitura disponibilizadas pelo agente. Tarefa: ${PROMPT}"

OUT="$(mktemp /tmp/eleicao2026-agy-out.XXXXXX)"
ERR="$(mktemp /tmp/eleicao2026-agy-err.XXXXXX)"
trap 'rm -f "$OUT" "$ERR"' EXIT

set +e
env HOME="$REAL_HOME" \
  timeout --signal=TERM --kill-after=10s "${TIMEOUT_SECONDS}s" \
  agy \
    --add-dir "$SNAPSHOT" \
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
