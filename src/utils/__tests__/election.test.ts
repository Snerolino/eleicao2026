import { describe, expect, it } from 'vitest';
import { onlyPublished } from '@/utils/claims';
import { confidenceLevel } from '@/utils/confidence';
import { normalizePosition } from '@/utils/position';
import { normalizeSourceCategory } from '@/utils/sourceCategory';
import type { ClaimStatus } from '@/types/election';

describe('confidenceLevel', () => {
  it('deriva os três níveis esperados', () => {
    expect(confidenceLevel(5)).toBe('verificado');
    expect(confidenceLevel(4)).toBe('verificado');
    expect(confidenceLevel(3)).toBe('parcialmente_verificado');
    expect(confidenceLevel(2)).toBe('parcialmente_verificado');
    expect(confidenceLevel(1)).toBe('nao_confirmado');
  });
});

describe('normalizeSourceCategory', () => {
  it('mapeia variantes conhecidas e usa outro como fallback', () => {
    expect(normalizeSourceCategory('OFICIAL')).toBe('oficial');
    expect(normalizeSourceCategory('press')).toBe('imprensa');
    expect(normalizeSourceCategory('fact-check')).toBe('fact_check');
    expect(normalizeSourceCategory('checagem')).toBe('fact_check');
    expect(normalizeSourceCategory('desconhecida')).toBe('outro');
  });
});

describe('onlyPublished', () => {
  it('mantém exclusivamente status published e corrected', () => {
    const values: Array<{ status: ClaimStatus }> = [
      { status: 'draft' },
      { status: 'published' },
      { status: 'pending_review' },
      { status: 'corrected' },
      { status: 'retracted' },
      { status: 'published' }
    ];

    expect(onlyPublished(values)).toEqual([
      { status: 'published' },
      { status: 'corrected' },
      { status: 'published' }
    ]);
  });
});

describe('normalizePosition', () => {
  it('aceita rótulos do banco em diferentes formatos', () => {
    expect(normalizePosition('Governador').position).toBe('governador');
    expect(normalizePosition('deputado federal').position).toBe(
      'deputado_federal'
    );
    expect(normalizePosition('Deputado Estadual').position).toBe(
      'deputado_estadual'
    );
  });
});
