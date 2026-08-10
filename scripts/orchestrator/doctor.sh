#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-/home/lourenco}"
SMOKE=false
[[ "${1:-}" == "--smoke" ]] && SMOKE=true

if [[ ! -d "$REAL_HOME" ]]; then
  REAL_HOME="$(getent passwd "$(id -un)" | cut -d: -f6)"
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
printf 'real_home=%s\n\n' "$REAL_HOME"

for cmd in git node npm hermes codex agy opencode timeout flock tar; do
  has_cmd "$cmd"
done

command -v gemini >/dev/null 2>&1 && warn "gemini disponível apenas como rota legacy/API-key; Google AI Pro usa agy" || ok "Gemini CLI legacy ausente (não obrigatório)"
command -v gh >/dev/null 2>&1 && ok "gh disponível" || warn "gh ausente"
command -v npx >/dev/null 2>&1 && ok "npx disponível" || fail "npx ausente"
command -v ollama >/dev/null 2>&1 && ok "ollama disponível (fallback local elegível para smoke separado)" || warn "ollama ausente; fallback local desabilitado"

[[ -s "$REAL_HOME/.codex/auth.json" ]] && ok "Codex auth presente (conteúdo não lido)" || warn "Codex auth não encontrado em ~/.codex/auth.json"
[[ -d "$REAL_HOME/.gemini/antigravity-cli" ]] && ok "Antigravity home presente (conteúdo secreto não lido)" || warn "Antigravity ainda não inicializado/autenticado"
[[ -s "$REAL_HOME/.local/share/opencode/auth.json" ]] && ok "OpenCode auth presente (conteúdo não lido)" || warn "OpenCode auth não encontrado"
[[ -d "$REAL_HOME/.hermes" ]] && ok "Hermes home presente" || fail "Hermes home não encontrado"

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
  scripts/orchestrator/prepare-snapshot.sh \
  supabase/migrations/20260810090000_create_legislative_core.sql \
  supabase/migrations/20260810090400_create_impact_rls_and_approval.sql; do
  [[ -f "$f" ]] && ok "$f presente" || fail "$f ausente"
done

SNAP="$(bash scripts/orchestrator/prepare-snapshot.sh doctor 2>/dev/null || true)"
if [[ -n "$SNAP" && -f "$SNAP/AGENTS.md" && ! -e "$SNAP/.env" ]]; then
  ok "snapshot Git sanitizado funciona e não contém .env"
else
  fail "snapshot Git sanitizado falhou"
fi

if hermes config check >/dev/null 2>&1; then
  ok "hermes config check"
else
  warn "hermes config check sinalizou configuração pendente"
fi

if hermes mcp list 2>/dev/null | grep -qi 'codex'; then
  ok "Codex MCP aparece na configuração do Hermes"
  if hermes mcp test codex >/dev/null 2>&1; then ok "Codex MCP conecta"; else warn "Codex MCP configurado, mas teste falhou"; fi
else
  warn "Codex MCP ainda não está configurado no Hermes"
fi

if command -v gh >/dev/null 2>&1; then
  gh auth status >/dev/null 2>&1 && ok "GitHub CLI autenticado" || warn "GitHub CLI sem autenticação válida"
fi

if command -v npx >/dev/null 2>&1; then
  npx --yes supabase --version >/dev/null 2>&1 && ok "Supabase CLI executável" || warn "Supabase CLI não respondeu"
  npx --yes wrangler --version >/dev/null 2>&1 && ok "Wrangler executável" || warn "Wrangler não respondeu"
fi

if $SMOKE; then
  printf '\n=== smoke dos executores consultivos/read-only ===\n'

  if bash scripts/orchestrator/run-opencode.sh \
    'Tarefa DOCTOR. Apenas confirme que consegue ler AGENTS.md neste snapshot e cite o caminho. Não execute ações externas.' \
    >/tmp/eleicao2026-opencode-smoke.json 2>/tmp/eleicao2026-opencode-smoke.err; then
    ok "OpenCode/DeepSeek smoke"
  else
    warn "OpenCode/DeepSeek smoke falhou; veja /tmp/eleicao2026-opencode-smoke.err"
  fi

  if bash scripts/orchestrator/run-antigravity.sh \
    'Tarefa DOCTOR. Apenas confirme que consegue ler AGENTS.md neste snapshot e cite o caminho.' \
    >/tmp/eleicao2026-antigravity-smoke.txt 2>/tmp/eleicao2026-antigravity-smoke.err; then
    ok "Antigravity/Google smoke"
  else
    warn "Antigravity/Google smoke falhou; veja /tmp/eleicao2026-antigravity-smoke.err"
  fi

  CODEX_PROMPT='Retorne JSON válido conforme o schema. task_id="DOCTOR-CODEX", status="ok", summary="Codex operacional", findings=[], evidence=[], files_changed=[], tests=[], risks=[], recommended_action="nenhuma", human_review_required=false. Não leia ou altere arquivos.'
  if printf '%s' "$CODEX_PROMPT" | bash scripts/orchestrator/run-codex-readonly.sh \
    >/tmp/eleicao2026-codex-smoke.json 2>/tmp/eleicao2026-codex-smoke.err; then
    ok "Codex exec fallback smoke"
  else
    warn "Codex exec fallback smoke falhou; veja /tmp/eleicao2026-codex-smoke.err"
  fi
fi

printf '\n=== resultado ===\n'
printf 'OK=%d WARN=%d FAIL=%d\n' "$PASS" "$WARN" "$FAIL"

if (( FAIL > 0 )); then exit 1; fi
exit 0
