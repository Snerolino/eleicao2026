// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { validateAlrsMeritPack } from '../validate-alrs-merit-pack.mjs';

describe('validate-alrs-merit-pack', () => {
  it('aceita item pronto para revisão humana, sem aplicação remota', () => {
    const result = validateAlrsMeritPack({ items: [{ proposition_version_id: 'v1', review_key: 'k', version_key_collision: false, title_quality: 'complete_or_unverified', factual_source_gate: 'green', human_review_required: true, remote_apply: false, editorial_status: 'pending_review', candidate_source_links: [] }] });
    expect(result).toEqual({ ok: true, errors: [], checked: 1 });
  });

  it('rejeita colisão de versão e liberações inseguras', () => {
    const result = validateAlrsMeritPack({ items: [{ proposition_version_id: 'v1', review_key: 'k', version_key_collision: true, title_quality: 'generic', factual_source_gate: 'pending', human_review_required: false, remote_apply: true, editorial_status: 'published' }] });
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['items[0]: version_key_collision', 'items[0]: title_quality_generic', 'items[0]: factual_source_gate_pending', 'items[0]: remote_apply_not_false', 'items[0]: candidate_source_links_missing']));
  });
});
