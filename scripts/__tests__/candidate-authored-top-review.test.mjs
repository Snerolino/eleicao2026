// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { groupUniqueAuthoredProjects, selectTopReviewProjects } from '../lib/candidate-authored-top-review.mjs';

describe('candidate-authored-top-review helper', () => {
  const manifest = {
    projects: [
      { id: 'b', candidate_tse_id: '2', role: 'coautor', authorship_official_id: '20', authorship_source_url: 'u2', type: 'PL' },
      { id: 'a', candidate_tse_id: '1', role: 'autor_principal', authorship_official_id: '10', authorship_source_url: 'u1', type: 'PL' },
      { id: 'a', candidate_tse_id: '2', role: 'coautor', authorship_official_id: '20', authorship_source_url: 'u2', type: 'PL' },
      { id: 'a', candidate_tse_id: '2', role: 'coautor', authorship_official_id: '20', authorship_source_url: 'u2', type: 'PL' },
      { id: 'c', candidate_tse_id: '3', role: 'autor_principal', authorship_official_id: '30', authorship_source_url: 'u3', type: 'REQ' },
    ],
  };

  it('agrupa por projeto único, deduplica candidatos e preserva roles', () => {
    const grouped = groupUniqueAuthoredProjects(manifest);
    expect(grouped).toHaveLength(3);
    expect(grouped[0].id).toBe('a');
    expect(grouped[0].candidate_occurrences).toBe(2);
    expect(grouped[0].candidate_tse_ids).toEqual(['1', '2']);
    expect(grouped[0].roles).toHaveLength(3);
  });

  it('aplica offset e limit na ordenação por cobertura', () => {
    const selected = selectTopReviewProjects(manifest, { offset: 1, limit: 1 });
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe('b');
  });
});
