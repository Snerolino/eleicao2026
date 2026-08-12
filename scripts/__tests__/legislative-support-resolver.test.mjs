// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { collectSupportRefs, resolveSupportRefs } from '../../src/domain/impact/legislative-support-resolver.ts';
import { planLegislativeImport } from '../../src/domain/impact/legislative-importer.ts';
import { readFileSync } from 'node:fs';

const FIXTURE = 'fixtures/legislative-import/boa-minima.json';

describe('legislative-support-resolver', () => {
  const catalogs = {
    legislatorsToCandidateId: { 'deputy-rs-001': '11111111-1111-1111-1111-111111111111' },
    candidateByIdentifier: {
      '210000000001': '11111111-1111-1111-1111-111111111111',
      'candidato-teste': '22222222-2222-2222-2222-222222222222',
    },
    sourceReferenceByKey: {
      'https://www.camara.leg.br/votacoes/123': '33333333-3333-3333-3333-333333333333',
    },
  };

  it('coleta referências de apoio do plano (sem duplicar)', () => {
    const envelope = JSON.parse(readFileSync(FIXTURE, 'utf8'));
    const plan = planLegislativeImport(envelope);
    const empty = { schema_version: '1.0.0', mode: 'dry-run', counts: { legislative_propositions: 0, proposition_versions: 0, voting_events: 0, legislative_votes: 0 }, operations: [] };
    const refs = collectSupportRefs(plan.plan ?? empty);
    expect(refs).toContain('legislators:deputy-rs-001');
    expect(refs).toContain('source_references:https://www.camara.leg.br/votacoes/123');
    expect(new Set(refs).size).toBe(refs.length);
  });

  it('resolve legislators → candidate_id', () => {
    const refs = ['legislators:deputy-rs-001'];
    const r = resolveSupportRefs(refs, catalogs);
    expect(r.resolved['legislators:deputy-rs-001']).toBe('11111111-1111-1111-1111-111111111111');
    expect(r.unresolved).toHaveLength(0);
  });

  it('não fabrica UUID para referência não encontrada', () => {
    const refs = ['legislators:deputy-rs-999'];
    const r = resolveSupportRefs(refs, catalogs);
    expect(r.resolved['legislators:deputy-rs-999']).toBeNull();
    expect(r.unresolved).toContain('legislators:deputy-rs-999');
  });

  it('source_references resolve por url normalizada', () => {
    const refs = ['source_references:https://www.camara.leg.br/votacoes/123'];
    const r = resolveSupportRefs(refs, catalogs);
    expect(r.resolved[refs[0]]).toBe('33333333-3333-3333-3333-333333333333');
  });

  it('candidate resolve por tse_candidate_id (case-insensitive)', () => {
    const refs = ['candidates:210000000001'];
    const r = resolveSupportRefs(refs, catalogs);
    expect(r.resolved[refs[0]]).toBe('11111111-1111-1111-1111-111111111111');
  });

  it('determinístico: mesma entrada → mesmo mapa', () => {
    const refs = ['legislators:deputy-rs-001', 'source_references:https://www.camara.leg.br/votacoes/123'];
    const a = resolveSupportRefs(refs, catalogs);
    const b = resolveSupportRefs(refs, catalogs);
    expect(a).toEqual(b);
  });

  it('catálogos vazios → tudo unresolved (nunca lança)', () => {
    const refs = ['legislators:deputy-rs-001'];
    const r = resolveSupportRefs(refs, {});
    expect(r.resolved[refs[0]]).toBeNull();
    expect(r.unresolved).toContain(refs[0]);
  });
});
