#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REAL_HOME="${HERMES_REAL_HOME:-/home/lourenco}"
SETTINGS="$REAL_HOME/.gemini/antigravity-cli/settings.json"

if [[ ! -d "$REAL_HOME" ]]; then
  REAL_HOME="$(getent passwd "$(id -un)" | cut -d: -f6)"
  SETTINGS="$REAL_HOME/.gemini/antigravity-cli/settings.json"
fi

SNAPSHOT="$(bash "$ROOT/scripts/orchestrator/prepare-snapshot.sh" antigravity)"
mkdir -p "$(dirname "$SETTINGS")"

if [[ -f "$SETTINGS" ]]; then
  BACKUP="$SETTINGS.backup-$(date +%Y%m%d-%H%M%S)"
  cp -a "$SETTINGS" "$BACKUP"
  chmod 600 "$BACKUP" 2>/dev/null || true
  printf 'backup=%s\n' "$BACKUP"
else
  printf '{}\n' > "$SETTINGS"
  chmod 600 "$SETTINGS" 2>/dev/null || true
fi

SNAPSHOT="$SNAPSHOT" SETTINGS="$SETTINGS" node <<'NODE'
import fs from 'node:fs';

const settingsPath = process.env.SETTINGS;
const snapshot = process.env.SNAPSHOT;
const allowRule = `read_file(${snapshot})`;
const denyWriteRule = `write_file(${snapshot})`;

const raw = fs.readFileSync(settingsPath, 'utf8').trim() || '{}';
const cfg = JSON.parse(raw);
cfg.permissions ??= {};
for (const key of ['allow', 'deny', 'ask']) {
  if (!Array.isArray(cfg.permissions[key])) cfg.permissions[key] = [];
}

const broadAsk = cfg.permissions.ask.includes('read_file(*)');
if (broadAsk) {
  console.error('ERRO: settings.json contém ask read_file(*), que tem precedência sobre allow.');
  console.error('Remova ou restrinja essa regra interativamente em /permissions antes de continuar.');
  process.exit(2);
}

if (!cfg.permissions.allow.includes(allowRule)) {
  cfg.permissions.allow.push(allowRule);
}
if (!cfg.permissions.deny.includes(denyWriteRule)) {
  cfg.permissions.deny.push(denyWriteRule);
}

fs.writeFileSync(settingsPath, JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 });

console.log(`ALLOW ${allowRule}`);
console.log(`DENY  ${denyWriteRule}`);
console.log('Nenhuma permissão command(*), mcp(*) ou write_file(*) foi adicionada.');
NODE

printf '\nConfiguração Antigravity read-only aplicada somente ao snapshot sanitizado.\n'
printf 'settings=%s\n' "$SETTINGS"
printf 'snapshot=%s\n' "$SNAPSHOT"
