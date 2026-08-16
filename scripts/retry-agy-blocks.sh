#!/usr/bin/env bash
# Reprocessa blocos AGY com retry automático (exit=46 = read_file permission denied no sandbox).
# Uso: bash scripts/retry-agy-blocks.sh 6 7 8 9 11 ...
set -u
ROOT="/home/lourenco/Projetos/eleicao2026"
cd "$ROOT"
export ANTIGRAVITY_API_KEY="4/0ATsMZqDdPu0uvqrx0IjGEbuc-RVA2CUeWsgYuw-Et48ExQkU0-8yA6AfhXa9dxYfjv1L9A"
export REAL_HOME=/home/lourenco
export HERMES_REAL_HOME=/home/lourenco
export ANTIGRAVITY_AGENT_MODEL="Gemini 3.5 Flash (Low)"
export ANTIGRAVITY_AGENT_NAME="eleicao2026-reader"
export ORCH_EXECUTOR_TIMEOUT=480

MAX_RETRY=4
for i in "$@"; do
  attempt=0
  while [ $attempt -lt $MAX_RETRY ]; do
    attempt=$((attempt+1))
    echo "=== B$i attempt $attempt $(date +%T) ==="
    timeout 475 bash scripts/orchestrator/run-antigravity.sh "$(cat .orchestrator/runtime/blocks/block-${i}-prompt.txt)" > .orchestrator/runtime/blocks/block-${i}-output.txt 2>&1
    status=$?
    sz=$(wc -c < .orchestrator/runtime/blocks/block-${i}-output.txt 2>/dev/null || echo 0)
    echo "B$i exit=$status size=$sz"
    if [ "$status" -eq 0 ] && [ "$sz" -gt 1000 ]; then
      echo "B$i OK"
      break
    fi
    echo "B$i falhou (exit=$status), retry em 3s..."
    sleep 3
  done
  if [ $attempt -ge $MAX_RETRY ]; then
    echo "B$i ESGOTOU RETRIES"
  fi
done
echo "=== DONE ==="
