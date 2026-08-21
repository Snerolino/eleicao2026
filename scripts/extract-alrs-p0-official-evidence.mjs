#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-matrix-review-pack-p0-only.json');
const output = resolve(root, 'data/legislative-import/alrs/p0-official-event-evidence.json');

function decodeHtml(value) {
  return value.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16))).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function parseItems(html) {
  const rows = [];
  for (const match of html.matchAll(/data-item='([^']+)'/g)) {
    try { rows.push(JSON.parse(decodeHtml(match[1]))); } catch { /* mantém evidência bruta fora do pacote */ }
  }
  return rows;
}

async function fetchOfficial(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'eleicao2026-p0-evidence/1.0' } });
  const body = await response.text();
  return { url, http_status: response.status, bytes: Buffer.byteLength(body), sha256: createHash('sha256').update(body).digest('hex'), items: parseItems(body) };
}

const pack = JSON.parse(readFileSync(input, 'utf8'));
const urls = [...new Set(pack.items.flatMap((item) => item.official_sources.map((source) => source.url)))];
const sources = [];
for (let index = 0; index < urls.length; index += 3) sources.push(...await Promise.all(urls.slice(index, index + 3).map(fetchOfficial)));
const officialItems = sources.flatMap((source) => source.items.map((item) => ({ ...item, source_url: source.url, source_sha256: source.sha256, source_bytes: source.bytes })));
const result = { schema_version: '1.0.0', packet_type: 'alrs_p0_official_event_evidence', source_kind: 'official_alrs_data_item', remote_apply: false, totals: { urls: sources.length, http_200: sources.filter((source) => source.http_status === 200).length, official_items: officialItems.length }, sources: sources.map(({ items, ...source }) => source), official_items: officialItems };
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
