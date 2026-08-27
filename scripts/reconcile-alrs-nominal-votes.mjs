#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifestFile = resolve(root, process.argv[2] ?? 'data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json');
const output = resolve(root, process.argv.find((arg) => arg.startsWith('--output='))?.slice(9) ?? 'data/legislative-import/alrs/alrs-nominal-vote-reconciliation-v1.json');
const pageSize = 1000;

function loadEnv(file) { if (!existsSync(file)) return; for (const line of readFileSync(file, 'utf8').split('\n')) { const value = line.trim(); const index = value.indexOf('='); if (index > 0 && !value.startsWith('#')) process.env[value.slice(0, index).trim()] ??= value.slice(index + 1).trim().replace(/^["']|["']$/g, ''); } }
function normalizeCalendarDate(value) { const text = String(value ?? ''); const br = text.match(/^(\d{2})\/(\d{2})\/(\d{4})/); return br ? `${br[3]}-${br[2]}-${br[1]}` : text.slice(0, 10); }
function normalizeTitle(value) { return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.;:,]+$/, ''); }
loadEnv(resolve(root, '.env.local'));
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) throw new Error('SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY obrigatórios');
const sb = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
async function fetchAll(table, select, buildQuery = (query) => query) {
  const countQuery = sb.from(table).select('*', { count: 'exact', head: true });
  const { count, error: countError } = await countQuery;
  if (countError) throw new Error(`count ${table}: ${JSON.stringify(countError)}`);
  const ranges = Array.from({ length: Math.ceil((count ?? 0) / pageSize) }, (_, index) => [index * pageSize, index * pageSize + pageSize - 1]);
  const pages = await Promise.all(ranges.map(async ([from, to]) => { const { data, error } = await buildQuery(sb.from(table).select(select)).range(from, to); if (error) throw new Error(`page ${table} ${from}-${to}: ${JSON.stringify(error)}`); return data ?? []; }));
  return pages.flat();
}
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
const exact = new Map((manifest.catalog ?? []).filter((row) => row.exact_candidate_matches?.length === 1).map((row) => [row.solicitante_id, row]));
const sourceRows = [];
for (const page of manifest.pages ?? []) { const identity = exact.get(page.solicitante_id); if (!identity) continue; for (const item of page.items ?? []) sourceRows.push({ ...item, solicitante_id: page.solicitante_id, politician_name: page.name, year: page.year, source_url: page.url, source_sha256: page.sha256, candidate: identity.exact_candidate_matches[0] }); }
const [candidates, versionRows, existing] = await Promise.all([
  fetchAll('candidates', 'id,tse_candidate_id', (q) => q.in('tse_candidate_id', [...new Set(sourceRows.map((row) => row.candidate.tse_candidate_id))])),
  fetchAll('proposition_versions', 'id,version_key,proposition_id,legislative_propositions!inner(house,proposition_type,number,year,title)', (q) => q.eq('legislative_propositions.house', 'alrs')),
  fetchAll('legislative_votes', 'candidate_id,value,voting_events!inner(occurred_at,house,proposition_version_id)', (q) => q.eq('voting_events.house', 'alrs')),
]);
const versions = versionRows.map((row) => ({ proposition_version_id: row.id, version_key: row.version_key, ...row.legislative_propositions }));
const candidateByTse = new Map(candidates.map((row) => [String(row.tse_candidate_id), row]));
const versionByNatural = new Map(); const versionByTitle = new Map();
for (const row of versions) { const naturalKey = `${row.proposition_type}:${row.number}:${row.year}`; const list = versionByNatural.get(naturalKey) ?? []; list.push(row); versionByNatural.set(naturalKey, list); const titleKey = `${row.number}:${row.year}:${normalizeTitle(row.title)}`; const titleList = versionByTitle.get(titleKey) ?? []; titleList.push(row); versionByTitle.set(titleKey, titleList); }
const existingKeys = new Set(existing.map((row) => `${row.candidate_id}|${row.voting_events?.proposition_version_id}|${normalizeCalendarDate(row.voting_events?.occurred_at)}|${row.value}`));
const results = [];
for (const row of sourceRows) { const candidate = candidateByTse.get(String(row.candidate.tse_candidate_id)); const type = String(row.tipoProjeto ?? '').trim().toLowerCase() === 'pec' ? 'pec' : 'outro'; const titleMatches = versionByTitle.get(`${Number(row.numProposicao)}:${Number(row.anoProposicao)}:${normalizeTitle(row.materia)}`) ?? []; const naturalMatches = versionByNatural.get(`${type}:${Number(row.numProposicao)}:${Number(row.anoProposicao)}`) ?? []; const versionsForMatter = titleMatches.length > 0 ? titleMatches : naturalMatches; const value = ({ Sim: 'sim', 'Não': 'nao', Abstenção: 'abstencao', Ausente: 'ausente', Obstrução: 'obstrucao' })[String(row.voto).trim()] ?? null; let status = 'missing_safe_to_import'; if (!candidate || !value) status = 'blocked_identity'; else if (versionsForMatter.length !== 1) status = versionsForMatter.length === 0 ? 'blocked_proposition_version' : 'ambiguous'; else if (existingKeys.has(`${candidate.id}|${versionsForMatter[0].proposition_version_id}|${normalizeCalendarDate(row.dataVotacao)}|${value}`)) status = 'already_present_exact'; results.push({ status, candidate_id: candidate?.id ?? null, tse_candidate_id: row.candidate.tse_candidate_id, politician_name: row.politician_name, proposition_version_id: versionsForMatter.length === 1 ? versionsForMatter[0].proposition_version_id : null, proposition_type: type, proposition_number: Number(row.numProposicao), proposition_year: Number(row.anoProposicao), occurred_at: row.dataVotacao, value, source_url: row.source_url, source_sha256: row.source_sha256 }); }
const counts = Object.fromEntries(['source_rows', 'exact_candidate_rows', 'candidate_matches', 'resolved_proposition_versions', 'already_present', 'missing', 'conflicts', 'ambiguous', 'blocked_identity', 'blocked_proposition'].map((key) => [key, 0]));
counts.source_rows = sourceRows.length; counts.exact_candidate_rows = sourceRows.length; counts.candidate_matches = results.filter((row) => row.candidate_id).length; counts.resolved_proposition_versions = results.filter((row) => row.proposition_version_id).length; counts.already_present = results.filter((row) => row.status === 'already_present_exact').length; counts.missing = results.filter((row) => row.status === 'missing_safe_to_import').length; counts.conflicts = results.filter((row) => row.status === 'conflict_existing_value').length; counts.ambiguous = results.filter((row) => row.status === 'ambiguous').length; counts.blocked_identity = results.filter((row) => row.status === 'blocked_identity').length; counts.blocked_proposition = results.filter((row) => row.status === 'blocked_proposition_version').length;
const outputData = { schema_version: '1.0.0', packet_type: 'alrs_nominal_vote_reconciliation', remote_apply: false, source_manifest_sha256: createHash('sha256').update(readFileSync(manifestFile)).digest('hex'), counts, rows: results };
writeFileSync(output, `${JSON.stringify(outputData, null, 2)}\n`);
console.log(JSON.stringify({ output, counts }));
