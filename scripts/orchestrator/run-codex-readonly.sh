#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-$(getent passwd "$(id -un)" | cut -d: -f6)}"
MODEL="${CODEX_AGENT_MODEL:-gpt-5.6-luna}"
TIMEOUT_SECONDS="${ORCH_EXECUTOR_TIMEOUT:-600}"
SCHEMA="$ROOT/.orchestrator/schemas/executor-result.schema.json"
OUT="$(mktemp)"
CODEX_ISOLATED_HOME="$(mktemp -d "${TMPDIR:-/tmp}/eleicao2026-codex-readonly.XXXXXX")"
trap 'rm -f "$OUT"; rm -rf -- "$CODEX_ISOLATED_HOME"' EXIT

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

# O fallback read-only não deve herdar config.toml/MCPs do CODEX_HOME real.
# Copie somente a credencial de autenticação necessária para o Codex remoto.
if [[ ! -s "$REAL_HOME/.codex/auth.json" ]]; then
  echo '{"error":"Codex auth ausente"}' >&2
  exit 43
fi
install -m 600 "$REAL_HOME/.codex/auth.json" "$CODEX_ISOLATED_HOME/auth.json"

cd "$ROOT"
printf '%s' "$PROMPT" | env \
  HOME="$REAL_HOME" \
  CODEX_HOME="$CODEX_ISOLATED_HOME" \
  timeout --signal=TERM --kill-after=10s "${TIMEOUT_SECONDS}s" \
  codex exec \
    -m "$MODEL" \
    --sandbox read-only \
    --ephemeral \
    --color never \
    --output-schema "$SCHEMA" \
    -o "$OUT" \
    - >/dev/null

cat "$OUT"
