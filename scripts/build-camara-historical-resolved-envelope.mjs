#!/usr/bin/env node
/** Monta envelope factual histórico Câmara somente para identidades exatas e cargo/UF elegíveis. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const VALUE_MAP = new Map([
  ['Sim', 'sim'],
  ['Não', 'nao'],
  ['Obstrução', 'obstrucao'],
  ['Abstenção', 'abstencao'],
  ['Ausente', 'ausente'],
]);

export function eligibleIdentityMap(identityLookup) {
  const result = new Map();
  for (const record of identityLookup.records ?? []) {
    if (record.match_status !== 'matched_exact') continue;
    if (record.remote_matches?.length !== 1) continue;
    const remote = record.remote_matches[0];
    if (remote.position !== 'deputado_federal' || remote.state !== 'RS') continue;
    const key = `${record.official_name}|${record.uf}`;
    const current = result.get(key);
    const candidate = {
      deputy_id: remote.id,
      tse_candidate_id: String(remote.tse_candidate_id),
      candidate_id: remote.id,
      official_name: record.official_name,
    };
    if (current && current.tse_candidate_id !== candidate.tse_candidate_id) {
      throw new Error(`identidade conflitante para ${key}`);
    }
    result.set(key, candidate);
  }
  return result;
}

function propositionType(name) {
  return name.startsWith('PEC ') ? 'pec' : name.startsWith('PL ') ? 'pl' : 'outro';
}

export function buildHistoricalEnvelope({ dryRun, identityLookup }) {
  const identities = eligibleIdentityMap(identityLookup);
  const propositions = [];
  const votes = [];
  const seenVotes = new Set();
  for (const proposition of dryRun.propositions ?? []) {
    const externalId = `camara-proposicao-${proposition.camara_proposition_id}`;
    const versions = [];
    for (const event of proposition.events ?? []) {
      const eventId = `camara-votacao-${event.numvot}`;
      const versionKey = `event-${event.numvot}`;
      versions.push({
        version_key: versionKey,
        version_label: `${proposition.name} — votação nominal ${event.numvot}`,
        effective_from: `${event.vote_date}T00:00:00.000Z`,
        source: event.source_url,
        voting_events: [{
          external_id: eventId,
          house: 'camara',
          session_id: event.numvot,
          vote_round: null,
          occurred_at: `${event.vote_date}T00:00:00.000Z`,
          source: event.source_url,
        }],
      });
      for (const record of event.records ?? []) {
        const identity = identities.get(`${record.official_name}|${record.uf}`);
        if (!identity) continue;
        const value = VALUE_MAP.get(record.vote);
        if (!value) throw new Error(`voto não normalizado: ${record.vote}`);
        const key = `${eventId}|${identity.deputy_id}`;
        if (seenVotes.has(key)) continue;
        seenVotes.add(key);
        votes.push({
          voting_event_id: `voting_events:camara:${eventId}`,
          deputy_id: `camara-deputado-${identity.deputy_id}`,
          candidate_id: identity.candidate_id,
          tse_candidate_id: identity.tse_candidate_id,
          proposition_version_id: `proposition_versions:camara:${externalId}:${versionKey}`,
          value,
          recorded_at: `${record.vote_date}T00:00:00.000Z`,
          source: record.source_url,
        });
      }
    }
    propositions.push({
      external_id: externalId,
      house: 'camara',
      proposition_type: propositionType(proposition.name),
      title: proposition.name,
      official_url: proposition.camara_proposition_id === '2209381'
        ? 'https://dadosabertos.camara.leg.br/api/v2/proposicoes/2209381'
        : undefined,
      versions,
    });
  }
  const envelope = {
    schema_version: '1.0.0',
    country: 'BR',
    state: 'RS',
    election_year: 2026,
    propositions,
    votes,
  };
  return {
    envelope,
    catalog: {
      candidateByTse: Object.fromEntries([...identities.values()].map((x) => [x.tse_candidate_id, x.candidate_id])),
      eligible_identities: identities.size,
      blocked_exact_records: (identityLookup.records ?? []).filter((record) => !identities.has(`${record.official_name}|${record.uf}`)).length,
    },
    totals: { propositions: propositions.length, events: propositions.reduce((n, p) => n + p.versions.length, 0), votes: votes.length, eligible_identities: identities.size },
  };
}

function main() {
  const root = resolve(import.meta.dirname, '..');
  const dryRun = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/historical-nominal-vote-dry-run.json'), 'utf8'));
  const identityLookup = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/historical-nominal-remote-identity-lookup.json'), 'utf8'));
  const result = buildHistoricalEnvelope({ dryRun, identityLookup });
  const out = resolve(root, 'data/legislative-import/camara/historical-resolved-envelope.json');
  const catalog = resolve(root, 'data/legislative-import/camara/historical-resolved-catalog.json');
  writeFileSync(out, `${JSON.stringify(result.envelope, null, 2)}\n`);
  writeFileSync(catalog, `${JSON.stringify({ ...result.catalog, source_sha256: createHash('sha256').update(JSON.stringify(result.envelope)).digest('hex') }, null, 2)}\n`);
  console.log(JSON.stringify(result.totals));
}

if (process.argv[1]?.endsWith('build-camara-historical-resolved-envelope.mjs')) main();
