// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildMeritReviewPack } from '../build-alrs-merit-review-pack.mjs';

describe('alrs-merit-review-pack', () => {
  it('mantém somente eventos merit_candidate e falha fechado para aplicação', () => {
    const result = buildMeritReviewPack({
      methodology_version: '1.0.0',
      unit_of_work: 'one_matrix_per_proposition_version_reused_for_all_voters',
      items: [
        {
          event_type: 'merit_candidate',
          priority: 'P0',
          factual_vote_count: 4,
          version_key: 'v0',
          source_urls: ['official'],
        },
        {
          event_type: 'procedural_candidate',
          priority: 'P1',
          factual_vote_count: 9,
          version_key: 'v1',
        },
      ],
    });

    expect(result.items).toHaveLength(1);
    expect(result.totals).toMatchObject({ versions: 1, factual_votes: 4, p0_versions: 1, p1_versions: 0 });
    expect(result.review_status).toBe('pending_review');
    expect(result.remote_apply).toBe(false);
    expect(result.public_approval).toBe(false);
    expect(result.items[0]).toMatchObject({
      review_gate: 'official_event_confirmation_required',
      editorial_disposition: 'pending_review',
      suggested_groups: [],
      suggested_direction: null,
      defending_vote: null,
      remote_apply: false,
    });
  });

  it('exclui colisões do pacote de mérito até resolução oficial', () => {
    const result = buildMeritReviewPack({ methodology_version: '1.0.0', unit_of_work: 'one_matrix_per_version', items: [{ event_type: 'merit_candidate', version_key_collision: true, factual_vote_count: 7 }] });
    expect(result.items).toHaveLength(0);
    expect(result.totals.excluded_version_collisions).toBe(1);
  });
});
