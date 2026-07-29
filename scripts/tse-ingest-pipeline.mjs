/**
 * Script: tse-ingest-pipeline
 *
 * Pipeline de ingestão TSE 2026 usando PRIORITARIAMENTE o espelho local em ../dataset2026.
 * Se o espelho local não existir, pode baixar os ZIPs oficiais do TSE com --download-missing.
 *
 * Fluxo:
 *   mirror local/ZIP oficial -> preservar original -> SHA-256 -> parse robusto CSV -> staging -> relatório
 *
 * Uso:
 *   node scripts/tse-ingest-pipeline.mjs --uf=RS --dry-run
 *   node scripts/tse-ingest-pipeline.mjs --uf=RS --import
 *   node scripts/tse-ingest-pipeline.mjs --all --dry-run
 *   node scripts/tse-ingest-pipeline.mjs --uf=RS --import --download-missing
 */

import { execSync } from 'child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import https from 'https';
import path from 'path';
import crypto from 'crypto';
import { parse } from 'csv-parse/sync';

const ROOT_DIR = process.cwd();
const LOCAL_DATASET_DIR = path.resolve(ROOT_DIR, '../dataset2026/candidatos');
const ARCHIVE_DIR = path.resolve(ROOT_DIR, 'data/tse-archive/2026');
const TMP_DIR = '/tmp/tse-ingest-2026';

const DOWNLOAD_MISSING = process.argv.includes('--download-missing');
const SHOULD_IMPORT = process.argv.includes('--import');
const DRY_RUN = process.argv.includes('--dry-run') || !SHOULD_IMPORT;
const ALL_UFS = process.argv.includes('--all');
const UF_TARGET = process.argv.find((a) => a.startsWith('--uf='))?.split('=')[1] ?? 'RS';
const UFS = ALL_UFS
  ? ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO', 'BR', 'BRASIL']
  : [UF_TARGET];

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Defina VITE_SUPABASE_URL');
  process.exit(1);
}

if (!ANON_KEY) {
  console.error('❌ Defina VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (!DRY_RUN && !SERVICE_KEY) {
  console.error('❌ Defina SUPABASE_SERVICE_ROLE_KEY para usar --import');
  process.exit(1);
}

const DATASETS = {
  consulta_cand: {
    folder: 'consulta_cand_2026',
    zip: 'consulta_cand_2026.zip',
    url: 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip',
  },
  consulta_cand_complementar: {
    folder: 'consulta_cand_complementar_2026',
    zip: 'consulta_cand_complementar_2026.zip',
    url: 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand_complementar/consulta_cand_complementar_2026.zip',
  },
  consulta_coligacao: {
    folder: 'consulta_coligacao_2026',
    zip: 'consulta_coligacao_2026.zip',
    url: 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_coligacao/consulta_coligacao_2026.zip',
  },
  consulta_vagas: {
    folder: 'consulta_vagas_2026',
    zip: 'consulta_vagas_2026.zip',
    url: 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_vagas/consulta_vagas_2026.zip',
  },
};

function log(msg = '') {
  console.log(msg);
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function toNullable(value) {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === '#NULO' || trimmed === '#NE' || trimmed === '-1') return null;
  return trimmed;
}

function toInt(value) {
  const v = toNullable(value);
  if (v == null) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function toNumeric(value) {
  const v = toNullable(value);
  if (v == null) return null;
  const n = Number.parseFloat(v.replace('.', '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function toBool(value) {
  const v = toNullable(value);
  if (v == null) return null;
  return ['S', 'SIM', 'TRUE', 'T', '1'].includes(v.toUpperCase());
}

function toIsoDateBR(value) {
  const v = toNullable(value);
  if (v == null) return null;
  const match = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

function sha256File(filePath) {
  const content = readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function sha256Text(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

function parseCsvFile(filePath) {
  const content = readFileSync(filePath, 'latin1');
  return parse(content, {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  });
}

function inferPosition(dsCargo) {
  const value = (toNullable(dsCargo) ?? '').toLowerCase();
  if (value === 'governador') return 'governador';
  if (value === 'vice-governador') return 'vice_governador';
  if (value === 'senador') return 'senador';
  if (value === 'deputado federal') return 'deputado_federal';
  if (value === 'deputado estadual' || value === 'deputado distrital') return 'deputado_estadual';
  if (value === 'presidente') return 'presidente';
  return value.replace(/\s+/g, '_') || 'outro';
}

function inferRegistrationStatus(value) {
  const raw = (toNullable(value) ?? '').toLowerCase();
  if (!raw || raw === 'não divulgável') return 'pre_candidate';
  if (raw.includes('deferido')) return 'approved';
  if (raw.includes('indeferido')) return 'denied';
  if (raw.includes('renúncia') || raw.includes('renuncia')) return 'withdrawn';
  if (raw.includes('substitu')) return 'replaced';
  if (raw.includes('cancel')) return 'cancelled';
  if (raw.includes('recurso')) return 'appeal_pending';
  if (raw.includes('registr')) return 'registered';
  return 'registration_requested';
}

async function supabaseFetch(method, restPath, body, preferMinimal = false) {
  const token = method === 'GET' ? ANON_KEY : SERVICE_KEY;
  if (!token) {
    throw new Error(`Token ausente para ${method} ${restPath}`);
  }
  const url = `${SUPABASE_URL}/rest/v1${restPath}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: token,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: preferMinimal ? 'return=minimal' : 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${method} ${restPath} -> ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

function localDatasetPath(datasetKey) {
  return path.join(LOCAL_DATASET_DIR, DATASETS[datasetKey].folder);
}

function localZipPath(datasetKey) {
  return path.join(LOCAL_DATASET_DIR, DATASETS[datasetKey].zip);
}

async function ensureDatasetAvailable(datasetKey, runDir) {
  const localDir = localDatasetPath(datasetKey);
  if (existsSync(localDir)) {
    return { source: 'local-dir', dir: localDir, zipPath: existsSync(localZipPath(datasetKey)) ? localZipPath(datasetKey) : null };
  }

  const localZip = localZipPath(datasetKey);
  if (existsSync(localZip)) {
    const extractDir = path.join(runDir, DATASETS[datasetKey].folder);
    ensureDir(extractDir);
    execSync(`unzip -o "${localZip}" -d "${extractDir}"`, { stdio: 'pipe' });
    return { source: 'local-zip', dir: extractDir, zipPath: localZip };
  }

  if (!DOWNLOAD_MISSING) {
    throw new Error(`Dataset ${datasetKey} não encontrado em ${LOCAL_DATASET_DIR}. Use --download-missing para baixar do TSE.`);
  }

  const zipPath = path.join(runDir, DATASETS[datasetKey].zip);
  const extractDir = path.join(runDir, DATASETS[datasetKey].folder);
  ensureDir(extractDir);
  log(`⬇️  Baixando ${datasetKey} do TSE...`);
  await download(DATASETS[datasetKey].url, zipPath);
  execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: 'pipe' });
  return { source: 'download', dir: extractDir, zipPath };
}

function matchingCsvFiles(dir, uf) {
  return readdirSync(dir)
    .filter((file) => file.endsWith(`_${uf}.csv`) || file.endsWith(`_${uf.toUpperCase()}.csv`))
    .map((file) => path.join(dir, file));
}

function buildCandidateStagingRows(rows, sourceFile, fileHash) {
  return rows.map((row) => ({
    sq_candidato: toNullable(row.SQ_CANDIDATO),
    dt_geracao: toIsoDateBR(row.DT_GERACAO),
    hh_geracao: toNullable(row.HH_GERACAO),
    ano_eleicao: toInt(row.ANO_ELEICAO) ?? 2026,
    cd_tipo_eleicao: toInt(row.CD_TIPO_ELEICAO),
    nm_tipo_eleicao: toNullable(row.NM_TIPO_ELEICAO),
    nr_turno: toInt(row.NR_TURNO),
    cd_eleicao: toInt(row.CD_ELEICAO),
    ds_eleicao: toNullable(row.DS_ELEICAO),
    dt_eleicao: toIsoDateBR(row.DT_ELEICAO),
    tp_abrangencia: toNullable(row.TP_ABRANGENCIA),
    sg_uf: toNullable(row.SG_UF),
    sg_ue: toNullable(row.SG_UE),
    nm_ue: toNullable(row.NM_UE),
    cd_cargo: toInt(row.CD_CARGO),
    ds_cargo: toNullable(row.DS_CARGO),
    nr_candidato: toInt(row.NR_CANDIDATO),
    nm_candidato: toNullable(row.NM_CANDIDATO),
    nm_urna_candidato: toNullable(row.NM_URNA_CANDIDATO),
    nm_social_candidato: toNullable(row.NM_SOCIAL_CANDIDATO),
    nr_cpf_candidato: null,
    ds_email: null,
    cd_situacao_candidatura: toInt(row.CD_SITUACAO_CANDIDATURA),
    ds_situacao_candidatura: toNullable(row.DS_SITUACAO_CANDIDATURA),
    tp_agremiacao: toNullable(row.TP_AGREMIACAO),
    nr_partido: toInt(row.NR_PARTIDO),
    sg_partido: toNullable(row.SG_PARTIDO),
    nm_partido: toNullable(row.NM_PARTIDO),
    nr_federacao: toInt(row.NR_FEDERACAO),
    nm_federacao: toNullable(row.NM_FEDERACAO),
    sg_federacao: toNullable(row.SG_FEDERACAO),
    ds_composicao_federacao: toNullable(row.DS_COMPOSICAO_FEDERACAO),
    sq_coligacao: toInt(row.SQ_COLIGACAO),
    nm_coligacao: toNullable(row.NM_COLIGACAO),
    ds_composicao_coligacao: toNullable(row.DS_COMPOSICAO_COLIGACAO),
    sg_uf_nascimento: toNullable(row.SG_UF_NASCIMENTO),
    dt_nascimento: toIsoDateBR(row.DT_NASCIMENTO),
    nr_titulo_eleitoral_candidato: null,
    cd_genero: toInt(row.CD_GENERO),
    ds_genero: toNullable(row.DS_GENERO),
    cd_grau_instrucao: toInt(row.CD_GRAU_INSTRUCAO),
    ds_grau_instrucao: toNullable(row.DS_GRAU_INSTRUCAO),
    cd_estado_civil: toInt(row.CD_ESTADO_CIVIL),
    ds_estado_civil: toNullable(row.DS_ESTADO_CIVIL),
    cd_cor_raca: toInt(row.CD_COR_RACA),
    ds_cor_raca: toNullable(row.DS_COR_RACA),
    cd_ocupacao: toInt(row.CD_OCUPACAO),
    ds_ocupacao: toNullable(row.DS_OCUPACAO),
    cd_sit_tot_turno: toInt(row.CD_SIT_TOT_TURNO),
    ds_sit_tot_turno: toNullable(row.DS_SIT_TOT_TURNO),
    source_file: sourceFile,
    raw_hash: sha256Text(JSON.stringify(row)),
    imported_at: new Date().toISOString(),
    source_dataset_hash: fileHash,
  }));
}

function buildComplementarRows(rows, sourceFile) {
  return rows.map((row) => ({
    dt_geracao: toIsoDateBR(row.DT_GERACAO),
    hh_geracao: toNullable(row.HH_GERACAO),
    ano_eleicao: toInt(row.ANO_ELEICAO) ?? 2026,
    cd_eleicao: toInt(row.CD_ELEICAO),
    sq_candidato: toNullable(row.SQ_CANDIDATO),
    cd_detalhe_situacao_cand: toInt(row.CD_DETALHE_SITUACAO_CAND),
    ds_detalhe_situacao_cand: toNullable(row.DS_DETALHE_SITUACAO_CAND),
    cd_nacionalidade: toInt(row.CD_NACIONALIDADE),
    ds_nacionalidade: toNullable(row.DS_NACIONALIDADE),
    cd_municipio_nascimento: toInt(row.CD_MUNICIPIO_NASCIMENTO),
    nm_municipio_nascimento: toNullable(row.NM_MUNICIPIO_NASCIMENTO),
    nr_idade_data_posse: toInt(row.NR_IDADE_DATA_POSSE),
    st_quilombola: toBool(row.ST_QUILOMBOLA),
    cd_etnia_indigena: toInt(row.CD_ETNIA_INDIGENA),
    ds_etnia_indigena: toNullable(row.DS_ETNIA_INDIGENA),
    vr_despesa_max_campanha: toNumeric(row.VR_DESPESA_MAX_CAMPANHA),
    st_reeleicao: toBool(row.ST_REELEICAO),
    st_declarar_bens: toBool(row.ST_DECLARAR_BENS),
    nr_protocolo_candidatura: toNullable(row.NR_PROTOCOLO_CANDIDATURA),
    nr_processo: toNullable(row.NR_PROCESSO),
    cd_situacao_candidato_pleito: toInt(row.CD_SITUACAO_CANDIDATO_PLEITO),
    ds_situacao_candidato_pleito: toNullable(row.DS_SITUACAO_CANDIDATO_PLEITO),
    cd_situacao_candidato_urna: toInt(row.CD_SITUACAO_CANDIDATO_URNA),
    ds_situacao_candidato_urna: toNullable(row.DS_SITUACAO_CANDIDATO_URNA),
    st_candidato_inserido_urna: toBool(row.ST_CANDIDATO_INSERIDO_URNA),
    nm_tipo_destinacao_votos: toNullable(row.NM_TIPO_DESTINACAO_VOTOS),
    cd_situacao_candidato_tot: toInt(row.CD_SITUACAO_CANDIDATO_TOT),
    ds_situacao_candidato_tot: toNullable(row.DS_SITUACAO_CANDIDATO_TOT),
    st_prest_contas: toBool(row.ST_PREST_CONTAS),
    st_substituido: toBool(row.ST_SUBSTITUIDO),
    sq_substituido: toNullable(row.SQ_SUBSTITUIDO),
    sq_ordem_suplencia: toInt(row.SQ_ORDEM_SUPLENCIA),
    dt_aceite_candidatura: toIsoDateBR(row.DT_ACEITE_CANDIDATURA),
    cd_situacao_julgamento: toInt(row.CD_SITUACAO_JULGAMENTO),
    ds_situacao_julgamento: toNullable(row.DS_SITUACAO_JULGAMENTO),
    cd_situacao_julgamento_pleito: toInt(row.CD_SITUACAO_JULGAMENTO_PLEITO),
    ds_situacao_julgamento_pleito: toNullable(row.DS_SITUACAO_JULGAMENTO_PLEITO),
    cd_situacao_julgamento_urna: toInt(row.CD_SITUACAO_JULGAMENTO_URNA),
    ds_situacao_julgamento_urna: toNullable(row.DS_SITUACAO_JULGAMENTO_URNA),
    cd_situacao_cassacao: toInt(row.CD_SITUACAO_CASSACAO),
    ds_situacao_cassacao: toNullable(row.DS_SITUACAO_CASSACAO),
    cd_situacao_cassacao_midia: toInt(row.CD_SITUACAO_CASSACAO_MIDIA),
    ds_situacao_cassacao_midia: toNullable(row.DS_SITUACAO_CASSACAO_MIDIA),
    cd_situacao_diploma: toInt(row.CD_SITUACAO_DIPLOMA),
    ds_situacao_diploma: toNullable(row.DS_SITUACAO_DIPLOMA),
    cd_genero_fefc: toInt(row.CD_GENERO_FEFC),
    ds_genero_fefc: toNullable(row.DS_GENERO_FEFC),
    cd_cor_raca_fefc: toInt(row.CD_COR_RACA_FEFC),
    ds_cor_raca_fefc: toNullable(row.DS_COR_RACA_FEFC),
    source_file: sourceFile,
    imported_at: new Date().toISOString(),
  }));
}

function buildColigacaoRows(rows, sourceFile) {
  return rows.map((row) => ({
    dt_geracao: toIsoDateBR(row.DT_GERACAO),
    hh_geracao: toNullable(row.HH_GERACAO),
    ano_eleicao: toInt(row.ANO_ELEICAO) ?? 2026,
    cd_tipo_eleicao: toInt(row.CD_TIPO_ELEICAO),
    nm_tipo_eleicao: toNullable(row.NM_TIPO_ELEICAO),
    nr_turno: toInt(row.NR_TURNO),
    cd_eleicao: toInt(row.CD_ELEICAO),
    ds_eleicao: toNullable(row.DS_ELEICAO),
    dt_eleicao: toIsoDateBR(row.DT_ELEICAO),
    sg_uf: toNullable(row.SG_UF),
    sg_ue: toNullable(row.SG_UE),
    nm_ue: toNullable(row.NM_UE),
    cd_cargo: toInt(row.CD_CARGO),
    ds_cargo: toNullable(row.DS_CARGO),
    tp_agremiacao: toNullable(row.TP_AGREMIACAO),
    nr_partido: toInt(row.NR_PARTIDO),
    sg_partido: toNullable(row.SG_PARTIDO),
    nm_partido: toNullable(row.NM_PARTIDO),
    nr_federacao: toInt(row.NR_FEDERACAO),
    nm_federacao: toNullable(row.NM_FEDERACAO),
    sg_federacao: toNullable(row.SG_FEDERACAO),
    ds_composicao_federacao: toNullable(row.DS_COMPOSICAO_FEDERACAO),
    sq_coligacao: toInt(row.SQ_COLIGACAO),
    nm_coligacao: toNullable(row.NM_COLIGACAO),
    ds_composicao_coligacao: toNullable(row.DS_COMPOSICAO_COLIGACAO),
    cd_situacao_legenda: toInt(row.CD_SITUACAO_LEGENDA),
    ds_situacao: toNullable(row.DS_SITUACAO),
    nm_tipo_destinacao_votos: toNullable(row.NM_TIPO_DESTINACAO_VOTOS),
    source_file: sourceFile,
    imported_at: new Date().toISOString(),
  }));
}

function buildVagasRows(rows, sourceFile) {
  return rows.map((row) => ({
    dt_geracao: toIsoDateBR(row.DT_GERACAO),
    hh_geracao: toNullable(row.HH_GERACAO),
    ano_eleicao: toInt(row.ANO_ELEICAO) ?? 2026,
    cd_tipo_eleicao: toInt(row.CD_TIPO_ELEICAO),
    nm_tipo_eleicao: toNullable(row.NM_TIPO_ELEICAO),
    nr_turno: toInt(row.NR_TURNO),
    cd_eleicao: toInt(row.CD_ELEICAO),
    ds_eleicao: toNullable(row.DS_ELEICAO),
    dt_eleicao: toIsoDateBR(row.DT_ELEICAO),
    tp_abrangencia: toNullable(row.TP_ABRANGENCIA),
    sg_uf: toNullable(row.SG_UF),
    sg_ue: toNullable(row.SG_UE),
    nm_ue: toNullable(row.NM_UE),
    cd_cargo: toInt(row.CD_CARGO),
    ds_cargo: toNullable(row.DS_CARGO),
    qt_vagas: toInt(row.QT_VAGAS),
    source_file: sourceFile,
    imported_at: new Date().toISOString(),
  }));
}

async function insertInBatches(restPath, rows, batchSize = 500) {
  for (let i = 0; i < rows.length; i += batchSize) {
    await supabaseFetch('POST', restPath, rows.slice(i, i + batchSize), true);
  }
}

async function buildDiffReport(uf, stagingRows) {
  const existing = await supabaseFetch('GET', `/candidates?select=id,full_name,party,ballot_number,position,tse_candidate_id&limit=5000`);
  const existingBySq = new Map(existing.filter((c) => c.tse_candidate_id).map((c) => [String(c.tse_candidate_id), c]));

  const report = {
    uf,
    created_at: new Date().toISOString(),
    totals: {
      staging: stagingRows.length,
      production: existing.length,
    },
    novos: [],
    atualizados: [],
    inalterados: 0,
  };

  for (const row of stagingRows) {
    const sq = row.sq_candidato;
    if (!sq) continue;
    const found = existingBySq.get(String(sq));
    const normalizedPosition = inferPosition(row.ds_cargo);
    if (!found) {
      report.novos.push({
        sq_candidato: sq,
        full_name: row.nm_candidato,
        ballot_name: row.nm_urna_candidato,
        party: row.sg_partido,
        ballot_number: row.nr_candidato,
        position: normalizedPosition,
        registration_status: inferRegistrationStatus(row.ds_situacao_candidatura),
      });
      continue;
    }

    const changed =
      found.full_name !== row.nm_candidato ||
      found.party !== row.sg_partido ||
      found.ballot_number !== row.nr_candidato ||
      found.position !== normalizedPosition;

    if (changed) {
      report.atualizados.push({
        sq_candidato: sq,
        antes: found,
        depois: {
          full_name: row.nm_candidato,
          party: row.sg_partido,
          ballot_number: row.nr_candidato,
          position: normalizedPosition,
        },
      });
    } else {
      report.inalterados += 1;
    }
  }

  return report;
}

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const runDir = path.join(TMP_DIR, `run-${timestamp}`);
  ensureDir(runDir);
  ensureDir(ARCHIVE_DIR);

  log(`🚀 TSE ingest 2026`);
  log(`   Fonte prioritária: ${LOCAL_DATASET_DIR}`);
  log(`   UFs: ${UFS.join(', ')}`);
  log(`   Modo: ${DRY_RUN ? 'DRY-RUN' : 'IMPORT'}`);
  log(`   Run dir: ${runDir}`);
  log();

  const available = {};
  for (const key of Object.keys(DATASETS)) {
    const info = await ensureDatasetAvailable(key, runDir);
    available[key] = info;
    log(`📦 ${key}: ${info.source} -> ${info.dir}`);
    if (info.zipPath && existsSync(info.zipPath)) {
      const archiveName = `${timestamp}_${path.basename(info.zipPath)}`;
      execSync(`cp "${info.zipPath}" "${path.join(ARCHIVE_DIR, archiveName)}"`);
    }
  }

  for (const uf of UFS) {
    log();
    log(`📋 UF ${uf}`);

    const candFiles = matchingCsvFiles(available.consulta_cand.dir, uf);
    if (candFiles.length === 0) {
      log(`   ⚠️  sem consulta_cand para ${uf}`);
      continue;
    }

    for (const filePath of candFiles) {
      const rows = parseCsvFile(filePath);
      const fileHash = sha256File(filePath);
      const sourceFile = path.basename(filePath);
      const stagingRows = buildCandidateStagingRows(rows, sourceFile, fileHash);
      log(`   candidatos: ${sourceFile} -> ${stagingRows.length} linhas`);

      const report = await buildDiffReport(uf, stagingRows);
      const reportPath = path.join(runDir, `report-${sourceFile}.json`);
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      log(`   relatório: ${reportPath}`);
      log(`   diff: novos=${report.novos.length} atualizados=${report.atualizados.length} inalterados=${report.inalterados}`);

      if (!DRY_RUN && stagingRows.length > 0) {
        await insertInBatches('/tse_candidates_staging', stagingRows);
      }
    }

    const compFiles = matchingCsvFiles(available.consulta_cand_complementar.dir, uf);
    for (const filePath of compFiles) {
      const rows = buildComplementarRows(parseCsvFile(filePath), path.basename(filePath));
      log(`   complementar: ${path.basename(filePath)} -> ${rows.length} linhas`);
      if (!DRY_RUN && rows.length > 0) await insertInBatches('/tse_candidates_complementar_staging', rows);
    }

    const colFiles = matchingCsvFiles(available.consulta_coligacao.dir, uf);
    for (const filePath of colFiles) {
      const rows = buildColigacaoRows(parseCsvFile(filePath), path.basename(filePath));
      log(`   coligação: ${path.basename(filePath)} -> ${rows.length} linhas`);
      if (!DRY_RUN && rows.length > 0) await insertInBatches('/tse_coligacoes_staging', rows);
    }

    const vagasFiles = matchingCsvFiles(available.consulta_vagas.dir, uf);
    for (const filePath of vagasFiles) {
      const rows = buildVagasRows(parseCsvFile(filePath), path.basename(filePath));
      log(`   vagas: ${path.basename(filePath)} -> ${rows.length} linhas`);
      if (!DRY_RUN && rows.length > 0) await insertInBatches('/tse_vagas_staging', rows);
    }
  }

  log();
  log(`✅ Pipeline pronta`);
  log(`   arquivos e relatórios: ${runDir}`);
  if (DRY_RUN) log('   nenhum write no banco (dry-run)');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});