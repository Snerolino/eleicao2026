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

printf '%s\n' "$TARGET"
