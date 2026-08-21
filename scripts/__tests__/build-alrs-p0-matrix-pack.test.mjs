// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildP0MatrixPack } from '../build-alrs-p0-matrix-pack.mjs';

describe('alrs-p0-matrix-pack', () => {
  it('seleciona apenas P0 sem colisão', () => {
    const result = buildP0MatrixPack({ items: [{ priority: 'P0', version_key_collision: false, factual_vote_count: 7 }, { priority: 'P0', version_key_collision: true, factual_vote_count: 7 }, { priority: 'P1', version_key_collision: false, factual_vote_count: 6 }] });
    expect(result.items).toHaveLength(1);
    expect(result.totals).toMatchObject({ versions: 1, factual_votes: 7 });
    expect(result.items[0].review_batch).toBe('P0-first-editorial-review');
  });
});
