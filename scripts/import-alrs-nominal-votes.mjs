#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const reconciliationFile = resolve(root, args.find((arg) => arg.endsWith('.json') && !arg.startsWith('--')) ?? 'data/legislative-import/alrs/alrs-nominal-vote-reconciliation-v1.json');
const outputFile = resolve(root, args.find((arg) => arg.startsWith('--output='))?.slice(9) ?? '/tmp/alrs-nominal-vote-import.json');
const chunkSize = Number(process.env.ALRS_IMPORT_CHUNK_SIZE ?? process.argv.find((arg) => arg.startsWith('--chunk-size='))?.slice(13) ?? 500);

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const value = line.trim();
    if (!value || value.startsWith('#')) continue;
    const index = value.indexOf('=');
    if (index > 0) process.env[value.slice(0, index).trim()] ??= value.slice(index + 1).trim().replace(/^["']|["']$/g, '');
  }
}
loadEnv(resolve(root, '.env.local'));
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const stateFile = resolve(process.env.XDG_STATE_HOME || resolve(homedir(), '.local', 'state'), 'eleicao2026/supabase-editor-session.json');
const reconciliation = JSON.parse(readFileSync(reconciliationFile, 'utf8'));
const sourceRows = (reconciliation.rows ?? []).filter((row) => row.status === 'missing_safe_to_import');
function isoDate(value) {
  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (!match) throw new Error(`data ALRS inválida: ${value}`);
  return `${match[3]}-${match[2]}-${match[1]}T${match[4] ?? '00'}:${match[5] ?? '00'}:00Z`;
}
const rows = [];
const seen = new Set();
for (const row of sourceRows) {
  const normalized = { candidate_id: row.candidate_id, proposition_version_id: row.proposition_version_id, value: row.value, occurred_at: isoDate(row.occurred_at), source_url: row.source_url, source_sha256: row.source_sha256 };
  const key = `${normalized.candidate_id}|${normalized.proposition_version_id}|${normalized.occurred_at}|${normalized.value}`;
  if (!seen.has(key)) { seen.add(key); rows.push(normalized); }
}
const report = { schema_version: '1.0.0', packet_type: 'alrs_nominal_vote_import', mode: apply ? 'apply' : 'dry-run', remote_apply: false, source_reconciliation: reconciliationFile, source_rows: sourceRows.length, deduplicated_rows: rows.length, chunk_size: chunkSize, chunks: [] };
if (apply && rows.length === 0) {
  report.status = 'idle_no_missing_safe_rows';
  writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report));
  process.exit(0);
}
if (!apply) {
  report.chunks = Array.from({ length: Math.ceil(rows.length / chunkSize) }, (_, index) => ({ chunk: index + 1, rows: Math.min(chunkSize, rows.length - index * chunkSize), status: 'validated_not_applied' }));
  writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report));
  process.exit(0);
}
if (!url || !anonKey) throw new Error('SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY obrigatórios.');
if (!existsSync(stateFile)) throw new Error(`sessão Auth ausente: ${stateFile}; execute npm run auth:editor:bootstrap em TTY.`);
const session = JSON.parse(readFileSync(stateFile, 'utf8'));
const sb = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: auth, error: authError } = await sb.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
if (authError || !auth.user) throw new Error(`sessão Auth inválida: ${authError?.message ?? 'usuário ausente'}`);
const { data: role, error: roleError } = await sb.from('editor_roles').select('role').eq('user_id', auth.user.id).maybeSingle();
if (roleError || !role || !['editor', 'admin'].includes(role.role)) throw new Error('sessão sem papel editor/admin');
for (let offset = 0; offset < rows.length; offset += chunkSize) {
  const chunk = rows.slice(offset, offset + chunkSize);
  const { data, error } = await sb.rpc('import_alrs_nominal_votes', { p_rows: chunk });
  if (error) throw new Error(`chunk ${Math.floor(offset / chunkSize) + 1}: ${error.message}`);
  report.chunks.push({ chunk: Math.floor(offset / chunkSize) + 1, rows: chunk.length, result: data });
}
report.remote_apply = true;
report.user_id = auth.user.id;
report.role = role.role;
writeFileSync(outputFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
