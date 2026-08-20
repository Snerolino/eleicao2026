#!/usr/bin/env node
/** Cadastra fontes Câmara verificadas; não altera proposições ou votos. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const INPUT = resolve(ROOT, 'data/legislative-import/camara/collector-2026-q1/resolved-source-catalog-input.json');
const ENV_FILES = [resolve(ROOT, '.env.local'), '/home/lourenco/Projetos/raspador-candidados-2026/.env'];

const SHA256 = /^sha256:[0-9a-f]{64}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function loadEnv() {
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

export function readSourceInput(path = INPUT) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Valida o catálogo local contra o manifesto, sem rede e sem credenciais. */
export function validateSourceInput(input, manifest) {
  if (input?.schema_version !== '1.0.0' || !Array.isArray(input.sources) || input.sources.length === 0) {
    throw new Error('catálogo de fontes inválido');
  }
  if (manifest?.schema_version !== '1.0.0' || !Array.isArray(manifest.urls) || manifest.urls.length === 0) {
    throw new Error('manifesto de fontes inválido');
  }
  const manifestByUrl = new Map();
  for (const entry of manifest?.urls ?? []) {
    if (manifestByUrl.has(entry.url)) throw new Error(`URL duplicada no manifesto: ${entry.url}`);
    if (entry.status !== 200 || !Number.isInteger(entry.bytes) || entry.bytes <= 0 || !SHA256.test(entry.sha256)) {
      throw new Error(`manifesto de fonte inválido: ${entry.url}`);
    }
    manifestByUrl.set(entry.url, entry);
  }
  const seen = new Set();
  const sources = input.sources.map((source) => {
    if (!source?.url || seen.has(source.url)) throw new Error(`URL duplicada ou ausente no catálogo: ${source?.url ?? ''}`);
    seen.add(source.url);
    if (!SHA256.test(source.content_hash)) throw new Error(`hash inválido no catálogo: ${source.url}`);
    const recorded = manifestByUrl.get(source.url);
    if (!recorded || recorded.sha256 !== source.content_hash) throw new Error(`URL/hash não coincide com o manifesto: ${source.url}`);
    return {
      source_name: source.source_name,
      source_category: source.source_category,
      url: source.url,
      title: source.title,
      content_hash: source.content_hash,
    };
  });
  if (manifestByUrl.size !== sources.length || [...manifestByUrl.keys()].some((url) => !seen.has(url))) {
    throw new Error(`manifesto de fontes incompleto: esperado ${sources.length}, recebido ${manifestByUrl.size}`);
  }
  return sources;
}

/** Revalida as linhas remotas por URL e hash e devolve somente IDs já existentes. */
export function resolveExistingSources(expectedSources, remoteRows) {
  const expectedUrls = new Set(expectedSources.map((source) => source.url));
  const byUrl = new Map();
  for (const row of remoteRows ?? []) {
    if (!row?.url || !expectedUrls.has(row.url)) continue;
    if (byUrl.has(row.url)) throw new Error(`source_reference duplicada por URL esperada: ${row.url}`);
    byUrl.set(row.url, row);
  }
  const resolved = new Map();
  const missing = [];
  for (const source of expectedSources) {
    const row = byUrl.get(source.url);
    if (!row) { missing.push(source.url); continue; }
    if (!UUID.test(String(row.id ?? ''))) throw new Error(`UUID remoto inválido: ${source.url}`);
    if (row.content_hash !== source.content_hash) throw new Error(`hash remoto divergente: ${source.url}`);
    resolved.set(source.url, row.id);
  }
  if (missing.length) throw new Error(`source_references ausentes: ${missing.join(', ')}`);
  return resolved;
}

export async function allSources(sb) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('source_references').select('id,url,content_hash').range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < 1000) return rows;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const inputArg = args.find((arg) => arg.startsWith('--input='))?.slice('--input='.length);
  const manifestArg = args.find((arg) => arg.startsWith('--manifest='))?.slice('--manifest='.length);
  const unsupported = args.find((arg) => arg !== '--apply' && !arg.startsWith('--input=') && !arg.startsWith('--manifest='));
  if (unsupported) throw new Error(`flag não suportada: ${unsupported}`);
  const inputPath = inputArg ? resolve(ROOT, inputArg) : INPUT;
  const input = readSourceInput(inputPath);
  const manifestPath = manifestArg
    ? resolve(ROOT, manifestArg)
    : resolve(ROOT, 'data/legislative-import/camara/historical-resolved-source-manifest.json');
  if (!existsSync(manifestPath)) throw new Error(`manifesto não encontrado: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const expectedSources = validateSourceInput(input, manifest);
  const report = {
    mode: apply ? 'apply' : 'dry-run',
    remote_apply: apply,
    planned: expectedSources.length,
    already_existing: null,
    missing: null,
    inserted: 0,
    resolved_source_reference_ids: [],
    votes_touched: 0,
  };
  if (!apply) {
    console.log(JSON.stringify({ ...report, local_manifest_verified: expectedSources.length, remote_catalog_checked: false }, null, 2));
    return;
  }
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Credenciais Supabase ausentes');
  const sb = createClient(url, key, { auth: { persist: false } });
  const before = await allSources(sb);
  const existing = new Map((before).filter((row) => row.url).map((row) => [row.url, row]));
  const missing = expectedSources.filter((source) => !existing.has(source.url));
  for (const source of expectedSources) {
    const row = existing.get(source.url);
    if (row && row.content_hash !== source.content_hash) throw new Error(`hash remoto divergente: ${source.url}`);
  }
  report.already_existing = expectedSources.length - missing.length;
  report.missing = missing.length;
  for (let i = 0; i < missing.length; i += 50) {
    const { data, error } = await sb.from('source_references').insert(missing.slice(i, i + 50)).select('id,url');
    if (error) throw error;
    report.inserted += data?.length ?? 0;
  }
  const after = await allSources(sb);
  const resolved = resolveExistingSources(expectedSources, after);
  report.resolved_source_reference_ids = expectedSources.map((source) => ({ url: source.url, id: resolved.get(source.url) }));
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1]?.endsWith('apply-camara-q1-sources.mjs')) main().catch((error) => { console.error(`FED-21 sources: ${error.message}`); process.exitCode = 1; });
