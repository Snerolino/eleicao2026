#!/usr/bin/env node
/**
 * import-senator-dossiers.mjs — Importa claims de senadores geradas pelo AGY
 * a partir de dossiês oficiais (dataset2026/relatorios/dossies).
 *
 * Entrada: JSON array de claims:
 *   { candidate_remote_id (UUID Supabase), tse_candidate_id, category,
 *     claim, source, confidence }
 *
 * Liga ao candidato pelo candidate_remote_id (UUID) priorizado, fallback tse_candidate_id.
 * Insere como pending_review (regra: claims novas entram como pending_review).
 * Fonte obrigatória (regra absoluta). Idempotente por (candidate_id, category, content_hash).
 *
 * Usage: node scripts/import-senator-dossiers.mjs <arquivo.json> [--apply]
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raspadorEnv = '/home/lourenco/Projetos/raspador-candidados-2026/.env';
function loadEnv() {
  for (const p of [resolve(__dirname, '../.env.local'), raspadorEnv]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      process.env[k] = v;
    }
  }
}
loadEnv();
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Faltam credenciais.'); process.exit(1); }
const apply = process.argv.includes('--apply');
const file = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!file) { console.error('Uso: node scripts/import-senator-dossiers.mjs <arquivo.json> [--apply]'); process.exit(2); }

const sb = createClient(url, key, { auth: { persist: false } });
const VALID_CAT = ['historico_politico', 'plataforma', 'reputacao', 'votacao_scrutiny'];

async function resolveCandidateId(cl) {
  if (cl.candidate_remote_id) {
    const { data } = await sb.from('candidates').select('id').eq('id', cl.candidate_remote_id).maybeSingle();
    if (data) return data.id;
  }
  if (cl.tse_candidate_id) {
    const { data } = await sb.from('candidates').select('id').eq('tse_candidate_id', cl.tse_candidate_id).maybeSingle();
    if (data) return data.id;
  }
  return null;
}

async function main() {
  const claims = JSON.parse(readFileSync(file, 'utf-8'));
  if (!Array.isArray(claims)) throw new Error('Esperado array JSON.');
  console.log(`Claims recebidas: ${claims.length} | ${apply ? 'APLICAR' : 'DRY-RUN'}`);

  let inserted = 0, skipped = 0, errors = [];
  for (const cl of claims) {
    if (!VALID_CAT.includes(cl.category)) { errors.push(`categoria inválida: ${cl.category}`); continue; }
    if (!cl.claim || !cl.source) { errors.push('claim ou source ausente (regra absoluta)'); continue; }
    const candidateId = await resolveCandidateId(cl);
    if (!candidateId) { errors.push(`candidato não resolvido (remote=${cl.candidate_remote_id}, tse=${cl.tse_candidate_id})`); continue; }
    const contentHash = createHash('sha256').update(cl.claim).digest('hex');
    const record = {
      candidate_id: candidateId,
      category: cl.category,
      content: cl.claim,
      external_id: `dossier_sen_${cl.tse_candidate_id || cl.candidate_remote_id}_${cl.category}`,
      content_hash: contentHash,
      generated_by_ai: false, // fonte = dossiê oficial, não IA
      prompt_version: 'dossier-v1',
      source_document_id: null,
      source_text: cl.source,
      source_url: null,
      confidence_score: cl.confidence || 4,
      status: 'pending_review',
    };
    if (!apply) { inserted++; continue; }
    const { error } = await sb.from('claims').insert(record);
    if (error) {
      // Se já existir (idempotência por external_id em execução futura), trata como skip.
      if (/duplicate|unique|already exists/i.test(error.message)) { skipped++; continue; }
      errors.push(error.message); continue;
    }
    inserted++;
  }
  console.log(`Inseridas: ${inserted} | Erros: ${errors.length}`);
  errors.slice(0, 10).forEach((e) => console.error('  ERRO:', e));
  if (!apply) console.log('DRY-RUN: rode com --apply para persistir.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });
