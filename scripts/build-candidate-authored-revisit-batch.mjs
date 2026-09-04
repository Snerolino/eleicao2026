#!/usr/bin/env node
/** Constrói o próximo lote revisitável de projetos autorais com fonte/evento oficiais já prospectados. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/camara/candidate-authored-source-recovery-queue-v1.json');
const limit = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.slice(8) ?? 25);
const output = resolve(root, 'data/legislative-import/camara/authored-project-review-batches/camara-authored-revisit-ready-batch-v1.json');

const data = JSON.parse(await readFile(input, 'utf8'));
const items = (data.revisit_queue ?? []).slice(0, limit).map((item, index) => ({
  order: index + 1,
  id: item.id,
  title: item.title,
  type: item.type,
  year: item.year,
  candidate_occurrences: item.candidate_occurrences,
  candidate_tse_ids: item.candidate_tse_ids,
  official_status: item.official_status,
  full_text_url: item.official_sources?.full_text_url ?? null,
  event_url: item.official_sources?.latest_status_event_url ?? null,
  proposition_api_url: item.official_sources?.proposition_api?.url ?? null,
  official_summary: item.official_summary,
  missing_sources: item.missing_sources,
}));

const result = {
  schema_version: '1.0.0',
  packet_type: 'candidate_authored_revisit_ready_batch',
  mode: 'pending_review',
  remote_apply: false,
  source_precedence: 'official_primary_only',
  counts: {
    selected: items.length,
    total_revisit_ready: (data.revisit_queue ?? []).length,
  },
  items,
};

await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, counts: result.counts, first_item: items[0]?.id ?? null }));
