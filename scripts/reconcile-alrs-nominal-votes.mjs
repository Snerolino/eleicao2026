#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestFile = resolve(root, process.argv[2] ?? 'data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json');
const output = resolve(root, process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/alrs/alrs-nominal-vote-reconciliation-v1.json');
function query(sql) {
  const raw = execFileSync('npx', ['supabase', 'db', 'query', '--linked', '--output', 'json', sql], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const start = raw.indexOf('{'); const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('resposta JSON ausente');
  return JSON.parse(raw.slice(start, end + 1)).rows ?? [];
}
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
const exact = new Map((manifest.catalog ?? []).filter((row) => row.exact_candidate_matches?.length === 1).map((row) => [row.solicitante_id, row]));
const sourceRows = [];
for (const page of manifest.pages ?? []) {
  const identity = exact.get(page.solicitante_id);
  if (!identity) continue;
  for (const item of page.items ?? []) sourceRows.push({ ...item, solicitante_id: page.solicitante_id, politician_name: page.name, year: page.year, source_url: page.url, source_sha256: page.sha256, candidate: identity.exact_candidate_matches[0] });
}
const candidates = query(`select id::text as id, tse_candidate_id::text as tse_candidate_id from public.candidates where tse_candidate_id in (${[...new Set(sourceRows.map((row) => `'${row.candidate.tse_candidate_id}'`))].join(',') || "'__none__'"});`);
const versions = query(`select pv.id::text as proposition_version_id, pv.version_key, lp.house, lp.proposition_type, lp.number, lp.year, lp.title from public.proposition_versions pv join public.legislative_propositions lp on lp.id=pv.proposition_id where lp.house='alrs';`);
const existing = query(`select lv.candidate_id::text as candidate_id, pv.id::text as proposition_version_id, ve.occurred_at::text as occurred_at, lv.value, ve.external_id as event_external_id from public.legislative_votes lv join public.voting_events ve on ve.id=lv.voting_event_id join public.proposition_versions pv on pv.id=ve.proposition_version_id where ve.house='alrs';`);
const candidateByTse = new Map(candidates.map((row) => [String(row.tse_candidate_id), row]));
const versionByNatural = new Map();
for (const row of versions) {
  const key = `${row.proposition_type}:${row.number}:${row.year}`;
  const list = versionByNatural.get(key) ?? []; list.push(row); versionByNatural.set(key, list);
}
const existingKeys = new Set(existing.map((row) => `${row.candidate_id}|${row.proposition_version_id}|${String(row.occurred_at).slice(0, 10)}|${row.value}`));
const results = [];
for (const row of sourceRows) {
  const candidate = candidateByTse.get(String(row.candidate.tse_candidate_id));
  const type = String(row.tipoProjeto ?? '').toLowerCase() === 'pec' ? 'pec' : 'pl';
  const versionsForMatter = versionByNatural.get(`${type}:${Number(row.numProposicao)}:${Number(row.anoProposicao)}`) ?? [];
  const value = ({ Sim: 'sim', 'Não': 'nao', Abstenção: 'abstencao', Ausente: 'ausente', Obstrução: 'obstrucao' })[String(row.voto).trim()] ?? null;
  let status = 'missing_safe_to_import';
  if (!candidate) status = 'blocked_identity';
  else if (!value) status = 'blocked_identity';
  else if (versionsForMatter.length !== 1) status = versionsForMatter.length === 0 ? 'blocked_proposition_version' : 'ambiguous';
  else if (existingKeys.has(`${candidate.id}|${versionsForMatter[0].proposition_version_id}|${String(row.dataVotacao).slice(0, 10)}|${value}`)) status = 'already_present_exact';
  results.push({ status, candidate_id: candidate?.id ?? null, tse_candidate_id: row.candidate.tse_candidate_id, politician_name: row.politician_name, proposition_version_id: versionsForMatter.length === 1 ? versionsForMatter[0].proposition_version_id : null, proposition_type: type, proposition_number: Number(row.numProposicao), proposition_year: Number(row.anoProposicao), occurred_at: row.dataVotacao, value, source_url: row.source_url, source_sha256: row.source_sha256 });
}
const counts = Object.fromEntries(['source_rows', 'exact_candidate_rows', 'candidate_matches', 'resolved_proposition_versions', 'already_present', 'missing', 'conflicts', 'ambiguous', 'blocked_identity', 'blocked_proposition'].map((key) => [key, 0]));
counts.source_rows = sourceRows.length; counts.exact_candidate_rows = sourceRows.length; counts.candidate_matches = results.filter((row) => row.candidate_id).length; counts.resolved_proposition_versions = results.filter((row) => row.proposition_version_id).length; counts.already_present = results.filter((row) => row.status === 'already_present_exact').length; counts.missing = results.filter((row) => row.status === 'missing_safe_to_import').length; counts.conflicts = results.filter((row) => row.status === 'conflict_existing_value').length; counts.ambiguous = results.filter((row) => row.status === 'ambiguous').length; counts.blocked_identity = results.filter((row) => row.status === 'blocked_identity').length; counts.blocked_proposition = results.filter((row) => row.status === 'blocked_proposition_version').length;
const outputData = { schema_version: '1.0.0', packet_type: 'alrs_nominal_vote_reconciliation', remote_apply: false, source_manifest_sha256: createHash('sha256').update(readFileSync(manifestFile)).digest('hex'), counts, rows: results };
writeFileSync(output, `${JSON.stringify(outputData, null, 2)}\n`);
console.log(JSON.stringify({ output, counts }));
