#!/usr/bin/env node
/**
 * Corrige a fonte de claims do AGY já inseridos (sem source_text/source_url)
 * fazendo UPDATE por content_hash — preserva editorial_reviews e histórico.
 *
 * Match: claims.content_hash == sha256(claim.claim do bloco).
 * Uso: node scripts/fix-claims-source.mjs [--apply]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BLOCKS_DIR = resolve(ROOT, '.orchestrator/runtime/blocks');
const CANDIDATES_PATH = resolve(ROOT, 'data/public-candidates.json');

function loadEnv() {
  const raspadorEnv = '/home/lourenco/Projetos/raspador-candidados-2026/.env';
  const out = {};
  if (existsSync(raspadorEnv)) {
    for (const line of readFileSync(raspadorEnv, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

function parseJsonMaybe(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function ensureJson(blockIndex) {
  const txt = resolve(BLOCKS_DIR, `block-${String(blockIndex).padStart(3, '0')}-output.txt`);
  if (!existsSync(txt)) throw new Error(`Ausente: ${txt}`);
  let out = parseJsonMaybe(readFileSync(txt, 'utf-8'));
  if (!out) {
    const m = readFileSync(txt, 'utf-8').match(/```json\s*\n?([\s\S]*?)```/);
    if (m) out = parseJsonMaybe(m[1]);
  }
  if (!out || !Array.isArray(out)) throw new Error(`Não parseável: ${txt}`);
  return out;
}

const typeToCategory = {
  historico_politico: 'historico_politico', historico: 'historico_politico',
  plataforma: 'plataforma', reputacao: 'reputacao',
  votacao_scrutiny: 'votacao_scrutiny', estruturio: 'votacao_scrutiny',
};

async function main() {
  const apply = process.argv.includes('--apply');
  const env = loadEnv();
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY ausente');
  const sb = createClient('https://hhqxhxcfkoijevxyzfky.supabase.co', key, { auth: { persist: false } });

  const candidates = JSON.parse(readFileSync(CANDIDATES_PATH, 'utf-8'));
  const slugToTse = new Map(candidates.map((c) => [c.slug, c.tse_candidate_id]));

  const updates = []; // {content_hash, source_text, source_url}
  let matched = 0, unmatched = 0;

  for (let i = 0; i <= 40; i++) {
    let block;
    try { block = ensureJson(i); } catch (e) { console.log(`B${i}: ${e.message}`); continue; }
    for (const rec of block) {
      const tseId = slugToTse.get(rec.slug);
      if (!tseId) { unmatched++; continue; }
      const { data: cand } = await sb.from('candidates').select('id').eq('tse_candidate_id', tseId).maybeSingle();
      if (!cand) { unmatched++; continue; }
      for (const claim of rec.claims || []) {
        const content = claim.claim;
        const hash = createHash('sha256').update(content).digest('hex');
        const sourceText = typeof claim.source === 'string' ? claim.source.trim() : null;
        let sourceUrl = null;
        if (sourceText) {
          const um = sourceText.match(/https?:\/\/[^\s)\]]+/);
          if (um) sourceUrl = um[0];
        }
        updates.push({ content_hash: hash, source_text: sourceText, source_url: sourceUrl, candidate_id: cand.id });
      }
    }
  }

  console.log(`Claims a atualizar: ${updates.length} (unmatched: ${unmatched})`);
  if (!apply) { console.log('DRY-RUN: use --apply'); return; }

  let done = 0, failed = 0;
  for (const u of updates) {
    const { error } = await sb
      .from('claims')
      .update({ source_text: u.source_text, source_url: u.source_url })
      .eq('content_hash', u.content_hash)
      .eq('candidate_id', u.candidate_id);
    if (error) { failed++; if (failed <= 5) console.error(`  falha hash ${u.content_hash.slice(0,8)}: ${error.message}`); }
    else done++;
  }
  console.log(`Atualizados: ${done} | falhas: ${failed}`);
  // Verifica quantos ainda sem fonte
  const { count } = await sb.from('claims').select('*', { count: 'exact', head: true })
    .eq('generated_by_ai', true).eq('status', 'pending_review').is('source_text', null);
  console.log(`Claims AGY pending_review AINDA sem source_text: ${count}`);
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
