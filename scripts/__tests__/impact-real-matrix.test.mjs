// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..', '..');
const matrixPath = resolve(root, 'data/impact-matrices/plp-230-2025-sbt-1-pending-review.json');

describe('primeira matriz real PLP 230/2025', () => {
  it('permanece em pending_review e não declara direção forte sem revisão humana', () => {
    const matrix = JSON.parse(readFileSync(matrixPath, 'utf8'));

    expect(matrix).toMatchObject({
      schema_version: '1.0.0',
      methodology_version: '1.0.0',
      severity: 2,
      structural_type: 'budgetary',
      review_status: 'pending_review',
    });
    expect(matrix.assessments).toHaveLength(1);
    expect(matrix.assessments[0]).toMatchObject({
      group: 'pessoas_com_deficiencia',
      impact_direction: 'unclear',
      defending_vote: null,
    });
    expect(matrix.assessments[0].confidence).toBeLessThanOrEqual(0.6);
    expect(matrix.assessments[0].sources).toEqual(
      expect.arrayContaining([
        'https://dadosabertos.camara.leg.br/api/v2/proposicoes/2580259',
        'https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=3170169',
        'https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24/votos',
      ]),
    );
    expect(JSON.stringify(matrix)).not.toMatch(/service_role|apikey|Authorization|Bearer/i);
  });
});
