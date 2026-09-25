// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  RELEASE_STATES,
  classifyRelease,
  inventoryKey,
  releaseReason,
} from '../lib/alrs-release-gates.mjs';

const base = {
  voting_event_id: 'event-1',
  assessment_id: 'assessment-1',
  methodology_version: '2.0.0',
  identity_status: 'exact',
  event_source_reference_id: 'source-event',
  version_source_reference_id: 'source-version',
  object_voted_required: true,
  object_source_reference_id: 'source-object',
  assessment_source_required: true,
  assessment_has_source: true,
  event_status: 'isolated',
  object_voted_kind: 'base_text',
  factual_vote_present: true,
  candidate_ids: ['candidate-1'],
  attribution_id: 'attr-1',
  review_status: 'approved',
  score_eligible: true,
  vote_attribution_status: 'isolated',
  event_defending_vote: 'sim',
  attribution_has_source: true,
  internal_review_approved: true,
  internal_reviewer_id: 'reviewer-1',
  created_by: 'author-1',
  external_review_required: false,
};

describe('ALRS release gates', () => {
  it('retém evento sem fonte', () => {
    expect(classifyRelease({ ...base, event_source_reference_id: null })).toBe(RELEASE_STATES.WITHHELD_SOURCE);
  });

  it('retém colisão de identidade', () => {
    expect(classifyRelease({ ...base, identity_status: 'collision' })).toBe(RELEASE_STATES.WITHHELD_IDENTITY);
  });

  it('retém composto não separável e procedural', () => {
    expect(classifyRelease({ ...base, event_status: 'compound_non_separable' })).toBe(RELEASE_STATES.WITHHELD_COMPOUND);
    expect(classifyRelease({ ...base, event_status: 'procedural', object_voted_kind: 'procedural' })).toBe(RELEASE_STATES.WITHHELD_PROCEDURAL);
  });

  it('permite fato nominal sem promover impacto', () => {
    expect(classifyRelease({ ...base, attribution_id: null })).toBe(RELEASE_STATES.FACTUAL_READY);
  });

  it('libera impacto somente com atribuição completa', () => {
    expect(classifyRelease(base)).toBe(RELEASE_STATES.IMPACT_RELEASE_READY);
    expect(classifyRelease({ ...base, attribution_has_source: false })).toBe(RELEASE_STATES.FACTUAL_READY);
    expect(classifyRelease({ ...base, internal_reviewer_id: base.created_by })).toBe(RELEASE_STATES.FACTUAL_READY);
  });

  it('exige revisão externa quando configurada', () => {
    expect(classifyRelease({ ...base, external_review_required: true })).toBe(RELEASE_STATES.FACTUAL_READY);
    expect(classifyRelease({ ...base, external_review_required: true, external_review_approved: true })).toBe(RELEASE_STATES.IMPACT_RELEASE_READY);
  });

  it('não libera quando o remoto é desconhecido e mantém chave determinística', () => {
    expect(classifyRelease({ ...base, remote_state: 'unknown' })).toBe(RELEASE_STATES.REMOTE_UNKNOWN);
    expect(inventoryKey(base)).toBe('event-1|assessment-1|2.0.0');
    expect(releaseReason(base)).toMatch(/gates .* verdes/i);
  });
});
