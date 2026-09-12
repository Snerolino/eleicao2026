#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOCK="$ROOT/.orchestrator/runtime/locks/continuous-progress.lock"
mkdir -p "$(dirname "$LOCK")"
exec 9>"$LOCK"
if ! flock -n 9; then
  printf '%s\n' '{"status":"locked","message":"writer ativo; execução encerrada sem mutação"}'
  exit 0
fi
exec env NO_STOP_LOCK_HELD=1 node "$ROOT/scripts/no-stop-supervisor.mjs" "$@"
