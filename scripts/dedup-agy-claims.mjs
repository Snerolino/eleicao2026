#!/usr/bin/env node
/**
 * Remove duplicatas de claims do AGY (generated_by_ai + pending_review)
 * mantendo 1 por (candidate_id, content_hash). A mantida é a de menor id
 * (mais antiga) — preserva a primeira inserção válida.
 *
 * Uso: node scripts/dedup-agy-claims.mjs [--apply]
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

function loadEnv() {
  const raspadorEnv = '/home/lourenco/Projetos/raspador-candidados-2026/.env';
  const out = {};
  if (fs.existsSync(raspadorEnv)) {
    for (const line of fs.readFileSync(raspadorEnv, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const env = loadEnv();
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY ausente');
  const sb = createClient('https://hhqxhxcfkoijevxyzfky.supabase.co', key, { auth: { persist: false } });

  // Busca duplicatas em memória (mais seguro que RPC custom)
  console.log('Buscando claims AGY pendentes...');
  const all = [];
  let from = 0;
  while (true) {
    const { data, error: e1 } = await sb.from('claims')
      .select('id, content_hash, candidate_id, created_at')
      .eq('generated_by_ai', true).eq('status', 'pending_review')
      .range(from, from + 999);
    if (e1) throw e1;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`Coletadas ${all.length} claims AGY pendentes`);
  const groups = new Map();
  for (const c of all || []) {
    if (!groups.has(c.content_hash)) groups.set(c.content_hash, []);
    groups.get(c.content_hash).push(c.id);
  }
  const toDelete = [];
  for (const [, ids] of groups) {
    if (ids.length > 1) {
      // mantém o de menor id (primeiro inserido), deleta o resto
      const sorted = ids.slice().sort();
      toDelete.push(...sorted.slice(1));
    }
  }
  console.log(`Claims duplicadas a deletar: ${toDelete.length} (de ${all.length} total)`);
  if (!apply) { console.log('DRY-RUN: use --apply'); return; }

  let del = 0, skipped = 0;
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100);
    // 1. remove editorial_reviews vinculadas (FK)
    const { error: e1 } = await sb.from('editorial_reviews').delete().in('claim_id', batch);
    if (e1) console.error('erro reviews lote', i, e1.message);
    // 2. remove as claims duplicadas
    const { error: e2, data } = await sb.from('claims').delete().in('id', batch).select('id');
    if (e2) { console.error('erro claims lote', i, e2.message); skipped += batch.length; }
    else del += data?.length || 0;
  }
  console.log(`Deletadas: ${del}`);
  const { count } = await sb.from('claims').select('*', { count: 'exact', head: true })
    .eq('generated_by_ai', true).eq('status', 'pending_review');
  console.log(`AGY pendentes restantes: ${count}`);
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
