import { describe, expect, it } from 'vitest';
import { generateSitemap } from '../generate-sitemap.mjs';

describe('generateSitemap', () => {
  it('publica somente rotas canônicas por slug e não URLs por UUID', () => {
    const sitemap = generateSitemap([
      {
        id: '7098b705-765c-56fa-b8c1-7258ab492c7f',
        slug: 'joao_batista_garcia_dias_210002532992',
      },
    ], { baseUrl: 'https://rs.votopraquem.org', today: '2026-07-30' });

    expect(sitemap).toContain(
      '<loc>https://rs.votopraquem.org/candidatos/joao_batista_garcia_dias_210002532992</loc>',
    );
    expect(sitemap).not.toContain('/candidatos/7098b705-765c-56fa-b8c1-7258ab492c7f');
  });
});
