import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'csv-parse/sync';
import { v5 as uuidv5 } from 'uuid';
import {
  SNAPSHOT_RELATIVE_PATH,
  validatePublicCandidateSnapshot,
} from './public-candidate-snapshot.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const DATASET_DIR = resolve(ROOT, '../dataset2026/candidatos');
const OUTPUT = resolve(ROOT, SNAPSHOT_RELATIVE_PATH);
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

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

      candidates.push({
        id: stableId(fullName, party),
        full_name: fullName,
        party,
        ballot_number: ballotNumber ? Number.parseInt(ballotNumber, 10) : null,
        position,
        position_label: POSITION_LABEL_MAP[position] ?? POSITION_LABEL_MAP.outro,
        photo_url: null,
        photo_source_url: null,
        claims: [],
        tse_candidate_id: toNullable(row.SQ_CANDIDATO),
        registration_status: 'registration_requested',
        state: toNullable(row.SG_UF),
        election_year: 2026,
        ballot_name: toNullable(row.NM_URNA_CANDIDATO),
      });
    }
  }

  return validatePublicCandidateSnapshot(candidates);
}

function main() {
  console.log('🔄 Atualizando snapshot público de candidatos TSE 2026...');
  console.log(`   Dataset: ${DATASET_DIR}`);

  const candidates = generatePublicCandidateSnapshot();
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(`${OUTPUT}.tmp`, `${JSON.stringify(candidates, null, 2)}\n`, 'utf8');
  writeFileSync(OUTPUT, readFileSync(`${OUTPUT}.tmp`, 'utf8'), 'utf8');

  console.log(`✅ Snapshot público: ${OUTPUT}`);
  console.log(`   ${candidates.length} candidaturas`);
  console.log(`   sha256: ${contentHash(candidates)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
