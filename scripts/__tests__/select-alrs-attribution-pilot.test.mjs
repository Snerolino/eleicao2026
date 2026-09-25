// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { selectPilot } from '../select-alrs-attribution-pilot.mjs';

const item = (overrides = {}) => ({
  inventory_key: 'event-1|assessment-1|2.0.0',
  state: 'impact_ready_for_review',
  house: 'alrs',
  identity_status: 'exact',
  event_status: 'isolated',
  candidate_ids: ['candidate-1'],
  occurred_at: '2022-01-01T00:00:00Z',
  ...overrides,
});

describe('select-alrs-attribution-pilot', () => {
  it('seleciona deterministicamente apenas itens elegíveis', () => {
    const result = selectPilot({ inventory_count: 3, inventory: [item(), item({ inventory_key: 'event-2|assessment-2|2.0.0', occurred_at: '2023-01-01T00:00:00Z' }), item({ inventory_key: 'blocked', state: 'withheld_source' })] }, { min: 1, limit: 2 });
    expect(result.mode).toBe('pending_review');
    expect(result.selected_count).toBe(2);
    expect(result.items.map((row) => row.inventory_key)).toEqual(['event-1|assessment-1|2.0.0', 'event-2|assessment-2|2.0.0']);
    expect(result.remote_apply).toBe(false);
  });

  it('não fabrica piloto quando não há elegíveis', () => {
    const result = selectPilot({ inventory_count: 1, inventory: [item({ state: 'withheld_source' })] }, { min: 5 });
    expect(result.mode).toBe('blocked_no_eligible_items');
    expect(result.selected_count).toBe(0);
  });
});
