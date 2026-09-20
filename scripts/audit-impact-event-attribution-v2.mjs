#!/usr/bin/env node
/**
 * Read-only methodology v2 audit.
 *
 * Produces a reprocessing inventory by crossing:
 *   proposition_version -> impact_assessment -> voting_event -> event attribution
 *
 * It never writes to Supabase. Missing v2 attribution is classified as
 * needs_event_binding, never inferred from legacy proposition-level fields.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'artifacts/reprocess-impact-v2');
const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const key =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    'Defina SUPABASE_URL/VITE_SUPABASE_URL e uma chave publishable/anon para o dry-run read-only.',
  );
  process.exit(2);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function chunks(values, size = 80) {
  const result = [];
  for (let i = 0; i < values.length; i += size) result.push(values.slice(i, i + size));
  return result;
}

async function fetchPaged(factory, pageSize = 1000) {
  const all = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await factory(from, from + pageSize - 1);
    if (error) throw error;
    all.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return all;
}

async function fetchMatrices() {
  return fetchPaged((from, to) =>
    supabase
      .from('impact_matrices')
      .select(
        'id,proposition_version_id,review_status,methodology_version,severity,structural_type,impact_assessments(id,group_slug,impact_direction,defending_vote,textual_defending_vote,confidence,impact_assessment_sources(source_reference_id))',
      )
      .in('review_status', ['approved', 'contested'])
      .range(from, to),
  );
}

async function fetchEvents(versionIds) {
  const rows = [];
  for (const batch of chunks(versionIds)) {
    rows.push(
      ...(await fetchPaged((from, to) =>
        supabase
          .from('voting_events')
          .select('id,proposition_version_id,external_id,house,session_id,vote_round,occurred_at,source_reference_id')
          .in('proposition_version_id', batch)
          .range(from, to),
      )),
    );
  }
  return rows;
}

async function fetchAttributions(eventIds, assessmentIds) {
  const rows = [];
  try {
    for (const eventBatch of chunks(eventIds, 60)) {
      for (const assessmentBatch of chunks(assessmentIds, 60)) {
        rows.push(
          ...(await fetchPaged((from, to) =>
            supabase
              .from('impact_event_attributions')
              .select(
                'id,voting_event_id,assessment_id,object_voted_kind,event_defending_vote,score_eligible,vote_attribution_status,score_withholding_reason,confidence,rationale,review_status,methodology_version,impact_event_attribution_sources(source_reference_id,source_kind)',
              )
              .eq('methodology_version', '2.0.0')
              .in('voting_event_id', eventBatch)
              .in('assessment_id', assessmentBatch)
              .range(from, to),
          )),
        );
      }
    }
  } catch (error) {
    const message = String(error?.message ?? error);
    if (
      message.includes('impact_event_attributions') ||
      error?.code === '42P01' ||
      error?.code === 'PGRST205'
    ) {
      return [];
    }
    throw error;
  }
  return rows;
}

async function fetchVoteIndex(eventIds) {
  const rows = [];
  for (const batch of chunks(eventIds, 60)) {
    rows.push(
      ...(await fetchPaged((from, to) =>
        supabase
          .from('legislator_vote_index')
          .select('candidate_id,voting_event_id,value')
          .in('voting_event_id', batch)
          .range(from, to),
      )),
    );
  }
  return rows;
}

function pairKey(eventId, assessmentId) {
  return `${eventId}|${assessmentId}`;
}

function scoreable(a) {
  return Boolean(
    a &&
      a.methodology_version === '2.0.0' &&
      a.score_eligible === true &&
      ['approved', 'contested'].includes(a.review_status) &&
      ['isolated', 'compound_separable'].includes(a.vote_attribution_status) &&
      ['sim', 'nao'].includes(a.event_defending_vote) &&
      Array.isArray(a.impact_event_attribution_sources) &&
      a.impact_event_attribution_sources.length > 0,
  );
}

function withheldClass(a) {
  if (!a) return 'needs_event_binding';
  if (a.vote_attribution_status === 'procedural') return 'procedural';
  if (a.vote_attribution_status === 'event_binding_missing') return 'needs_event_binding';
  return 'verified_text_unscoreable';
}

async function main() {
  const matrices = await fetchMatrices();
  const assessments = matrices.flatMap((matrix) =>
    (matrix.impact_assessments ?? []).map((assessment) => ({
      ...assessment,
      matrix_id: matrix.id,
      proposition_version_id: matrix.proposition_version_id,
      matrix_review_status: matrix.review_status,
      matrix_methodology_version: matrix.methodology_version,
      severity: matrix.severity,
      structural_type: matrix.structural_type,
    })),
  );
  const versionIds = [...new Set(matrices.map((row) => row.proposition_version_id))];
  const events = await fetchEvents(versionIds);
  const eventIds = events.map((row) => row.id);
  const assessmentIds = assessments.map((row) => row.id);
  const attributions = await fetchAttributions(eventIds, assessmentIds);
  const votes = await fetchVoteIndex(eventIds);

  const assessmentsByVersion = new Map();
  for (const assessment of assessments) {
    const bucket = assessmentsByVersion.get(assessment.proposition_version_id) ?? [];
    bucket.push(assessment);
    assessmentsByVersion.set(assessment.proposition_version_id, bucket);
  }
  const attributionByPair = new Map(
    attributions.map((row) => [pairKey(row.voting_event_id, row.assessment_id), row]),
  );
  const candidatesByEvent = new Map();
  for (const vote of votes) {
    const bucket = candidatesByEvent.get(vote.voting_event_id) ?? new Set();
    if (vote.candidate_id) bucket.add(vote.candidate_id);
    candidatesByEvent.set(vote.voting_event_id, bucket);
  }

  const inventory = [];
  for (const event of events) {
    for (const assessment of assessmentsByVersion.get(event.proposition_version_id) ?? []) {
      const attribution = attributionByPair.get(pairKey(event.id, assessment.id));
      const assessmentHasSources =
        Array.isArray(assessment.impact_assessment_sources) &&
        assessment.impact_assessment_sources.length > 0;
      let classification;
      if (!assessmentHasSources) classification = 'source_missing';
      else if (scoreable(attribution)) classification = 'verified_scoreable';
      else classification = withheldClass(attribution);

      inventory.push({
        proposition_version_id: event.proposition_version_id,
        voting_event_id: event.id,
        event_external_id: event.external_id,
        house: event.house,
        occurred_at: event.occurred_at,
        assessment_id: assessment.id,
        group_slug: assessment.group_slug,
        impact_direction: assessment.impact_direction,
        textual_defending_vote:
          assessment.textual_defending_vote ?? assessment.defending_vote ?? null,
        attribution_id: attribution?.id ?? null,
        event_defending_vote: attribution?.event_defending_vote ?? null,
        vote_attribution_status:
          attribution?.vote_attribution_status ?? 'event_binding_missing',
        score_eligible: scoreable(attribution),
        classification,
        affected_candidates: [...(candidatesByEvent.get(event.id) ?? [])],
      });
    }
  }

  const verified = inventory.filter((row) => row.classification === 'verified_scoreable');
  const withheld = inventory.filter((row) => row.classification !== 'verified_scoreable');
  const affectedLegislators = [...new Set(withheld.flatMap((row) => row.affected_candidates))];
  const versionsWithEventCount = new Map();
  for (const event of events) {
    versionsWithEventCount.set(
      event.proposition_version_id,
      (versionsWithEventCount.get(event.proposition_version_id) ?? 0) + 1,
    );
  }

  const summary = {
    schema_version: '2.0.0',
    packet_type: 'impact_event_attribution_v2_dry_run',
    mode: 'read-only',
    remote_apply: false,
    generated_at: new Date().toISOString(),
    counts: {
      matrices: matrices.length,
      assessments: assessments.length,
      assessed_versions: versionIds.length,
      voting_events: events.length,
      event_assessment_pairs: inventory.length,
      factual_vote_index_rows: votes.length,
      verified_scoreable: verified.length,
      withheld: withheld.length,
      affected_candidates_with_withheld_events: affectedLegislators.length,
      versions_with_multiple_events: [...versionsWithEventCount.values()].filter((n) => n > 1).length,
      max_events_same_version: Math.max(0, ...versionsWithEventCount.values()),
    },
  };

  const queue = {
    ...summary,
    packet_type: 'impact_event_attribution_v2_reanalysis_queue',
    items: withheld,
  };
  const verifiedPack = {
    ...summary,
    packet_type: 'impact_event_attribution_v2_verified_scoreable',
    items: verified,
  };
  const withheldPack = {
    ...summary,
    packet_type: 'impact_event_attribution_v2_withheld_events',
    items: withheld,
  };
  const affectedPack = {
    ...summary,
    packet_type: 'impact_event_attribution_v2_affected_candidates',
    candidate_ids: affectedLegislators,
  };

  await mkdir(OUT, { recursive: true });
  await Promise.all([
    writeFile(resolve(OUT, 'inventory.json'), JSON.stringify({ ...summary, items: inventory }, null, 2) + '\n'),
    writeFile(resolve(OUT, 'reanalysis-queue.json'), JSON.stringify(queue, null, 2) + '\n'),
    writeFile(resolve(OUT, 'verified-scoreable.json'), JSON.stringify(verifiedPack, null, 2) + '\n'),
    writeFile(resolve(OUT, 'withheld-events.json'), JSON.stringify(withheldPack, null, 2) + '\n'),
    writeFile(resolve(OUT, 'affected-legislators.json'), JSON.stringify(affectedPack, null, 2) + '\n'),
    writeFile(
      resolve(OUT, 'final-audit.md'),
      `# Impact attribution v2 — dry-run\n\n` +
        `Modo: read-only. Nenhuma mutação remota.\n\n` +
        `- Matrizes: ${summary.counts.matrices}\n` +
        `- Assessments: ${summary.counts.assessments}\n` +
        `- Versões avaliadas: ${summary.counts.assessed_versions}\n` +
        `- Eventos: ${summary.counts.voting_events}\n` +
        `- Pares evento × assessment: ${summary.counts.event_assessment_pairs}\n` +
        `- Verificados e pontuáveis: ${summary.counts.verified_scoreable}\n` +
        `- Retidos: ${summary.counts.withheld}\n` +
        `- Versões com múltiplos eventos: ${summary.counts.versions_with_multiple_events}\n` +
        `- Máximo de eventos na mesma versão: ${summary.counts.max_events_same_version}\n\n` +
        `Regra: ausência de atribuição v2 aprovada não é convertida em score zero nem herda o defending_vote textual.\n`,
    ),
  ]);

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
