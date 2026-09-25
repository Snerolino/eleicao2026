#!/usr/bin/env node
/** Read-only event × assessment release inventory. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { classifyRelease, inventoryKey, releaseReason, RELEASE_STATES } from './lib/alrs-release-gates.mjs';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'artifacts/reprocess-impact-v2');
const sql = `
select
  e.id as voting_event_id,
  e.external_id as event_external_id,
  e.house,
  e.occurred_at,
  e.proposition_version_id,
  e.source_reference_id as event_source_reference_id,
  p.version_key,
  p.source_reference_id as version_source_reference_id,
  m.review_status as matrix_review_status,
  m.severity,
  m.methodology_version as matrix_methodology_version,
  a.id as assessment_id,
  a.group_slug,
  a.confidence as assessment_confidence,
  exists(select 1 from public.impact_assessment_sources ias where ias.assessment_id = a.id) as assessment_has_source,
  ea.id as attribution_id,
  ea.object_voted_kind,
  ea.event_defending_vote,
  ea.score_eligible,
  ea.vote_attribution_status,
  ea.review_status,
  ea.methodology_version,
  exists(select 1 from public.impact_event_attribution_sources eas where eas.attribution_id = ea.id) as attribution_has_source,
  exists(select 1 from public.impact_event_attribution_reviews er where er.attribution_id = ea.id and er.reviewer_type = 'curadoria_interna' and er.decision = 'approved') as internal_review_approved,
  exists(select 1 from public.impact_event_attribution_reviews er where er.attribution_id = ea.id and er.reviewer_type = 'painel_externo' and er.decision = 'approved') as external_review_approved,
  ea.created_by,
  coalesce(array(select distinct i.candidate_id::text from public.legislator_vote_index i where i.voting_event_id = e.id), '{}') as candidate_ids
from public.voting_events e
join public.proposition_versions p on p.id = e.proposition_version_id
join public.impact_matrices m on m.proposition_version_id = e.proposition_version_id
join public.impact_assessments a on a.impact_matrix_id = m.id
left join public.impact_event_attributions ea
  on ea.voting_event_id = e.id
 and ea.assessment_id = a.id
 and ea.methodology_version = '2.0.0'
where e.house = 'alrs'
  and e.occurred_at >= '2022-01-01'
  and m.review_status in ('approved', 'contested')
order by e.occurred_at, e.id, a.id;
`;

function readJson(relative, fallback) {
  try { return JSON.parse(readFileSync(resolve(root, relative), 'utf8')); } catch { return fallback; }
}

function queryRows() {
  if (process.argv.includes('--fixture')) return [];
  const raw = execFileSync('supabase', ['db', 'query', '--linked', '--output-format', 'json', sql], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const start = raw.indexOf('{');
  if (start < 0) throw new Error('Supabase CLI returned no JSON payload');
  const payload = JSON.parse(raw.slice(start));
  if (!Array.isArray(payload.rows)) throw new Error('Unexpected inventory payload');
  return payload.rows;
}

function collisionSet() {
  const audit = readJson('data/legislative-import/alrs/version-key-collision-audit-v1.json', { collisions: [] });
  return new Set((audit.collisions ?? []).map((item) => item.version_key).filter(Boolean));
}

function normalizeRow(row, collisions) {
  const candidateIds = Array.isArray(row.candidate_ids) ? row.candidate_ids.filter(Boolean) : [];
  const collision = collisions.has(row.version_key);
  const eventStatus = row.attribution_id ? row.vote_attribution_status : null;
  const item = {
    ...row,
    candidate_ids: candidateIds,
    identity_status: collision ? 'collision' : 'exact',
    event_status: eventStatus,
    object_voted_required: Boolean(row.attribution_id),
    assessment_source_required: true,
    factual_vote_present: candidateIds.length > 0,
    remote_state: 'known',
    internal_reviewer_id: row.internal_review_approved ? 'reviewer' : null,
    external_review_required: Number(row.severity ?? 0) >= 4 || Number(row.assessment_confidence ?? 1) < 0.6 || eventStatus === 'compound_separable',
  };
  const state = classifyRelease(item);
  return {
    ...item,
    state,
    reason: releaseReason(item, state),
    inventory_key: inventoryKey(item),
    remote_apply: false,
    public_approval: false,
  };
}

export function buildInventory(rows, collisions = new Set()) {
  const seen = new Set();
  const inventory = [];
  for (const row of rows) {
    const item = normalizeRow(row, collisions);
    if (seen.has(item.inventory_key)) continue;
    seen.add(item.inventory_key);
    inventory.push(item);
  }
  return inventory;
}

function writeArtifacts(inventory) {
  mkdirSync(outDir, { recursive: true });
  const state = {
    schema_version: '1.0.0',
    packet_type: 'alrs_event_assessment_release_inventory',
    mode: 'read-only',
    remote_apply: false,
    generated_at: new Date().toISOString(),
    counts: Object.fromEntries(Object.values(RELEASE_STATES).map((state) => [state, inventory.filter((item) => item.state === state).length])),
    inventory_count: inventory.length,
    inventory,
  };
  const factual = inventory.filter((item) => item.state === RELEASE_STATES.FACTUAL_READY);
  const impactReview = inventory.filter((item) => item.state === RELEASE_STATES.IMPACT_READY_FOR_REVIEW);
  const withheld = inventory.filter((item) => ![RELEASE_STATES.FACTUAL_READY, RELEASE_STATES.IMPACT_READY_FOR_REVIEW, RELEASE_STATES.IMPACT_RELEASE_READY].includes(item.state));
  writeFileSync(resolve(outDir, 'release-inventory.json'), `${JSON.stringify(state, null, 2)}\n`);
  writeFileSync(resolve(outDir, 'factual-release-queue.json'), `${JSON.stringify({ ...state, inventory: factual, inventory_count: factual.length }, null, 2)}\n`);
  writeFileSync(resolve(outDir, 'impact-review-queue.json'), `${JSON.stringify({ ...state, inventory: impactReview, inventory_count: impactReview.length }, null, 2)}\n`);
  writeFileSync(resolve(outDir, 'withheld-events.json'), `${JSON.stringify({ ...state, inventory: withheld, inventory_count: withheld.length }, null, 2)}\n`);
  return state;
}

if (process.argv[1]?.endsWith('build-alrs-attribution-release-queue.mjs')) {
  try {
    const inventory = buildInventory(queryRows(), collisionSet());
    const state = writeArtifacts(inventory);
    console.log(JSON.stringify({
      inventory_count: state.inventory_count,
      counts: state.counts,
      output: 'artifacts/reprocess-impact-v2',
      remote_apply: false,
    }));
  } catch (error) {
    console.error(`REMOTE_UNKNOWN: ${error.message}`);
    process.exit(2);
  }
}
