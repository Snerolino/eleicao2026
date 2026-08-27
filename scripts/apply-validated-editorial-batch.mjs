#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const batchFile = args.find((arg) => !arg.startsWith('--')) ?? 'data/legislative-import/alrs/impact-carry-forward-001-v1.json';
const decisionsFile = args.find((arg, index) => !arg.startsWith('--') && index > 0);
const apply = args.includes('--apply');
const outputFile = args.find((arg) => arg.startsWith('--output='))?.slice('--output='.length) ?? '/tmp/validated-editorial-batch-apply.json';

function envFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const value = line.trim();
    if (!value || value.startsWith('#')) continue;
    const index = value.indexOf('=');
    if (index < 0) continue;
    const key = value.slice(0, index).trim();
    if (!process.env[key]) process.env[key] = value.slice(index + 1).trim().replace(/^["']|["']$/g, '');
  }
}
envFile(resolve(root, '.env.local'));

const batch = JSON.parse(readFileSync(resolve(root, batchFile), 'utf8'));
const decisions = decisionsFile ? JSON.parse(readFileSync(resolve(root, decisionsFile), 'utf8')) : batch;
const items = batch.items ?? [];
const rows = decisions.items ?? decisions.decisions ?? [];
const expectedHash = createHash('sha256').update(JSON.stringify({ batch_id: batch.batch_id, items })).digest('hex');
const errors = [];
if (decisions.batch_id !== batch.batch_id) errors.push('batch_id_mismatch');
if (decisions.batch_sha256 !== expectedHash) errors.push('batch_sha256_mismatch');
if (rows.length !== items.length) errors.push('cardinality_mismatch');
const byId = new Map(items.map((item) => [item.proposition_version_id, item]));
const seen = new Set();
for (const row of rows) {
  const item = byId.get(row.proposition_version_id);
  if (!item) { errors.push(`${row.proposition_version_id}:unknown_version`); continue; }
  if (seen.has(row.proposition_version_id)) errors.push(`${row.proposition_version_id}:duplicate`);
  seen.add(row.proposition_version_id);
  if (row.review_key !== item.review_key) errors.push(`${row.proposition_version_id}:review_key_mismatch`);
  if (!['approved', 'needs_changes'].includes(row.decision)) errors.push(`${row.proposition_version_id}:invalid_decision`);
  if ((item.official_event_type ?? item.event_type) === 'procedural_confirmed') errors.push(`${row.proposition_version_id}:procedural_forbidden`);
  if (item.source_gate && item.source_gate !== 'green' && item.source_reopen !== false) errors.push(`${row.proposition_version_id}:source_not_green`);
  if (row.decision === 'needs_changes' && (!row.disposition || String(row.notes ?? '').trim().length < 20)) errors.push(`${row.proposition_version_id}:exception_requires_disposition_and_notes`);
}
for (const item of items) if (!seen.has(item.proposition_version_id)) errors.push(`${item.proposition_version_id}:missing_decision`);

const report = { schema_version: '1.0.0', packet_type: 'validated_editorial_batch_apply', batch_id: batch.batch_id, batch_sha256: expectedHash, mode: apply ? 'apply' : 'dry-run', remote_apply: false, errors, actions: [] };
if (errors.length) {
  writeFileSync(resolve(root, outputFile), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report));
  process.exit(1);
}

if (!apply) {
  report.actions = rows.map((row) => ({ proposition_version_id: row.proposition_version_id, decision: row.decision, status: 'validated_not_applied' }));
  writeFileSync(resolve(root, outputFile), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report));
  process.exit(0);
}

const email = process.env.SUPABASE_EDITOR_EMAIL || 'admin@votopraquem.org';
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let password = process.env.SUPABASE_EDITOR_PASSWORD;
const stateFile = resolve(process.env.XDG_STATE_HOME || resolve(homedir(), '.local', 'state'), 'eleicao2026/supabase-editor-session.json');
if (!password && apply && existsSync(stateFile)) password = 'use_session_file';
if (!password && apply) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('SUPABASE_EDITOR_PASSWORD ausente, sessão remota não encontrada e terminal não interativo; execute scripts/auth-editor-bootstrap.mjs localmente.');
  password = await new Promise((resolvePassword, reject) => {
    let value = '';
    const stdin = process.stdin;
    const onData = (chunk) => {
      for (const char of String(chunk)) {
        if (char === '\u0003') { stdin.setRawMode(false); stdin.pause(); reject(new Error('entrada cancelada')); return; }
        if (char === '\r' || char === '\n') { stdin.setRawMode(false); stdin.pause(); process.stdout.write('\n'); resolvePassword(value); return; }
        if (char === '\u007f') value = value.slice(0, -1);
        else value += char;
      }
    };
    process.stdout.write(`Senha Supabase Auth para ${email}: `);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.on('data', onData);
  });
}
if (!email || !url || !anonKey) throw new Error('SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY são obrigatórios; nenhum service_role é aceito.');
const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
let authData;
let authError;
if (password === 'use_session_file') {
  try {
    const session = JSON.parse(readFileSync(stateFile, 'utf8'));
    if (!session.refresh_token || !session.access_token) throw new Error('sessão editor incompleta');
    ({ data: authData, error: authError } = await supabase.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token }));
  } catch (error) { authError = error; }
} else {
  ({ data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password }));
  password = '';
}
if (authError || !authData.user) throw new Error(`Supabase Auth falhou: ${authError?.message ?? 'usuário ausente'}`);
const { data: role, error: roleError } = await supabase.from('editor_roles').select('role').eq('user_id', authData.user.id).maybeSingle();
if (roleError || !role || !['editor', 'admin'].includes(role.role)) throw new Error('usuário técnico sem papel editor/admin em editor_roles');

const results = await Promise.all(rows.map(async (row) => {
  const item = byId.get(row.proposition_version_id);
  const rpc = row.decision === 'needs_changes' ? 'record_impact_editorial_exception' : 'record_impact_editorial_disposition';
  const rpcArgs = row.decision === 'needs_changes'
    ? { p_proposition_version_id: row.proposition_version_id, p_review_key: row.review_key, p_title: item.title ?? row.proposition_version_id, p_disposition: row.disposition ?? item.disposition ?? item.recommended_disposition, p_notes: row.notes ?? row.rationale }
    : { p_proposition_version_id: row.proposition_version_id, p_review_key: row.review_key, p_title: item.title ?? row.proposition_version_id, p_disposition: row.disposition ?? item.disposition ?? item.recommended_disposition, p_rationale: row.rationale ?? row.notes ?? item.rationale ?? item.recommended_rationale };
  const { error } = await supabase.rpc(rpc, rpcArgs);
  return { proposition_version_id: row.proposition_version_id, decision: row.decision, rpc, status: error ? 'error' : 'applied', error: error?.message ?? null };
}));
report.remote_apply = true;
report.reviewer_user_id = authData.user.id;
report.actions = results;
writeFileSync(resolve(root, outputFile), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
if (results.some((result) => result.status === 'error')) process.exit(1);
