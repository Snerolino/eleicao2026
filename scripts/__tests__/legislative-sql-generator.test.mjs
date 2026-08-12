// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { planLegislativeImport } from '../../src/domain/impact/legislative-importer.ts';
import { operationToSql, planToSql } from '../../src/domain/impact/legislative-sql-generator.ts';

const ENVELOPE = {
  schema_version: '1.0.0',
  country: 'BR',
  state: 'RS',
  election_year: 2026,
  propositions: [
    {
      external_id: 'pl-123-2026',
      house: 'camara',
      proposition_type: 'pl',
      number: 123,
      year: 2026,
      title: 'Política pública de proteção social',
      summary: 'Texto público para teste do importer.',
      official_url: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?id=123',
      versions: [
        {
          version_key: 'substitutivo-1',
          version_label: 'Substitutivo 1',
          text_hash: 'sha256:texto-publico-123',
          effective_from: '2026-08-01T12:00:00Z',
          source: 'https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=123',
          voting_events: [
            {
              external_id: 'votacao-123-1',
              house: 'camara',
              session_id: 'sessao-2026-08-02',
              vote_round: 'nominal',
              occurred_at: '2026-08-02T15:30:00-03:00',
              source: 'https://www.camara.leg.br/votacoes/123',
            },
          ],
        },
      ],
    },
  ],
  votes: [
    {
      voting_event_id: 'voting_events:camara:votacao-123-1',
      deputy_id: 'deputy-rs-001',
      proposition_version_id: 'proposition_versions:camara:pl-123-2026:substitutivo-1',
      value: 'ausente',
      absence_type: 'justificada',
      recorded_at: '2026-08-02T15:35:00Z',
      source: 'https://www.camara.leg.br/votacoes/123',
    },
  ],
};

const EMPTY_PLAN = {
  schema_version: '1.0.0',
  mode: 'dry-run',
  counts: { legislative_propositions: 0, proposition_versions: 0, voting_events: 0, legislative_votes: 0 },
  operations: [],
};

describe('legislative-sql-generator', () => {
  it('gera SQL determinístico e resolvido por FK lógica', () => {
    const plan = planLegislativeImport(ENVELOPE);
    expect(plan.ok).toBe(true);
    const sql = planToSql(plan.plan ?? EMPTY_PLAN);
    expect(sql).toContain(
      "insert into legislative_propositions (external_id, house, proposition_type, number, year, title, summary, official_url) values ('pl-123-2026', 'camara', 'pl', 123, 2026, 'Política pública de proteção social', 'Texto público para teste do importer.', 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?id=123') on conflict (house, external_id) do update set",
    );
    expect(sql).toContain('proposition_versions');
    expect(sql).toContain(
      "select id from legislative_propositions where house = 'camara' and external_id = 'pl-123-2026'",
    );
    expect(sql).toContain('voting_events');
    expect(sql).toContain('legislative_votes');
    expect(sql).toContain(
      "select ve.id from voting_events ve where ve.house = 'camara' and ve.external_id = 'votacao-123-1'",
    );
  });

  it('não fabrica UUIDs; resolve FKs por subselect', () => {
    const plan = planLegislativeImport(ENVELOPE);
    const sql = planToSql(plan.plan ?? EMPTY_PLAN);
    expect(sql).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
    );
  });

  it('escala aspas simples em strings', () => {
    const envelope = JSON.parse(JSON.stringify(ENVELOPE));
    envelope.propositions[0].title = "Lei 'teste'";
    const plan = planLegislativeImport(envelope);
    const sql = planToSql(plan.plan ?? EMPTY_PLAN);
    expect(sql).toContain("'Lei ''teste'''");
  });

  it('voto ausente com absence_type gera insert correto', () => {
    const plan = planLegislativeImport(ENVELOPE);
    const sql = planToSql(plan.plan ?? EMPTY_PLAN);
    expect(sql).toContain('deputy-rs-001');
    expect(sql).toContain("'ausente', 'justificada'");
  });

  it('source_reference_id (tabela de apoio) vira null comentado', () => {
    const plan = planLegislativeImport(ENVELOPE);
    const sql = planToSql(plan.plan ?? EMPTY_PLAN);
    expect(sql).toMatch(/null \/\* 'source_references:https:\/\/www\.camara\.leg\.br\/votacoes\/123' \*\//);
  });

  it('plano vazio gera comentário', () => {
    const empty = planLegislativeImport({
      schema_version: '1.0.0',
      country: 'BR',
      state: 'RS',
      election_year: 2026,
      propositions: [],
      votes: [],
    });
    expect(planToSql(empty.plan ?? EMPTY_PLAN)).toContain('-- Nenhuma operação a gerar.');
  });

  it('com catálogo, resolve UUID real em vez de null comentado', () => {
    const plan = planLegislativeImport(ENVELOPE);
    const catalogs = {
      legislatorsToCandidateId: { 'deputy-rs-001': '11111111-1111-1111-1111-111111111111' },
      sourceReferenceByKey: {
        'https://www.camara.leg.br/votacoes/123': '33333333-3333-3333-3333-333333333333',
      },
    };
    const sql = planToSql(plan.plan ?? EMPTY_PLAN, catalogs);
    expect(sql).toContain("'11111111-1111-1111-1111-111111111111', null, 'ausente'");
    expect(sql).not.toContain("null /* 'legislators:deputy-rs-001' */");
    expect(sql).toContain("'33333333-3333-3333-3333-333333333333'");
  });

  it('sem catálogo, FK de apoio vira null comentado (não fabrica UUID)', () => {
    const plan = planLegislativeImport(ENVELOPE);
    const sql = planToSql(plan.plan ?? EMPTY_PLAN);
    expect(sql).toContain("null /* 'legislators:deputy-rs-001' */");
  });
});
