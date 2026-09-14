// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { auditEditorialUniverse } from '../audit-alrs-editorial-universe.mjs';

const item = (id, extra = {}) => ({ proposition_version_id: id, review_key: `rk-${id}`, editorial_disposition: 'pending_review', ...extra });

describe('audit-alrs-editorial-universe', () => {
  it('fecha o universo em categorias disjuntas', () => {
    const queue = { items: [item('ready'), item('collision'), item('resolved'), item('blocked', { review_key: null })] };
    const result = auditEditorialUniverse({
      queue,
      collisions: { collisions: [{ proposition_version_ids: ['collision'] }] },
      resolved: { resolved_version_ids: ['resolved'] },
    });
    expect(result.input_pending).toBe(4);
    expect(result.ready_for_disposition).toBe(1);
    expect(result.blocked_collision).toBe(1);
    expect(result.already_resolved).toBe(1);
    expect(result.other_blocked).toBe(1);
    expect(result.unclassified_version_ids).toEqual([]);
  });

  it('detecta IDs duplicados', () => {
    const result = auditEditorialUniverse({ queue: { items: [item('same'), item('same')] } });
    expect(result.duplicate_version_ids).toEqual(['same']);
    expect(result.input_pending).toBe(result.ready_for_disposition);
  });
});
