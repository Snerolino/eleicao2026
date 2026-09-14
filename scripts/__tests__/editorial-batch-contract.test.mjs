// @vitest-environment node
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { canonicalBatchHash, validateBatch, validateDecisionEnvelope } from '../lib/editorial-batch-contract.mjs';

const item = (id = '11111111-1111-1111-1111-111111111111') => ({
  proposition_version_id: id,
  review_key: `rk-${id}`,
  source_gate: 'green',
  official_event_type: 'merit_confirmed',
  remote_apply: false,
  public_approval: false,
});

function batch() {
  const value = { batch_id: 'alrs-test-001', items: [item()] };
  return { ...value, batch_sha256: canonicalBatchHash(value) };
}

function approvedEnvelope(value, overrides = {}) {
  return {
    batch_id: value.batch_id,
    batch_sha256: canonicalBatchHash(value),
    items: [{
      proposition_version_id: value.items[0].proposition_version_id,
      review_key: value.items[0].review_key,
      decision: 'approved',
      disposition: 'no_direct_population_group',
      rationale: 'A matéria não apresenta grupo populacional direto na unidade analisada.',
      ...overrides,
    }],
  };
}

describe('editorial-batch-contract', () => {
  it('calcula hash somente com batch_id e items', () => {
    const value = batch();
    const expected = createHash('sha256').update(JSON.stringify({ batch_id: value.batch_id, items: value.items })).digest('hex');
    expect(canonicalBatchHash({ ...value, generated_at: 'drift' })).toBe(expected);
  });

  it('rejeita batch duplicado ou com flags de aplicação', () => {
    const value = { batch_id: 'x', items: [item(), { ...item('22222222-2222-2222-2222-222222222222'), remote_apply: true }] };
    value.items.push(item());
    const result = validateBatch(value);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['22222222-2222-2222-2222-222222222222:remote_apply_must_be_false', '11111111-1111-1111-1111-111111111111:duplicate_item']));
  });

  it('exige decisão explícita e bloqueia approved sem disposição', () => {
    const value = batch();
    const result = validateDecisionEnvelope(value, approvedEnvelope(value, { disposition: undefined }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('11111111-1111-1111-1111-111111111111:invalid_disposition');
  });

  it('rejeita lote com decisão duplicada ou faltante', () => {
    const value = { batch_id: 'x', items: [item(), item('22222222-2222-2222-2222-222222222222')] };
    const envelope = approvedEnvelope(value);
    envelope.batch_sha256 = canonicalBatchHash(value);
    envelope.items.push({ ...envelope.items[0] });
    const result = validateDecisionEnvelope(value, envelope);
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['11111111-1111-1111-1111-111111111111:duplicate_decision', '22222222-2222-2222-2222-222222222222:missing_decision']));
  });

  it('exige assessment completo e fonte verde', () => {
    const value = batch();
    value.items[0].source_gate = 'needs_substantive_source_check';
    const result = validateDecisionEnvelope(value, approvedEnvelope(value, {
      disposition: 'assess',
      matrix: { severity: 3, structural_type: 'structural' },
      assessments: [{ group_slug: 'mulheres', impact_direction: 'positive', defending_vote: 'sim', confidence: 0.8, rationale: 'A avaliação precisa de justificativa substantiva.' }],
    }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('11111111-1111-1111-1111-111111111111:source_gate_not_green');
  });
});
