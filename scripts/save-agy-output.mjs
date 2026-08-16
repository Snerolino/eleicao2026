#!/usr/bin/env node
/**
 * Salva o output do agy em block-<N>-output.json (idempotente).
 * Uso: node scripts/save-agy-output.mjs <N>
 * Requer: HERMES_REAL_HOME=/home/lourenco timeout ... bash scripts/orchestrator/run-antigravity.sh "$(cat prompt.txt)" > raw.txt 2> err.txt
 *         node scripts/save-agy-output.mjs N
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOCKS_DIR = resolve(ROOT, '.orchestrator', 'runtime', 'blocks');
const RAW_FILE = resolve(BLOCKS_DIR, process.argv[2] || 'block-0-raw.txt');
const OUTPUT_FILE = resolve(BLOCKS_DIR, process.argv[2] ? `block-${process.argv[2]}-output.json` : 'block-0-output.json');

const raw = readFileSync(RAW_FILE, 'utf-8');

// Extrai o JSON do output do agy
// O agy pode retornar markdown ou texto livre. Tenta achar o array JSON.
let jsonStr = raw;
// Remove markdown fences se presentes
jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

try {
  const data = JSON.parse(jsonStr);
  if (Array.isArray(data)) {
    writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Salvado ${data.length} claims em ${OUTPUT_FILE}`);
    console.log(`📊 Resumo:`);
    for (const item of data) {
      const slug = item.slug || 'N/A';
      const hasHistorico = !!item.historico_politico;
      const hasPlataforma = !!item.plataforma;
      const hasReputacao = !!item.reputacao;
      const hasScrutiny = !!item.votacao_scrutiny;
      const total = [hasHistorico, hasPlataforma, hasReputacao, hasScrutiny].filter(Boolean).length;
      console.log(`  ${slug}: ${total} claims (${hasHistorico ? 'hist' : ''}${hasPlataforma ? '+plat' : ''}${hasReputacao ? '+rep' : ''}${hasScrutiny ? '+scr' : ''})`);
    }
  } else {
    console.error('❌ Output não é um array JSON válido');
    process.exit(1);
  }
} catch (e) {
  console.error('❌ JSON inválido:', e.message);
  console.error('Raw (primeiros 500 chars):', raw.slice(0, 500));
  process.exit(1);
}