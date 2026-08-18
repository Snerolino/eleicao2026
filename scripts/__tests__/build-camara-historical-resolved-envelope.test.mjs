// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildHistoricalEnvelope, eligibleIdentityMap } from '../build-camara-historical-resolved-envelope.mjs';

const identity = {
  records: [
    { official_name: 'A', uf: 'RS', match_status: 'matched_exact', remote_matches: [{ id: 'uuid-a', tse_candidate_id: '1', position: 'deputado_federal', state: 'RS' }] },
    { official_name: 'B', uf: 'RS', match_status: 'matched_exact', remote_matches: [{ id: 'uuid-b', tse_candidate_id: '2', position: 'senador', state: 'RS' }] },
    { official_name: 'C', uf: 'RS', match_status: 'identity_pending', remote_matches: [] },
  ],
};

const dryRun = {
  propositions: [{
    name: 'PEC 6/2019',
    camara_proposition_id: '2192459',
    events: [{
      numvot: '9002',
      vote_date: '2019-08-07',
      source_url: 'https://www.camara.gov.br/internet/votacao/mostraVotacao.asp?ideVotacao=9002',
      records: [
        { official_name: 'A', uf: 'RS', vote: 'Sim', vote_date: '2019-08-07', source_url: 'https://example.test/9002' },
        { official_name: 'B', uf: 'RS', vote: 'Não', vote_date: '2019-08-07', source_url: 'https://example.test/9002' },
        { official_name: 'C', uf: 'RS', vote: 'Não', vote_date: '2019-08-07', source_url: 'https://example.test/9002' },
      ],
    }],
  }],
};

describe('build-camara-historical-resolved-envelope', () => {
  it('mantém somente deputado federal RS com match exato único', () => {
    expect([...eligibleIdentityMap(identity).keys()]).toEqual(['A|RS']);
  });

  it('preserva fonte, data, proposição e voto no envelope dry-run', () => {
    const result = buildHistoricalEnvelope({ dryRun, identityLookup: identity });
    expect(result.totals).toEqual({ propositions: 1, events: 1, votes: 1, eligible_identities: 1 });
    expect(result.envelope.votes[0]).toMatchObject({
      candidate_id: 'uuid-a',
      tse_candidate_id: '1',
      value: 'sim',
      recorded_at: '2019-08-07T00:00:00.000Z',
      source: 'https://example.test/9002',
    });
    expect(result.envelope.propositions[0].versions[0].voting_events[0].source).toBe(dryRun.propositions[0].events[0].source_url);
  });

  it('falha fechado para voto não normalizado', () => {
    const invalid = structuredClone(dryRun);
    invalid.propositions[0].events[0].records[0].vote = 'Presente';
    expect(() => buildHistoricalEnvelope({ dryRun: invalid, identityLookup: identity })).toThrow('voto não normalizado');
  });
});
