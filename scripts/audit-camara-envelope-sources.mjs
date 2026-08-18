#!/usr/bin/env node
/** Auditor read-only de fontes oficiais presentes em envelope Câmara. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function collectSourceUrls(envelope) {
  const urls = new Set();
  for (const proposition of envelope.propositions ?? []) {
    if (proposition.official_url) urls.add(proposition.official_url);
    for (const version of proposition.versions ?? []) {
      if (version.source) urls.add(version.source);
      for (const event of version.voting_events ?? []) if (event.source) urls.add(event.source);
    }
  }
  for (const vote of envelope.votes ?? []) if (vote.source) urls.add(vote.source);
  return [...urls].sort();
}

async function main() {
  const input = process.argv[2];
  const output = process.argv[3] || input.replace(/\.json$/, '-source-manifest.json');
  if (!input) throw new Error('Uso: node scripts/audit-camara-envelope-sources.mjs <envelope.json> [manifest.json]');
  const envelope = JSON.parse(readFileSync(resolve(input), 'utf8'));
  const urls = collectSourceUrls(envelope);
  const rows = [];
  for (const url of urls) {
    let response;
    let body;
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'eleicao2026-camara-source-audit/1.0' } });
        body = await response.text();
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) throw new Error(`fetch failed após 3 tentativas: ${url}: ${lastError.message}`);
    rows.push({ url, status: response.status, bytes: Buffer.byteLength(body, 'utf8'), sha256: `sha256:${createHash('sha256').update(body, 'utf8').digest('hex')}` });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  }
  const result = { schema_version: '1.0.0', mode: 'read-only', source_domain: 'dadosabertos.camara.leg.br', envelope: input, urls: rows };
  writeFileSync(resolve(output), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({ urls: rows.length, all_http_200: rows.every((row) => row.status === 200), output }, null, 2));
}

if (process.argv[1]?.endsWith('audit-camara-envelope-sources.mjs')) main().catch((error) => { console.error(`FED-21 sources: ${error.message}`); process.exitCode = 1; });
