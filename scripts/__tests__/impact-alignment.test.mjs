import { describe, expect, it } from 'vitest';
import { deriveAlignment } from '../../src/domain/impact/alignment.ts';

/**
 * Testes RED da Fase 1 (GUIA §15 — Alinhamento como função pura).
 */

describe('impact-alignment: deriveAlignment(vote, assessment)', () => {
  it('voto sim + assessment positive → a_favor', () => {
    expect(
      deriveAlignment({ value: 'sim' }, { impact_direction: 'positive', defending_vote: 'sim' }),
    ).toBe('a_favor');
  });

  it('voto nao + assessment negative → a_favor (concorda com o voto contrário)', () => {
    expect(
      deriveAlignment({ value: 'nao' }, { impact_direction: 'negative', defending_vote: 'nao' }),
    ).toBe('a_favor');
  });

  it('voto sim + assessment negative → contra', () => {
    expect(
      deriveAlignment({ value: 'sim' }, { impact_direction: 'negative', defending_vote: 'nao' }),
    ).toBe('contra');
  });

  it('abstencao → neutro_declarado', () => {
    expect(
      deriveAlignment({ value: 'abstencao' }, { impact_direction: 'positive', defending_vote: 'sim' }),
    ).toBe('neutro_declarado');
  });

  it('ausente + absence_type estrategica → omissao_estrategica', () => {
    expect(
      deriveAlignment({ value: 'ausente', absence_type: 'estrategica' }, { impact_direction: 'positive', defending_vote: 'sim' }),
    ).toBe('omissao_estrategica');
  });

  it('ausente + absence_type obstrucao_coordenada → omissao_coordenada', () => {
    expect(
      deriveAlignment({ value: 'ausente', absence_type: 'obstrucao_coordenada' }, { impact_direction: 'positive', defending_vote: 'sim' }),
    ).toBe('omissao_coordenada');
  });

  it('ausente + absence_type justificada → sem_dado (voto não utilizável)', () => {
    expect(
      deriveAlignment({ value: 'ausente', absence_type: 'justificada' }, { impact_direction: 'positive', defending_vote: 'sim' }),
    ).toBe('sem_dado');
  });

  it('assessment com defending_vote null (unclear) → nao_avaliavel, não sem_dado', () => {
    expect(
      deriveAlignment({ value: 'sim' }, { impact_direction: 'unclear', defending_vote: null }),
    ).toBe('nao_avaliavel');
  });

  it('assessment mixed com defending_vote null → nao_avaliavel', () => {
    expect(
      deriveAlignment({ value: 'sim' }, { impact_direction: 'mixed', defending_vote: null }),
    ).toBe('nao_avaliavel');
  });

  it('sem voto (null) → sem_dado', () => {
    expect(
      deriveAlignment(null, { impact_direction: 'positive', defending_vote: 'sim' }),
    ).toBe('sem_dado');
  });
});
