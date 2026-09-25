// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildInventory } from '../build-alrs-attribution-release-queue.mjs';
import { RELEASE_STATES } from '../lib/alrs-release-gates.mjs';

const row = (overrides = {}) => ({
  voting_event_id: 'event-1',
  event_external_id: 'ext-1',
  house: 'alrs',
  occurred_at: '2026-01-01T00:00:00Z',
  proposition_version_id: 'version-1',
  version_key: 'texto-PL-1-2026',
  event_source_reference_id: 'event-source',
  version_source_reference_id: 'version-source',
  matrix_review_status: 'approved',
  severity: 2,
  assessment_id: 'assessment-1',
  group_slug: 'mulheres',
  assessment_confidence: 0.9,
  assessment_has_source: true,
  attribution_id: null,
  candidate_ids: ['candidate-1'],
  ...overrides,
});

describe('build-alrs-attribution-release-queue', () => {
  it('deduplica pela chave evento-assessment-metodologia e conserva os retidos', () => {
    const inventory = buildInventory([row(), row(), row({ voting_event_id: 'event-2', event_external_id: 'ext-2' })]);
    expect(inventory).toHaveLength(2);
    expect(inventory.every((item) => item.remote_apply === false)).toBe(true);
    expect(inventory.every((item) => item.state === RELEASE_STATES.FACTUAL_READY)).toBe(true);
  });

  it('classifica factual pronto sem transformar ausência de atribuição em score', () => {
    const inventory = buildInventory([row()]);
    expect(inventory[0].state).toBe(RELEASE_STATES.FACTUAL_READY);
  });

  it('libera impacto somente quando a atribuição possui fonte e revisão', () => {
    const inventory = buildInventory([row({
      attribution_id: 'attr-1',
      object_voted_kind: 'base_text',
      object_source_reference_id: 'object-source',
      attribution_has_source: true,
      methodology_version: '2.0.0',
      review_status: 'approved',
      score_eligible: true,
      vote_attribution_status: 'isolated',
      event_defending_vote: 'sim',
      internal_review_approved: true,
      internal_reviewer_id: 'reviewer-1',
      created_by: 'author-1',
    })]);
    expect(inventory[0].state).toBe(RELEASE_STATES.IMPACT_RELEASE_READY);
  });
});
