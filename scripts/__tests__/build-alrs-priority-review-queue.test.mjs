// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildPriorityQueue } from '../build-alrs-priority-review-queue.mjs';

describe('alrs-priority-review-queue', () => {
  it('mantém somente P0/P1 e deduplica URLs', () => {
    const result = buildPriorityQueue({ methodology_version: '1.0.0', unit_of_work: 'one_matrix_per_proposition_version', items: [
      { priority: 'P0', candidate_count: 7, factual_vote_count: 10, event_count: 1, source_urls: ['u', 'u'], event_external_ids: ['e'], title: 'P0', version_key: 'v0' },
      { priority: 'P2', candidate_count: 3, factual_vote_count: 3, event_count: 1, source_urls: ['x'], event_external_ids: ['e2'], title: 'P2', version_key: 'v2' },
    ] });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].source_urls).toEqual(['u']);
    expect(result.totals).toMatchObject({ versions: 1, factual_votes: 10, p0_versions: 1, p1_versions: 0 });
  });
});
