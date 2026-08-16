#!/usr/bin/env node
/**
 * build-vote-profile.mjs — Indexa o perfil de votação dos parlamentares.
 *
 * Lê os votos factuais (legislative_votes) UMA vez e os materializa em:
 *   - legislator_vote_index: voto por evento já pontuado (direction).
 *   - legislator_vote_profile: agregado por candidato (contagens + score).
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

const DIRECTION = { sim: 1, nao: -1, abstencao: 0, ausente: 0, obstrucao: 0 };

async function main() {
  console.log(`build-vote-profile: ${apply ? 'APLICAR' : 'DRY-RUN'}`);

  // 1) Ler todos os votos factuais com candidato (house vem de voting_events)
  const { data: votes, error } = await sb
    .from('legislative_votes')
    .select('id, candidate_id, voting_event_id, value, voting_events(house)')
    .not('candidate_id', 'is', null);
  if (error) throw error;
  console.log(`Votos factuais com candidato: ${votes?.length ?? 0}`);

  if (!votes || votes.length === 0) {
    console.log('Nenhum voto para indexar. Encerrando.');
    return;
  }

  // 2) Montar índice por evento (direction) + agregar por candidato
  const indexRows = [];
  const profileMap = new Map(); // candidate_id -> {house, counts}
  for (const v of votes) {
    const house = v.voting_events?.house ?? 'camara';
    const direction = DIRECTION[v.value] ?? 0;
    indexRows.push({
      candidate_id: v.candidate_id,
      voting_event_id: v.voting_event_id,
      direction,
      value: v.value,
    });
    const p = profileMap.get(v.candidate_id) || {
      house: house,
      sim: 0, nao: 0, abstencao: 0, ausente: 0, obstrucao: 0, total: 0,
    };
    p.house = house;
    p.total++;
    if (v.value === 'sim') p.sim++;
    else if (v.value === 'nao') p.nao++;
    else if (v.value === 'abstencao') p.abstencao++;
    else if (v.value === 'ausente') p.ausente++;
    else if (v.value === 'obstrucao') p.obstrucao++;
    profileMap.set(v.candidate_id, p);
  }

  const profileRows = [];
  for (const [candidateId, p] of profileMap) {
    const score = p.total > 0 ? (p.sim - p.nao) / p.total : 0;
    profileRows.push({
      candidate_id: candidateId,
      house: p.house,
      total_votes: p.total,
      votos_sim: p.sim,
      votos_nao: p.nao,
      votos_abstencao: p.abstencao,
      votos_ausente: p.ausente,
      votos_obstrucao: p.obstrucao,
      profile_score: Number(score.toFixed(4)),
    });
  }

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
