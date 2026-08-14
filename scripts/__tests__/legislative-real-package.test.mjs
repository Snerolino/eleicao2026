// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { planLegislativeImport } from '../../src/domain/impact/legislative-importer.ts';
import { planToSql } from '../../src/domain/impact/legislative-sql-generator.ts';

const root = resolve(import.meta.dirname, '..', '..');
const envelopePath = resolve(root, 'data/legislative-import/camara/plp-230-2025-votacao-2580259-24-marcel-van-hattem.json');
const catalogPath = resolve(root, 'data/legislative-import/camara/plp-230-2025-votacao-2580259-24-catalog.json');

describe('pacote real Câmara PLP 230/2025 — Marcel van Hattem', () => {
  it('é um pacote factual pequeno e válido para dry-run sem escrita remota', () => {
    const envelope = JSON.parse(readFileSync(envelopePath, 'utf8'));
    const result = planLegislativeImport(envelope);

    expect(result.ok).toBe(true);
    expect(result.plan?.counts).toEqual({
      legislative_propositions: 1,
      proposition_versions: 1,
      voting_events: 1,
      legislative_votes: 1,
    });
    expect(envelope.propositions[0].external_id).toBe('camara-proposicao-2580259-plp-230-2025');
    expect(envelope.votes[0]).toMatchObject({
      deputy_id: 'camara-deputado-156190',
      value: 'nao',
      source: 'https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24/votos',
    });
  });

  it('gera SQL revisável com candidate_id e source_reference_id resolvidos', () => {
    const envelope = JSON.parse(readFileSync(envelopePath, 'utf8'));
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    const result = planLegislativeImport(envelope);
    const sql = planToSql(result.plan, catalog);

    expect(sql).toContain("'abdfe5f9-52ab-561f-aec5-afe475423fb9', 'nao'");
    expect(sql).not.toContain("null /* 'source_references:");
    expect(sql).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
    expect(sql).toContain('camara-votacao-2580259-24');
    expect(sql).not.toMatch(/service_role|apikey|Authorization|Bearer/i);
  });
});
