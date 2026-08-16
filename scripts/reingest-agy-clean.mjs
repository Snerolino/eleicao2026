#!/usr/bin/env node
/**
 * Reingestão limpa de claims do AGY:
 * 1. Deleta editorial_reviews vinculadas aos claims AGY pending_review (em lotes)
 * 2. Deleta os claims AGY pending_review (em lotes)
 * 3. Reimporta os 41 blocos (com source_text/source_url)
 *
 * Uso: node scripts/reingest-agy-clean.mjs --apply
 */
import { createClient } from '@supabase/supabase-js';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

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

  const { data: claims, error } = await sb.from('claims')
    .select('id').eq('generated_by_ai', true).eq('status', 'pending_review');
  if (error) throw error;
  const ids = claims.map((c) => c.id);
  console.log(`Claims AGY pending_review: ${ids.length}`);

  if (!apply) { console.log('DRY-RUN'); return; }

  // 1. Deletar editorial_reviews em lotes de 100
  console.log('Deletando editorial_reviews vinculadas...');
  let revDel = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { error: e1 } = await sb.from('editorial_reviews').delete().in('claim_id', batch);
    if (e1) console.error('  erro reviews lote', i, e1.message);
    else revDel += batch.length;
  }
  console.log(`  reviews processadas: ${revDel}`);

  // 2. Deletar claims em lotes de 100
  console.log('Deletando claims AGY pendentes...');
  let del = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { error: e2, data } = await sb.from('claims').delete().in('claim_id', batch).select('id');
    if (e2) { console.error('  erro claims lote', i, e2.message); break; }
    del += data?.length || 0;
  }
  console.log(`  claims deletados: ${del}`);

  // 3. Reimportar blocos 0-40
  console.log('Reimportando blocos 0-40...');
  for (let b = 0; b <= 40; b++) {
    const out = execFileSync('node', ['scripts/import-agy-block.mjs', String(b), '--apply'],
      { cwd: ROOT, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
    const m = out.match(/Inseridos:\s*(\d+)/);
    console.log(`  B${b}: ${m ? m[1] + ' inseridos' : 'sem resultado'}`);
  }

  // 4. Verificar
  const { count } = await sb.from('claims').select('*', { count: 'exact', head: true })
    .eq('generated_by_ai', true).eq('status', 'pending_review').is('source_text', null);
  console.log(`Claims AGY pending_review AINDA sem source_text: ${count}`);
  console.log('=== REINGESTÃO LIMPA CONCLUÍDA ===');
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });
