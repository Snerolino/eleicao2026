#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function buildReviewQueue(envelopes, manifests) {
  const items = [];
  for (const [index, envelope] of envelopes.entries()) {
    const sourceUrls = new Set((manifests[index]?.urls ?? []).map((row) => row.url));
    for (const proposition of envelope.propositions ?? []) {
      for (const version of proposition.versions ?? []) {
        const events = version.voting_events ?? [];
        items.push({
          house: proposition.house,
          proposition_external_id: proposition.external_id,
          version_key: version.version_key,
          title: proposition.title,
          event_external_ids: events.map((event) => event.external_id),
          factual_vote_count: envelope.votes.filter((vote) => events.some((event) => vote.voting_event_id.endsWith(event.external_id))).length,
          source_urls: [...sourceUrls].filter((url) => url.includes(String(proposition.external_id).match(/\d+/)?.[0] ?? '')),
          review_status: 'pending_review',
          suggested_groups: [],
          suggested_direction: null,
          human_review_required: true,
        });
      }
    }
  }
  return { schema_version: '1.0.0', packet_type: 'camara_r4_review_queue', review_status: 'pending_review', remote_apply: false, public_approval: false, items };
}

function main() {
  const root = resolve(import.meta.dirname, '..');
  const q2 = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/collector-2026-q2/resolved-envelope.json'), 'utf8'));
  const q3 = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/collector-2026-q3/resolved-envelope.json'), 'utf8'));
  const m2 = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/collector-2026-q2/resolved-source-manifest.json'), 'utf8'));
  const m3 = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/collector-2026-q3/resolved-source-manifest.json'), 'utf8'));
  const packet = buildReviewQueue([q2, q3], [m2, m3]);
  const output = resolve(root, 'data/legislative-import/camara/r4-review-queue-q2-q3.json');
  writeFileSync(output, `${JSON.stringify(packet, null, 2)}\n`);
  console.log(JSON.stringify({ items: packet.items.length, factual_votes: packet.items.reduce((sum, item) => sum + item.factual_vote_count, 0), review_status: packet.review_status }));
}
if (process.argv[1]?.endsWith('build-camara-r4-review-queue.mjs')) main();
