#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-merit-review-pack-p0-p1.json');
const output = resolve(root, 'data/legislative-import/alrs/impact-merit-source-manifest.json');

async function verify(url) {
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'eleicao2026-source-verifier/1.0' } });
    const body = await response.arrayBuffer();
    const bytes = Buffer.from(body);
    return { url, http_status: response.status, content_type: response.headers.get('content-type'), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), ok: response.ok };
  } catch (error) {
    return { url, http_status: 0, error: error instanceof Error ? error.message : String(error), ok: false };
  }
}

const pack = JSON.parse(readFileSync(input, 'utf8'));
const urls = [...new Set(pack.items.flatMap((item) => item.source_urls ?? []))].filter((url) => url.startsWith('https://transparencia.al.rs.gov.br/'));
const results = [];
for (let index = 0; index < urls.length; index += 3) results.push(...await Promise.all(urls.slice(index, index + 3).map(verify)));
const manifest = { schema_version: '1.0.0', source_kind: 'official_alrs', generated_at: new Date().toISOString(), urls: results, totals: { urls: results.length, http_200: results.filter((row) => row.http_status === 200).length, ok: results.filter((row) => row.ok).length, failed: results.filter((row) => !row.ok).length } };
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ output, ...manifest.totals }));
