// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const manifest = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/fed5-pilot/manifest.json'), 'utf8'));
const envelope = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/fed5-pilot/2580259-24-pilot.json'), 'utf8'));

describe('FED-5: lote factual piloto Câmara', () => {
  it('contém quatro vínculos seguros e quatro votos factuais', () => {
    expect(manifest.counts).toMatchObject({ selected_candidates: 4, safe_votes: 4, propositions: 1, versions: 1, events: 1 });
    expect(manifest.selected_candidates).toHaveLength(4);
    expect(manifest.selected_candidates.every((entry) => entry.identity_status === 'matched' && entry.match_method === 'official_name_exact')).toBe(true);
    expect(envelope.votes).toHaveLength(4);
  });

  it('mantém Marcel somente como fixture identity_pending', () => {
    expect(manifest.regression_fixture).toMatchObject({
      name: 'Marcel van Hattem',
      camara_deputado_id: 156190,
      status: 'regression_fixture_identity_pending',
    });
    expect(manifest.selected_candidates.some((entry) => entry.camara_deputado_id === 156190)).toBe(false);
  });

  it('não mistura interpretação de impacto no lote', () => {
    const serialized = JSON.stringify(envelope);
    for (const forbidden of ['impact', 'alignment', 'score', 'defending_vote']) {
      expect(serialized).not.toContain(`"${forbidden}"`);
    }
    expect(manifest.remote_apply).toBe(false);
  });
});
