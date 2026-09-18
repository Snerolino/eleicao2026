#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const lane = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json'), 'utf8'));
const sourceManifest = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/alrs/alrs-substantive-source-manifest-v1.json'), 'utf8'));
const output = resolve(root, 'public/editorial/alrs-ready-for-human-review-v1.json');

const items = lane.batches.flatMap((batch) => batch.items).map((item) => {
  const source = sourceManifest.items?.[item.proposition_version_id] ?? null;
  const sources = [
    ...item.source_urls.map((url) => ({ kind: 'official_vote_page', url })),
    ...(source?.proposition_page ? [{ kind: 'official_proposition_page', url: source.proposition_page, sha256: source.proposition_page_sha256 ?? null, bytes: source.proposition_page_bytes ?? null }] : []),
    ...(source?.document_url ? [{
      kind: 'official_substantive_document',
      url: (() => { const parsed = new URL(source.document_url); parsed.search = ''; return parsed.toString(); })(),
      access: 'temporary signed query removed from public download; renew from the official proposition page',
      sha256: source.document_sha256 ?? null,
      bytes: source.document_bytes ?? null,
      corpus_path: source.document_path ?? null,
    }] : []),
  ];
  return {
    proposition_version_id: item.proposition_version_id,
    review_key: item.review_key,
    version_key: item.version_key,
    title: item.title,
    priority: item.priority,
    event_type: item.event_type,
    official_event_type: item.official_event_type,
    candidate_count: item.candidate_count,
    factual_vote_count: item.factual_vote_count,
    source_status: source ? 'substantive_manifest_found' : 'substantive_source_not_located_in_manifest',
    source_gates: source ? { proposition_page: 'green', durability: source.source_durability_gate ?? source.durability_gate ?? 'unknown', bytes_preserved: source.source_bytes_preserved ?? false } : { proposition_page: 'unknown', durability: 'unknown', bytes_preserved: false },
    sources: [...new Map(sources.map((entry) => [`${entry.kind}:${entry.url}`, entry])).values()],
    human_review: {
      required: true,
      decision: null,
      disposition: null,
      rationale: null,
      assessment: null,
    },
    remote_apply: false,
    public_approval: false,
  };
});

const payload = {
  schema_version: '1.0.0',
  packet_type: 'alrs_human_editorial_review_download',
  purpose: 'pacote público para análise editorial humana; não é autorização de aplicação ou publicação',
  generated_from: {
    source_queue_sha256: lane.source_queue_sha256 ?? createHash('sha256').update(JSON.stringify(lane)).digest('hex'),
    source_manifest: 'data/legislative-import/alrs/alrs-substantive-source-manifest-v1.json',
  },
  totals: {
    items: items.length,
    priorities: Object.fromEntries(['P0', 'P1', 'P2', 'P3'].map((priority) => [priority, items.filter((item) => item.priority === priority).length])),
    substantive_manifest_found: items.filter((item) => item.source_status === 'substantive_manifest_found').length,
    substantive_source_not_located: items.filter((item) => item.source_status !== 'substantive_manifest_found').length,
  },
  reviewer_instructions: [
    'Confirme a identidade exata da versão e leia a fonte substantiva antes de decidir.',
    'Escolha exatamente uma disposição: assess, no_direct_population_group, taxonomy_gap ou excluded.',
    'Registre justificativa humana com pelo menos 20 caracteres e preserve a fonte usada.',
    'Para assess, preencha assessment somente com grupo canônico, direção, voto defensor quando aplicável, severidade, tipo estrutural, confiança, rationale e fonte.',
    'Não altere proposition_version_id, review_key, hashes ou URLs; alterações exigem novo pacote versionado.',
  ],
  remote_apply: false,
  public_approval: false,
  items,
};

mkdirSync(resolve(root, 'public/editorial'), { recursive: true });
writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`);
for (const batch of JSON.parse(readFileSync(resolve(root, 'data/legislative-import/alrs/editorial-batches/manifest-v1.json'), 'utf8')).batches ?? []) {
  writeFileSync(resolve(root, 'public/editorial', batch.file), readFileSync(resolve(root, 'data/legislative-import/alrs/editorial-batches', batch.file)));
}
console.log(JSON.stringify({ output, items: items.length, bytes: Buffer.byteLength(JSON.stringify(payload, null, 2) + '\n'), remote_apply: false, public_approval: false }));
