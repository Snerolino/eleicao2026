#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'data/legislative-import/alrs/impact-resolved-version-catalog-v1.json');

function parseSupabase(outputText) {
  const start = outputText.indexOf('{');
  const end = outputText.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('JSON do Supabase não encontrado');
  return JSON.parse(outputText.slice(start, end + 1));
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
const result = { schema_version: '1.0.0', generated_by: 'read_only_supabase_reconciliation', remote_apply: false, resolved_version_ids: resolved, existing_matrix_version_ids: resolved, profile_candidate_ids: [...new Set(profileRows.map((row) => row.candidate_id))].sort(), totals: { resolved_versions: resolved.length, existing_matrix_versions: resolved.length, profile_candidates: profileRows.length } };
mkdirSync(resolve(root, 'data/legislative-import/alrs'), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
