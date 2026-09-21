import { describe, expect, it } from 'vitest';
import {
  deriveAlignmentV2,
  isScoreableAttributionV2,
  type EventAttributionV2,
} from '../event-attribution-v2';

const scoreable = (
  overrides: Partial<EventAttributionV2> = {},
): EventAttributionV2 => ({
  event_defending_vote: 'sim',
  score_eligible: true,
  vote_attribution_status: 'isolated',
  score_withholding_reason: null,
  review_status: 'approved',
  methodology_version: '2.0.0',
  ...overrides,
});

describe('event attribution v2', () => {
  it('alinha somente SIM/NAO contra o voto defensor do evento', () => {
    expect(deriveAlignmentV2({ value: 'sim' }, scoreable())).toBe('aligned');
    expect(deriveAlignmentV2({ value: 'nao' }, scoreable())).toBe('not_aligned');
    expect(
      deriveAlignmentV2(
        { value: 'nao' },
        scoreable({ event_defending_vote: 'nao' }),
      ),
    ).toBe('aligned');
  });

  it.each([
    ['compound_non_separable'],
    ['procedural'],
    ['event_binding_missing'],
  ] as const)('retém status não atribuível: %s', (status) => {
    const attribution = scoreable({
      event_defending_vote: null,
      score_eligible: false,
      vote_attribution_status: status,
      score_withholding_reason: 'Evento sem atribuição segura.',
    });
    expect(isScoreableAttributionV2(attribution)).toBe(false);
    expect(deriveAlignmentV2({ value: 'sim' }, attribution)).toBe('withheld');
  });

  it('retém atribuição ainda não aprovada', () => {
    const attribution = scoreable({ review_status: 'pending_review' });
    expect(deriveAlignmentV2({ value: 'sim' }, attribution)).toBe('withheld');
  });

  it('retém atribuição de metodologia diferente', () => {
    const attribution = scoreable({ methodology_version: '1.1.0' });
    expect(deriveAlignmentV2({ value: 'sim' }, attribution)).toBe('withheld');
  });

  it.each(['abstencao', 'ausente', 'obstrucao'] as const)(
    'não transforma %s em posição de mérito',
    (value) => {
      expect(deriveAlignmentV2({ value }, scoreable())).toBe('no_alignment');
    },
  );
});
