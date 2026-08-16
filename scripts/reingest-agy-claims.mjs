#!/usr/bin/env node
/**
 * Reingestão de claims do AGY: remove claims geradas por IA em pending_review
 * (que foram inseridas sem fonte) e reimporta os 41 blocos com source_text/source_url.
 *
 * Uso: node scripts/reingest-agy-claims.mjs [--apply]
 * Sem --apply: só conta o que seria deletado.
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
  const url = 'https://hhqxhxcfkoijevxyzfky.supabase.co';
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SECRET_KEY ausente');
  const sb = createClient(url, key, { auth: { persist: false } });

  // 1. Contar claims AGY pending_review
  const { count, error } = await sb
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('generated_by_ai', true)
    .eq('status', 'pending_review');
  if (error) throw error;
  console.log(`Claims AGY pending_review: ${count}`);

  if (!apply) {
    console.log('DRY-RUN: use --apply para deletar e reimportar.');
    return;
  }

  // 2. Deletar em lotes (evita timeout de query longa)
  console.log('Deletando claims AGY pending_review...');
  let deleted = 0;
  while (true) {
    const { data, error: delErr } = await sb
      .from('claims')
      .delete()
      .eq('generated_by_ai', true)
      .eq('status', 'pending_review')
      .limit(500)
      .select('id');
    if (delErr) throw delErr;
    if (!data || data.length === 0) break;
    deleted += data.length;
    console.log(`  deletados ${deleted}...`);
    if (data.length < 500) break;
  }
  console.log(`Total deletado: ${deleted}`);

  // 3. Reimportar blocos 0-40
  console.log('Reimportando blocos 0-40...');
  for (let i = 0; i <= 40; i++) {
    const out = execFileSync(
      'node',
      ['scripts/import-agy-block.mjs', String(i), '--apply'],
      { cwd: ROOT, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 }
    );
    const m = out.match(/Inseridos:\s*(\d+)/);
    console.log(`  B${i}: ${m ? m[1] + ' inseridos' : 'sem resultado'}`);
  }
  console.log('=== REINGESTÃO CONCLUÍDA ===');
}

main().catch((e) => {
  console.error('ERRO:', e.message);
  process.exit(1);
});
