#!/usr/bin/env node
/** Adapta parser Senado para envelope com URL oficial e legislator_id lógico. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function sourceUrlByLegislatorYear(input) {
  return new Map(input.sources.map((source) => [`${source.legislator_external_id}|${source.year}`, source.url]));
}

export function adaptEnvelope(envelope, sourceMap) {
  const sourceFor = (id, recordedAt) => {
    const year = String(recordedAt).slice(0, 4);
    const url = sourceMap.get(`${id}|${year}`);
    if (!url) throw new Error(`source Senado ausente para ${id}/${year}`);
    return url;
  };
  const eventForVote = new Map(envelope.votes.map((vote) => [vote.event_external_id, sourceFor(vote.legislator_external_id, vote.recorded_at)]));
  const events = (envelope.events ?? []).map((event) => ({ ...event, source_url: eventForVote.get(event.external_id) ?? null }));
  const eventById = new Map(events.map((event) => [event.external_id, event]));
  const votes = (envelope.votes ?? []).map((vote) => {
    const event = eventById.get(vote.event_external_id);
    if (!event) throw new Error(`evento Senado ausente: ${vote.event_external_id}`);
    return { ...vote, legislator_id: `senado:${vote.legislator_external_id}`, source_url: event.source_url, source_text: 'Senado Federal — relatório oficial de votações nominais', candidate_tse_id: null };
  });
  return { ...envelope, events, votes, source_policy: 'official_url_exact_hash_manifest', remote_candidate_policy: 'legislator_id_only_no_candidate_inference' };
}

function main() {
  const inputPath = process.argv[2] || '/tmp/senado-nominal-envelope-latest.json';
  const outputPath = process.argv[3] || 'data/legislative-import/senado/nominal-envelope-dry-run.json';
  const input = JSON.parse(readFileSync('data/legislative-import/senado/nominal-source-catalog-input.json', 'utf8'));
  const envelope = JSON.parse(readFileSync(resolve(inputPath), 'utf8'));
  const adapted = adaptEnvelope(envelope, sourceUrlByLegislatorYear(input));
  writeFileSync(resolve(outputPath), `${JSON.stringify(adapted, null, 2)}\n`);
  console.log(JSON.stringify({ propositions: adapted.propositions.length, events: adapted.events.length, votes: adapted.votes.length, legislators: adapted.legislators.length, candidate_ids_inferred: adapted.votes.filter((vote) => vote.candidate_tse_id).length }, null, 2));
}
if (process.argv[1]?.endsWith('adapt-senado-nominal-envelope.mjs')) main();
