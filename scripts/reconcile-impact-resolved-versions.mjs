#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'data/legislative-import/alrs/impact-resolved-version-catalog-v1.json');

function parseSupabase(outputText) {
  const start = outputText.indexOf('{');
  const end = outputText.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('JSON do Supabase não encontrado');
  return JSON.parse(outputText.slice(start, end + 1));
}

function canonicalKey(row) {
  const identity = String(row.external_id ?? '').match(/\b(PEC|PLC|PL|PR)\s*-?\s*(\d+)\s*[\/-]\s*(\d{4})\b/i) ?? String(row.title ?? '').match(/\b(PEC|PLC|PL|PR)\s+(\d+)\s*[\/-]\s*(\d{4})\b/i);
  if (!identity) return null;
  const textHash = String(row.version_key ?? '').startsWith('sha256:') ? String(row.version_key).slice(7) : null;
  if (!textHash) return null;
  return `${row.house}:${identity[1].toUpperCase()}:${identity[2]}:${identity[3]}:${textHash}`;
}

const sql = `
  select 'resolved' as kind, proposition_version_id::text as proposition_version_id
  from public.impact_matrices where review_status in ('approved','contested')
  union
  select 'resolved' as kind, proposition_version_id::text as proposition_version_id
  from public.impact_editorial_dispositions where status='approved';
`;
const profileSql = `select candidate_id::text as candidate_id from public.legislator_vote_profile where house='alrs';`;
const raw = execFileSync('npx', ['supabase', 'db', 'query', '--linked', '--output', 'json', sql], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const rows = parseSupabase(raw).rows ?? [];
const profileRaw = execFileSync('npx', ['supabase', 'db', 'query', '--linked', '--output', 'json', profileSql], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const profileRows = parseSupabase(profileRaw).rows ?? [];
const resolved = [...new Set(rows.map((row) => row.proposition_version_id))].sort();
const detailSql = `select pv.id::text as proposition_version_id, pv.version_key, lp.house, lp.external_id, lp.title from public.proposition_versions pv join public.legislative_propositions lp on lp.id=pv.proposition_id where pv.id in (${resolved.map((id) => `'${id}'`).join(',') || 'null'});`;
const detailRaw = execFileSync('npx', ['supabase', 'db', 'query', '--linked', '--output', 'json', detailSql], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const details = parseSupabase(detailRaw).rows ?? [];
const resolvedCanonicalKeys = [...new Set(details.map(canonicalKey).filter(Boolean))].sort();
const result = { schema_version: '1.0.0', generated_by: 'read_only_supabase_reconciliation', remote_apply: false, resolved_version_ids: resolved, existing_matrix_version_ids: resolved, resolved_canonical_keys: resolvedCanonicalKeys, profile_candidate_ids: [...new Set(profileRows.map((row) => row.candidate_id))].sort(), totals: { resolved_versions: resolved.length, existing_matrix_versions: resolved.length, resolved_canonical_keys: resolvedCanonicalKeys.length, profile_candidates: profileRows.length } };
mkdirSync(resolve(root, 'data/legislative-import/alrs'), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
