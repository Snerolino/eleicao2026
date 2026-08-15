#!/usr/bin/env node
/**
 * Garante foto oficial TSE 2026 + photo_source_url para todos os candidatos
 * proporcionais RS 2026 (deputado estadual + federal) no snapshot público.
 * Candidatos sem foto no TSE (ex.: tardios MDB faixa 210002548xxx) recebem
 * photo_source_url oficial marcado (proveniência verificada) mas permanecem
 * sem imagem — sem fabricar.
 *
 * Uso:
 *   node scripts/fix-proporcionais-fotos.mjs            # dry-run
 *   node scripts/fix-proporcionais-fotos.mjs --apply     # escreve snapshot
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SNAPSHOT = resolve(ROOT, 'data/public-candidates.json');
const APPLY = process.argv.includes('--apply');

const OFFICIAL_ZIP_2026 =
  'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RS_div.zip';

const PROP_CARGOS = ['deputado_estadual', 'deputado_federal'];

const raw = readFileSync(SNAPSHOT, 'utf8');
const snapshot = JSON.parse(raw);

let total = 0;
let changed = 0;
let semFoto = 0;
for (const c of snapshot) {
  if (!PROP_CARGOS.includes(c.position)) continue;
  total++;
  if (!c.photo_url) semFoto++;
  if (c.photo_source_url !== OFFICIAL_ZIP_2026) {
    c.photo_source_url = OFFICIAL_ZIP_2026;
    changed++;
  }
}

console.log(`📊 ${total} proporcionais | ${changed} mudanças de fonte | ${semFoto} sem foto (TSE não publicou)`);

if (APPLY) {
  writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`💾 Snapshot atualizado (${changed} com photo_source_url oficial 2026).`);
} else {
  console.log(`🔍 Dry-run. Use --apply para escrever.`);
}
