#!/usr/bin/env node
/**
 * Gera o catálogo institucional Câmara ↔ snapshot TSE sem fuzzy matching.
 * A lista oficial é somente leitura; o resultado é um artefato versionado.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'data/legislative-import/camara/candidate-catalog.json');
const officialUrl = 'https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000';
const retrievedOn = '2026-08-17';

function normalizeName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

const candidates = JSON.parse(await readFile(resolve(root, 'data/public-candidates.json'), 'utf8'))
  .filter((candidate) => candidate.position === 'deputado_federal')
  .sort((a, b) => String(a.tse_candidate_id).localeCompare(String(b.tse_candidate_id)));

const response = await fetch(officialUrl);
if (!response.ok) throw new Error(`Câmara API HTTP ${response.status}`);
const official = (await response.json()).dados ?? [];

const candidateByName = new Map();
for (const candidate of candidates) {
  for (const sourceName of [candidate.ballot_name, candidate.full_name]) {
    const key = normalizeName(sourceName);
    if (!key) continue;
    const bucket = candidateByName.get(key) ?? [];
    bucket.push(candidate);
    candidateByName.set(key, bucket);
  }
}

const entries = candidates.map((candidate) => {
  const candidatesByOfficialName = official.filter((deputy) => {
    const key = normalizeName(deputy.nome);
    return candidateByName.get(key)?.length === 1 && candidateByName.get(key)[0].id === candidate.id;
  });
  const deputy = candidatesByOfficialName.length === 1 ? candidatesByOfficialName[0] : null;
  if (!deputy) {
    return {
      camara_deputado_id: null,
      camara_name: null,
      camara_uf: null,
      camara_legislatura: null,
      candidate_id: candidate.id,
      tse_candidate_id: candidate.tse_candidate_id,
      candidate_name: candidate.full_name,
      federal_legislative_history_status: 'identity_pending',
      identity_status: 'identity_pending',
      match_method: 'none',
      confidence: null,
      source_url: officialUrl,
    };
  }
  return {
    camara_deputado_id: deputy.id,
    camara_name: deputy.nome,
    camara_uf: deputy.siglaUf,
    camara_legislatura: deputy.idLegislatura,
    candidate_id: candidate.id,
    tse_candidate_id: candidate.tse_candidate_id,
    candidate_name: candidate.full_name,
    federal_legislative_history_status: 'current_federal_deputy',
    identity_status: 'matched',
    match_method: 'official_name_exact',
    confidence: 1,
    source_url: deputy.uri,
  };
});

const result = {
  schema_version: '1.0.0',
  catalog_type: 'camara_candidate_identity',
  target_house: 'camara',
  target_office_2026: 'deputado_federal',
  retrieved_on: retrievedOn,
  source_url: officialUrl,
  matching_policy: 'exact normalized official name against unique ballot/full name; no fuzzy matching',
  totals: {
    public_candidates: candidates.length,
    official_deputies_downloaded: official.length,
    matched: entries.filter((entry) => entry.identity_status === 'matched').length,
    identity_pending: entries.filter((entry) => entry.identity_status === 'identity_pending').length,
  },
  entries,
};

await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result.totals));
console.log(`Wrote ${output}`);
