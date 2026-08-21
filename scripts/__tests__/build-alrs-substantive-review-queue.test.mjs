// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildSubstantiveQueue } from '../build-alrs-substantive-review-queue.mjs';

describe('alrs-substantive-review-queue', () => {
  it('exclui procedimentos/emendas e mantém mérito pendente', () => {
    const result = buildSubstantiveQueue({ methodology_version: '1.0.0', unit_of_work: 'one_matrix_per_version', items: [
      { event_type: 'merit_confirmed', version_key_collision: false, title_quality: 'complete_or_unverified', factual_vote_count: 7 },
      { event_type: 'procedural_confirmed', version_key_collision: false, title_quality: 'complete_or_unverified', factual_vote_count: 7 },
      { event_type: 'amendment_confirmed', version_key_collision: false, title_quality: 'complete_or_unverified', factual_vote_count: 7 },
    ] });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].review_gate).toBe('official_event_confirmed');
    expect(result.items[0].editorial_disposition).toBe('pending_review');
  });
});
