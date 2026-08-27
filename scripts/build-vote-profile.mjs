#!/usr/bin/env node
/**
 * build-vote-profile.mjs — Indexa o perfil de votação dos parlamentares.
 *
 * Lê os votos factuais (legislative_votes) UMA vez e os materializa em:
 *   - legislator_vote_index: voto por evento já pontuado (direction).
 *   - legislator_vote_profile: agregado por candidato e casa (contagens + score).
 *
 * Isso evita reavaliar o sentido de cada voto a cada renderização/comparacao.
 * Idempotente: roda quantas vezes forem necessárias (upsert por chave única).
 *
 * Usage: node scripts/build-vote-profile.mjs [--apply]   (default: dry-run)
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildVoteProfileRows } from './lib/vote-profile.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raspadorEnv = '/home/lourenco/Projetos/raspador-candidados-2026/.env';
function loadEnv() {
  for (const p of [resolve(__dirname, '../.env.local'), raspadorEnv]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      process.env[k] = v;
    }
  }
}

loadEnv();
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('VITE_SUPABASE_URL / SUPABASE_SECRET_KEY ausentes.');
  process.exit(1);
}
const apply = process.argv.includes('--apply');
const sb = createClient(url, key, { auth: { persist: false } });

const PAGE_SIZE = 1000;

async function fetchAllVotes() {
  const countQuery = sb
    .from('legislative_votes')
    .select('*', { count: 'exact', head: true })
    .not('candidate_id', 'is', null);
  const { count, error: countError } = await countQuery;
  if (countError) throw countError;
  if (!count || count === 0) return [];

  const ranges = Array.from(
    { length: Math.ceil(count / PAGE_SIZE) },
    (_, index) => [index * PAGE_SIZE, index * PAGE_SIZE + PAGE_SIZE - 1]
  );

  const pages = await Promise.all(
    ranges.map(async ([from, to]) => {
      const { data, error } = await sb
        .from('legislative_votes')
        .select('id, candidate_id, voting_event_id, value, voting_events(house)')
        .not('candidate_id', 'is', null)
        .range(from, to);
      if (error) throw error;
      return data ?? [];
    })
  );

  return pages.flat();
}

async function main() {
  console.log(`build-vote-profile: ${apply ? 'APLICAR' : 'DRY-RUN'}`);

  // 1) Ler todos os votos factuais com candidato (house vem de voting_events)
  const votes = await fetchAllVotes();
  console.log(`Votos factuais com candidato: ${votes?.length ?? 0}`);

  if (!votes || votes.length === 0) {
    console.log('Nenhum voto para indexar. Encerrando.');
    return;
  }

  // 2) Montar índice por evento e agregar por candidato+casa.
  const { indexRows, profileRows } = buildVoteProfileRows(votes);

  console.log(`Índice por evento: ${indexRows.length} | Perfis: ${profileRows.length}`);

  if (!apply) {
    console.log('DRY-RUN: nenhuma escrita. Rode com --apply para materializar.');
    return;
  }

  // 3) Upsert do índice por evento
  const { error: e1 } = await sb
    .from('legislator_vote_index')
    .upsert(indexRows, { onConflict: 'candidate_id,voting_event_id' });
  if (e1) throw e1;

  // 4) Upsert do perfil agregado
  const { error: e2 } = await sb
    .from('legislator_vote_profile')
    .upsert(profileRows, { onConflict: 'candidate_id,house' });
  if (e2) throw e2;

  console.log('Índice de perfil de votação materializado com sucesso.');
}

main().catch((e) => {
  console.error('Erro:', e.message);
  process.exit(1);
});
