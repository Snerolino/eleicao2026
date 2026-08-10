#!/usr/bin/env node
/**
 * Sincroniza o snapshot público de candidatos (data/public-candidates.json) com o
 * Supabase de forma idempotente por `tse_candidate_id` (on_conflict), preservando
 * ids existentes e criando apenas candidatos novos.
 *
 * Regras:
 *  - Nunca sobrescreve claims (somente a linha do candidato em candidates).
 *  - Não envia PII nem campos fora do modelo público.
 *  - Dry-run por padrão; --apply exige service role externa (SUPABASE_SECRET_KEY).
 *
 * Uso:
 *   node scripts/sync-candidates-snapshot.mjs            # dry-run (relatório)
 *   node scripts/sync-candidates-snapshot.mjs --apply    # upsert idempotente
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOULD_APPLY = process.argv.includes('--apply');

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, 'utf-8')
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')];
      }),
  );
}

const env = loadEnvFile(resolve(__dirname, '..', '.env.local'));
const raspadorEnv = loadEnvFile(resolve(__dirname, '..', '..', 'raspador-candidados-2026', '.env'));

const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || raspadorEnv.SUPABASE_SECRET_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL ausente.');
if (SHOULD_APPLY && !serviceRoleKey) {
  throw new Error('SUPABASE_SECRET_KEY (service role) é obrigatório para --apply e não pode vir de .env versionado.');
}
if (!SHOULD_APPLY && !anonKey) throw new Error('VITE_SUPABASE_ANON_KEY ausente para dry-run.');

const supabase = createClient(supabaseUrl, SHOULD_APPLY ? serviceRoleKey : anonKey);

const PUBLIC_FIELDS = [
  'tse_candidate_id',
  'full_name',
  'party',
  'ballot_number',
  'position',
  'slug',
  'state',
  'election_year',
  'registration_status',
  'ballot_name',
  'photo_url',
  'photo_source_url',
];

function toPayload(candidate) {
  const payload = {};
  for (const field of PUBLIC_FIELDS) {
    if (candidate[field] !== undefined && candidate[field] !== null) {
      payload[field] = candidate[field];
    }
  }
  return payload;
}

async function main() {
  const snapshot = JSON.parse(
    readFileSync(resolve(__dirname, '..', 'data/public-candidates.json'), 'utf8'),
  );
  console.log(`Snapshot: ${snapshot.length} candidaturas`);

  const { data: existing, error: listError } = await supabase
    .from('candidates')
    .select('id, tse_candidate_id');
  if (listError) throw listError;

  const existingById = new Map((existing ?? []).map((row) => [String(row.tse_candidate_id), row.id]));
  const onlyInDb = (existing ?? []).filter((row) => !snapshot.some((c) => String(c.tse_candidate_id) === String(row.tse_candidate_id)));

  const toInsert = snapshot.filter((c) => !existingById.has(String(c.tse_candidate_id)));
  const toUpdate = snapshot.filter((c) => existingById.has(String(c.tse_candidate_id)));

  console.log(`No banco: ${existing?.length ?? 0} | a criar: ${toInsert.length} | a atualizar: ${toUpdate.length} | só no banco (fora do snapshot): ${onlyInDb.length}`);

  if (!SHOULD_APPLY) {
    console.log('Dry-run: nenhuma escrita. Use --apply com service role para sincronizar.');
    return;
  }

  // Upsert idempotente por tse_candidate_id; ids existentes são preservados.
  const { error: upsertError } = await supabase
    .from('candidates')
    .upsert(snapshot.map(toPayload), {
      onConflict: 'tse_candidate_id',
      ignoreDuplicates: false,
    });
  if (upsertError) throw upsertError;

  console.log(`✅ ${snapshot.length} candidaturas sincronizadas (upsert por tse_candidate_id).`);
  console.log(`   criadas: ${toInsert.length} | atualizadas: ${toUpdate.length}`);
  if (onlyInDb.length) {
    console.log(`⚠️  ${onlyInDb.length} registro(s) no banco sem correspondência no snapshot (não removidos):`);
    for (const row of onlyInDb.slice(0, 10)) console.log(`   - ${row.tse_candidate_id}`);
  }
}

try {
  main();
} catch (error) {
  const message = String(error?.message ?? error).replace(
    /(apikey|Authorization|Bearer|service_role|token)=?\s*[^\s,}]+/gi,
    '$1=[REDACTED]',
  );
  console.error(message);
  process.exit(1);
}