// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  CANONICAL_GROUPS,
  matchCrossHouseSimilarity,
  loadAlrsKnowledgeBase,
} from '../cross-house-similarity-matcher.mjs';

describe('cross-house-similarity-matcher', () => {
  it('possui os 14 grupos canônicos', () => {
    expect(CANONICAL_GROUPS.length).toBe(14);
    expect(CANONICAL_GROUPS).toContain('mulheres');
    expect(CANONICAL_GROUPS).toContain('povos_indigenas');
    expect(CANONICAL_GROUPS).toContain('agricultura_familiar_sem_terra');
    expect(CANONICAL_GROUPS).toContain('trabalhadores_informais');
  });

  it('identifica proposição protetiva de mulheres (PLP 41/2026)', () => {
    const result = matchCrossHouseSimilarity({
      title: 'PLP 41/2026',
      summary: 'Dispõe sobre o Sistema Nacional de Enfrentamento da Violência contra Meninas e Mulheres e a destinação de recursos às ações de enfrentamento ao feminicídio.',
      version_label: 'Aprovado o Substitutivo',
    });

    expect(result.disposition).toBe('assess');
    expect(result.matched_groups).toContain('mulheres');
    expect(result.impact_direction).toBe('positive');
    expect(result.suggested_defending_vote).toBe('sim');
    expect(result.suggested_structural_type).toBe('structural');
    expect(result.similarity_score).toBeGreaterThanOrEqual(0.75);
  });

  it('identifica proposição de pequenos produtores rurais de subsistência (PL 2898/2025)', () => {
    const result = matchCrossHouseSimilarity({
      title: 'PL 2898/2025',
      summary: 'Altera a Lei nº 9.605, de 12 de fevereiro de 1998, para estabelecer regime especial de sanções para pequenos produtores rurais que produzam para subsistência.',
      version_label: 'Aprovada a redação final',
    });

    expect(result.disposition).toBe('assess');
    expect(result.matched_groups).toContain('agricultura_familiar_sem_terra');
    expect(result.impact_direction).toBe('positive');
    expect(result.suggested_defending_vote).toBe('sim');
  });

  it('identifica proposição restritiva / revogação com defending_vote=nao', () => {
    const result = matchCrossHouseSimilarity({
      title: 'PL 9999/2026',
      summary: 'Revoga e restringe diretrizes de proteção e medidas de apoio a mulheres vítimas de violência.',
      version_label: 'Votação final',
    });

    expect(result.disposition).toBe('assess');
    expect(result.matched_groups).toContain('mulheres');
    expect(result.impact_direction).toBe('negative');
    expect(result.suggested_defending_vote).toBe('nao');
  });

  it('identifica matéria puramente procedimental (Urgência Art. 155 RICD)', () => {
    const result = matchCrossHouseSimilarity({
      title: 'PL 849/2025',
      summary: 'Reduz a Área de Proteção Ambiental',
      version_label: 'Aprovado o Requerimento de Urgência (Art. 155 do RICD). Sim: 310; Não: 80.',
    });

    expect(result.disposition).toBe('excluded');
    expect(result.matched_groups.length).toBe(0);
    expect(result.suggested_defending_vote).toBeNull();
  });

  it('identifica lacuna de taxonomia (regulamentação de artista visual)', () => {
    const result = matchCrossHouseSimilarity({
      title: 'PL 1928/2024',
      summary: 'Dispõe sobre a profissão de artista visual e dá outras providências.',
      version_label: 'Parecer aprovado',
    });

    expect(result.disposition).toBe('taxonomy_gap');
  });

  it('identifica matéria sem grupo direto (FUST telecomunicações)', () => {
    const result = matchCrossHouseSimilarity({
      title: 'PLP 230/2025',
      summary: 'Altera a Lei Complementar nº 101, para vedar a limitação de empenho e movimentação financeira das despesas relativas ao Fundo de Universalização dos Serviços de Telecomunicações.',
      version_label: 'Aprovado o Substitutivo',
    });

    expect(result.disposition).toBe('no_direct_population_group');
  });
});
