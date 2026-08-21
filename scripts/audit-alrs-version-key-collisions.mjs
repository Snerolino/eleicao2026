#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'data/legislative-import/alrs/version-key-collision-audit-v1.json');

function parseJson(outputText) {
  const start = outputText.indexOf('{');
  const end = outputText.lastIndexOf('}');
  return JSON.parse(outputText.slice(start, end + 1));
}

function query() {
  const sql = `
    with duplicated as (
      select version_key
      from proposition_versions
      group by version_key
      having count(*) > 1
    )
    select pv.id as proposition_version_id,
      pv.version_key,
      pv.text_hash,
      pv.version_label,
      lp.external_id as proposition_external_id,
      lp.title,
      ve.id as event_id,
      ve.external_id as event_external_id,
      ve.occurred_at,
      ve.vote_round,
      sr.url as source_url
    from proposition_versions pv
    join duplicated d on d.version_key = pv.version_key
    join legislative_propositions lp on lp.id = pv.proposition_id
    left join voting_events ve on ve.proposition_version_id = pv.id
    left join source_references sr on sr.id in (pv.source_reference_id, ve.source_reference_id)
    where ve.house = 'alrs'
    order by pv.version_key, pv.id, ve.occurred_at;
  `;
  return parseJson(execFileSync('supabase', ['db', 'query', '--linked', '--output', 'json', sql], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })).rows ?? [];
}

const rows = query();
const groups = new Map();
for (const row of rows) {
  const list = groups.get(row.version_key) ?? [];
  list.push(row);
  groups.set(row.version_key, list);
}
const collisions = [...groups.entries()].map(([version_key, entries]) => ({
  version_key,
  proposition_version_ids: [...new Set(entries.map((entry) => entry.proposition_version_id))],
  entries,
  resolution_status: 'blocked_until_official_version_identity',
}));
const result = { schema_version: '1.0.0', packet_type: 'alrs_version_key_collision_audit', remote_apply: false, totals: { collision_keys: collisions.length, affected_versions: new Set(rows.map((row) => row.proposition_version_id)).size, affected_events: new Set(rows.map((row) => row.event_id).filter(Boolean)).size }, collisions };
mkdirSync(resolve(root, 'data/legislative-import/alrs'), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
