// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { hasSourceGaps, summarizeSourceCoverage } from '../lib/source-coverage.mjs';

describe('source-coverage', () => {
  it('agrega cobertura por casa sem misturar tabelas', () => {
    const summary = summarizeSourceCoverage([
      { house: 'alrs', source_reference_id: 'source-1' },
      { house: 'alrs', source_reference_id: null },
      { house: 'camara', source_reference_id: 'source-2' },
    ]);

    expect(summary).toEqual({
      alrs: { total: 2, with_source: 1, without_source: 1 },
      camara: { total: 1, with_source: 1, without_source: 0 },
    });
    expect(hasSourceGaps(summary)).toBe(true);
  });

  it('resolve a casa por relação aninhada dos votos', () => {
    const summary = summarizeSourceCoverage([
      { source_reference_id: 'source-1', voting_events: { house: 'alrs' } },
    ]);

    expect(summary.alrs).toEqual({ total: 1, with_source: 1, without_source: 0 });
    expect(hasSourceGaps(summary)).toBe(false);
  });

  it('resolve a casa pela proposição da versão', () => {
    const summary = summarizeSourceCoverage([
      { source_reference_id: null, legislative_propositions: { house: 'alrs' } },
    ]);

    expect(summary.alrs.without_source).toBe(1);
  });
});
