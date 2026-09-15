#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ensureEditorSession } from './lib/editor-session.mjs';
import { validateDecisionEnvelope } from './lib/editorial-batch-contract.mjs';

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
const validation = validateDecisionEnvelope(batch, decisions);
const rows = validation.rows;
const errors = validation.errors;
const expectedHash = validation.expected_hash;

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

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const stateFile = resolve(process.env.XDG_STATE_HOME || resolve(process.env.HOME ?? '/', '.local', 'state'), 'eleicao2026/supabase-editor-session.json');
if (!url || !anonKey) throw new Error('SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY são obrigatórios; nenhum service_role é aceito.');
const supabase = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const auth = await ensureEditorSession(supabase, stateFile);

const itemById = new Map(items.map((item) => [item.proposition_version_id, item]));
const rpcItems = rows.map((row) => {
  const item = itemById.get(row.proposition_version_id);
  return {
    proposition_version_id: row.proposition_version_id,
    review_key: row.review_key,
    title: item?.title ?? row.proposition_version_id,
    disposition: row.disposition,
    rationale: row.rationale,
    notes: row.notes,
    decision: row.decision,
    status: row.decision === 'needs_changes' ? 'needs_changes' : 'approved',
    event_type: item?.official_event_type ?? item?.event_type,
  };
});
const { data: rpcResult, error: rpcError } = await supabase.rpc('record_impact_editorial_batch', {
  p_batch_id: batch.batch_id,
  p_batch_sha256: expectedHash,
  p_items: rpcItems,
});
if (rpcError) throw new Error(`apply transacional falhou: ${rpcError.message}`);
report.remote_apply = true;
report.reviewer_user_id = auth.user.id;
report.actions = [{ rpc: 'record_impact_editorial_batch', status: 'applied', result: rpcResult }];
const readBack = await supabase
  .from('impact_editorial_dispositions')
  .select('proposition_version_id, review_key, disposition, rationale, status, batch_id, batch_sha256')
  .in('proposition_version_id', rows.map((row) => row.proposition_version_id));
if (readBack.error) throw new Error(`read-back pós-apply falhou: ${readBack.error.message}`);
const readBackById = new Map((readBack.data ?? []).map((row) => [row.proposition_version_id, row]));
report.read_back = {
  rows: readBack.data?.length ?? 0,
  expected: rows.length,
  exact: rows.every((row) => {
    const actual = readBackById.get(row.proposition_version_id);
    return actual?.review_key === row.review_key
      && actual?.status === (row.decision === 'needs_changes' ? 'needs_changes' : 'approved')
      && actual?.disposition === row.disposition
      && actual?.batch_id === batch.batch_id
      && actual?.batch_sha256 === expectedHash;
  }),
  second_pass_rpc_calls: rpcResult?.already_present ?? 0,
};
writeFileSync(resolve(root, outputFile), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
if (!report.read_back.exact) process.exit(1);
