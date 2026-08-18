#!/usr/bin/env node
/** Reconcilia deputados Câmara do batch Q1 por nome oficial exato; não aplica votos. */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const INPUT = resolve(ROOT, 'data/legislative-import/camara/collector-2026-q1');
const OUTPUT = resolve(ROOT, 'data/legislative-import/camara/collector-2026-q1/identity-reconciliation.json');

export function normalizeName(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function buildCandidateIndex(candidates) {
  const index = new Map();
  for (const candidate of candidates.filter((row) => row.position === 'deputado_federal')) {
    for (const name of [candidate.full_name, candidate.ballot_name]) {
      const key = normalizeName(name); if (!key) continue;
      const bucket = index.get(key) ?? [];
      if (!bucket.some((row) => row.tse_candidate_id === candidate.tse_candidate_id)) bucket.push({ tse_candidate_id: candidate.tse_candidate_id, candidate_name: candidate.full_name });
      index.set(key, bucket);
    }
  }
  return index;
}

export function resolveExactIdentity(officialName, index) {
  const matches = index.get(normalizeName(officialName)) ?? [];
  return { status: matches.length === 1 ? 'matched_exact' : 'identity_pending', matches };
}

async function main() {
  const candidates = JSON.parse(readFileSync(resolve(ROOT, 'data/public-candidates.json'), 'utf8'));
  const index = buildCandidateIndex(candidates);
  const deputyById = new Map();
  const files = readdirSync(INPUT).filter((name) => /^\d[\d-]*\.json$/.test(name) && !name.includes('manifest') && !name.includes('summary') && !name.includes('identity'));
  for (const file of files) {
    const voteId = file.replace(/\.json$/, '');
    const response = await fetch(`https://dadosabertos.camara.leg.br/api/v2/votacoes/${voteId}/votos`, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Câmara HTTP ${response.status} em ${voteId}`);
    for (const vote of (await response.json()).dados ?? []) {
      const deputy = vote.deputado_;
      if (deputy?.siglaUf !== 'RS') continue;
      const key = String(deputy.id);
      const current = deputyById.get(key) ?? { deputy_id: key, official_name: deputy.nome, source_urls: [] };
      const source = `https://dadosabertos.camara.leg.br/api/v2/votacoes/${voteId}/votos`;
      if (!current.source_urls.includes(source)) current.source_urls.push(source);
      deputyById.set(key, current);
    }
  }
  const entries = [...deputyById.values()].sort((a, b) => a.deputy_id.localeCompare(b.deputy_id, 'en', { numeric: true })).map((entry) => ({ ...entry, ...resolveExactIdentity(entry.official_name, index) }));
  const result = { schema_version: '1.0.0', mode: 'read-only', source: 'https://dadosabertos.camara.leg.br/api/v2/votacoes/{vote_id}/votos', batch: 'collector-2026-q1', totals: { deputies: entries.length, matched_exact: entries.filter((x) => x.status === 'matched_exact').length, identity_pending: entries.filter((x) => x.status === 'identity_pending').length }, entries };
  writeFileSync(OUTPUT, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result.totals));
}

if (process.argv[1]?.endsWith('reconcile-camara-q1-identities.mjs')) main().catch((error) => { console.error(`FED-20: ${error.message}`); process.exitCode = 1; });
