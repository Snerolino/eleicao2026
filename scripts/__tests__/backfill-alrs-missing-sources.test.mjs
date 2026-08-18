// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { decodeHtmlAttribute, isoDate, normalizeVote, selectExactEvidence } from '../backfill-alrs-missing-sources.mjs';

describe('backfill-alrs-missing-sources', () => {
  it('decodifica data-item ALRS com entidades hexadecimais', () => {
    expect(JSON.parse(decodeHtmlAttribute('&#x7B;&quot;voto&quot;&#x3A;&quot;N&#xE3;o&quot;&#x7D;'))).toEqual({ voto: 'Não' });
  });

  it('normaliza votos e datas oficiais', () => {
    expect(normalizeVote('Não')).toBe('nao');
    expect(isoDate('10/03/2026 00:00')).toBe('2026-03-10T00:00:00Z');
  });

  it('aceita uma única evidência exata e rejeita ambiguidade', () => {
    const item = { tipoProjeto: 'PL ', numProposicao: 134, anoProposicao: 2023, dataVotacao: '10/03/2026 00:00', voto: 'Sim' };
    expect(selectExactEvidence([item], 'alrs_pl134_2023', '2026-03-10T14:00:00Z', 'sim')).toMatchObject({ ok: true });
    expect(selectExactEvidence([item, item], 'alrs_pl134_2023', '2026-03-10T00:00:00Z', 'sim')).toEqual({ ok: false, reason: 'expected_one_match_got_2' });
  });
});
