#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUTPUT = resolve(ROOT, 'data/legislative-import/alrs/impact-review-queue-v1.json');
const RESOLUTIONS = resolve(ROOT, 'data/legislative-import/alrs/version-key-collision-resolutions-confirmed.json');
const CLASSIFICATIONS = resolve(ROOT, 'data/legislative-import/alrs/p0-official-classifications.json');

function loadConfirmedResolutions() {
  try { return JSON.parse(readFileSync(RESOLUTIONS, 'utf8')).resolutions ?? {}; } catch { return {}; }
}

function loadOfficialClassifications() {
  try { return JSON.parse(readFileSync(CLASSIFICATIONS, 'utf8')).classifications ?? {}; } catch { return {}; }
}

export function buildAlrsReviewQueue(rows) {
  const resolutions = loadConfirmedResolutions();
  const classifications = loadOfficialClassifications();
  const items = rows.map((row) => {
    const candidates = Number(row.candidates ?? 0);
    const votes = Number(row.votes ?? 0);
    const priority = candidates >= 7 ? 'P0' : candidates >= 5 ? 'P1' : candidates >= 3 ? 'P2' : 'P3';
    const technical_event_classification = classifyAlrsEventTitle(row.title);
    const official = classifications[row.version_key];
    return {
      house: 'alrs',
      proposition_version_id: row.version_id,
      review_key: `${row.version_key}#${row.version_id}`,
      proposition_external_id: row.proposition_external_id,
      version_key: row.version_key,
      title: row.title,
      title_quality: classifyAlrsTitleQuality(row.title),
      collision_resolution_status: resolutions[row.version_key]?.status ?? null,
      official_event_type: official?.event_type ?? null,
      official_event_date: official?.official_date ?? null,
      official_event_description: official?.description ?? null,
      candidate_count: candidates,
      factual_vote_count: votes,
      event_count: Number(row.events ?? 0),
      event_external_ids: row.event_external_ids ?? [],
      source_urls: row.source_urls ?? [],
      candidate_source_links: row.candidate_source_links ?? [],
      event_type: official?.event_type ?? technical_event_classification,
      editorial_disposition: official?.event_type === 'procedural_confirmed' ? 'procedural_only' : 'pending_review',
      priority,
      suggested_groups: [],
      suggested_direction: null,
      defending_vote: null,
      human_review_required: true,
      remote_apply: false,
    };
  });
  const versionKeyCounts = new Map();
  for (const item of items) versionKeyCounts.set(item.version_key, (versionKeyCounts.get(item.version_key) ?? 0) + 1);
  for (const item of items) {
    item.version_key_collision = (versionKeyCounts.get(item.version_key) ?? 0) > 1 && item.collision_resolution_status !== 'resolved_as_cross_proposition_collision';
    item.human_review_required = true;
  }
  items.sort((a, b) => b.candidate_count - a.candidate_count || b.factual_vote_count - a.factual_vote_count || a.review_key.localeCompare(b.review_key));
  return {
    schema_version: '1.0.0',
    packet_type: 'alrs_impact_review_queue',
    methodology_version: '1.0.0',
    unit_of_work: 'one_matrix_per_proposition_version_reused_for_all_voters',
    review_status: 'pending_review',
    remote_apply: false,
    public_approval: false,
    totals: {
      versions: items.length,
      factual_votes: items.reduce((sum, item) => sum + item.factual_vote_count, 0),
      candidates_covered: Math.max(0, ...items.map((item) => item.candidate_count)),
      p0_versions: items.filter((item) => item.priority === 'P0').length,
      p1_versions: items.filter((item) => item.priority === 'P1').length,
    },
    items,
  };
}

export function classifyAlrsEventTitle(title) {
  const value = String(title ?? '').trim();
  if (/^(requer|encaminha indicação|encaminha indicacao)\b/i.test(value)) return 'procedural_candidate';
  if (/^(altera|dispõe|dispoe|permite|cria|institui|estabelece|reserva|regulamenta)\b/i.test(value)) return 'merit_candidate';
  return 'needs_official_classification';
}

export function classifyAlrsTitleQuality(title) {
  const value = String(title ?? '').trim();
  if (!value) return 'missing';
  if (/^(PL|PEC|PLP|PDL|MPV|REQ)\s+\d+\/\d{4}$/i.test(value)) return 'generic';
  if (/(do Rio Grande do|Estado do Rio Grande do|dá outras providências\s*\.\.\.)$/i.test(value)) return 'possibly_truncated';
  return 'complete_or_unverified';
}

function parseSupabaseJson(output) {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Resposta JSON do Supabase não encontrada');
  return JSON.parse(output.slice(start, end + 1));
}

function queryRows() {
  const sql = `
    select
      pv.id as version_id,
      pv.version_key,
      lp.external_id as proposition_external_id,
      lp.title,
      count(distinct ve.id)::int as events,
      count(distinct lv.candidate_id)::int as candidates,
      count(lv.id)::int as votes,
      coalesce(json_agg(distinct ve.external_id) filter (where ve.external_id is not null), '[]'::json) as event_external_ids,
      coalesce(json_agg(distinct sr.url) filter (where sr.url is not null), '[]'::json) as source_urls,
      coalesce(json_agg(distinct jsonb_build_object('candidate_id', lv.candidate_id, 'event_external_id', ve.external_id, 'source_reference_id', lv.source_reference_id)) filter (where lv.candidate_id is not null), '[]'::json) as candidate_source_links
    from proposition_versions pv
    join legislative_propositions lp on lp.id = pv.proposition_id
    join voting_events ve on ve.proposition_version_id = pv.id and ve.house = 'alrs'
    join legislative_votes lv on lv.voting_event_id = ve.id
    left join impact_matrices im on im.proposition_version_id = pv.id
    left join source_references sr on sr.id in (pv.source_reference_id, ve.source_reference_id, lv.source_reference_id)
    where im.id is null
    group by pv.id, pv.version_key, lp.external_id, lp.title
    order by candidates desc, votes desc;
  `;
  const output = execFileSync('supabase', ['db', 'query', '--linked', '--output', 'json', sql], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return parseSupabaseJson(output).rows ?? [];
}

function main() {
  mkdirSync(resolve(ROOT, 'data/legislative-import/alrs'), { recursive: true });
  const queue = buildAlrsReviewQueue(queryRows());
  writeFileSync(OUTPUT, `${JSON.stringify(queue, null, 2)}\n`);
  console.log(JSON.stringify({ output: OUTPUT, ...queue.totals }));
}

if (process.argv[1]?.endsWith('build-alrs-impact-review-queue.mjs')) main();
