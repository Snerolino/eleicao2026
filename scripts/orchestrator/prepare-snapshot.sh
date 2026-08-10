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

printf '%s\n' "$TARGET"
