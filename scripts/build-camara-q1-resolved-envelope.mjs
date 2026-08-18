#!/usr/bin/env node
/** Monta envelope factual Q1 Câmara somente com identidades exatas e FK remota resolvida. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export function matchedDeputies(identity) {
  return new Set(identity.entries.filter((entry) => entry.status === 'matched_exact').map((entry) => `camara-deputado-${entry.deputy_id}`));
}

export function consolidateEnvelopes(envelopes, allowedDeputies) {
  const propositions = [];
  const propositionKeys = new Set();
  const votes = [];
  const voteKeys = new Set();
  for (const envelope of envelopes) {
    for (const proposition of envelope.propositions ?? []) {
      const key = `${proposition.house}|${proposition.external_id}`;
      if (!propositionKeys.has(key)) { propositionKeys.add(key); propositions.push(proposition); }
    }
    for (const vote of envelope.votes ?? []) {
      if (!allowedDeputies.has(vote.deputy_id)) continue;
      const key = `${vote.voting_event_id}|${vote.deputy_id}`;
      if (!voteKeys.has(key)) { voteKeys.add(key); votes.push(vote); }
    }
  }
  return { propositions, votes };
}

export function buildResolvedBatch({ identity, envelopes, candidateRows }) {
  const matched = identity.entries.filter((entry) => entry.status === 'matched_exact' && entry.matches.length === 1);
  const candidateByTse = new Map(candidateRows.map((row) => [String(row.tse_candidate_id), row.id]));
  const deputyToCandidate = new Map();
  const candidateByIdentifier = {};
  for (const entry of matched) {
    const tse = String(entry.matches[0].tse_candidate_id);
    const candidateId = candidateByTse.get(tse);
    if (!candidateId) throw new Error(`FK remota ausente para tse_candidate_id=${tse}`);
    const deputyKey = `camara-deputado-${entry.deputy_id}`;
    deputyToCandidate.set(deputyKey, candidateId);
    candidateByIdentifier[tse] = candidateId;
  }

  const consolidated = consolidateEnvelopes(envelopes, new Set(deputyToCandidate.keys()));
  const propositionsByKey = new Map();
  for (const envelope of envelopes) {
    for (const proposition of envelope.propositions ?? []) {
      const key = `${proposition.house}|${proposition.external_id}`;
      const current = propositionsByKey.get(key) ?? { ...proposition, versions: [] };
      const versions = new Map((current.versions ?? []).map((version) => [version.version_key, version]));
      for (const version of proposition.versions ?? []) versions.set(version.version_key, version);
      current.versions = [...versions.values()];
      propositionsByKey.set(key, current);
    }
  }
  const propositions = [...propositionsByKey.values()];
  const votes = consolidated.votes;
  return {
    envelope: { schema_version: '1.0.0', country: 'BR', state: 'RS', election_year: 2026, propositions, votes },
    catalog: {
      legislatorsToCandidateId: Object.fromEntries([...deputyToCandidate.entries()]),
      candidateByIdentifier,
    },
    totals: { exact_identities: matched.length, propositions: propositions.length, votes: votes.length, pending_identities: identity.totals.identity_pending },
  };
}

function main() {
  const root = resolve(import.meta.dirname, '..');
  const dir = resolve(root, 'data/legislative-import/camara/collector-2026-q1');
  const identity = JSON.parse(readFileSync(resolve(dir, 'identity-reconciliation.json'), 'utf8'));
  const candidateRowsPath = process.argv[2] || resolve(dir, 'resolved-candidates.json');
  const candidateRows = JSON.parse(readFileSync(candidateRowsPath, 'utf8'));
  const files = readdirSync(dir).filter((name) => /^\d[\d-]+\.json$/.test(name)).sort();
  const envelopes = files.map((file) => JSON.parse(readFileSync(resolve(dir, file), 'utf8')));
  const result = buildResolvedBatch({ identity, envelopes, candidateRows });
  const outDir = resolve(root, 'data/legislative-import/camara/collector-2026-q1');
  writeFileSync(resolve(outDir, 'resolved-envelope.json'), `${JSON.stringify(result.envelope, null, 2)}\n`);
  writeFileSync(resolve(outDir, 'resolved-catalog.json'), `${JSON.stringify(result.catalog, null, 2)}\n`);
  console.log(JSON.stringify(result.totals));
}

if (process.argv[1]?.endsWith('build-camara-q1-resolved-envelope.mjs')) main();
