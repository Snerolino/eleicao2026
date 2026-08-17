#!/usr/bin/env node
/**
 * Importa claims verificadas dos blocos AGY como pending_review.
 * Nunca publica diretamente. Idempotente por content_hash.
 *
 * Uso: node scripts/import-agy-runtime-pending.mjs [--apply]
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { verifyCliOutput, AGY_CONTRACT } from './lib/verify-cli-output.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const BLOCKS_DIR = resolve(ROOT, '.orchestrator/runtime/blocks');
const SNAPSHOT = resolve(ROOT, 'data/public-candidates.json');
const ENV_FILES = [resolve(ROOT, '.env.local'), '/home/lourenco/Projetos/raspador-candidados-2026/.env'];
const CATEGORY = {
  historico_politico: 'historico_politico',
  historico: 'historico_politico',
  plataforma: 'plataforma',
  reputacao: 'reputacao',
  votacao_scrutiny: 'votacao_scrutiny',
  estruturio: 'votacao_scrutiny',
};

function loadEnv() {
  const env = {};
  for (const file of ENV_FILES) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const text = line.trim();
      if (!text || text.startsWith('#')) continue;
      const index = text.indexOf('=');
      if (index < 0) continue;
      env[text.slice(0, index).trim()] = text.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

function readClaims() {
  const claims = [];
  for (const file of Array.from({ length: 41 }, (_, index) => resolve(BLOCKS_DIR, `block-${String(index).padStart(3, '0')}-output.json`))) {
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, 'utf8');
    const verification = verifyCliOutput(raw, AGY_CONTRACT);
    if (!verification.ok) throw new Error(`Saída reprovada: ${file} (code ${verification.code})`);
    for (const item of JSON.parse(raw)) {
      for (const claim of item.claims ?? []) {
        const content = typeof claim.claim === 'string' ? claim.claim.trim() : '';
        const source = typeof claim.source === 'string' ? claim.source.trim() : '';
        const category = CATEGORY[claim.type];
        if (!item.slug || !content || !source || !category) continue;
        const contentHash = createHash('sha256').update(content).digest('hex');
        claims.push({ slug: item.slug, category, content, source, confidence: Math.max(1, Math.min(5, Number(claim.confidence) || 1)), contentHash });
      }
    }
  }
  const deduped = new Map();
  for (const claim of claims) deduped.set(claim.contentHash, claim);
  return [...deduped.values()];
}

async function main() {
  const apply = process.argv.includes('--apply');
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Credenciais Supabase ausentes.');

  const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
  const snapshotBySlug = new Map(snapshot.map((candidate) => [candidate.slug, candidate]));
  const excluded = new Set((JSON.parse(readFileSync(resolve(ROOT, 'data/public-candidate-overrides.json'), 'utf8')).excluded_tse_candidate_ids ?? []).map(String));
  const sb = createClient(url, key, { auth: { persist: false } });
  const claims = readClaims();
  const hashes = claims.map((claim) => claim.contentHash);
  const existing = new Set();
  for (let index = 0; index < hashes.length; index += 50) {
    const { data, error } = await sb.from('claims').select('content_hash').in('content_hash', hashes.slice(index, index + 50));
    if (error) throw error;
    for (const row of data ?? []) existing.add(row.content_hash);
  }

  const candidates = new Map();
  for (const candidate of snapshot) {
    if (candidate.tse_candidate_id && !excluded.has(String(candidate.tse_candidate_id))) candidates.set(String(candidate.tse_candidate_id), candidate);
  }
  const remoteByTse = new Map();
  for (const candidate of candidates.values()) {
    const { data, error } = await sb.from('candidates').select('id,tse_candidate_id').eq('tse_candidate_id', candidate.tse_candidate_id).maybeSingle();
    if (error) throw error;
    if (data) remoteByTse.set(String(data.tse_candidate_id), data.id);
  }

  const records = [];
  const skipped = { existing: 0, candidate: 0 };
  for (const claim of claims) {
    if (existing.has(claim.contentHash)) { skipped.existing += 1; continue; }
    const candidate = snapshotBySlug.get(claim.slug);
    const candidateId = candidate && remoteByTse.get(String(candidate.tse_candidate_id));
    if (!candidateId) { skipped.candidate += 1; continue; }
    records.push({
      candidate_id: candidateId,
      category: claim.category,
      content: claim.content,
      external_id: `agy_${claim.slug}_${claim.category}_${claim.contentHash.slice(0, 16)}`,
      content_hash: claim.contentHash,
      generated_by_ai: true,
      prompt_version: '1.0',
      source_document_id: null,
      source_text: claim.source,
      source_url: null,
      confidence_score: claim.confidence,
      status: 'pending_review',
    });
  }

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', collected: claims.length, new_records: records.length, skipped, source_url_records: records.filter((record) => record.source_url).length }, null, 2));
  if (!apply) return;

  let inserted = 0;
  for (let index = 0; index < records.length; index += 100) {
    const { data, error } = await sb.from('claims').insert(records.slice(index, index + 100)).select('id');
    if (error) throw error;
    inserted += data?.length ?? 0;
    console.log(`lote ${index / 100 + 1}: ${data?.length ?? 0} inseridas`);
  }
  console.log(JSON.stringify({ inserted, status: 'pending_review', published_directly: 0 }, null, 2));
}

main().catch((error) => { console.error(`ERRO: ${error.message}`); process.exit(1); });
