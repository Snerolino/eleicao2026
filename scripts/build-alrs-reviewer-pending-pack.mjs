#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trim().startsWith('#')) process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
}
loadEnv(resolve(root, '.env.local'));
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const stateFile = resolve(process.env.XDG_STATE_HOME || resolve(homedir(), '.local', 'state'), 'eleicao2026/supabase-editor-session.json');
if (!url || !key || !existsSync(stateFile)) throw new Error('URL/chave pública ou sessão Auth ausente');
const session = JSON.parse(readFileSync(stateFile, 'utf8'));
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const auth = await sb.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
if (auth.error || !auth.data.user) throw new Error(`sessão Auth inválida: ${auth.error?.message ?? 'usuário ausente'}`);
const role = await sb.from('editor_roles').select('role').eq('user_id', auth.data.user.id).maybeSingle();
if (role.error || !role.data || !['editor', 'admin'].includes(role.data.role)) throw new Error('sessão sem papel editor/admin');

const readJson = (file) => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
const priority = readJson('data/legislative-import/alrs/impact-review-priority-p0-p1.json');
const collisions = readJson('data/legislative-import/alrs/version-key-collision-resolution-pack-v1.json');
const collisionAudit = readJson('data/legislative-import/alrs/version-key-collision-audit-v1.json');
const priorityIds = priority.items.map((item) => item.proposition_version_id);
const collisionIds = [...new Set(collisions.items.flatMap((item) => item.proposition_version_ids))];
const allIds = [...new Set([...priorityIds, ...collisionIds])];
const remote = [];
for (let i = 0; i < allIds.length; i += 100) {
  const q = await sb.from('impact_editorial_dispositions').select('proposition_version_id,status,disposition,rationale').in('proposition_version_id', allIds.slice(i, i + 100));
  if (q.error) throw q.error;
  remote.push(...(q.data ?? []));
}
const remoteById = new Map(remote.map((row) => [row.proposition_version_id, row]));
const collisionById = new Map();
for (const item of collisions.items) for (const id of item.proposition_version_ids) collisionById.set(id, item);

const items = priority.items
  .filter((item) => !remoteById.has(item.proposition_version_id))
  .map((item) => ({
    lane: 'priority',
    priority: item.priority,
    proposition_version_id: item.proposition_version_id,
    review_key: item.review_key,
    proposition_external_id: item.proposition_external_id,
    title: item.title,
    event_type: item.event_type,
    official_event_type: item.official_event_type,
    candidate_count: item.candidate_count,
    factual_vote_count: item.factual_vote_count,
    source_urls: item.source_urls,
    required_decision: 'assess | no_direct_population_group | taxonomy_gap | excluded',
    current_remote_status: 'missing',
    remote_apply: false,
  }));
for (const id of collisionIds) {
  if (remoteById.has(id)) continue;
  const c = collisionById.get(id);
  const entry = collisionAudit.collisions.find((x) => x.version_key === c.version_key);
  items.push({
    lane: 'collision',
    priority: 'BLOCKED_IDENTITY',
    proposition_version_id: id,
    review_key: null,
    version_key: c.version_key,
    proposition_external_ids: c.proposition_external_ids,
    proposition_version_ids: c.proposition_version_ids,
    event_ids: c.event_ids,
    source_urls: c.source_urls,
    technical_hypothesis: c.technical_hypothesis,
    resolution_status: c.resolution_status,
    required_decision: 'resolve_as_distinct_event | resolve_identity_mismatch | excluded',
    current_remote_status: 'missing',
    remote_apply: false,
    audit_entry_present: Boolean(entry),
  });
}
items.sort((a, b) => `${a.lane}:${a.priority}:${a.proposition_version_id}`.localeCompare(`${b.lane}:${b.priority}:${b.proposition_version_id}`));
const output = {
  schema_version: '1.0.0',
  packet_type: 'alrs_reviewer_pending_dispositions',
  generated_by: 'scripts/build-alrs-reviewer-pending-pack.mjs',
  mode: 'read-only',
  remote_apply: false,
  public_approval: false,
  reviewer_contract: {
    priority_decision_values: ['assess', 'no_direct_population_group', 'taxonomy_gap', 'excluded'],
    collision_decision_values: ['resolve_as_distinct_event', 'resolve_identity_mismatch', 'excluded'],
    assess_requires: ['group_slug', 'impact_direction', 'defending_vote', 'severity', 'structural_type', 'confidence', 'rationale'],
    minimum_rationale_chars: 20,
    no_score_or_fanout_in_this_packet: true,
  },
  remote_snapshot: {
    authenticated_role: role.data.role,
    dispositions_returned: remote.length,
    resolved_input_ids: allIds.filter((id) => remoteById.has(id)).length,
  },
  totals: {
    pending_items: items.length,
    priority_pending: items.filter((x) => x.lane === 'priority').length,
    collision_pending: items.filter((x) => x.lane === 'collision').length,
    p0_pending: items.filter((x) => x.priority === 'P0').length,
    p1_pending: items.filter((x) => x.priority === 'P1').length,
  },
  items,
};
const outputPath = resolve(root, 'data/legislative-import/alrs/alrs-reviewer-pending-dispositions-v1.json');
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: outputPath, totals: output.totals, remote_apply: false }));
