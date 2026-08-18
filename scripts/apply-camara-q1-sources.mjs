#!/usr/bin/env node
/** FED-21: cadastra fontes Câmara verificadas; não altera proposições ou votos. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const INPUT = resolve(ROOT, 'data/legislative-import/camara/collector-2026-q1/resolved-source-catalog-input.json');
const ENV_FILES = [resolve(ROOT, '.env.local'), '/home/lourenco/Projetos/raspador-candidados-2026/.env'];

function loadEnv() {
  const env = {};
  for (const file of ENV_FILES) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const text = line.trim(); if (!text || text.startsWith('#')) continue;
      const i = text.indexOf('='); if (i < 0) continue;
      env[text.slice(0, i).trim()] = text.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

async function allSources(sb) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('source_references').select('id,url,content_hash').range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < 1000) return rows;
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  const input = JSON.parse(readFileSync(INPUT, 'utf8'));
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Credenciais Supabase ausentes');
  const sb = createClient(url, key, { auth: { persist: false } });
  const existing = new Map((await allSources(sb)).filter((row) => row.url).map((row) => [row.url, row]));
  const missing = [];
  for (const source of input.sources) {
    const row = existing.get(source.url);
    if (row && row.content_hash !== source.content_hash) throw new Error(`hash remoto divergente: ${source.url}`);
    if (!row) missing.push({ source_name: source.source_name, source_category: source.source_category, url: source.url, title: source.title, content_hash: source.content_hash });
  }
  const report = { mode: apply ? 'apply' : 'dry-run', planned: input.sources.length, already_existing: input.sources.length - missing.length, missing: missing.length, inserted: 0, votes_touched: 0 };
  if (!apply) { console.log(JSON.stringify(report, null, 2)); return; }
  for (let i = 0; i < missing.length; i += 50) {
    const { data, error } = await sb.from('source_references').insert(missing.slice(i, i + 50)).select('id,url');
    if (error) throw error;
    report.inserted += data?.length ?? 0;
  }
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1]?.endsWith('apply-camara-q1-sources.mjs')) main().catch((error) => { console.error(`FED-21 sources: ${error.message}`); process.exitCode = 1; });
