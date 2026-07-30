import { describe, expect, it } from 'vitest';
import { candidatePublicId, candidatePublicPath, candidateSlugFromTse } from '@/utils/candidateIdentity';

describe('candidateIdentity', () => {
  it('gera slug canônico com nome normalizado e SQ_CANDIDATO completo', () => {
    expect(candidateSlugFromTse('ADA CRISTINA MUNARETTO', '210002532998')).toBe(
      'ada_cristina_munaretto_210002532998',
    );
  });

  it('usa slug como identificador público principal', () => {
    const candidate = {
      id: 'db-uuid',
      slug: 'nome_publico_210002532992',
      tse_candidate_id: '210002532992',
    };

    expect(candidatePublicId(candidate)).toBe('nome_publico_210002532992');
    expect(candidatePublicPath(candidate)).toBe('/candidatos/nome_publico_210002532992');
  });

  it('mantém fallback temporário por SQ_CANDIDATO e id legado', () => {
    expect(candidatePublicId({ id: 'legacy-id', tse_candidate_id: '210', slug: null })).toBe('210');
    expect(candidatePublicId({ id: 'legacy-id', tse_candidate_id: null, slug: null })).toBe('legacy-id');
  });
});
