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
const SIG_CANDIDATES_FILE = 'FONTE OFICIAL = sig.tse.jus.br -lista_candidatos_2026.csv';
const DADOS_ABERTOS_CANDIDATES_FILE = 'FONTE OFICIAL  = dadosabertos.tse.jus.b = candidatos.csv';
const CONSULTA_CANDIDATES_FILE = 'consulta_cand_2026/consulta_cand_2026_RS.csv';
const OUTPUT = resolve(ROOT, SNAPSHOT_RELATIVE_PATH);
const MANIFEST_OUTPUT = resolve(ROOT, TSE_SOURCE_MANIFEST_RELATIVE_PATH);
const PUBLIC_OVERRIDES_PATH = resolve(ROOT, 'data/public-candidate-overrides.json');
const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const TSE_CONSULTA_CAND_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip';
const TSE_SIG_CANDIDATES_URL = 'https://sig.tse.jus.br/ords/dwapr/r/seai/sig-candidaturas/lista-candidatos';
const TSE_DADOS_ABERTOS_CANDIDATES_URL = 'https://dadosabertos.tse.jus.br/dataset/candidatos';

const POSITION_MAP = {
  'DEPUTADO FEDERAL': 'deputado_federal',
  'DEPUTADO ESTADUAL': 'deputado_estadual',
  'DEPUTADO DISTRITAL': 'deputado_estadual',
  SENADOR: 'senador',
  GOVERNADOR: 'governador',
  'VICE-GOVERNADOR': 'vice_governador',
  'VICE GOVERNADOR': 'vice_governador',
  PRESIDENTE: 'presidente',
};

const POSITION_LABEL_MAP = {
  presidente: 'Presidente',
  governador: 'Governador',
  vice_governador: 'Vice-governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_estadual: 'Deputado Estadual',
  outro: 'Outros cargos',
};

function loadPublicOverrides() {
  if (!existsSync(PUBLIC_OVERRIDES_PATH)) {
    return { excluded_tse_candidate_ids: [], position_overrides: {} };
  }
  return JSON.parse(readFileSync(PUBLIC_OVERRIDES_PATH, 'utf8'));
}

function applyPublicOverrides(candidates) {
  const overrides = loadPublicOverrides();
  const excludedIds = new Set(overrides.excluded_tse_candidate_ids ?? []);
  const positionOverrides = overrides.position_overrides ?? {};

  return candidates
    .filter((candidate) => !excludedIds.has(String(candidate.tse_candidate_id ?? '')))
    .map((candidate) => {
      const override = positionOverrides[String(candidate.tse_candidate_id ?? '')];
      if (!override) return candidate;
      return {
        ...candidate,
        position: override.position ?? candidate.position,
        position_label: override.position_label ?? candidate.position_label,
      };
    });
}

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

function normalizePublicClassifier(value) {
  return toNullable(value)?.toUpperCase() ?? null;
}

function rowValue(row, ...keys) {
  for (const key of keys) {
    if (key in row) return row[key];
  }
  return undefined;
}

function inferPosition(value) {
  const normalized = ascii(toNullable(value) ?? '').toUpperCase().trim();
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

function datasetSourceManifest({ csvPath, rows, datasetKey, uf, officialUrl, createdAt }) {
  return buildDatasetSourceManifest({
    datasetKey,
    uf,
    sourceKind: 'local-file',
    sourcePath: relative(ROOT, csvPath),
    officialUrl,
    sha256: createHash('sha256').update(readFileSync(csvPath)).digest('hex'),
    rowCount: rows.length,
    createdAt,
  });
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

function buildCandidate({ fullName, party, positionValue, ballotNumberValue, tseCandidateIdValue, stateValue, ballotNameValue, genderValue, raceValue, indigenousEthnicityValue }) {
  const name = toNullable(fullName);
  const partyValue = toNullable(party);
  if (!name || !partyValue) return null;

  const position = inferPosition(positionValue);
  const ballotNumber = toNullable(ballotNumberValue);
  const tseCandidateId = toNullable(tseCandidateIdValue);

  return {
    id: stableId(name, partyValue),
    slug: stableSlug(name, tseCandidateId),
    full_name: name,
    party: partyValue,
    ballot_number: ballotNumber ? Number.parseInt(ballotNumber, 10) : null,
    position,
    position_label: POSITION_LABEL_MAP[position] ?? POSITION_LABEL_MAP.outro,
    photo_url: null,
    photo_source_url: null,
    claims: [],
    tse_candidate_id: tseCandidateId,
    registration_status: 'registration_requested',
    state: toNullable(stateValue),
    election_year: 2026,
    ballot_name: toNullable(ballotNameValue),
    gender: normalizePublicClassifier(genderValue),
    race: normalizePublicClassifier(raceValue),
    indigenous_ethnicity: toNullable(indigenousEthnicityValue),
  };
}

function candidateFromSigRow(row) {
  return buildCandidate({
    fullName: rowValue(row, 'nm_candidato'),
    party: rowValue(row, 'sg_partido'),
    positionValue: rowValue(row, 'ds_cargo'),
    ballotNumberValue: rowValue(row, 'nr_candidato'),
    tseCandidateIdValue: rowValue(row, 'sq_candidato'),
    stateValue: rowValue(row, 'sg_uf'),
    ballotNameValue: rowValue(row, 'nm_urna_candidato'),
    genderValue: rowValue(row, 'ds_genero'),
    raceValue: rowValue(row, 'ds_cor_raca'),
    indigenousEthnicityValue: rowValue(row, 'ds_etnia_indigena'),
  });
}

function candidateFromConsultaCandRow(row) {
  return buildCandidate({
    fullName: row.NM_CANDIDATO,
    party: row.SG_PARTIDO,
    positionValue: row.DS_CARGO,
    ballotNumberValue: row.NR_CANDIDATO,
    tseCandidateIdValue: row.SQ_CANDIDATO,
    stateValue: row.SG_UF,
    ballotNameValue: row.NM_URNA_CANDIDATO,
    genderValue: row.DS_GENERO,
    raceValue: row.DS_COR_RACA,
    indigenousEthnicityValue: row.DS_ETNIA_INDIGENA,
  });
}

function consultaClassifiersByTseId(datasetDir) {
  const csvPath = resolve(datasetDir, CONSULTA_CANDIDATES_FILE);
  if (!existsSync(csvPath)) return new Map();

  return new Map(
    readCsv(csvPath)
      .map((row) => [
        toNullable(row.SQ_CANDIDATO),
        {
          gender: normalizePublicClassifier(row.DS_GENERO),
          race: normalizePublicClassifier(row.DS_COR_RACA),
          indigenous_ethnicity: toNullable(row.DS_ETNIA_INDIGENA),
        },
      ])
      .filter(([tseCandidateId]) => tseCandidateId),
  );
}

function enrichPublicClassifiers(candidates, datasetDir) {
  const classifiers = consultaClassifiersByTseId(datasetDir);
  if (classifiers.size === 0) return candidates;

  return candidates.map((candidate) => {
    const classifier = classifiers.get(String(candidate.tse_candidate_id ?? ''));
    if (!classifier) return candidate;
    return {
      ...candidate,
      gender: candidate.gender ?? classifier.gender,
      race: candidate.race ?? classifier.race,
      indigenous_ethnicity: candidate.indigenous_ethnicity ?? classifier.indigenous_ethnicity,
    };
  });
}

export function generatePublicCandidateSnapshot({ datasetDir = DATASET_DIR } = {}) {
  const sigCsvPath = resolve(datasetDir, SIG_CANDIDATES_FILE);
  if (existsSync(sigCsvPath)) {
    const candidates = enrichPublicClassifiers(applyPublicOverrides(readCsv(sigCsvPath)
      .map(candidateFromSigRow)
      .filter(Boolean)), datasetDir);
    return validatePublicCandidateSnapshot(candidates);
  }

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
      const candidate = candidateFromConsultaCandRow(row);
      if (candidate) candidates.push(candidate);
    }
  }

  return validatePublicCandidateSnapshot(applyPublicOverrides(candidates));
}

export function generateTseSourceManifest({ datasetDir = DATASET_DIR, createdAt = new Date().toISOString() } = {}) {
  const sigCsvPath = resolve(datasetDir, SIG_CANDIDATES_FILE);
  const dadosAbertosCsvPath = resolve(datasetDir, DADOS_ABERTOS_CANDIDATES_FILE);
  if (existsSync(sigCsvPath)) {
    const sigRows = readCsv(sigCsvPath);
    const firstUf = toNullable(rowValue(sigRows[0] ?? {}, 'sg_uf')) ?? 'RS';
    const manifest = [
      datasetSourceManifest({
        csvPath: sigCsvPath,
        rows: sigRows,
        datasetKey: 'sig_lista_candidatos',
        uf: firstUf,
        officialUrl: TSE_SIG_CANDIDATES_URL,
        createdAt,
      }),
    ];

    if (existsSync(dadosAbertosCsvPath)) {
      const dadosAbertosRows = readCsv(dadosAbertosCsvPath);
      const dadosAbertosUf = toNullable(rowValue(dadosAbertosRows[0] ?? {}, 'UF')) ?? firstUf;
      manifest.push(
        datasetSourceManifest({
          csvPath: dadosAbertosCsvPath,
          rows: dadosAbertosRows,
          datasetKey: 'dadosabertos_candidatos',
          uf: dadosAbertosUf,
          officialUrl: TSE_DADOS_ABERTOS_CANDIDATES_URL,
          createdAt,
        }),
      );
    }

    return manifest;
  }

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
