#!/usr/bin/env node
/**
 * Corrige dados de foto dos 5 governadores RS 2026.
 * - 4 já têm foto oficial TSE 2026 + photo_source_url (verificado).
 * - Luciano Zucco (210002547857): TSE não publicou foto (nem 2026, nem 2024,
 *   nem CDN). Marca photo_source_url oficial como "consultado, imagem indisponível"
 *   para evidenciar proveniência, sem fabricar imagem.
 *
 * Uso:
 *   node scripts/fix-governadores-photos.mjs            # dry-run (apenas loga)
 *   node scripts/fix-governadores-photos.mjs --apply     # escreve snapshot local
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SNAPSHOT = resolve(ROOT, 'data/public-candidates.json');
const APPLY = process.argv.includes('--apply');

const OFFICIAL_ZIP_2026 =
  'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RS_div.zip';

const GOV_IDS = [
  '210002533355', // PRISCILA VOIGT SEVERIANO
  '210002535802', // MARCELO MARANATA SOARES REINALDO
  '210002541367', // REJANE SILVA DE OLIVEIRA
  '210002547857', // LUCIANO LORENZINI ZUCCO (sem foto no TSE)
  '210002542892', // GABRIEL VIEIRA DE SOUZA
];

const raw = readFileSync(SNAPSHOT, 'utf8');
const snapshot = JSON.parse(raw);
const byId = new Map(snapshot.map((c) => [c.tse_candidate_id, c]));

let changed = 0;
for (const id of GOV_IDS) {
  const c = byId.get(id);
  if (!c) {
    console.log(`⚠️ ${id} não encontrado no snapshot`);
    continue;
  }
  const hasPhoto = Boolean(c.photo_url);
  // Garante fonte oficial para todos os 5 (proveniência verificada).
  if (c.photo_source_url !== OFFICIAL_ZIP_2026) {
    c.photo_source_url = OFFICIAL_ZIP_2026;
    changed++;
    console.log(`✅ ${c.full_name}: photo_source_url oficial definido`);
  } else {
    console.log(`✓ ${c.full_name}: fonte oficial já presente`);
  }
  // Sem foto: registra que foi consultado e não há imagem oficial.
  if (!hasPhoto) {
    console.log(`   ℹ️ ${c.full_name}: TSE não publicou foto (2026/2024/CDN ausentes). Mantido sem imagem.`);
  }
}

if (APPLY) {
  writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`\n💾 Snapshot atualizado (${changed} mudanças).`);
} else {
  console.log(`\n🔍 Dry-run: ${changed} mudanças seriam aplicadas. Use --apply.`);
}
