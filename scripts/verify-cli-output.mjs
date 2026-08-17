#!/usr/bin/env node
/**
 * verify-cli-output.mjs — Verificador CLI genérico, fail-closed (REGRA ABSOLUTA).
 *
 * Audita claims publicados e verifica que NENHUM dado é exibido sem fonte visível.
 * NÃO culpa AGY: relatório baseado em evidências com códigos de camada.
 *
 * Códigos de saída:  0=approved  10=empty/invalid  30=source missing  40=contract
 *
 * Uso:
 *   node scripts/verify-cli-output.mjs                    # verifica snapshot público JSON
 *   node scripts/verify-cli-output.mjs --live             # verifica claims published no Supabase (fonte de verdade ativa)
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const useLive = process.argv.includes('--live');

// ---- Snapshot JSON (public-candidates) ----
function verifyLocal() {
  const file = resolve(__dirname, '../data/public-candidates.json');
  if (!existsSync(file)) {
    console.error(`[FAIL-40] Snapshot não encontrado: ${file}`);
    process.exit(40);
  }
  let data;
  try { data = JSON.parse(readFileSync(file, 'utf-8')); } catch {
    console.error(`[FAIL-40] JSON inválido: ${file}`);
    process.exit(40);
  }
  if (!Array.isArray(data) || data.length === 0) {
    console.error('[FAIL-10] Envelope vazio.'); process.exit(10);
  }
  // claims não carregados inline no snapshot (carregados via API no runtime) — valida contrato
  let broken = 0;
  for (const c of data) {
    if (!c || !c.tse_candidate_id) broken++;
  }
  if (broken) { console.error(`[FAIL-40] ${broken} registros sem tse_candidate_id.`); process.exit(40); }
  console.log(`[OK-0] Snapshot aprovado. candidaturas=${data.length} (claims carregados via API no runtime).`);
  process.exit(0);
}

// ---- Supabase ao vivo ----
async function verifyLive() {
  for (const p of [resolve(__dirname, '../.env.local'), '/home/lourenco/Projetos/raspador-candidados-2026/.env']) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const t = line.trim(); if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('='); if (i === -1) continue;
      process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  const { createClient } = await import('@supabase/supabase-js');
  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error('[FAIL-40] Credenciais ausentes para --live.'); process.exit(40);
  }
  const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
  const { data, error } = await sb
    .from('claims').select('id,source_document_id,source_url,source_text,status')
    .eq('status', 'published');
  if (error) { console.error(error.message); process.exit(40); }
  if (!data || data.length === 0) {
    console.error('[FAIL-10] Nenhuma claim published encontrada.'); process.exit(10);
  }
  let missing = 0;
  for (const c of data) {
    const hasDoc = c.source_document_id;
    const hasRef = c.source_url || c.source_text;
    if (!hasDoc && !hasRef) missing++;
  }
  console.log(`claims published auditados: ${data.length}`);
  if (missing > 0) {
    console.error(`[FAIL-30] ${missing} claim(s) published sem fonte visível/auditável.`);
    process.exit(30);
  }
  console.log(`[OK-0] Aprovado. ${data.length} claims publicadas, 0 sem fonte.`);
  process.exit(0);
}

useLive ? verifyLive() : verifyLocal();
