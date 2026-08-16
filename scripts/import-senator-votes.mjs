#!/usr/bin/env node
/**
 * import-senator-votes.mjs — Importa votações de senadores RS para o Supabase.
 *
 * Consome um envelope JSON simples (votações oficiais) e insere em:
 *   legislative_propositions, proposition_versions, voting_events, legislative_votes
 * resolvendo o candidato pelo tse_candidate_id (auditável).
 *
 * O envelope DEVE trazer fonte oficial em cada voto/proposição (regra absoluta).
 *
 * Usage: node scripts/import-senator-votes.mjs <arquivo.json> [--apply]
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
if (!url || !key) { console.error('Faltam credenciais.'); process.exit(1); }
const apply = process.argv.includes('--apply');
const file = process.argv.find((a) => !a.startsWith('--'));
if (!file) { console.error('Uso: node scripts/import-senator-votes.mjs <arquivo.json> [--apply]'); process.exit(2); }

const sb = createClient(url, key, { auth: { persist: false } });
const VOTE_VALUES = ['sim', 'nao', 'abstencao', 'ausente', 'obstrucao'];

async function resolveCandidateId(tseId) {
  const { data } = await sb.from('candidates').select('id').eq('tse_candidate_id', tseId).maybeSingle();
  return data?.id ?? null;
}

async function upsertSource(text, url) {
  if (!text && !url) return null;
  const { data, error } = await sb
    .from('source_references')
    .upsert({ source_name: text || 'Fonte oficial', source_category: 'oficial', url: url || null }, { onConflict: 'url,source_name' })
    .select('id').single();
  if (error) throw error;
  return data.id;
}

async function main() {
  const envelope = JSON.parse(readFileSync(file, 'utf-8'));
  if (!envelope.propositions || !envelope.events || !envelope.votes) {
    throw new Error('Envelope precisa de propositions[], events[], votes[].');
  }
  console.log(`Envelope: ${envelope.propositions.length} props, ${envelope.events.length} events, ${envelope.votes.length} votos | ${apply ? 'APLICAR' : 'DRY-RUN'}`);

  // 1) propositions + versions + events
  const eventIdMap = new Map(); // external_id -> uuid
  for (const prop of envelope.propositions) {
    const { data: p, error } = await sb
      .from('legislative_propositions')
      .upsert({ external_id: prop.external_id, house: prop.house, proposition_type: prop.type, number: prop.number, year: prop.year, title: prop.title, official_url: prop.official_url || null }, { onConflict: 'house,external_id' })
      .select('id').single();
    if (error) throw error;
    const { data: ver, error: e2 } = await sb
      .from('proposition_versions')
      .upsert({ proposition_id: p.id, version_key: prop.version_key || 'texto-base', version_label: prop.version_label || 'Texto-base', text_hash: prop.text_hash || 'pending', effective_from: prop.effective_from || new Date().toISOString() }, { onConflict: 'proposition_id,version_key' })
      .select('id').single();
    if (e2) throw e2;
    for (const ev of envelope.events.filter((e) => e.proposition_external_id === prop.external_id)) {
      if (!VOTE_VALUES.includes(ev.value)) {} // noop
      const { data: vev, error: e3 } = await sb
        .from('voting_events')
        .upsert({ proposition_version_id: ver.id, external_id: ev.external_id, house: ev.house, occurred_at: ev.occurred_at }, { onConflict: 'house,external_id' })
        .select('id').single();
      if (e3) throw e3;
      eventIdMap.set(ev.external_id, vev.id);
    }
  }

  // 2) votes
  let inserted = 0;
  for (const v of envelope.votes) {
    if (!VOTE_VALUES.includes(v.value)) { console.error(`Voto inválido ignorado: ${v.value}`); continue; }
    const candidateId = await resolveCandidateId(v.candidate_tse_id);
    if (!candidateId) { console.error(`Candidato TSE ${v.candidate_tse_id} não encontrado — voto ignorado`); continue; }
    const eventId = eventIdMap.get(v.event_external_id);
    if (!eventId) { console.error(`Evento ${v.event_external_id} não encontrado — voto ignorado`); continue; }
    const srcId = await upsertSource(v.source_text, v.source_url);
    if (!apply) { inserted++; continue; }
    const { error } = await sb.from('legislative_votes').upsert({
      voting_event_id: eventId, candidate_id: candidateId, value: v.value, recorded_at: v.recorded_at, source_reference_id: srcId,
    }, { onConflict: 'voting_event_id,candidate_id' });
    if (error) throw error;
    inserted++;
  }
  console.log(`Votos processados: ${inserted}`);
  if (!apply) console.log('DRY-RUN: rode com --apply para persistir.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });
