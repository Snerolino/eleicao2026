// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { planAlrsMatrixApply } from '../plan-alrs-matrix-apply.mjs';

describe('plan-alrs-matrix-apply', () => {
  it('bloqueia pacote pendente e vazio', () => {
    const result = planAlrsMatrixApply({ review_status: 'pending_review', public_approval: false, items: [{ version_key_collision: true, factual_source_gate: 'green', human_review_required: true, editorial_status: 'pending_review', assessments: [] }] });
    expect(result.ok).toBe(false);
    expect(result.remote_apply).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['pack_review_status_not_approved', 'items[0]:version_key_collision', 'items[0]:assessments_empty']));
  });
  it('planeja somente pacote explicitamente aprovado e completo', () => {
    const result = planAlrsMatrixApply({ review_status: 'approved', public_approval: true, items: [{ proposition_version_id: 'v', review_key: 'k', version_key_collision: false, factual_source_gate: 'green', substantive_source_gate: 'green', human_review_required: true, editorial_status: 'approved', assessments: [{ group_slug: 'mulheres' }] }] });
    expect(result).toMatchObject({ ok: true, remote_apply: false, planned_versions: 1 });
  });
});
