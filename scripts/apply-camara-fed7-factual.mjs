#!/usr/bin/env node
/**
 * Aplica somente fatos nominais do piloto Câmara FED-7B.
 * Nunca toca impact_matrices, profiles ou avaliações editoriais.
 * Uso: node scripts/apply-camara-fed7-factual.mjs [--apply]
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv() {
  for (const path of [resolve('.env.local'), '/home/lourenco/Projetos/raspador-candidados-2026/.env']) {
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const text = line.trim();
      if (!text || text.startsWith('#')) continue;
      const index = text.indexOf('=');
      if (index < 0) continue;
      process.env[text.slice(0, index).trim()] = text.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
}

const apply = process.argv.includes('--apply');
const packagePath = resolve('data/legislative-import/camara/fed5-pilot/2580259-24-pilot.json');
const catalogPath = resolve('data/legislative-import/camara/fed7-remote-readiness/remote-catalog.json');
const envelope = JSON.parse(readFileSync(packagePath, 'utf8'));
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

function sourceId(url) {
  return catalog.sourceReferenceByKey[String(url).trim().toLowerCase()] ?? null;
}
function fail(message) { console.error(`Erro: ${message}`); process.exit(1); }
function required(value, label) { if (!value) fail(`ausente: ${label}`); return value; }

loadEnv();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) fail('credenciais Supabase ausentes');
const sb = createClient(supabaseUrl, supabaseKey, { auth: { persist: false } });

async function findOrCreate(table, match, row) {
  if (!apply) return { id: `dry-run-${table}`, created: true };
  const { data: existing, error: selectError } = await sb.from(table).select('id').match(match).maybeSingle();
  if (selectError) throw selectError;
  if (existing) return { id: existing.id, created: false };
  const { data, error } = await sb.from(table).insert(row).select('id').single();
  if (error) {
    const { data: raced, error: retryError } = await sb.from(table).select('id').match(match).maybeSingle();
    if (retryError || !raced) throw error;
    return { id: raced.id, created: false };
  }
  return { id: data.id, created: true };
}

async function main() {
  const proposition = envelope.propositions[0];
  const version = proposition.versions[0];
  const event = version.voting_events[0];
  const sourceProposition = required(sourceId(proposition.official_url), 'source proposition');
  const sourceVersion = required(sourceId(version.source), 'source version');
  const sourceEvent = required(sourceId(event.source), 'source event');
  if (sourceProposition !== sourceVersion && sourceVersion !== sourceEvent) {
    console.log('Fontes distintas preservadas:', sourceProposition, sourceVersion, sourceEvent);
  }

  const propositionResult = await findOrCreate('legislative_propositions',
    { house: proposition.house, external_id: proposition.external_id },
    { house: proposition.house, external_id: proposition.external_id, proposition_type: proposition.proposition_type, number: proposition.number, year: proposition.year, title: proposition.title, official_url: proposition.official_url });
  const versionResult = await findOrCreate('proposition_versions',
    { proposition_id: propositionResult.id, version_key: version.version_key },
    { proposition_id: propositionResult.id, version_key: version.version_key, version_label: version.version_label, text_hash: version.text_hash, effective_from: version.effective_from });
  const eventResult = await findOrCreate('voting_events',
    { house: event.house, external_id: event.external_id },
    { proposition_version_id: versionResult.id, house: event.house, external_id: event.external_id, session_id: event.session_id, vote_round: event.vote_round, occurred_at: event.occurred_at });

  let createdVotes = 0;
  for (const vote of envelope.votes) {
    const candidateId = required(catalog.legislatorsToCandidateId[vote.deputy_id], `candidate ${vote.deputy_id}`);
    const voteSource = required(sourceId(vote.source), `source vote ${vote.deputy_id}`);
    const result = await findOrCreate('legislative_votes',
      { voting_event_id: eventResult.id, candidate_id: candidateId },
      { voting_event_id: eventResult.id, candidate_id: candidateId, value: vote.value, recorded_at: vote.recorded_at, source_reference_id: voteSource });
    if (result.created) createdVotes += 1;
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', proposition: propositionResult, version: versionResult, event: eventResult, votes: envelope.votes.length, createdVotes, impactTouched: false }));
}
main().catch((error) => fail(error.message));
