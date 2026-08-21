#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const packPath = resolve(root, 'data/legislative-import/alrs/p1-substantive-review-pack-v1.json');
const evidencePath = resolve(root, 'data/legislative-import/alrs/p1-official-event-evidence.json');
const output = resolve(root, 'data/legislative-import/alrs/p1-official-match-report.json');

function keyFrom(item) {
  const text = `${item.proposition_external_id ?? ''} ${item.title ?? ''}`;
  const match = text.match(/\b(PEC|PLP|PLC|PL|PDL|PR|RDI|RCE)\s*[-:]?\s*(\d+)\s*\/\s*(\d{4})\b/i);
  return match ? `${match[1].toUpperCase()}-${match[2]}-${match[3]}` : null;
}

function keyOfficial(row) {
  const type = String(row.tipoProjeto ?? '').trim().toUpperCase();
  const number = row.numProposicao;
  const year = row.anoProposicao;
  return type && number && year ? `${type}-${number}-${year}` : null;
}

function norm(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const pack = JSON.parse(readFileSync(packPath, 'utf8'));
const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
const items = (pack.items ?? []).map((item) => {
  const structuredKey = keyFrom(item);
  let matches = structuredKey
    ? evidence.official_items.filter((row) => keyOfficial(row) === structuredKey)
    : [];
  let matchMethod = matches.length ? 'structured_key' : null;

  if (!matches.length) {
    const title = norm(item.title);
    matches = evidence.official_items.filter((row) => {
      const matter = norm(row.materia);
      return title.length > 20 && matter.length > 20 && (matter === title || matter.includes(title) || title.includes(matter));
    });
    matchMethod = matches.length ? 'official_title_exact_or_contained' : null;
  }

  const propositionKeys = [...new Set(matches.map(keyOfficial).filter(Boolean))];
  const officialMatchKey = propositionKeys.length === 1 ? propositionKeys[0] : null;
  const status = propositionKeys.length === 1
    ? 'matched_official_identity'
    : propositionKeys.length > 1
      ? 'multiple_official_candidates'
      : 'needs_official_identity';

  return {
    ...item,
    official_match_key: officialMatchKey,
    official_match_method: matchMethod,
    official_match_count: matches.length,
    official_match_status: status,
    official_match_proposition_keys: propositionKeys,
    official_matches: matches.slice(0, 20),
  };
});

const result = {
  schema_version: '1.0.0',
  packet_type: 'alrs_p1_official_match_report',
  remote_apply: false,
  totals: {
    items: items.length,
    matched: items.filter((item) => item.official_match_status === 'matched_official_identity').length,
    multiple: items.filter((item) => item.official_match_status === 'multiple_official_candidates').length,
    unmatched: items.filter((item) => item.official_match_status === 'needs_official_identity').length,
  },
  items,
};

writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
