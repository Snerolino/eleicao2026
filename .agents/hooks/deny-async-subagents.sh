#!/usr/bin/env bash
set -euo pipefail

# Workspace-local Antigravity guard for the headless Google executor.
# PreToolUse calls this only for collaboration/subagent tools. Keep the
# headless route synchronous so `agy -p` returns a final answer to Hermes.
printf '%s\n' '{"decision":"deny","reason":"Executor headless eleicao2026 deve permanecer sincrono. Resolva diretamente com view_file/grep_search; nao invoque subagentes, background agents ou mensageria entre agentes."}'
