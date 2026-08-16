#!/usr/bin/env node
/**
 * Corrige claims JÁ PUBLICADAS sem source_text, cruzando source_document_id
 * -> source_references (fonte real, não inventada).
 *
 * Uso: node scripts/fix-published-sources.mjs [--apply]
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

  // Claims publicadas sem source_text mas com source_document_id
  const { data: claims, error } = await sb
    .from('claims')
    .select('id, source_document_id, category')
    .eq('status', 'published')
    .is('source_text', null)
    .not('source_document_id', 'is', null)
    .limit(1000);
  if (error) throw error;
  console.log(`Claims publicadas sem fonte (com source_document_id): ${claims.length}`);

  let done = 0, failed = 0, noRef = 0;
  for (const c of claims) {
    const { data: ref } = await sb
      .from('source_references')
      .select('source_name, url, title')
      .eq('id', c.source_document_id)
      .maybeSingle();
    if (!ref) { noRef++; continue; }
    const text = ref.title ? `${ref.source_name} — ${ref.title}` : ref.source_name;
    if (!apply) continue;
    const { error: e2 } = await sb
      .from('claims')
      .update({ source_text: text, source_url: ref.url || null })
      .eq('id', c.id);
    if (e2) { failed++; if (failed <= 3) console.error('erro', c.id, e2.message); }
    else done++;
  }
  if (!apply) { console.log('DRY-RUN: use --apply'); return; }
  console.log(`Atualizadas: ${done} | falhas: ${failed} | sem source_references: ${noRef}`);
  const { count } = await sb.from('claims').select('*', { count: 'exact', head: true })
    .eq('status', 'published').is('source_text', null);
  console.log(`Publicadas AINDA sem fonte: ${count}`);
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
