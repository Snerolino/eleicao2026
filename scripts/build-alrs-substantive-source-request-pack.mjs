#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/confirmed-merit-assessment-proposal-pack-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/substantive-source-request-pack-v1.json');

export function buildOfficialVoteSources(item) {
  const referencesByUrl = new Map();
  for (const link of item.candidate_source_links ?? []) {
    if (!link.source_url) continue;
    const references = referencesByUrl.get(link.source_url) ?? new Set();
    if (link.source_reference_id) references.add(link.source_reference_id);
    referencesByUrl.set(link.source_url, references);
  }
  const urls = new Set(item.source_urls ?? []);
  for (const url of referencesByUrl.keys()) urls.add(url);
  return [...urls].map((url) => ({ url, source_reference_ids: [...(referencesByUrl.get(url) ?? [])], source_kind: 'official_vote_source' }));
}

export function buildVoteSourceReferenceIds(item) {
  return [...new Set((item.candidate_source_links ?? []).map((link) => link.source_reference_id).filter(Boolean))];
}

export function buildRequestPack(pack) {
  const items = (pack.items ?? [])
    .filter((item) => item.substantive_source_gate !== 'green')
    .map((item) => ({
      proposition_version_id: item.proposition_version_id,
      review_key: item.review_key,
      title: item.title,
      requested_for_groups: (item.proposed_assessments ?? []).map((assessment) => assessment.group_slug),
      official_vote_sources: buildOfficialVoteSources(item),
      official_vote_source_reference_ids: buildVoteSourceReferenceIds(item),
      required_source_types: ['texto_integral_versao', 'parecer_ou_substitutivo', 'resultado_oficial_ou_tramitacao'],
      source_request_status: 'pending_substantive_source',
      human_review_required: true,
      remote_apply: false,
    }));
  return {
    schema_version: '1.0.0',
    packet_type: 'alrs_substantive_source_request_pack',
    remote_apply: false,
    public_approval: false,
    totals: {
      requests: items.length,
      versions: items.length,
      excluded_with_substantive_source: (pack.items ?? []).filter((item) => item.substantive_source_gate === 'green').length,
      uncovered_merit_versions: items.filter((item) => item.requested_for_groups.length === 0).length,
    },
    items,
  };
}

const result = buildRequestPack(JSON.parse(readFileSync(input, 'utf8')));
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
