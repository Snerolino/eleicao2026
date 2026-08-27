#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const queueFile = resolve(root, 'data/legislative-import/alrs/impact-source-acquisition-queue-v1.json');
const outputFile = resolve(root, 'data/legislative-import/alrs/alrs-source-acquisition-manifest-v1.json');
const concurrency = 8;
const queue = JSON.parse(readFileSync(queueFile, 'utf8'));
const urls = [...new Set((queue.items ?? []).flatMap((item) => item.source_urls ?? []).filter(Boolean))].sort();
const results = [];
let next = 0;
async function fetchOne(url) {
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { accept: 'text/html', 'user-agent': 'eleicao2026-alrs-source-acquisition/1.0' }, signal: AbortSignal.timeout(20_000) });
    const body = await response.text();
    const dataItems = [...body.matchAll(/data-item\s*=\s*["']([^"']+)["']/gi)].length;
    results.push({ url, status: response.status, ok: response.ok, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex'), data_items: dataItems, source_kind: url.includes('/votos-plenario/') ? 'nominal_vote' : 'candidate_substantive', substantive_gate: url.includes('/votos-plenario/') ? 'not_applicable' : (response.ok && dataItems > 0 ? 'needs_review' : 'blocked') });
  } catch (error) { results.push({ url, status: null, ok: false, error: String(error?.message ?? error), source_kind: url.includes('/votos-plenario/') ? 'nominal_vote' : 'candidate_substantive', substantive_gate: 'blocked' }); }
}
async function worker() { while (true) { const index = next++; if (index >= urls.length) return; await fetchOne(urls[index]); } }
await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
results.sort((a, b) => a.url.localeCompare(b.url));
const output = { schema_version: '1.0.0', packet_type: 'alrs_source_acquisition_manifest', remote_apply: false, concurrency, unique_urls: urls.length, results };
writeFileSync(outputFile, `${JSON.stringify(output, null, 2)}\n`);
const counts = { ok: results.filter((x) => x.ok).length, blocked: results.filter((x) => !x.ok).length, data_items: results.reduce((n, x) => n + (x.data_items ?? 0), 0), substantive_candidates: results.filter((x) => x.source_kind === 'candidate_substantive').length };
console.log(JSON.stringify({ output: outputFile, ...counts }));
