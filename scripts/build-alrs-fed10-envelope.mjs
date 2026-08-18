#!/usr/bin/env node
/** Converte o plano ALRS FED-10 para o envelope aceito por import-senator-votes.mjs. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const plan = JSON.parse(readFileSync(resolve('data/legislative-import/alrs-fed10/fed10-consolidated-plan.json'), 'utf8'));
const allowed = new Set(['pec', 'plp', 'pl', 'pld', 'lei', 'mp']);
const toISO = (value) => {
  const m = String(value ?? '').match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}:\d{2}))?$/);
  if (!m) return value;
  return `${m[3]}-${m[2]}-${m[1]}T${m[4] || '12:00'}:00-03:00`;
};
const typeOf = (type) => allowed.has(String(type).toLowerCase()) ? String(type).toLowerCase() : 'outro';
const extId = (vote) => `alrs-${vote.tipo_projeto}-${vote.num_proposicao}-${vote.ano_proposicao}`;
const events = new Map();
const propositions = new Map();
const votes = [];

for (const vote of plan.votes) {
  const propositionExternalId = extId(vote);
  const eventExternalId = `${propositionExternalId}-${vote.alrs_solicitante_id}-${vote.data_votacao}`.replace(/[^a-zA-Z0-9-]/g, '_');
  const sourceUrl = vote.source?.url;
  if (!propositions.has(propositionExternalId)) {
    propositions.set(propositionExternalId, {
      external_id: propositionExternalId,
      house: 'alrs',
      type: typeOf(vote.tipo_projeto),
      number: Number(vote.num_proposicao) || 1,
      year: Number(vote.ano_proposicao) || 2026,
      title: `${vote.tipo_projeto} ${vote.num_proposicao}/${vote.ano_proposicao}`,
      official_url: sourceUrl,
      version_key: `texto-${vote.tipo_projeto}-${vote.num_proposicao}-${vote.ano_proposicao}`,
      version_label: vote.materia,
      text_hash: vote.natural_key?.materia_hash || 'pending',
      effective_from: toISO(vote.data_votacao),
    });
  }
  if (!events.has(eventExternalId)) {
    events.set(eventExternalId, {
      external_id: eventExternalId,
      proposition_external_id: propositionExternalId,
      house: 'alrs',
      occurred_at: toISO(vote.data_votacao),
    });
  }
  votes.push({
    candidate_tse_id: vote.tse_candidate_id,
    event_external_id: eventExternalId,
    value: vote.value,
    recorded_at: toISO(vote.data_votacao),
    source_text: `ALRS — votação plenária ${vote.tipo_projeto} ${vote.num_proposicao}/${vote.ano_proposicao}`,
    source_url: sourceUrl,
  });
}

const envelope = {
  propositions: [...propositions.values()],
  events: [...events.values()],
  votes,
};
const out = resolve('data/legislative-import/alrs-fed10/fed10-envelope.json');
writeFileSync(out, `${JSON.stringify(envelope, null, 2)}\n`);
console.log(JSON.stringify({ propositions: envelope.propositions.length, events: envelope.events.length, votes: envelope.votes.length, out }, null, 2));
