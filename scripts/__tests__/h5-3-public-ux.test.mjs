import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const theme = readFileSync(join(process.cwd(), 'src/theme.css'), 'utf8');
const home = readFileSync(join(process.cwd(), 'src/pages/HomePage.tsx'), 'utf8');
const smoke = readFileSync(join(process.cwd(), 'scripts/smoke-browser.mjs'), 'utf8');

describe('H5.3 acessibilidade, busca e viewports', () => {
  it('mantém foco visível global em links, botões, inputs e selects', () => {
    expect(theme).toMatch(/a:focus-visible/);
    expect(theme).toMatch(/button:focus-visible/);
    expect(theme).toMatch(/input:focus-visible/);
    expect(theme).toMatch(/select:focus-visible/);
    expect(theme).toMatch(/outline:\s*2px\s+solid\s+var\(--color-institutional\)/);
    expect(theme).toMatch(/outline-offset:\s*2px/);
  });

  it('cacheia normalização de busca sem mudar os critérios por acento, partido, número e cargo', () => {
    expect(home).toMatch(/interface CandidateSearchCache/);
    expect(home).toMatch(/nameNormalized\s*[=:]\s*normalize\(c\.full_name\)/);
    expect(home).toMatch(/labelNormalized\s*[=:]\s*normalize\(c\.position_label\)/);
    expect(home).toMatch(/partyLower\s*[=:]\s*c\.party\.toLowerCase\(\)/);
    expect(home).toMatch(/ballot_number\?\.toString\(\)/);
    expect(home).not.toMatch(/Bolt Optimization|expensive normalize|O\(N\*M\)/);
  });

  it('smoke público testa os viewports exigidos pelo Guia H5.3', () => {
    for (const [width, height] of [
      [320, 640],
      [390, 844],
      [768, 1024],
      [1280, 720],
    ]) {
      expect(smoke).toContain(`width: ${width}`);
      expect(smoke).toContain(`height: ${height}`);
    }
  });
});
