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

exec 9>"$LOCK"
flock 9

rm -rf -- "$TARGET"
mkdir -p "$TARGET"

git -C "$ROOT" archive --format=tar HEAD | tar -xf - -C "$TARGET"

# Symlinks rastreados poderiam apontar para fora do snapshot e furar o contrato
# de isolamento se um reader os seguisse. A v1 prefere falhar fechado.
SYMLINK="$(find "$TARGET" -type l -print -quit)"
if [[ -n "$SYMLINK" ]]; then
  rm -rf -- "$TARGET"
  echo "snapshot rejeitado: symlink rastreado detectado ($SYMLINK)" >&2
  exit 43
fi

printf '%s\n' "$TARGET"
