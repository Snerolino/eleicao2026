/**
 * Script: generate-mockdata
 *
 * Gera src/services/mockData.ts a partir dos CSVs oficiais do TSE em ../dataset2026/
 *
 * Uso:
 *   node scripts/generate-mockdata.mjs
 *
 * Regenera todo o conteúdo de mockData.ts com base nos CSVs TSE disponíveis.
 * Se um CSV não existir, os candidatos daquela UF não são incluídos.
 * Presidentes só aparecerão quando o TSE publicar o CSV correspondente (BRASIL).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { parse } from 'csv-parse/sync';
import { v5 as uuidv5 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATASET_DIR = resolve(ROOT, '../dataset2026/candidatos');
const OUTPUT = resolve(ROOT, 'src/services/mockData.ts');

const UUID_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // standard DNS namespace

const POSITION_MAP = {
  'DEPUTADO FEDERAL': 'deputado_federal',
  'DEPUTADO ESTADUAL': 'deputado_estadual',
  'DEPUTADO DISTRITAL': 'deputado_estadual',
  'SENADOR': 'senador',
  'GOVERNADOR': 'governador',
  'VICE-GOVERNADOR': 'vice_governador',
  'PRESIDENTE': 'presidente',
};

const POSITION_LABEL_MAP = {
  presidente: 'Presidente',
  governador: 'Governador',
  vice_governador: 'Vice-Governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_estadual: 'Deputado Estadual',
};

function umlautToAscii(text) {
  return text
    .replace(/[ÀÁÂÃÄ]/g, 'A')
    .replace(/[àáâãä]/g, 'a')
    .replace(/[ÈÉÊË]/g, 'E')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ÌÍÎÏ]/g, 'I')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[ÒÓÔÕÖ]/g, 'O')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ÙÚÛÜ]/g, 'U')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[Ç]/g, 'C')
    .replace(/[ç]/g, 'c')
    .replace(/[Ñ]/g, 'N')
    .replace(/[ñ]/g, 'n');
}

function makeId(name, party) {
  const raw = `${umlautToAscii(name)}-${party}`;
  return uuidv5(raw, UUID_NAMESPACE);
}

function toNullable(val) {
  if (val == null) return null;
  const s = String(val).trim();
  if (!s || s === '#NULO' || s === '#NE' || s === '-1') return null;
  return s;
}

function inferPosition(dsCargo) {
  const raw = (toNullable(dsCargo) ?? '').toUpperCase().trim();
  return POSITION_MAP[raw] || 'outro';
}

function parseCsvFile(filePath) {
  const raw = readFileSync(filePath, 'latin1');
  return parse(raw, {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  });
}

function generateMockData() {
  const candidatesDir = resolve(DATASET_DIR, 'consulta_cand_2026');
  if (!existsSync(candidatesDir)) {
    console.log(`⚠️  ${candidatesDir} não encontrado. mockData.ts vazio será gerado.`);
    return [];
  }

  const csvFiles = readdirSync(candidatesDir)
    .filter((f) => f.endsWith('.csv') && /consulta_cand_2026_/.test(f))
    .sort();

  const allCandidates = [];

  for (const csvFile of csvFiles) {
    const csvPath = resolve(candidatesDir, csvFile);
    const rows = parseCsvFile(csvPath);

    console.log(`   ${csvFile}: ${rows.length} registros`);

    for (const row of rows) {
      const fullName = toNullable(row.NM_CANDIDATO);
      const ballotName = toNullable(row.NM_URNA_CANDIDATO);
      const party = toNullable(row.SG_PARTIDO);
      const ballotNumber = toNullable(row.NR_CANDIDATO);
      const dsCargo = toNullable(row.DS_CARGO);

      if (!fullName || !party) continue;

      const position = inferPosition(dsCargo);

      allCandidates.push({
        id: makeId(fullName, party),
        full_name: fullName,
        party,
        ballot_number: ballotNumber ? parseInt(ballotNumber, 10) : null,
        position,
        position_label: POSITION_LABEL_MAP[position] || dsCargo || 'Outro cargo',
        photo_url: null,
        photo_source_url: null,
        claims: [],
        tse_candidate_id: toNullable(row.SQ_CANDIDATO),
        registration_status: 'registration_requested',
        state: toNullable(row.SG_UF),
        election_year: 2026,
        ballot_name: ballotName,
      });
    }
  }

  return allCandidates;
}

function renderTs(candidates) {
  const generatedAt = new Date().toISOString();

  return `// ⚠️ ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITE MANUALMENTE
// Gerado por: scripts/generate-mockdata.mjs
// Fonte: ../dataset2026/candidatos/consulta_cand_2026/
// Data: ${generatedAt}
// Total: ${candidates.length} candidatos

import type { CandidateWithClaims } from '@/types/election';

export const MOCK_CANDIDATES: CandidateWithClaims[] = ${JSON.stringify(candidates, null, 2).replace(/"([^"]+)":/g, '$1:')};
`;
}

function main() {
  console.log('🔄 Gerando mockData.ts do dataset TSE 2026...');
  console.log(`   Dataset: ${DATASET_DIR}`);

  const candidates = generateMockData();

  const ts = renderTs(candidates);
  writeFileSync(OUTPUT, ts, 'utf-8');

  console.log(`\n✅ mockData.ts gerado: ${OUTPUT}`);
  console.log(`   ${candidates.length} candidatos`);
}

main();