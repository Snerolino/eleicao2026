#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = process.argv.slice(2).find((arg) => !arg.startsWith('--')) ?? 'data/legislative-import/alrs/impact-matrix-review-pack-p0-p1.json';

export function validateSubstantiveSources(pack) {
  const errors = [];
  for (const [index, item] of (pack.items ?? []).entries()) {
    const urls = (item.official_sources ?? []).map((source) => source.url ?? source).filter(Boolean);
    const substantiveUrls = urls.filter((url) => !url.includes('/votos-plenario/'));
    const declaredSources = Array.isArray(item.substantive_sources)
      ? item.substantive_sources.filter((source) => source.document_url || source.proposition_page)
      : [];
    if (substantiveUrls.length === 0 && declaredSources.length === 0) errors.push(`items[${index}]:substantive_source_missing`);
    if (item.substantive_source_gate !== 'green' && item.substantive_source_gate !== undefined) errors.push(`items[${index}]:substantive_gate_blocked`);
  }
  return { ok: errors.length === 0, errors, checked: pack.items?.length ?? 0 };
}

function main() {
  const pack = JSON.parse(readFileSync(resolve(root, input), 'utf8'));
  const result = validateSubstantiveSources(pack);
  console.log(JSON.stringify(result));
  if (!result.ok) process.exit(2);
}

if (process.argv[1]?.endsWith('validate-alrs-substantive-sources.mjs')) main();
