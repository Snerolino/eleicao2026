#!/usr/bin/env bash
# Mata processos AGY concorrentes que escrevem nos mesmos arquivos de bloco
pkill -f "run-antigravity.sh" 2>/dev/null
pkill -f "timeout 475 bash" 2>/dev/null
sleep 2
echo "restantes AGY: $(ps aux | grep -E 'run-antigravity|timeout 475' | grep -v grep | wc -l)"
