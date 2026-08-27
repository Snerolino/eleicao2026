#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
function loadEnv(file) { if (!existsSync(file)) return; for (const line of readFileSync(file, 'utf8').split('\n')) { const t = line.trim(); const i = t.indexOf('='); if (i > 0 && !t.startsWith('#')) process.env[t.slice(0, i).trim()] ??= t.slice(i + 1).trim().replace(/^["']|["']$/g, ''); } }
loadEnv(resolve(root, '.env.local'));
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const stateFile = resolve(process.env.XDG_STATE_HOME || resolve(homedir(), '.local', 'state'), 'eleicao2026/supabase-editor-session.json');
const manifest = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json'), 'utf8'));
const reconciliation = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/alrs/alrs-nominal-vote-reconciliation-v1.json'), 'utf8'));
const blocked = new Set((reconciliation.rows ?? []).filter((row) => row.status === 'blocked_proposition_version').map((row) => `${row.proposition_number}|${row.proposition_year}|${row.occurred_at}`));
const catalog = new Map((manifest.catalog ?? []).map((row) => [row.solicitante_id, row]));
const propositions = new Map();
for (const page of manifest.pages ?? []) {
  const identity = catalog.get(page.solicitante_id);
  if (!identity || identity.exact_candidate_matches?.length !== 1) continue;
  for (const item of page.items ?? []) {
    const key = `${item.numProposicao}|${item.anoProposicao}|${item.dataVotacao}`;
    if (!blocked.has(key)) continue;
    const type = String(item.tipoProjeto ?? '').trim().toUpperCase();
    const normalizedType = type === 'PEC' ? 'pec' : 'pl';
    const propositionKey = `${type}|${item.numProposicao}|${item.anoProposicao}|${item.materia}`;
    if (!propositions.has(propositionKey)) propositions.set(propositionKey, { external_id: `${type} ${item.numProposicao}/${item.anoProposicao}`, proposition_type: normalizedType, number: Number(item.numProposicao), year: Number(item.anoProposicao), title: item.materia.trim(), source_url: page.url, source_sha256: page.sha256, effective_from: new Date().toISOString(), version_key: `alrs-${type.toLowerCase()}-${item.numProposicao}-${item.anoProposicao}` });
  }
}
if (!url || !key || !existsSync(stateFile)) throw new Error('URL/chave publicável ou sessão Auth ausente');
const session = JSON.parse(readFileSync(stateFile, 'utf8'));
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: auth, error: authError } = await sb.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
if (authError || !auth.user) throw new Error(authError?.message ?? 'sessão Auth inválida');
const { data: role, error: roleError } = await sb.from('editor_roles').select('role').eq('user_id', auth.user.id).maybeSingle();
if (roleError || !role || !['editor', 'admin'].includes(role.role)) throw new Error('sessão sem papel editor/admin');
const rows = [...propositions.values()];
const { data, error } = await sb.rpc('ensure_alrs_nominal_proposition_version', { p_rows: rows });
if (error) throw error;
console.log(JSON.stringify({ remote_apply: true, role: role.role, rows_sent: rows.length, versions: data }, null, 2));
