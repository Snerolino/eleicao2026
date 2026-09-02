#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
PROFILE="${HERMES_ORCH_PROFILE:-eleicao2026}"
SERVICE="hermes-gateway-${PROFILE}.service"
SMOKE=false
[[ "${1:-}" == "--smoke" ]] && SMOKE=true

if [[ -z "$REAL_HOME" || ! -d "$REAL_HOME" ]]; then
  echo "FAIL home real não resolvido" >&2
  exit 2
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

# Núcleo obrigatório. Executores consultivos opcionais não tornam o control
# plane inviável quando existe Hermes + Codex como rota segura.
for cmd in git node npm hermes codex timeout flock tar find cmp mktemp python3; do
  has_cmd "$cmd"
done

DIAG_DIR="$(mktemp -d "${TMPDIR:-/tmp}/eleicao2026-orch-doctor.XXXXXX" 2>/dev/null || true)"
if [[ -z "$DIAG_DIR" || ! -d "$DIAG_DIR" ]]; then
  echo "FAIL não foi possível criar diretório temporário seguro para diagnósticos" >&2
  exit 3
fi
trap 'rm -rf -- "$DIAG_DIR"' EXIT

command -v agy >/dev/null 2>&1 && ok "agy disponível: $(command -v agy)" || warn "agy ausente; rota Google Antigravity indisponível"
command -v opencode >/dev/null 2>&1 && ok "opencode disponível: $(command -v opencode)" || warn "opencode ausente; rota DeepSeek gratuita indisponível"

NODE_BIN=""
NODE_DIR=""
if command -v node >/dev/null 2>&1; then
  NODE_VERSION="$(node -v 2>/dev/null || true)"
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
  NODE_BIN="$(readlink -f "$(command -v node)" 2>/dev/null || true)"
  NODE_DIR="$(dirname "$NODE_BIN")"
  [[ "$NODE_MAJOR" == "24" ]] && ok "Node do shell compatível: $NODE_VERSION" || fail "projeto exige Node 24; shell usa ${NODE_VERSION:-desconhecido}"
fi

command -v gemini >/dev/null 2>&1 && warn "gemini disponível apenas como rota legacy/API-key; Google AI Pro usa agy" || ok "Gemini CLI legacy ausente (não obrigatório)"
command -v gh >/dev/null 2>&1 && ok "gh disponível" || warn "gh ausente"
command -v npx >/dev/null 2>&1 && ok "npx disponível" || fail "npx ausente"

[[ -s "$REAL_HOME/.codex/auth.json" ]] && ok "Codex auth presente (conteúdo não lido)" || warn "Codex auth não encontrado em ~/.codex/auth.json"
[[ -d "$REAL_HOME/.gemini/antigravity-cli" ]] && ok "Antigravity home presente (conteúdo secreto não lido)" || warn "Antigravity ainda não inicializado/autenticado"
[[ -s "$REAL_HOME/.local/share/opencode/auth.json" ]] && ok "OpenCode auth presente (conteúdo não lido)" || warn "OpenCode auth não encontrado"
[[ -d "$BASE_HOME" ]] && ok "Hermes home presente" || fail "Hermes home não encontrado"

cd "$ROOT" || exit 1
BRANCH="$(git branch --show-current 2>/dev/null || true)"
SHA="$(git rev-parse --short=12 HEAD 2>/dev/null || true)"
[[ -n "$SHA" ]] && ok "Git HEAD $SHA em ${BRANCH:-detached}" || fail "não foi possível ler Git HEAD"

GIT_STATUS="$(git status --porcelain 2>/dev/null || true)"
if [[ -z "$GIT_STATUS" ]]; then
  ok "working tree limpa (tracked + untracked)"
else
  warn "working tree possui alterações ou arquivos untracked; leitores econômicos verão somente o HEAD rastreado"
fi

for f in \
  .orchestrator/STATE.md \
  .orchestrator/routing.yaml \
  .orchestrator/schemas/executor-result.schema.json \
  .orchestrator/hermes-skill/SKILL.md \
  .agents/agents/eleicao2026-reader/agent.md \
  scripts/orchestrator/prepare-snapshot.sh \
  scripts/orchestrator/run-free-pool.sh \
  scripts/orchestrator/install-hermes-skill.sh \
  scripts/orchestrator/sync-gateway-node.sh \
  scripts/orchestrator/configure-antigravity-readonly.sh \
  supabase/migrations/20260810090000_create_legislative_core.sql \
  supabase/migrations/20260810090400_create_impact_rls_and_approval.sql; do
  [[ -f "$f" ]] && ok "$f presente" || fail "$f ausente"
done

if grep -q 'opencode_free_pool:' .orchestrator/routing.yaml \
  && grep -q 'run-free-pool.sh' .orchestrator/routing.yaml \
  && grep -q 'opencode/deepseek-v4-flash-free' .orchestrator/routing.yaml \
  && grep -q 'opencode/mimo-v2.5-free' .orchestrator/routing.yaml \
  && grep -q '"orch:free"' package.json; then
  ok "free provider pool registrado no roteamento e package.json"
else
  fail "free provider pool incompleto; confira routing.yaml, package.json e run-free-pool.sh"
fi

if bash scripts/orchestrator/prepare-snapshot.sh '../escape' >/dev/null 2>&1; then
  fail "prepare-snapshot aceitou nome com path traversal"
else
  ok "prepare-snapshot rejeita nomes com path traversal"
fi

SNAP="$(bash scripts/orchestrator/prepare-snapshot.sh doctor 2>/dev/null || true)"
SNAP_ENV_LEAK=""
[[ -n "$SNAP" && -d "$SNAP" ]] && SNAP_ENV_LEAK="$(find "$SNAP" -name '.env*' -print -quit 2>/dev/null || true)"
if [[ -n "$SNAP" \
  && -f "$SNAP/AGENTS.md" \
  && -f "$SNAP/.agents/agents/eleicao2026-reader/agent.md" \
  && -z "$SNAP_ENV_LEAK" \
  && ! -e "$SNAP/data/tse-archive" ]]; then
  ok "snapshot Git sanitizado contém reader, rejeita symlinks e remove .env*/dados brutos"
else
  fail "snapshot Git sanitizado/reader falhou ou contém conteúdo proibido"
fi

# Não recrie o snapshot Antigravity só para inspecionar policy: uma execução real
# pode estar usando esse workspace sob lock. O caminho é estável e suficiente
# para validar as regras registradas.
AGY_SNAPSHOT="$ROOT/.orchestrator/runtime/snapshots/antigravity"
AGY_SETTINGS="$REAL_HOME/.gemini/antigravity-cli/settings.json"
if [[ -f "$AGY_SETTINGS" ]]; then
  SNAPSHOT="$AGY_SNAPSHOT" SETTINGS="$AGY_SETTINGS" node <<'NODE' >/dev/null 2>&1
import fs from 'node:fs';
const snapshot = process.env.SNAPSHOT;
const cfg = JSON.parse(fs.readFileSync(process.env.SETTINGS, 'utf8') || '{}');
const allow = cfg?.permissions?.allow ?? [];
const deny = cfg?.permissions?.deny ?? [];
const ask = cfg?.permissions?.ask ?? [];
const allowRule = `read_file(${snapshot})`;
if (allow.some((rule) => /^read_file\(/.test(rule) && rule !== allowRule)) process.exit(6);
if (ask.some((rule) => /^read_file\(/.test(rule))) process.exit(7);
if (!allow.includes(allowRule)) process.exit(3);
if (!deny.includes(`write_file(${snapshot})`)) process.exit(4);
NODE
  AGY_POLICY_STATUS=$?
  case "$AGY_POLICY_STATUS" in
    0) ok "Antigravity possui allow read_file + deny write_file estreitos no snapshot" ;;
    6|7) fail "Antigravity possui permissão read_file fora do snapshot; remova-a antes de usar a rota Google" ;;
    *) warn "Antigravity sem policy completa do snapshot; rode npm run orch:configure-google" ;;
  esac
else
  warn "não foi possível validar settings do Antigravity"
fi

if env HOME="$REAL_HOME" hermes profile show "$PROFILE" >/dev/null 2>&1; then
  ok "perfil Hermes $PROFILE existe"

  SKILL_SOURCE="$ROOT/.orchestrator/hermes-skill/SKILL.md"
  SKILL_PATH="$PROFILE_HOME/skills/software-development/eleicao2026-orchestrator/SKILL.md"
  if [[ ! -s "$SKILL_PATH" ]]; then
    fail "skill obrigatória eleicao2026-orchestrator ausente; rode npm run orch:install-skill"
  elif cmp -s "$SKILL_SOURCE" "$SKILL_PATH"; then
    ok "skill eleicao2026-orchestrator instalada e sincronizada com o Git"
  else
    fail "skill eleicao2026-orchestrator instalada está desatualizada; rode npm run orch:install-skill"
  fi

  if [[ -f "$PROFILE_HOME/.env" ]] && grep -q '^TERMINAL_ENV=' "$PROFILE_HOME/.env" 2>/dev/null; then
    warn "perfil contém TERMINAL_ENV legado em .env; revise/remova esse override se backend local não for respeitado"
  else
    ok "nenhum TERMINAL_ENV legado detectado no perfil"
  fi

  if env HOME="$REAL_HOME" hermes -p "$PROFILE" config check >/dev/null 2>&1; then
    ok "Hermes config check ($PROFILE)"
  else
    warn "Hermes config check sinalizou configuração pendente no perfil $PROFILE"
  fi

  FALLBACK_LIST="$(env HOME="$REAL_HOME" hermes -p "$PROFILE" fallback list 2>/dev/null || true)"
  if grep -q 'gemini-2\.5-flash' <<<"$FALLBACK_LIST"; then
    fail "fallback Hermes contém gemini-2.5-flash removido; atualize para modelo disponível"
  else
    ok "fallback Hermes sem modelo Gemini obsoleto"
  fi

  if env HOME="$REAL_HOME" hermes -p "$PROFILE" mcp list 2>/dev/null | grep -qi 'codex'; then
    ok "Codex MCP aparece na configuração do perfil $PROFILE"
  else
    fail "Codex MCP obrigatório não aparece no perfil $PROFILE"
  fi
else
  fail "perfil Hermes $PROFILE ainda não existe"
fi

if command -v systemctl >/dev/null 2>&1 && systemctl --user cat "$SERVICE" >/dev/null 2>&1; then
  MAIN_PID="$(systemctl --user show "$SERVICE" -p MainPID --value 2>/dev/null || true)"
  if [[ "$MAIN_PID" =~ ^[1-9][0-9]*$ && -r "/proc/$MAIN_PID/environ" && -n "$NODE_BIN" ]]; then
    SERVICE_PATH="$(tr '\0' '\n' < "/proc/$MAIN_PID/environ" | sed -n 's/^PATH=//p' | head -n1)"
    GATEWAY_NODE="$(env PATH="$SERVICE_PATH" sh -c 'command -v node' 2>/dev/null || true)"
    GATEWAY_NODE_REAL="$(readlink -f "$GATEWAY_NODE" 2>/dev/null || true)"
    GATEWAY_NODE_VERSION="$(env PATH="$SERVICE_PATH" node -v 2>/dev/null || true)"
    if [[ "$GATEWAY_NODE_REAL" == "$NODE_BIN" && "$GATEWAY_NODE_VERSION" == v24.* ]]; then
      ok "gateway Hermes resolve efetivamente o Node do shell ($GATEWAY_NODE_REAL, $GATEWAY_NODE_VERSION)"
    else
      warn "gateway Hermes resolve Node diferente; rode npm run orch:sync-gateway-node"
    fi
  else
    warn "não foi possível validar o Node efetivo do processo gateway"
  fi
fi

MCP_ERR="$DIAG_DIR/codex-mcp-launch.err"
env HOME="$REAL_HOME" CODEX_HOME="$REAL_HOME/.codex" \
  timeout --signal=TERM --kill-after=10s 3s codex mcp-server >/dev/null 2>"$MCP_ERR"
MCP_STATUS=$?
if [[ $MCP_STATUS -eq 124 || $MCP_STATUS -eq 0 ]]; then
  ok "codex mcp-server inicia e permanece disponível por stdio"
else
  fail "codex mcp-server obrigatório falhou ao iniciar"
  [[ -s "$MCP_ERR" ]] && sed -n '1,20p' "$MCP_ERR" >&2
fi

if command -v gh >/dev/null 2>&1; then
  gh auth status >/dev/null 2>&1 && ok "GitHub CLI autenticado" || warn "GitHub CLI sem autenticação válida"
fi

check_local_cli() {
  local name="$1"
  local bin=""
  if command -v "$name" >/dev/null 2>&1; then
    bin="$(command -v "$name")"
  elif [[ -x "$ROOT/node_modules/.bin/$name" ]]; then
    bin="$ROOT/node_modules/.bin/$name"
  fi

  if [[ -n "$bin" ]]; then
    timeout --signal=TERM --kill-after=5s 10s "$bin" --version >/dev/null 2>&1 \
      && ok "$name CLI instalada localmente e executável" \
      || warn "$name CLI local não respondeu ao --version"
  else
    warn "$name CLI não instalada localmente; doctor não baixa/executa pacote remoto via npx"
  fi
}

check_local_cli supabase
check_local_cli wrangler

if $SMOKE; then
  printf '\n=== smoke dos executores e rota obrigatória ===\n'

  MCP_TRANSPORT_OUT="$DIAG_DIR/codex-mcp-transport-smoke.out"
  MCP_TRANSPORT_ERR="$DIAG_DIR/codex-mcp-transport-smoke.err"
  if env HOME="$REAL_HOME" hermes -p "$PROFILE" mcp test codex >"$MCP_TRANSPORT_OUT" 2>"$MCP_TRANSPORT_ERR" \
    && grep -q 'Connected' "$MCP_TRANSPORT_OUT" \
    && grep -q 'Tools discovered' "$MCP_TRANSPORT_OUT"; then
    ok "Codex MCP transporte e descoberta de ferramentas comprovados"
  else
    fail "Codex MCP não conectou ou não descobriu ferramentas"
    [[ -s "$MCP_TRANSPORT_ERR" ]] && sed -n '1,20p' "$MCP_TRANSPORT_ERR" >&2
  fi

  # O gate E2E não confia no texto final do modelo. A sessão one-shot é
  # persistida pelo Hermes em state.db; abaixo validamos tool_call + tool result
  # estruturados associados a um probe único desta execução, inclusive o
  # sandbox read-only explícito nos argumentos da chamada Codex.
  HERMES_MCP_PROBE="ORCH_MCP_${$}_$(date +%s)"
  HERMES_MCP_OUT="$DIAG_DIR/hermes-codex-mcp-smoke.out"
  HERMES_MCP_ERR="$DIAG_DIR/hermes-codex-mcp-smoke.err"

  # O valor esperado não aparece no prompt. Assim, o Hermes só consegue
  # responder corretamente se realmente invocar o MCP Codex e ler o arquivo.
  mkdir -p "$ROOT/.orchestrator/runtime/probes"
  HERMES_MCP_EXPECTED_NONCE="$(python3 -c 'import secrets; print(secrets.token_hex(24))')"
  HERMES_MCP_NONCE_FILE="$ROOT/.orchestrator/runtime/probes/${HERMES_MCP_PROBE}.txt"
  printf '%s\n' "$HERMES_MCP_EXPECTED_NONCE" >"$HERMES_MCP_NONCE_FILE"
  chmod 600 "$HERMES_MCP_NONCE_FILE"
  HERMES_MCP_NONCE_REL="${HERMES_MCP_NONCE_FILE#$ROOT/}"

  HERMES_MCP_PROMPT="Tarefa DOCTOR probe ${HERMES_MCP_PROBE}. Execute obrigatoriamente uma chamada real ao servidor MCP Codex. Se a ferramenta Codex MCP ainda não estiver carregada, use tool_search para localizar codex e tool_describe se necessário. Execute tool_call para mcp__codex__codex. Na chamada Codex, defina explicitamente sandbox=read-only. Pelo MCP Codex, leia SOMENTE o arquivo relativo ${HERMES_MCP_NONCE_REL} e peça que devolva exatamente seu conteúdo. O conteúdo do arquivo NÃO está neste prompt: não tente adivinhar. Não use terminal nem ferramentas de arquivo do próprio Hermes."

  env HOME="$REAL_HOME" \
    timeout --signal=TERM --kill-after=10s 120s hermes -p "$PROFILE" chat -q "$HERMES_MCP_PROMPT" \
    >"$HERMES_MCP_OUT" 2>"$HERMES_MCP_ERR"
  HERMES_MCP_STATUS=$?

  rm -f -- "$HERMES_MCP_NONCE_FILE"

  if [[ $HERMES_MCP_STATUS -eq 0 \
    && -n "$HERMES_MCP_EXPECTED_NONCE" \
    && -f "$PROFILE_HOME/state.db" \
    && $(command -v python3 >/dev/null 2>&1; echo $?) -eq 0 ]] \
    && PROFILE_DB="$PROFILE_HOME/state.db" \
       PROBE_ID="$HERMES_MCP_PROBE" \
       EXPECTED_NONCE="$HERMES_MCP_EXPECTED_NONCE" \
       python3 <<'PY'
import json
import os
import re
import sqlite3
import sys

path = os.environ["PROFILE_DB"]
probe = os.environ["PROBE_ID"]
expected = os.environ["EXPECTED_NONCE"]
name_re = re.compile(r"^mcp(?:__|_)codex(?:__|_)", re.I)

try:
    conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)
    row = conn.execute(
        """
        SELECT session_id
        FROM messages
        WHERE role = 'user' AND content LIKE ?
        ORDER BY id DESC
        LIMIT 1
        """,
        (f"%{probe}%",),
    ).fetchone()
    if not row:
        sys.exit(2)

    session_id = row[0]
    rows = conn.execute(
        """
        SELECT role, content, tool_call_id, tool_calls, tool_name
        FROM messages
        WHERE session_id = ?
        ORDER BY id
        """,
        (session_id,),
    ).fetchall()
finally:
    try:
        conn.close()
    except Exception:
        pass

def parse_object(value):
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except Exception:
            return {}
        return parsed if isinstance(parsed, dict) else {}
    return {}

call_meta = {}
saw_readonly_codex_call = False
saw_valid_result = False

for role, content, tool_call_id, tool_calls, tool_name in rows:
    if tool_calls:
        try:
            calls = json.loads(tool_calls)
        except Exception:
            calls = []

        if isinstance(calls, dict):
            calls = [calls]

        for call in calls if isinstance(calls, list) else []:
            if not isinstance(call, dict):
                continue

            fn = call.get("function") or {}
            outer_name = fn.get("name") if isinstance(fn, dict) else None
            outer_name = outer_name or call.get("name") or ""

            raw_args = fn.get("arguments") if isinstance(fn, dict) else None
            if raw_args is None:
                raw_args = call.get("arguments")

            outer_args = parse_object(raw_args)
            effective_name = outer_name
            effective_args = outer_args

            if outer_name == "tool_call":
                wrapped_name = outer_args.get("name")
                if isinstance(wrapped_name, str):
                    effective_name = wrapped_name
                effective_args = parse_object(outer_args.get("arguments"))

            call_id = call.get("id") or call.get("call_id") or ""
            sandbox = effective_args.get("sandbox")
            is_readonly_codex = bool(name_re.search(effective_name)) and sandbox == "read-only"

            if call_id:
                call_meta[call_id] = {
                    "name": effective_name,
                    "sandbox": sandbox,
                    "readonly_codex": is_readonly_codex,
                }

            if is_readonly_codex:
                saw_readonly_codex_call = True

    if role == "tool" and tool_call_id:
        meta = call_meta.get(tool_call_id)
        if not meta:
            continue

        if meta.get("readonly_codex") and expected in (content or ""):
            saw_valid_result = True

sys.exit(0 if saw_readonly_codex_call and saw_valid_result else 3)
PY
  then
    ok "Hermes -> Codex MCP comprovado por tool_call read-only + resultado estruturados"
  else
    warn "probe LLM Hermes -> Codex MCP não comprovou tool_call estruturado; transporte MCP já verificado acima"
    [[ -s "$HERMES_MCP_ERR" ]] && sed -n '1,30p' "$HERMES_MCP_ERR" >&2
  fi

  if command -v opencode >/dev/null 2>&1; then
    OC_OUT="$DIAG_DIR/opencode-smoke.json"
    OC_ERR="$DIAG_DIR/opencode-smoke.err"
    OC_EXPECTED_TITLE="$(sed -n '1s/^# //p' AGENTS.md)"
    if bash scripts/orchestrator/run-opencode.sh \
      'Tarefa DOCTOR. Leia AGENTS.md na raiz do snapshot e devolva o título inicial exato. Não execute ações externas.' \
      >"$OC_OUT" 2>"$OC_ERR" \
      && [[ -s "$OC_OUT" ]] \
      && [[ -n "$OC_EXPECTED_TITLE" ]] \
      && grep -Fq "$OC_EXPECTED_TITLE" "$OC_OUT"; then
      ok "OpenCode/DeepSeek comprovou leitura do AGENTS.md pelo título esperado"
    else
      warn "OpenCode/DeepSeek não comprovou leitura do AGENTS.md"
      [[ -s "$OC_ERR" ]] && sed -n '1,20p' "$OC_ERR" >&2
    fi
  else
    warn "smoke OpenCode ignorado porque executor opcional está ausente"
  fi

  if command -v agy >/dev/null 2>&1; then
    AGY_OUT="$DIAG_DIR/antigravity-smoke.txt"
    AGY_ERR="$DIAG_DIR/antigravity-smoke.err"
    AGY_EXPECTED_TITLE="$(sed -n '1s/^# //p' AGENTS.md)"
    if bash scripts/orchestrator/run-antigravity.sh \
      'Tarefa DOCTOR. Use somente ferramentas de leitura. Leia AGENTS.md na raiz do workspace e devolva o título inicial exato.' \
      >"$AGY_OUT" 2>"$AGY_ERR" \
      && [[ -s "$AGY_OUT" ]] \
      && [[ -n "$AGY_EXPECTED_TITLE" ]] \
      && grep -Fq "$AGY_EXPECTED_TITLE" "$AGY_OUT"; then
      ok "Antigravity/Google comprovou leitura do AGENTS.md pelo título esperado"
    else
      warn "Antigravity/Google não comprovou leitura do AGENTS.md"
      [[ -s "$AGY_ERR" ]] && sed -n '1,20p' "$AGY_ERR" >&2
    fi
  else
    warn "smoke Antigravity ignorado porque executor opcional está ausente"
  fi

  CODEX_PROMPT='Retorne JSON válido conforme o schema. task_id="DOCTOR-CODEX", status="ok", summary="Codex operacional", findings=[], evidence=[], files_changed=[], tests=[], risks=[], recommended_action="nenhuma", human_review_required=false. Não leia ou altere arquivos.'
  CX_OUT="$DIAG_DIR/codex-smoke.json"
  CX_ERR="$DIAG_DIR/codex-smoke.err"
  if printf '%s' "$CODEX_PROMPT" | bash scripts/orchestrator/run-codex-readonly.sh \
    >"$CX_OUT" 2>"$CX_ERR" && [[ -s "$CX_OUT" ]]; then
    ok "Codex exec fallback smoke com saída estruturada"
  else
    warn "Codex exec fallback smoke falhou ou retornou vazio"
    [[ -s "$CX_ERR" ]] && sed -n '1,20p' "$CX_ERR" >&2
  fi

else
  warn "rota Hermes -> Codex MCP não foi exercitada no modo rápido; use --smoke para o gate final"
fi

printf '\n=== resultado ===\n'
printf 'OK=%d WARN=%d FAIL=%d\n' "$PASS" "$WARN" "$FAIL"

if (( FAIL > 0 )); then exit 1; fi
exit 0
