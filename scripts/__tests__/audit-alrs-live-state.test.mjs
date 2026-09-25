// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseQueryPayload, summarizeLocalState } from '../audit-alrs-live-state.mjs';

const known = {
  recovery: { counts: { total: 2, event_binding_missing: 1, compound_non_separable: 1 } },
  collisions: { totals: { collision_keys: 1, affected_versions: 2, affected_events: 3 } },
  lane: { totals: { pending_versions: 0 }, remote_disposition_read: { ok: true } },
  inventory: { inventory_count: 4, counts: { withheld_source: 4 } },
  pilot: { mode: 'blocked_no_eligible_items', selected_count: 0 },
  sourceAcquisition: { unique_urls: 2, results: [{ ok: true, data_items: 5 }, { ok: false }] },
};

describe('audit-alrs-live-state', () => {
  it('aceita preâmbulo da CLI e exige uma linha JSON', () => {
    expect(parseQueryPayload('Initialising login role...\n{"rows":[{"events":2281}]}')).toEqual({ events: 2281 });
    expect(() => parseQueryPayload('{"rows":[]}')).toThrow(/Unexpected Supabase count payload/);
  });

  it('preserva o estado conhecido dos artefatos locais', () => {
    const state = summarizeLocalState(known);
    expect(state.release_inventory_state).toBe('known');
    expect(state.release_inventory_count).toBe(4);
    expect(state.exclusive_remote_read_ok).toBe(true);
    expect(state.source_acquisition_ok).toBe(1);
    expect(state.source_acquisition_blocked).toBe(1);
    expect(state.source_acquisition_data_items).toBe(5);
  });

  it('não converte inventário ausente em fila vazia', () => {
    const state = summarizeLocalState({
      ...known,
      inventory: { __state_unknown: true, __state_error: 'LOCAL_STATE_UNKNOWN:inventory' },
    });
    expect(state.release_inventory_state).toBe('unknown');
    expect(state.release_inventory_count).toBeNull();
    expect(state.release_inventory_counts).toBeNull();
    expect(state.release_inventory_error).toMatch(/LOCAL_STATE_UNKNOWN/);
  });
});
