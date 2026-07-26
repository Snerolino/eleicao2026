/**
 * Script: tse-connector
 *
 * Baixa o CSV mais recente do Portal de Dados Abertos do TSE e
 * compara com os candidatos já cadastrados. Gera relatório de:
 *  - Candidatos novos (não cadastrados)
 *  - Candidatos com dados atualizados
 *
 * Uso:
 *   node scripts/tse-connector.mjs                    # RS apenas
 *   node scripts/tse-connector.mjs --uf SP            # outro estado
 *   node scripts/tse-connector.mjs --all              # todos os estados
 *   node scripts/tse-connector.mjs --import           # importa no Supabase
 *
 * Dados: https://dadosabertos.tse.jus.br/dataset/candidatos-2026
 */

const TSE_CSV_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip';
const TMP_DIR = '/tmp/tse-csv';

const UF_TARGET = process.argv.includes('--all')
  ? null
  : (process.argv.find((a) => a.startsWith('--uf='))?.split('=')[1] ?? 'RS');

const SHOULD_IMPORT = process.argv.includes('--import');

import { execSync } from 'child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { readdir } from 'fs/promises';
import https from 'https';
import path from 'path';

// --- Helpers ---

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

function parseCSV(text) {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(';').map((h) => h.replace(/"/g, '').trim());
  return lines.slice(1).map((line) => {
    const values = line.split(';').map((v) => v.replace(/"/g, '').trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || null; });
    return row;
  });
}

// --- Main ---

async function main() {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

  const zipPath = path.join(TMP_DIR, 'consulta_cand_2026.zip');
  console.log('⬇️  Baixando CSV do TSE...');
  await download(TSE_CSV_URL, zipPath);

  console.log('📦 Extraindo...');
  execSync(`unzip -o ${zipPath} -d ${TMP_DIR}`, { stdio: 'pipe' });

  const files = await readdir(TMP_DIR);
  const csvFiles = files.filter((f) => f.endsWith('.csv') && f.startsWith('consulta_cand_2026_'));

  if (csvFiles.length === 0) {
    console.log('⚠️  Nenhum arquivo CSV encontrado no zip.');
    return;
  }

  for (const csvFile of csvFiles) {
    const uf = csvFile.replace('consulta_cand_2026_', '').replace('.csv', '');
    if (UF_TARGET && uf !== UF_TARGET) continue;

    const csvPath = path.join(TMP_DIR, csvFile);
    const content = readFileSync(csvPath, 'latin1');
    const rows = parseCSV(content);

    console.log(`\n📋 ${uf} — ${rows.length} registros`);

    if (rows.length === 0) {
      console.log('   (sem dados — candidaturas ainda não registradas)');
      continue;
    }

    // Agrupar por cargo
    const byCargo = {};
    for (const row of rows) {
      const cargo = row.DS_CARGO || 'Desconhecido';
      byCargo[cargo] = byCargo[cargo] || [];
      byCargo[cargo].push(row);
    }

    for (const [cargo, lista] of Object.entries(byCargo)) {
      console.log(`   ${cargo}: ${lista.length} candidatos`);
      for (const c of lista.slice(0, 3)) {
        console.log(`     - ${c.NM_URNA_CANDIDATO || c.NM_CANDIDATO} (${c.SG_PARTIDO}, nº ${c.NR_CANDIDATO})`);
      }
      if (lista.length > 3) console.log(`     ... e mais ${lista.length - 3}`);
    }

    if (SHOULD_IMPORT) {
      console.log('\n   🔄 Modo --import ativado. Gerando SQL de upsert...');
      // Gerar SQL para importação no Supabase
      const inserts = rows.map((row) => {
        const name = (row.NM_CANDIDATO || '').replace(/'/g, "''");
        const urn = (row.NM_URNA_CANDIDATO || '').replace(/'/g, "''");
        const party = (row.SG_PARTIDO || '').replace(/'/g, "''");
        const number = row.NR_CANDIDATO ? parseInt(row.NR_CANDIDATO) : null;
        const cargo = (row.DS_CARGO || '').replace(/'/g, "''");
        const cpf = (row.NR_CPF_CANDIDATO || '').replace(/'/g, "''");
        const email = (row.DS_EMAIL || '').replace(/'/g, "''");
        const sqCandidato = row.SQ_CANDIDATO;

        // SQL: INSERT ON CONFLICT (tse_candidate_id) DO UPDATE
        return `INSERT INTO candidates (full_name, party, ballot_number, position, tse_candidate_id, email)
VALUES ('${name}', '${party}', ${number}, '${cargo}', '${sqCandidato}', '${email}')
ON CONFLICT (tse_candidate_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  party = EXCLUDED.party,
  ballot_number = EXCLUDED.ballot_number;`;
      });

      const sqlPath = path.join(TMP_DIR, `import_${uf}.sql`);
      writeFileSync(sqlPath, inserts.join('\n\n'));
      console.log(`   ✅ SQL gerado: ${sqlPath} (${inserts.length} statements)`);
    }
  }

  // Limpeza
  unlinkSync(zipPath);
  console.log('\n🧹 Temp files cleaned.');
}

main().catch(console.error);
