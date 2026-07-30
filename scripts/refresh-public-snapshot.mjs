import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'csv-parse/sync';
import { v5 as uuidv5 } from 'uuid';
import {
  SNAPSHOT_RELATIVE_PATH,
  validatePublicCandidateSnapshot,
} from './public-candidate-snapshot.mjs';
import {
  buildDatasetSourceManifest,
  TSE_SOURCE_MANIFEST_RELATIVE_PATH,
} from './tse-ingest-contract.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const DATASET_DIR = resolve(ROOT, '../dataset2026/candidatos');
const OUTPUT = resolve(ROOT, SNAPSHOT_RELATIVE_PATH);
const MANIFEST_OUTPUT = resolve(ROOT, TSE_SOURCE_MANIFEST_RELATIVE_PATH);
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const TSE_CONSULTA_CAND_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip';

const POSITION_MAP = {
  'DEPUTADO FEDERAL': 'deputado_federal',
  'DEPUTADO ESTADUAL': 'deputado_estadual',
  'DEPUTADO DISTRITAL': 'deputado_estadual',
  SENADOR: 'senador',
  GOVERNADOR: 'governador',
  'VICE-GOVERNADOR': 'governador',
  PRESIDENTE: 'presidente',
};

const POSITION_LABEL_MAP = {
  presidente: 'Presidente',
  governador: 'Governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_estadual: 'Deputado Estadual',
  outro: 'Outros cargos',
};

function ascii(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

function stableId(name, party) {
  return uuidv5(`${ascii(name)}-${party}`, UUID_NAMESPACE);
}

function slugBase(text) {
  return ascii(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');
}

function stableSlug(name, tseCandidateId) {
  const suffix = String(tseCandidateId ?? '').replace(/\D/g, '');
  const base = slugBase(name) || 'candidato';
  return suffix ? `${base}_${suffix}` : base;
}

function toNullable(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text || text === '#NULO' || text === '#NE' || text === '-1') return null;
  return text;
}

function inferPosition(value) {
  const normalized = (toNullable(value) ?? '').toUpperCase().trim();
  return POSITION_MAP[normalized] ?? 'outro';
}

function readCsv(csvPath) {
  return parse(readFileSync(csvPath, 'latin1'), {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  });
}

function contentHash(candidates) {
  const canonical = candidates.map((candidate) => ({
    id: candidate.id,
    tse_candidate_id: candidate.tse_candidate_id,
    full_name: candidate.full_name,
    party: candidate.party,
    ballot_number: candidate.ballot_number,
    position: candidate.position,
  }));
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}

function sourceManifest(csvPath, rows, csvFile, createdAt) {
  const uf = csvFile.match(/_([A-Z]{2}|BRASIL|BR)\.csv$/)?.[1] ?? 'BR';
  return buildDatasetSourceManifest({
    datasetKey: 'consulta_cand',
    uf,
    sourceKind: 'local-dir',
    sourcePath: relative(ROOT, csvPath),
    officialUrl: TSE_CONSULTA_CAND_URL,
    sha256: createHash('sha256').update(readFileSync(csvPath)).digest('hex'),
    rowCount: rows.length,
    createdAt,
  });
}

export function generatePublicCandidateSnapshot({ datasetDir = DATASET_DIR } = {}) {
  const candidatesDir = resolve(datasetDir, 'consulta_cand_2026');
  if (!existsSync(candidatesDir)) {
    throw new Error(`Dataset TSE ausente: ${candidatesDir}`);
  }

  const csvFiles = readdirSync(candidatesDir)
    .filter((file) => file.endsWith('.csv') && /consulta_cand_2026_/.test(file))
    .sort();

  if (csvFiles.length === 0) {
    throw new Error(`Nenhum CSV TSE encontrado em ${candidatesDir}`);
  }

  const candidates = [];

  for (const csvFile of csvFiles) {
    const rows = readCsv(resolve(candidatesDir, csvFile));

    for (const row of rows) {
      const fullName = toNullable(row.NM_CANDIDATO);
      const party = toNullable(row.SG_PARTIDO);
      if (!fullName || !party) continue;

      const position = inferPosition(row.DS_CARGO);
      const ballotNumber = toNullable(row.NR_CANDIDATO);
      const tseCandidateId = toNullable(row.SQ_CANDIDATO);

      candidates.push({
        id: stableId(fullName, party),
        slug: stableSlug(fullName, tseCandidateId),
        full_name: fullName,
        party,
        ballot_number: ballotNumber ? Number.parseInt(ballotNumber, 10) : null,
        position,
        position_label: POSITION_LABEL_MAP[position] ?? POSITION_LABEL_MAP.outro,
        photo_url: null,
        photo_source_url: null,
        claims: [],
        tse_candidate_id: tseCandidateId,
        registration_status: 'registration_requested',
        state: toNullable(row.SG_UF),
        election_year: 2026,
        ballot_name: toNullable(row.NM_URNA_CANDIDATO),
      });
    }
  }

  return validatePublicCandidateSnapshot(candidates);
}

export function generateTseSourceManifest({ datasetDir = DATASET_DIR, createdAt = new Date().toISOString() } = {}) {
  const candidatesDir = resolve(datasetDir, 'consulta_cand_2026');
  if (!existsSync(candidatesDir)) {
    throw new Error(`Dataset TSE ausente: ${candidatesDir}`);
  }

  return readdirSync(candidatesDir)
    .filter((file) => file.endsWith('.csv') && /consulta_cand_2026_/.test(file))
    .sort()
    .map((csvFile) => {
      const csvPath = resolve(candidatesDir, csvFile);
      const rows = readCsv(csvPath);
      return sourceManifest(csvPath, rows, csvFile, createdAt);
    });
}

function main() {
  console.log('🔄 Atualizando snapshot público de candidatos TSE 2026...');
  console.log(`   Dataset: ${DATASET_DIR}`);

  const createdAt = new Date().toISOString();
  const candidates = generatePublicCandidateSnapshot();
  const manifest = generateTseSourceManifest({ createdAt });
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(`${OUTPUT}.tmp`, `${JSON.stringify(candidates, null, 2)}\n`, 'utf8');
  writeFileSync(OUTPUT, readFileSync(`${OUTPUT}.tmp`, 'utf8'), 'utf8');
  unlinkSync(`${OUTPUT}.tmp`);
  writeFileSync(MANIFEST_OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`✅ Snapshot público: ${OUTPUT}`);
  console.log(`   ${candidates.length} candidaturas`);
  console.log(`   sha256: ${contentHash(candidates)}`);
  console.log(`✅ Manifesto TSE: ${MANIFEST_OUTPUT}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
