// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildAlrsReviewQueue } from '../build-alrs-impact-review-queue.mjs';

describe('alrs-impact-review-queue', () => {
  it('prioriza uma matriz por versão e reutilização entre candidatos', () => {
    const queue = buildAlrsReviewQueue([
      { version_id: 'v1', version_key: 'v1', proposition_external_id: 'p1', title: 'P1', events: 2, candidates: 7, votes: 12, event_external_ids: ['e1', 'e2'], source_urls: ['https://al.rs.gov.br/p1'] },
      { version_id: 'v2', version_key: 'v2', proposition_external_id: 'p2', title: 'P2', events: 1, candidates: 3, votes: 3, event_external_ids: ['e3'], source_urls: [] },
    ]);
    expect(queue.unit_of_work).toContain('one_matrix_per_proposition_version');
    expect(queue.items[0]).toMatchObject({ version_key: 'v1', priority: 'P0', candidate_count: 7, editorial_disposition: 'pending_review', remote_apply: false });
    expect(queue.totals).toMatchObject({ versions: 2, factual_votes: 15, p0_versions: 1 });
  });

  it('não inventa grupo, direção ou voto defensor', () => {
    const [item] = buildAlrsReviewQueue([{ version_id: 'v1', version_key: 'v1', proposition_external_id: 'p1', title: 'P1', events: 1, candidates: 7, votes: 7 }]).items;
    expect(item.suggested_groups).toEqual([]);
    expect(item.suggested_direction).toBeNull();
    expect(item.defending_vote).toBeNull();
  });
});
