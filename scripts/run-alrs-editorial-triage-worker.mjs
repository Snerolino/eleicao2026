#!/usr/bin/env node
/** Triagem ALRS em caixas independentes; prepara decisões, nunca aprova/aplica remotamente. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const queueFile = resolve(root, 'data/legislative-import/alrs/editorial-batches/manifest-v1.json');
const runtime = resolve(root, '.orchestrator/runtime/no-stop/alrs-editorial-workers');
const args = process.argv.slice(2);
const worker = Number(args.find((arg) => arg.startsWith('--worker='))?.slice(9) ?? 0);
const workers = Number(args.find((arg) => arg.startsWith('--workers='))?.slice(10) ?? 4);
if (!Number.isInteger(worker) || !Number.isInteger(workers) || worker < 0 || worker >= workers || workers < 1 || workers > 16) throw new Error('worker/workers inválidos');

const manifest = existsSync(queueFile) ? JSON.parse(readFileSync(queueFile, 'utf8')) : null;
if (!manifest) throw new Error('manifesto de lotes ALRS ausente; regenere os lotes antes da triagem');
const selectedBatches = (manifest.batches ?? []).filter((_, index) => index % workers === worker);
const selected = selectedBatches.flatMap((descriptor) => {
  const file = resolve(root, 'data/legislative-import/alrs/editorial-batches', descriptor.file);
  if (!existsSync(file)) throw new Error(`lote ausente: ${descriptor.file}`);
  const batch = JSON.parse(readFileSync(file, 'utf8'));
  if (batch.batch_sha256 !== descriptor.batch_sha256) throw new Error(`hash divergente: ${descriptor.batch_id}`);
  return batch.items.map((item) => ({ ...item, batch_id: batch.batch_id }));
});
const items = selected.map((item) => ({
  proposition_version_id: item.proposition_version_id,
  review_key: item.review_key,
  priority: item.priority,
  lane: item.priority === 'BLOCKED_IDENTITY' ? 'collision' : 'disposition',
  source_urls: item.source_urls ?? [],
  candidate_count: item.candidate_count ?? 0,
  factual_vote_count: item.factual_vote_count ?? 0,
  recommended_disposition: item.priority === 'BLOCKED_IDENTITY' ? null : null,
  disposition_status: 'awaiting_external_editorial_decision',
  rationale: 'Preparado para revisão independente; nenhuma decisão automática foi promovida.',
  remote_apply: false,
  public_approval: false,
}));
const payload = { schema_version: '1.0.0', packet_type: 'alrs_editorial_triage_worker_output', mode: 'read-only', worker, workers, source_queue_sha256: createHash('sha256').update(JSON.stringify(manifest)).digest('hex'), batch_ids: selectedBatches.map((batch) => batch.batch_id), counts: { selected: items.length, disposition: items.filter((x) => x.lane === 'disposition').length, collision: items.filter((x) => x.lane === 'collision').length, awaiting_external_editorial_decision: items.length }, items };
mkdirSync(runtime, { recursive: true });
const output = resolve(runtime, `worker-${String(worker).padStart(2, '0')}-of-${String(workers).padStart(2, '0')}.json`);
writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ worker, workers, output, ...payload.counts, remote_apply: false }));
