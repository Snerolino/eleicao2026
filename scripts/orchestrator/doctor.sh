#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-/home/lourenco}"
PROFILE="${HERMES_ORCH_PROFILE:-eleicao2026}"
SERVICE="hermes-gateway-${PROFILE}.service"
SMOKE=false
[[ "${1:-}" == "--smoke" ]] && SMOKE=true

if [[ ! -d "$REAL_HOME" ]]; then
  REAL_HOME="$(getent passwd "$(id -un)" | cut -d: -f6)"
fi

BASE_HOME="${HERMES_BASE_HOME:-$REAL_HOME/.hermes}"
if [[ "$PROFILE" == "default" ]]; then
  PROFILE_HOME="$BASE_HOME"
else
  PROFILE_HOME="$BASE_HOME/profiles/$PROFILE"
fi

PASS=0
WARN=0
FAIL=0

ok()   { printf 'OK   %s\n' "$*"; PASS=$((PASS+1)); }
warn() { printf 'WARN %s\n' "$*"; WARN=$((WARN+1)); }
fail() { printf 'FAIL %s\n' "$*"; FAIL=$((FAIL+1)); }

has_cmd() {
  if command -v "$1" >/dev/null 2>&1; then ok "$1 disponível: $(command -v "$1")"; else fail "$1 não encontrado no PATH"; fi
}

printf '=== eleicao2026 orchestrator doctor ===\n'
printf 'root=%s\n' "$ROOT"
printf 'real_home=%s\n' "$REAL_HOME"
printf 'hermes_profile=%s\n\n' "$PROFILE"

for cmd in git node npm hermes codex agy opencode timeout flock tar; do
  has_cmd "$cmd"
done

if command -v node >/dev/null 2>&1; then
  NODE_VERSION="$(node -v 2>/dev/null || true)"
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
  NODE_DIR="$(dirname "$(readlink -f "$(command -v node)")")"
  [[ "$NODE_MAJOR" == "24" ]] && ok "Node do shell compatível: $NODE_VERSION" || fail "projeto exige Node 24; shell usa ${NODE_VERSION:-desconhecido}"
else
  NODE_DIR=""
fi

command -v gemini >/dev/null 2>&1 && warn "gemini disponível apenas como rota legacy/API-key; Google AI Pro usa agy" || ok "Gemini CLI legacy ausente (não obrigatório)"
command -v gh >/dev/null 2>&1 && ok "gh disponível" || warn "gh ausente"
command -v npx >/dev/null 2>&1 && ok "npx disponível" || fail "npx ausente"
command -v ollama >/dev/null 2>&1 && ok "ollama disponível (fallback local pode ser elegível)" || warn "ollama ausente; fallback local desabilitado"

[[ -s "$REAL_HOME/.codex/auth.json" ]] && ok "Codex auth presente (conteúdo não lido)" || warn "Codex auth não encontrado em ~/.codex/auth.json"
[[ -d "$REAL_HOME/.gemini/antigravity-cli" ]] && ok "Antigravity home presente (conteúdo secreto não lido)" || warn "Antigravity ainda não inicializado/autenticado"
[[ -s "$REAL_HOME/.local/share/opencode/auth.json" ]] && ok "OpenCode auth presente (conteúdo não lido)" || warn "OpenCode auth não encontrado"
[[ -d "$BASE_HOME" ]] && ok "Hermes home presente" || fail "Hermes home não encontrado"

cd "$ROOT" || exit 1
BRANCH="$(git branch --show-current 2>/dev/null || true)"
SHA="$(git rev-parse --short=12 HEAD 2>/dev/null || true)"
[[ -n "$SHA" ]] && ok "Git HEAD $SHA em ${BRANCH:-detached}" || fail "não foi possível ler Git HEAD"

if git diff --quiet && git diff --cached --quiet; then
  ok "working tree sem alterações tracked"
else
  warn "working tree possui alterações tracked; leitores econômicos verão somente HEAD, não o diff vivo"
fi

for f in \
  .orchestrator/STATE.md \
  .orchestrator/routing.yaml \
  .orchestrator/schemas/executor-result.schema.json \
  .orchestrator/hermes-skill/SKILL.md \
  .agents/agents/eleicao2026-reader/agent.md \
  scripts/orchestrator/prepare-snapshot.sh \
  scripts/orchestrator/install-hermes-skill.sh \
  scripts/orchestrator/sync-gateway-node.sh \
  scripts/orchestrator/configure-antigravity-readonly.sh \
  supabase/migrations/20260810090000_create_legislative_core.sql \
  supabase/migrations/20260810090400_create_impact_rls_and_approval.sql; do
  [[ -f "$f" ]] && ok "$f presente" || fail "$f ausente"
done

SNAP="$(bash scripts/orchestrator/prepare-snapshot.sh doctor 2>/dev/null || true)"
if [[ -n "$SNAP" && -f "$SNAP/AGENTS.md" && -f "$SNAP/.agents/agents/eleicao2026-reader/agent.md" && ! -e "$SNAP/.env" ]]; then
  ok "snapshot Git sanitizado contém reader Google e não contém .env"
else
  fail "snapshot Git sanitizado/reader Google falhou"
fi

AGY_SNAPSHOT="$(bash scripts/orchestrator/prepare-snapshot.sh antigravity 2>/dev/null || true)"
AGY_SETTINGS="$REAL_HOME/.gemini/antigravity-cli/settings.json"
if [[ -n "$AGY_SNAPSHOT" && -f "$AGY_SETTINGS" ]]; then
  if SNAPSHOT="$AGY_SNAPSHOT" SETTINGS="$AGY_SETTINGS" node <<'NODE' >/dev/null 2>&1
import fs from 'node:fs';
const snapshot = process.env.SNAPSHOT;
const cfg = JSON.parse(fs.readFileSync(process.env.SETTINGS, 'utf8') || '{}');
const allow = cfg?.permissions?.allow ?? [];
const deny = cfg?.permissions?.deny ?? [];
const ask = cfg?.permissions?.ask ?? [];
if (ask.includes('read_file(*)')) process.exit(2);
if (!allow.includes(`read_file(${snapshot})`)) process.exit(3);
if (!deny.includes(`write_file(${snapshot})`)) process.exit(4);
NODE
  then
    ok "Antigravity possui allow read_file + deny write_file no snapshot sanitizado"
  else
    warn "Antigravity sem política read-only do snapshot; rode npm run orch:configure-google"
  fi
else
  warn "não foi possível validar settings do Antigravity"
fi

if hermes profile show "$PROFILE" >/dev/null 2>&1; then
  ok "perfil Hermes $PROFILE existe"

  SKILL_PATH="$PROFILE_HOME/skills/software-development/eleicao2026-orchestrator/SKILL.md"
  [[ -s "$SKILL_PATH" ]] && ok "skill eleicao2026-orchestrator instalada no perfil" || warn "skill do projeto ainda não instalada; rode npm run orch:install-skill"

  if [[ -f "$PROFILE_HOME/.env" ]] && grep -q '^TERMINAL_ENV=' "$PROFILE_HOME/.env" 2>/dev/null; then
    warn "perfil contém TERMINAL_ENV legado em .env; revise/remova esse override se backend local não for respeitado"
  else
    ok "nenhum TERMINAL_ENV legado detectado no perfil"
  fi

  if hermes -p "$PROFILE" config check >/dev/null 2>&1; then
    ok "Hermes config check ($PROFILE)"
  else
    warn "Hermes config check sinalizou configuração pendente no perfil $PROFILE"
  fi

  if hermes -p "$PROFILE" mcp list 2>/dev/null | grep -qi 'codex'; then
    ok "Codex MCP aparece na configuração do perfil $PROFILE"
  else
    warn "Codex MCP ainda não aparece no perfil $PROFILE"
  fi
else
  warn "perfil Hermes $PROFILE ainda não existe"
fi

if systemctl --user cat "$SERVICE" >/dev/null 2>&1; then
  GATEWAY_ENV="$(systemctl --user show "$SERVICE" -p Environment --value 2>/dev/null || true)"
  if [[ -n "$NODE_DIR" && "$GATEWAY_ENV" == *"$NODE_DIR"* ]]; then
    ok "gateway Hermes usa o Node do shell ($NODE_DIR)"
  else
    warn "gateway Hermes usa PATH diferente do Node 24 atual; rode npm run orch:sync-gateway-node"
  fi
fi

MCP_ERR="/tmp/eleicao2026-codex-mcp-launch.err"
env HOME="$REAL_HOME" CODEX_HOME="$REAL_HOME/.codex" \
  timeout 3s codex mcp-server >/dev/null 2>"$MCP_ERR"
MCP_STATUS=$?
if [[ $MCP_STATUS -eq 124 || $MCP_STATUS -eq 0 ]]; then
  ok "codex mcp-server inicia e permanece disponível por stdio"
else
  warn "codex mcp-server falhou ao iniciar; veja $MCP_ERR"
fi

if command -v gh >/dev/null 2>&1; then
  gh auth status >/dev/null 2>&1 && ok "GitHub CLI autenticado" || warn "GitHub CLI sem autenticação válida"
fi

if command -v npx >/dev/null 2>&1; then
  npx --yes supabase --version >/dev/null 2>&1 && ok "Supabase CLI executável" || warn "Supabase CLI não respondeu"
  npx --yes wrangler --version >/dev/null 2>&1 && ok "Wrangler executável" || warn "Wrangler não respondeu"
fi

if command -v ollama >/dev/null 2>&1; then
  if ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -Fxq 'gpt-oss:20b'; then
    ok "Ollama gpt-oss:20b disponível"
  else
    warn "Ollama presente, mas gpt-oss:20b ausente; fallback local desabilitado"
  fi
fi

if $SMOKE; then
  printf '\n=== smoke dos executores consultivos/read-only ===\n'

  OC_OUT="/tmp/eleicao2026-opencode-smoke.json"
  if bash scripts/orchestrator/run-opencode.sh \
    'Tarefa DOCTOR. Apenas confirme que consegue ler AGENTS.md neste snapshot e cite o caminho. Não execute ações externas.' \
    >"$OC_OUT" 2>/tmp/eleicao2026-opencode-smoke.err && [[ -s "$OC_OUT" ]]; then
    ok "OpenCode/DeepSeek smoke com saída não vazia"
  else
    warn "OpenCode/DeepSeek smoke falhou ou retornou vazio; veja /tmp/eleicao2026-opencode-smoke.err"
  fi

  AGY_OUT="/tmp/eleicao2026-antigravity-smoke.txt"
  if bash scripts/orchestrator/run-antigravity.sh \
    'Tarefa DOCTOR. Use somente view_file/grep_search. Confirme que consegue ler AGENTS.md neste snapshot e cite o caminho.' \
    >"$AGY_OUT" 2>/tmp/eleicao2026-antigravity-smoke.err && [[ -s "$AGY_OUT" ]]; then
    ok "Antigravity/Google reader smoke com saída não vazia"
  else
    warn "Antigravity/Google reader falhou ou retornou vazio; veja /tmp/eleicao2026-antigravity-smoke.err"
  fi

  CODEX_PROMPT='Retorne JSON válido conforme o schema. task_id="DOCTOR-CODEX", status="ok", summary="Codex operacional", findings=[], evidence=[], files_changed=[], tests=[], risks=[], recommended_action="nenhuma", human_review_required=false. Não leia ou altere arquivos.'
  CX_OUT="/tmp/eleicao2026-codex-smoke.json"
  if printf '%s' "$CODEX_PROMPT" | bash scripts/orchestrator/run-codex-readonly.sh \
    >"$CX_OUT" 2>/tmp/eleicao2026-codex-smoke.err && [[ -s "$CX_OUT" ]]; then
    ok "Codex exec fallback smoke com saída estruturada"
  else
    warn "Codex exec fallback smoke falhou ou retornou vazio; veja /tmp/eleicao2026-codex-smoke.err"
  fi

  if command -v ollama >/dev/null 2>&1 && ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -Fxq 'gpt-oss:20b'; then
    LOCAL_OUT="/tmp/eleicao2026-local-smoke.txt"
    if bash scripts/orchestrator/run-local-fallback.sh \
      'Leia AGENTS.md e responda apenas: LOCAL_OK' \
      >"$LOCAL_OUT" 2>/tmp/eleicao2026-local-smoke.err && [[ -s "$LOCAL_OUT" ]]; then
      ok "fallback local Ollama smoke"
    else
      warn "fallback local Ollama falhou; veja /tmp/eleicao2026-local-smoke.err"
    fi
  fi
fi

printf '\n=== resultado ===\n'
printf 'OK=%d WARN=%d FAIL=%d\n' "$PASS" "$WARN" "$FAIL"

if (( FAIL > 0 )); then exit 1; fi
exit 0
