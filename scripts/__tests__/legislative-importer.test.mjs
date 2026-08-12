// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  normalizeLegislativeImport,
  planLegislativeImport,
  validateLegislativeImport,
} from '../../src/domain/impact/legislative-importer.ts';

const fixture = JSON.parse(readFileSync(resolve('fixtures/legislative-import/boa-minima.json'), 'utf8'));

describe('legislative importer dry-run', () => {
  it('aceita e normaliza a entrada factual mínima', () => {
    const result = normalizeLegislativeImport(fixture);
    expect(result.ok).toBe(true);
    expect(result.data.votes[0].absence_type).toBe('justificada');
    expect(result.data.propositions[0].versions[0].effective_from).toBe('2026-08-01T12:00:00.000Z');
  });

  it('rejeita relação de evento inexistente', () => {
    const input = structuredClone(fixture);
    input.votes[0].voting_event_id = 'voting_events:camara:nao-existe';
    const result = validateLegislativeImport(input);
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toMatch(/voting_event_id.*inexistente/);
  });

  it('rejeita relação de versão incompatível com o evento', () => {
    const input = structuredClone(fixture);
    input.votes[0].proposition_version_id = 'proposition_versions:camara:pl-123-2026:outra-versao';
    const result = validateLegislativeImport(input);
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toMatch(/não corresponde/);
  });

  it('rejeita duplicidade ambígua de proposição', () => {
    const input = structuredClone(fixture);
    input.propositions.push({ ...structuredClone(input.propositions[0]), title: 'Outro fato para a mesma chave' });
    const result = validateLegislativeImport(input);
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toMatch(/duplicidade ambígua/);
  });

  it('aplica absence_type condicional', () => {
    const input = structuredClone(fixture);
    input.votes[0].value = 'sim';
    input.votes[0].absence_type = 'justificada';
    expect(validateLegislativeImport(input).ok).toBe(false);
  });

  it('rejeita campo derivado no voto', () => {
    const input = structuredClone(fixture);
    input.votes[0].score = 0;
    const result = validateLegislativeImport(input);
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toMatch(/score.*derivado/);
  });

  it('rejeita enum, data e URL inválidos', () => {
    const input = structuredClone(fixture);
    input.propositions[0].house = 'assembleia-inventada';
    input.propositions[0].versions[0].effective_from = 'ontem';
    input.propositions[0].official_url = 'javascript:alert(1)';
    const result = validateLegislativeImport(input);
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toMatch(/house|effective_from|official_url/);
  });

  it('produz plano ordenado, com FKs lógicas e sem UUIDs', () => {
    const result = planLegislativeImport(fixture);
    expect(result.ok).toBe(true);
    expect(result.plan.operations.map((operation) => operation.table)).toEqual([
      'legislative_propositions',
      'proposition_versions',
      'voting_events',
      'legislative_votes',
    ]);
    expect(result.plan.operations[3].payload.voting_event_id).toEqual({
      logical_ref: 'voting_events:camara:votacao-123-1',
    });
    expect(JSON.stringify(result.plan)).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  });

  it('é determinístico e repetível', () => {
    expect(planLegislativeImport(fixture)).toEqual(planLegislativeImport(structuredClone(fixture)));
  });

  it('mantém a ordem global das quatro entidades', () => {
    const input = structuredClone(fixture);
    const second = structuredClone(input.propositions[0]);
    second.external_id = 'pl-456-2026';
    second.number = 456;
    second.versions[0].version_key = 'texto-original';
    second.versions[0].voting_events = [];
    input.propositions.push(second);
    const tables = planLegislativeImport(input).plan.operations.map((operation) => operation.table);
    expect(tables).toEqual([
      'legislative_propositions', 'legislative_propositions',
      'proposition_versions', 'proposition_versions',
      'voting_events',
      'legislative_votes',
    ]);
  });
});
