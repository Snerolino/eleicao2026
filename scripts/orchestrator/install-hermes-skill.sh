#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROFILE="${HERMES_ORCH_PROFILE:-eleicao2026}"
BASE_HOME="${HERMES_BASE_HOME:-$HOME/.hermes}"
SOURCE="$ROOT/.orchestrator/hermes-skill/SKILL.md"

if [[ "$PROFILE" == "default" ]]; then
  PROFILE_HOME="$BASE_HOME"
else
  PROFILE_HOME="$BASE_HOME/profiles/$PROFILE"
fi

if [[ ! -f "$SOURCE" ]]; then
  echo "skill source ausente: $SOURCE" >&2
  exit 1
fi

if [[ ! -d "$PROFILE_HOME" ]]; then
  echo "perfil Hermes ausente: $PROFILE_HOME" >&2
  echo "crie primeiro com: hermes profile create $PROFILE" >&2
  exit 2
fi

TARGET="$PROFILE_HOME/skills/software-development/eleicao2026-orchestrator"
mkdir -p "$TARGET"
install -m 0644 "$SOURCE" "$TARGET/SKILL.md"

printf 'skill instalada em %s\n' "$TARGET/SKILL.md"
printf 'reinicie a sessão Hermes para recarregar o índice de skills.\n'
