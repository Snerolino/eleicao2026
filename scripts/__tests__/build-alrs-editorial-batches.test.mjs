// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildEditorialBatches } from '../build-alrs-editorial-batches.mjs';

const lane = {
  totals: { input_versions: 3 },
  batches: [
    { batch_id: 'source-1', items: [{ proposition_version_id: 'a', review_key: 'ra', priority: 'P0', remote_apply: false, public_approval: false }] },
    { batch_id: 'source-2', items: [{ proposition_version_id: 'b', review_key: 'rb', priority: 'P1', remote_apply: false, public_approval: false }, { proposition_version_id: 'c', review_key: 'rc', priority: 'P2', remote_apply: false, public_approval: false }] },
  ],
};

describe('build-alrs-editorial-batches', () => {
  it('preserva cardinalidade, lotes e flags fail-closed', () => {
    const result = buildEditorialBatches(lane);
    expect(result.totals).toMatchObject({ input_versions: 3, ready_for_disposition: 3, batches: 2, p0_versions: 1, p1_versions: 1, p2_versions: 1 });
    expect(result.remote_apply).toBe(false);
    expect(result.batches.every((batch) => batch.batch_sha256.length === 64)).toBe(true);
  });

  it('não permite item duplicado dentro de um lote', () => {
    expect(() => buildEditorialBatches({ totals: { input_versions: 2 }, batches: [{ batch_id: 'bad', items: [
      { proposition_version_id: 'a', review_key: 'ra', remote_apply: false, public_approval: false },
      { proposition_version_id: 'a', review_key: 'ra', remote_apply: false, public_approval: false },
    ] }] })).toThrow(/duplicate_item/);
  });
});
