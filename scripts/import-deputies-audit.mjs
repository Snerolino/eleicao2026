#!/usr/bin/env node
/**
 * import-deputies-audit.mjs — Converte o relatório de auditoria de deputados estaduais
 * (dataset2026/candidatos_deputados_estaduais_rs_2026.md) em claims pending_review.
 *
 * Fail-closed: claim só é emitido com source primária explícita; candidate_id resolvido
 * via tse_candidate_id no Supabase (fonte de verdade, não o UUID local do snapshot).
 *
 * Uso: node scripts/import-deputies-audit.mjs [--apply]
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const raspadorEnv = '/home/lourenco/Projetos/raspador-candidados-2026/.env';
for (const p of [resolve(__dirname, '../.env.local'), raspadorEnv]) {
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('='); if (i === -1) continue;
    process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
  }
}
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persist: false } });
const apply = process.argv.includes('--apply');

const cands = JSON.parse(readFileSync(resolve(__dirname, '../data/public-candidates.json'), 'utf-8'))
  .filter(c => ['deputado_estadual', 'deputada_estadual'].includes(c.position));
const byBallot = new Map();
const byFull = new Map();
for (const c of cands) {
  byBallot.set((c.ballot_name || '').toUpperCase().replace(/^['"]|['"]$/g, '').replace(/\s+/g, ''), c);
  byFull.set((c.full_name || '').toUpperCase().replace(/\s+/g, ''), c);
}

const cacheId = new Map();
async function resolveCandidateId(tseId) {
  if (!tseId) return null;
  if (cacheId.has(tseId)) return cacheId.get(tseId);
  const { data } = await sb.from('candidates').select('id').eq('tse_candidate_id', tseId).maybeSingle();
  const id = data?.id ?? null;
  cacheId.set(tseId, id);
  return id;
}

function matchCandidate(nome) {
  const key = String(nome).trim().toUpperCase().replace(/\*|_/g, '').replace(/\s+/g, '');
  const cand = byBallot.get(key) || byFull.get(key) || null;
  if (!cand) return null;
  return { tse: cand.tse_candidate_id, ballot: cand.ballot_name, party: cand.party, number: cand.ballot_number };
}

const md = readFileSync('/home/lourenco/Projetos/dataset2026/relatorios/pesquisas/candidatos_deputados_estaduais_rs_2026.md', 'utf-8');
const lines = md.split('\n').filter(l => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('|| :---'));
const out = [];
for (const l of lines) {
  const cols = l.split('|').map(c => c.trim()).filter((_, i) => i > 0 && i < 11);
  if (cols.length < 9) continue;
  const [nome, cargo, partido, jaEleito, reeleicao, cargos, historico, resumo, fonte] = cols.slice(0, 9);
  const cand = matchCandidate(nome);
  if (!cand) continue;
  if (!fonte) continue;
  const content = resumo ? `(${cargo}) ${resumo}` : `(${cargo}) ${cand.ballot}, ${partido}, nº ${cand.number}. ${historico || ''}`;
  out.push({ nome: cand.ballot, tse: cand.tse, content, source_text: fonte, category: 'historico_politico' });
}

console.log(`Claims montadas (candidate rastreado): ${out.length} / ${lines.length - 1} linhas`);
for (const o of out) console.log(`  ${o.ballot} [${o.category}] fonte=${o.source_text.slice(0,40)}`);

if (!apply) {
  console.log('DRY-RUN. Rode --apply para inserir no Supabase.');
  process.exit(0);
}

let created = 0;
for (const o of out) {
  const cid = await resolveCandidateId(o.tse);
  if (!cid) { console.error(`  SKIP (candidate_id não encontrado no Supabase): ${o.tse} ${o.nome}`); continue; }
  const { data: ex } = await sb.from('claims')
    .select('id').eq('candidate_id', cid).eq('content', o.content).eq('status', 'pending_review').maybeSingle();
  if (ex) continue;
  const { error } = await sb.from('claims').insert({
    candidate_id: cid,
    category: o.category,
    content: o.content,
    source_text: o.source_text,
    source_url: null,
    source_document_id: null,
    confidence_score: 4,
    status: 'pending_review',
  });
  if (error) { console.error('  ERRO', error.message.slice(0, 200)); continue; }
  created++;
}
console.log(`Claims pending_review inseridas: ${created}`);
