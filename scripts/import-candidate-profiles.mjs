#!/usr/bin/env node
/**
 * Fase 3 — ETL de perfil enriquecido (candidatos RS 2026)
 *
 * Ingestão idempotente de dados de perfil públicos → claims (`pending_review`):
 *   1. bem_candidato_2026_RS.csv  → claim category "financial_declarations"
 *      (soma de bens por candidato + claim individual por tipo/categoria)
 *   2. rede_social_candidato_2026_RS.csv → claim category "social_media"
 *      (uma claim por URL de rede social, com texto do link)
 *
 * Fontes: TSE Dados Abertos (CSV `../dataset2026`). Read-only sobre o mirror.
 * NÃO lê `../dataset2026` silenciosamente — é chamado explicitamente.
 *
 * Idempotência: dedupe por `content_hash` (sha256 do SQ_CANDIDATO|category|tipo+valor)
 * via upsert em `claims` usando coluna `content_hash` unique (migration 20260729).
 *
 * Uso (service_role autoritativa, via perfil Hermes .env):
 *   node scripts/import-candidate-profiles.mjs              # DRY RUN (preview)
 *   node scripts/import-candidate-profiles.mjs --apply        # confirma
 *
 * Requer: SUPABASE_SERVICE_ROLE_KEY (service_role, NUNCA VITE_*), VITE_SUPABASE_URL.
 * Segue AGENTS.md: "service_role nunca entra em VITE_*".
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA = resolve(process.env.ELEICAO2026_DATASET || ROOT, '..', 'dataset2026');

const CSV_BENS = resolve(DATA, 'candidatos', 'bem_candidato_2026_RS.csv');
const CSV_SOCIAL = resolve(DATA, 'candidatos', 'rede_social_candidato_2026_RS.csv');

// ---------------------------------------------------------------------------
// Env / client
// ---------------------------------------------------------------------------
function loadEnv() {
  const files = [
    resolve(__dirname, '..', '.env.local'),          // repo do projeto
    '/home/lourenco/Projetos/raspador-candidados-2026/.env', // raspador (service_role)
    '/home/lourenco/.hermes/profiles/eleicao2026/.env',       // perfil Hermes
  ];
  const out = { ...process.env };
  for (const f of files) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#') || !t.includes('=')) continue;
      const i = t.indexOf('=');
      out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return out;
}

function resolveEnv(name) {
  const env = loadEnv();
  const v = process.env[name] || env[name];
  if (!v) {
    // alias: raspador usa SUPABASE_SECRET_KEY (service_role)
    const alias = name === 'SUPABASE_SERVICE_ROLE_KEY' ? 'SUPABASE_SECRET_KEY' : 'SUPABASE_SERVICE_ROLE_KEY';
    const v2 = process.env[alias] || env[alias];
    if (v2) return v2;
    throw new Error(`${name} ausente. Carregue SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY (service_role).`);
  }
  return v;
}

function buildClient() {
  return createClient(resolveEnv('VITE_SUPABASE_URL'), resolveEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
  });
}

// ---------------------------------------------------------------------------
// Parser CSV (Latin-1, ';')
// ---------------------------------------------------------------------------
function readCsv(path) {
  if (!existsSync(path)) {
    throw new Error(`CSV ausente: ${path}`);
  }
  const buf = readFileSync(path);
  const text = buf.toString('latin1');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(';').map((h) => h.replace(/"/g, '').trim());
  return lines.slice(1).map((line) => {
    const v = line.split(';').map((c) => c.replace(/(^"| "$)|"/g, '').trim());
    const row = {};
    header.forEach((h, i) => (row[h] = v[i] ?? ''));
    return row;
  });
}

function sha(...parts) {
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 32);
}

function toFloat(v) {
  if (!v) return 0;
  const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
}

function fmtMoeda(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

// ---------------------------------------------------------------------------
// Ingestion
// ---------------------------------------------------------------------------
async function mapCandidateByTse(supabase, tseIds) {
  // resolve tse_candidate_id -> uuid candidates.id (supabase)
  const { data, error } = await supabase
    .from('candidates')
    .select('id,tse_candidate_id')
    .in('tse_candidate_id', tseIds);
  if (error) throw error;
  const m = new Map();
  for (const c of data || []) m.set(String(c.tse_candidate_id), c.id);
  return m;
}

// ---------------------------------------------------------------------------
// Idempotent insert: sem depender de unique constraint no remote.
// Busca content_hash existentes e filtra antes do insert em lote.
async function dedupeAndInsert(supabase, claims, label) {
  if (!claims.length) return 0;
  // batch fetch existing hashes (em chunks de 100 pra não estourar URL)
  const existing = new Set();
  const BATCH = 20; // PostgREST GET limita tamanho URL (~8KB) — 20 hashes seguros
  for (let i = 0; i < claims.length; i += BATCH) {
    const chunk = claims.slice(i, i + BATCH).map((c) => c.content_hash);
    const { data, error } = await supabase
      .from('claims')
      .select('content_hash')
      .in('content_hash', chunk);
    if (error) throw error;
    for (const row of data || []) existing.add(row.content_hash);
  }
  const toInsert = claims.filter((c) => !existing.has(c.content_hash));
  if (toInsert.length === 0) {
    console.log(`[${label}] ℹ️ nenhum novo (todos já existem).`);
    return 0;
  }
  const { error } = await supabase.from('claims').insert(toInsert);
  if (error) throw error;
  console.log(`[${label}] ✅ insert ${toInsert.length} claims (de ${claims.length} novos/total, ${existing.size} já existentes).`);
  return toInsert.length;
}

async function importBens(supabase, apply) {
  const rows = readCsv(CSV_BENS);
  const tseIds = [...new Set(rows.map((r) => r.SQ_CANDIDATO).filter(Boolean))];
  const tseToUuid = await mapCandidateByTse(supabase, tseIds);

  const byCandidate = new Map(); // tse -> {total, items:[]}
  for (const r of rows) {
    const sq = String(r.SQ_CANDIDATO);
    if (!sq || !tseToUuid.has(sq)) continue; // not in snapshot (ex: Ernani extra)
    const v = toFloat(r.VR_BEM_CANDIDATO);
    let agg = byCandidate.get(sq);
    if (!agg) agg = { total: 0, items: [], uuid: tseToUuid.get(sq) };
    agg.total += v;
    agg.items.push({ tipo: r.DS_TIPO_BEM_CANDIDATO, valor: fmtMoeda(v) });
    byCandidate.set(sq, agg);
  }

  const claims = [];
  for (const [sq, agg] of byCandidate) {
    if (agg.items.length === 0) continue;
    const content = `Total de bens declarados: ${fmtMoeda(agg.total)} (${agg.items.length} bens). Itens: ${agg.items.map((i) => `${i.tipo} (${i.valor})`).join('; ')}.`;
    const claim = {
      candidate_id: agg.uuid,
      category: 'financial_declarations',
      content,
      confidence_score: 5,
      status: 'pending_review',
      source_document_id: null,
      content_hash: sha(sq, 'bem', 'total'),
      created_at: new Date().toISOString(),
    };
    claims.push(claim);
  }
  console.log(`[bem] ${claims.length} claims (de ${rows.length} bens, ${tseIds.length} candidatos).`);
  if (apply && claims.length) {
    await dedupeAndInsert(supabase, claims, 'bem');
  } else if (!apply) {
    const preview = claims[0] ? claims[0].content.slice(0, 60) : '(nenhum)';
    console.log(`[bem] 🔍 DRY RUN — ${preview}`);
  }
  return claims;
}

async function importSocial(supabase, apply) {
  const rows = readCsv(CSV_SOCIAL);
  const tseIds = [...new Set(rows.map((r) => r.SQ_CANDIDATO).filter(Boolean))];
  const tseToUuid = await mapCandidateByTse(supabase, tseIds);

  const claims = [];
  for (const r of rows) {
    const sq = String(r.SQ_CANDIDATO);
    if (!sq || !tseToUuid.has(sq)) continue;
    const url = String(r.DS_URL || '').trim();
    const ordem = r.NR_ORDEM_REDE_SOCIAL;
    if (!url) continue;
    const content = `Rede social (${ordem ? `#${ordem}` : 'url'}): ${url}`;
    claims.push({
      candidate_id: tseToUuid.get(sq),
      category: 'social_media',
      content,
      confidence_score: 5,
      status: 'pending_review',
      source_document_id: null,
      content_hash: sha(sq, 'social', url),
      created_at: new Date().toISOString(),
    });
  }
  // dedupe por URL por candidato (uma claim por rede)
  const seen = new Set();
  const deduped = claims.filter((c) => {
    const k = c.content_hash;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  console.log(`[social] ${deduped.length} claims (de ${rows.length} URLs, ${tseIds.length} candidatos).`);
  if (apply && deduped.length) {
    await dedupeAndInsert(supabase, deduped, 'social');
  } else if (!apply) {
    const preview = deduped[0] ? deduped[0].content.slice(0, 60) : '(nenhum)';
    console.log(`[social] 🔍 DRY RUN — ${preview}`);
  }
  return deduped;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const apply = process.argv.includes('--apply');
  if (!apply) console.log('🔍 Modo DRY RUN (use --apply para gravar claims).\n');

  const supabase = buildClient();
  const bens = await importBens(supabase, apply);
  const social = await importSocial(supabase, apply);
  console.log(`\n=== Fim: ${bens.length} bens + ${social.length} redes sociais → ${bens.length + social.length} claims (${apply ? 'APLICADO' : 'preview'}) ===`);
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
