#!/usr/bin/env node
/**
 * import-senator-xlsx-claims.mjs — Importa claims de senadores geradas pelo AGY
 * a partir do dossiê xlsx de senado. Formato: { nome, cargo_2026, category, claim, source, confidence }.
 *
 * Resolve o candidato pelo NOME (full_name ou slug) no Supabase.
 * Insere como pending_review, fonte obrigatória. Idempotente por external_id.
 *
 * Usage: node scripts/import-senator-xlsx-claims.mjs <arquivo.json> [--apply]
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
if (!file) { console.error('Uso: node scripts/import-senator-xlsx-claims.mjs <arquivo.json> [--apply]'); process.exit(2); }

const sb = createClient(url, key, { auth: { persist: false } });
const VALID_CAT = ['historico_politico', 'plataforma', 'reputacao', 'votacao_scrutiny'];

function slugifyName(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function resolveCandidateId(nome) {
  const slug = slugifyName(nome);
  // tenta por slug exato
  let { data } = await sb.from('candidates').select('id').eq('slug', slug).maybeSingle();
  if (data) return data.id;
  // tenta por full_name contendo
  const { data: list } = await sb.from('candidates').select('id, full_name').ilike('full_name', `%${nome.split(' ')[0]}%`).limit(5);
  if (list && list.length) {
    const exact = list.find((c) => c.full_name.toLowerCase().includes(nome.toLowerCase()) || nome.toLowerCase().includes(c.full_name.toLowerCase()));
    if (exact) return exact.id;
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
    const candidateId = await resolveCandidateId(cl.nome || '');
    if (!candidateId) { errors.push(`candidato não resolvido por nome: ${cl.nome}`); continue; }
    const extId = `dossier_xlsx_${slugifyName(cl.nome)}_${cl.category}_${createHash('sha256').update(cl.claim).digest('hex').slice(0, 8)}`;
    const record = {
      candidate_id: candidateId,
      category: cl.category,
      content: cl.claim,
      external_id: extId,
      content_hash: createHash('sha256').update(cl.claim).digest('hex'),
      generated_by_ai: false,
      prompt_version: 'dossier-xlsx-v1',
      source_document_id: null,
      source_text: cl.source,
      source_url: null,
      confidence_score: cl.confidence || 4,
      status: 'pending_review',
    };
    if (!apply) { inserted++; continue; }
    const { error } = await sb.from('claims').insert(record);
    if (error) {
      if (/duplicate|unique|already exists/i.test(error.message)) { skipped++; continue; }
      errors.push(error.message); continue;
    }
    inserted++;
  }
  console.log(`Inseridas: ${inserted} | Ignoradas(skip): ${skipped} | Erros: ${errors.length}`);
  errors.slice(0, 10).forEach((e) => console.error('  ERRO:', e));
  if (!apply) console.log('DRY-RUN: rode com --apply para persistir.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });
