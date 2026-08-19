// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { adaptEnvelope, sourceUrlByLegislatorYear } from '../adapt-senado-nominal-envelope.mjs';

describe('adapt-senado-nominal-envelope', () => {
  const input = { sources: [{ legislator_external_id: '825', year: 2026, url: 'https://senado.test/825/2026' }] };
  it('mapeia fonte oficial por legislador/ano e não infere candidato', () => {
    const envelope = { events: [{ external_id: 'e1', occurred_at: '2026-03-01T13:00:00Z' }], votes: [{ event_external_id: 'e1', legislator_external_id: '825', recorded_at: '2026-03-01T13:00:00Z', value: 'sim' }], propositions: [], legislators: [] };
    const result = adaptEnvelope(envelope, sourceUrlByLegislatorYear(input));
    expect(result.events[0].source_url).toBe(input.sources[0].url);
    expect(result.votes[0]).toMatchObject({ source_url: input.sources[0].url, candidate_tse_id: null });
  });
});
