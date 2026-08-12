#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NAME="${1:-reader}"

# O nome entra em um caminho que é removido/recriado. Aceite somente um
# identificador simples para impedir path traversal em chamadas manuais.
if [[ ! "$NAME" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$ ]]; then
  echo "nome de snapshot inválido: $NAME" >&2
  exit 42
fi

RUNTIME="$ROOT/.orchestrator/runtime"
TARGET="$RUNTIME/snapshots/$NAME"
LOCK="$RUNTIME/locks/snapshot-$NAME.lock"

mkdir -p "$RUNTIME/snapshots" "$RUNTIME/locks"

# Chamadas manuais seguram o lock durante a preparação. Os wrappers oficiais
# seguram o MESMO lock por toda a vida do reader e avisam isso via env para não
# deadlockar ao chamar este helper.
if [[ "${ORCH_SNAPSHOT_LOCK_HELD:-0}" != "1" ]]; then
  exec 9>"$LOCK"
  flock 9
fi

rm -rf -- "$TARGET"
mkdir -p "$TARGET"

git -C "$ROOT" archive --format=tar HEAD | tar -xf - -C "$TARGET"

# O snapshot enviado a leitores externos não contém nenhum .env*, nem mesmo
# exemplos rastreados. Dados brutos explicitamente proibidos também são
# removidos fisicamente em vez de depender apenas de ignore/config do executor.
find "$TARGET" -depth -name '.env*' -exec rm -rf -- {} +
rm -rf -- "$TARGET/data/tse-archive" "$TARGET/supabase/.temp"

# Estes utilitários legados contêm material de autenticação rastreado e nunca
# devem sair para leitores externos. A remoção do segredo no Git/rotação do
# provedor é um incidente separado; aqui o contrato do snapshot é fail-closed.
rm -f -- \
  "$TARGET/scripts/create-token.sh" \
  "$TARGET/scripts/find-permissions.sh"

ENV_LEAK="$(find "$TARGET" -name '.env*' -print -quit)"
if [[ -n "$ENV_LEAK" ]]; then
  rm -rf -- "$TARGET"
  echo "snapshot rejeitado: arquivo .env* permaneceu após sanitização ($ENV_LEAK)" >&2
  exit 44
fi

# Symlinks rastreados poderiam apontar para fora do snapshot e furar o contrato
# de isolamento se um reader os seguisse. A v1 prefere falhar fechado.
SYMLINK="$(find "$TARGET" -type l -print -quit)"
if [[ -n "$SYMLINK" ]]; then
  rm -rf -- "$TARGET"
  echo "snapshot rejeitado: symlink rastreado detectado ($SYMLINK)" >&2
  exit 43
fi

# Última barreira antes de liberar o snapshot. Procure formatos plausíveis de
# credencial, aceitando shell/env, JSON e YAML, além de headers HTTP em qualquer
# caixa. Regexes/fixtures sintéticas não devem parecer valores reais. Reporte
# SOMENTE o caminho, nunca linha ou conteúdo.
SECRET_PATTERNS=(
  'authorization[[:space:]]*:[[:space:]]*bearer[[:space:]]+[A-Za-z0-9._~+/-]{24,}'
  "['\"]?CLOUDFLARE_API_TOKEN['\"]?[[:space:]]*[:=][[:space:]]*['\"]?[A-Za-z0-9_-]{30,}['\"]?"
  "['\"]?OPENAI_API_KEY['\"]?[[:space:]]*[:=][[:space:]]*['\"]?sk-(proj-|svcacct-)?[A-Za-z0-9_-]{20,}['\"]?"
  "['\"]?SUPABASE_SERVICE_ROLE_KEY['\"]?[[:space:]]*[:=][[:space:]]*['\"]?eyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}['\"]?"
  "['\"]?AWS_SECRET_ACCESS_KEY['\"]?[[:space:]]*[:=][[:space:]]*['\"]?[A-Za-z0-9/+=]{40}['\"]?"
  'github_pat_[A-Za-z0-9_]{20,}'
  'gh[pousr]_[A-Za-z0-9]{20,}'
  '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'
)
GREP_SECRET_ARGS=()
for pattern in "${SECRET_PATTERNS[@]}"; do
  GREP_SECRET_ARGS+=( -e "$pattern" )
done

SECRET_SCAN="$(mktemp "$RUNTIME/secret-scan.XXXXXX")"
set +e
grep -RIlEi --binary-files=without-match "${GREP_SECRET_ARGS[@]}" -- "$TARGET" >"$SECRET_SCAN" 2>/dev/null
SECRET_SCAN_STATUS=$?
set -e

case "$SECRET_SCAN_STATUS" in
  0)
    SECRET_LEAK="$(head -n1 "$SECRET_SCAN")"
    rm -f -- "$SECRET_SCAN"
    rm -rf -- "$TARGET"
    echo "snapshot rejeitado: material secreto rastreado detectado em ${SECRET_LEAK#$TARGET/}" >&2
    exit 45
    ;;
  1)
    rm -f -- "$SECRET_SCAN"
    ;;
  *)
    rm -f -- "$SECRET_SCAN"
    rm -rf -- "$TARGET"
    echo "snapshot rejeitado: scanner de segredos falhou (status $SECRET_SCAN_STATUS)" >&2
    exit 46
    ;;
esac

printf '%s\n' "$TARGET"
