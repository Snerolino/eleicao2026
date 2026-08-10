#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NAME="${1:-reader}"
RUNTIME="$ROOT/.orchestrator/runtime"
TARGET="$RUNTIME/snapshots/$NAME"
LOCK="$RUNTIME/locks/snapshot-$NAME.lock"

mkdir -p "$RUNTIME/snapshots" "$RUNTIME/locks"

exec 9>"$LOCK"
flock 9

rm -rf "$TARGET"
mkdir -p "$TARGET"

git -C "$ROOT" archive --format=tar HEAD | tar -xf - -C "$TARGET"

printf '%s\n' "$TARGET"
