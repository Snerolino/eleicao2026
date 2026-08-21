// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { validateSubstantiveSources } from '../validate-alrs-substantive-sources.mjs';

describe('validate-alrs-substantive-sources', () => {
  it('rejeita pacote que só tem páginas de votos', () => {
    const result = validateSubstantiveSources({ items: [{ official_sources: [{ url: 'https://transparencia.al.rs.gov.br/parlamentares/votos-plenario/pesquisa?x=1' }], substantive_source_gate: 'blocked_until_impact_sources' }] });
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['items[0]:substantive_source_missing']));
  });
});
