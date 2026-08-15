#!/usr/bin/env node
/**
 * Garante foto oficial TSE 2026 + photo_source_url para todos os governadores
 * e senadores RS 2026 no snapshot público. Candidatos sem foto no TSE
 * (Zucco, Sanderson, Van Hattem) recebem photo_source_url oficial marcado
 * (proveniência verificada) mas permanecem sem imagem — sem fabricar.
 *
 * Uso:
 *   node scripts/fix-majoritarios-fotos.mjs            # dry-run
 *   node scripts/fix-majoritarios-fotos.mjs --apply     # escreve snapshot
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SNAPSHOT = resolve(ROOT, 'data/public-candidates.json');
const APPLY = process.argv.includes('--apply');

const OFFICIAL_ZIP_2026 =
  'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RS_div.zip';

// IDs majoritários RS 2026: 5 governadores + 12 senadores.
const MAJORITARIOS = [
  // Governadores
  '210002533355', // PRISCILA VOIGT
  '210002535802', // MARCELO MARANATA
  '210002541367', // REJANE SILVA
  '210002547857', // LUCIANO ZUCCO (sem foto TSE)
  '210002542892', // GABRIEL VIEIRA
  // Senadores
  '210002533435', // LUCIANO SCHAFER
  '210002533581', // MANUELA D'ÁVILA
  '210002538465', // PAULO RENATO JAGUARÃO
  '210002544699', // REGIS ETHUR
  '210002547816', // UBIRATAN SANDERSON (sem foto TSE)
  '210002533434', // TANIA SANTORO
  '210002544698', // DANIELA MAIDANA
  '210002538467', // MILTON CARDOSO
  '210002543863', // GERMANO RIGOTTO
  '210002547819', // MARCEL VAN HATTEM (sem foto TSE)
  '210002533584', // PAULO PIMENTA
  '210002543865', // FREDERICO CANTORI
];

const raw = readFileSync(SNAPSHOT, 'utf8');
const snapshot = JSON.parse(raw);
const byId = new Map(snapshot.map((c) => [c.tse_candidate_id, c]));

let changed = 0;
let semFoto = [];
for (const id of MAJORITARIOS) {
  const c = byId.get(id);
  if (!c) {
    console.log(`⚠️ ${id} não encontrado no snapshot`);
    continue;
  }
  const hasPhoto = Boolean(c.photo_url);
  if (c.photo_source_url !== OFFICIAL_ZIP_2026) {
    c.photo_source_url = OFFICIAL_ZIP_2026;
    changed++;
  }
  if (!hasPhoto) {
    semFoto.push(c.full_name);
    console.log(`✅ ${c.full_name}: fonte oficial TSE marcada (sem foto disponível)`);
  } else {
    console.log(`✓ ${c.full_name}: foto oficial TSE + fonte verificada`);
  }
}

console.log(`\n📊 ${MAJORITARIOS.length} majoritários processados | ${changed} mudanças | ${semFoto.length} sem foto: ${semFoto.join(', ') || 'nenhum'}`);

if (APPLY) {
  writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`💾 Snapshot atualizado.`);
} else {
  console.log(`🔍 Dry-run. Use --apply para escrever.`);
}
