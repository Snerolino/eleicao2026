// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { consolidateEnvelopes, matchedDeputies } from '../build-camara-q1-resolved-envelope.mjs';

describe('build-camara-q1-resolved-envelope', () => {
  it('seleciona somente identidades matched_exact', () => {
    const allowed = matchedDeputies({ entries: [{ deputy_id: '1', status: 'matched_exact' }, { deputy_id: '2', status: 'identity_pending' }] });
    expect(allowed).toEqual(new Set(['camara-deputado-1']));
  });

  it('deduplica proposições e votos por evento/deputado', () => {
    const result = consolidateEnvelopes([
      { propositions: [{ house: 'camara', external_id: 'p1' }], votes: [{ voting_event_id: 'e1', deputy_id: 'camara-deputado-1', value: 'sim' }, { voting_event_id: 'e1', deputy_id: 'camara-deputado-2', value: 'nao' }] },
      { propositions: [{ house: 'camara', external_id: 'p1' }], votes: [{ voting_event_id: 'e1', deputy_id: 'camara-deputado-1', value: 'sim' }] },
    ], new Set(['camara-deputado-1']));
    expect(result.propositions).toHaveLength(1);
    expect(result.votes).toHaveLength(1);
  });
});
