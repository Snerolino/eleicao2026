#!/usr/bin/env node
/** Audita vínculos de fontes legislativas no Supabase; nunca escreve no remoto. */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { hasSourceGaps, summarizeSourceCoverage } from './lib/source-coverage.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const PAGE = 1000;
const TABLES = {
  propositions: { table: 'legislative_propositions', select: 'house,external_id', source: false },
  versions: { table: 'proposition_versions', select: 'source_reference_id,proposition_id,legislative_propositions(house)', source: true },
  events: { table: 'voting_events', select: 'house,source_reference_id,external_id', source: true },
  votes: { table: 'legislative_votes', select: 'source_reference_id,voting_events(house)', source: true },
};

function loadEnv() {
  const values = {};
  for (const file of [resolve(ROOT, '.env.local'), resolve(ROOT, '.env'), '/home/lourenco/Projetos/raspador-candidados-2026/.env']) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const text = line.trim();
      if (!text || text.startsWith('#')) continue;
      const index = text.indexOf('=');
      if (index < 0) continue;
      values[text.slice(0, index).trim()] = text.slice(index + 1).trim().replace(/^["']|["']$/g, '');
    }
  }
  return values;
}

async function allRows(client, table, select) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await client.from(table).select(select).range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE) return rows;
  }
}

async function main() {
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Credenciais Supabase ausentes');

  const client = createClient(url, key, { auth: { persist: false } });
  const report = { mode: 'read-only', tables: {}, has_gaps: false };
  for (const [name, config] of Object.entries(TABLES)) {
    const rows = await allRows(client, config.table, config.select);
    const summary = summarizeSourceCoverage(rows);
    report.tables[name] = { rows: rows.length, source_tracking: config.source, coverage: config.source ? summary : null };
    if (config.source && hasSourceGaps(summary)) report.has_gaps = true;
  }

  console.log(JSON.stringify(report, null, 2));
  if (process.argv.includes('--strict') && report.has_gaps) process.exitCode = 2;
}

main().catch((error) => {
  console.error(`source-coverage-audit: ${error.message}`);
  process.exitCode = 1;
});
