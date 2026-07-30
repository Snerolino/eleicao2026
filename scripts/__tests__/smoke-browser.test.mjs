import { describe, expect, it } from 'vitest';
import { assertHomeHasCandidates } from '../smoke-browser.mjs';

function fakeLocator(bodyText, articleCount) {
  return (selector) => {
    if (selector === 'main article') {
      return { count: async () => articleCount };
    }
    if (selector === 'body') {
      return { innerText: async () => bodyText };
    }
    throw new Error(`selector inesperado: ${selector}`);
  };
}

describe('smoke-browser diagnostics', () => {
  it('falha com diagnóstico explícito quando a home não renderiza articles/candidatos', async () => {
    const page = {
      locator: fakeLocator('Portal antigo sem cards de candidatos', 0),
    };

    await expect(assertHomeHasCandidates(page, 69)).rejects.toThrow(
      /Home não renderizou articles\/candidatos.*cards=0.*esperado >= 69/s,
    );
  });
});
