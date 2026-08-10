import { describe, expect, it } from 'vitest';
import { validateImpactContract } from '../../src/domain/impact/contract.ts';

/**
 * Testes RED da Fase 1 (GUIA §9 — Contrato).
 * Casos mínimos obrigatórios antes da migration.
 */

const base = {
  schema_version: '1.0.0',
  methodology_version: '1.0.0',
  severity: 4,
  structural_type: 'structural',
  assessments: [],
  review_status: 'pending_review',
};

describe('impact-contract: matriz', () => {
  it('aceita uma matriz mínima válida sem assessments', () => {
    expect(validateImpactContract(base).ok).toBe(true);
  });

  it('rejeita grupo desconhecido', () => {
    const data = {
      ...base,
      assessments: [
        {
          group: 'aposentados_de_alto_padrao',
          impact_direction: 'positive',
          defending_vote: 'sim',
          confidence: 0.8,
          rationale: 'Justificativa com mais de vinte caracteres para valer.',
          sources: ['https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=1'],
        },
      ],
    };
    const r = validateImpactContract(data);
    expect(r.ok).toBe(false);
    expect(r.errors.join(' ')).toMatch(/group/);
  });

  it('rejeita severity 0', () => {
    expect(validateImpactContract({ ...base, severity: 0 }).ok).toBe(false);
  });

  it('rejeita severity 6', () => {
    expect(validateImpactContract({ ...base, severity: 6 }).ok).toBe(false);
  });

  it('rejeita confidence -0.1', () => {
    const data = {
      ...base,
      assessments: [
        {
          group: 'mulheres',
          impact_direction: 'positive',
          defending_vote: 'sim',
          confidence: -0.1,
          rationale: 'Justificativa com mais de vinte caracteres para valer.',
          sources: ['https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=1'],
        },
      ],
    };
    expect(validateImpactContract(data).ok).toBe(false);
  });

  it('rejeita confidence 1.1', () => {
    const data = {
      ...base,
      assessments: [
        {
          group: 'mulheres',
          impact_direction: 'positive',
          defending_vote: 'sim',
          confidence: 1.1,
          rationale: 'Justificativa com mais de vinte caracteres para valer.',
          sources: ['https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=1'],
        },
      ],
    };
    expect(validateImpactContract(data).ok).toBe(false);
  });

  it('rejeita grupo duplicado', () => {
    const assessment = {
      impact_direction: 'positive',
      defending_vote: 'sim',
      confidence: 0.8,
      rationale: 'Justificativa com mais de vinte caracteres para valer.',
      sources: ['https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=1'],
    };
    const data = {
      ...base,
      assessments: [
        { ...assessment, group: 'mulheres' },
        { ...assessment, group: 'mulheres' },
      ],
    };
    expect(validateImpactContract(data).ok).toBe(false);
  });

  it('rejeita unclear + defending_vote=sim (regra recomendada)', () => {
    const data = {
      ...base,
      assessments: [
        {
          group: 'mulheres',
          impact_direction: 'unclear',
          defending_vote: 'sim',
          confidence: 0.8,
          rationale: 'Justificativa com mais de vinte caracteres para valer.',
          sources: ['https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=1'],
        },
      ],
    };
    expect(validateImpactContract(data).ok).toBe(false);
  });

  it('rejeita source inválida (não-http)', () => {
    const data = {
      ...base,
      assessments: [
        {
          group: 'mulheres',
          impact_direction: 'positive',
          defending_vote: 'sim',
          confidence: 0.8,
          rationale: 'Justificativa com mais de vinte caracteres para valer.',
          sources: ['ftp://nao-e-url-publica.com/arquivo'],
        },
      ],
    };
    expect(validateImpactContract(data).ok).toBe(false);
  });

  it('rejeita método sem versão', () => {
    const { methodology_version: _omit, ...semVersao } = base;
    expect(validateImpactContract(semVersao).ok).toBe(false);
  });
});

describe('impact-contract: votos (absence_type condicional)', () => {
  it('rejeita sim + absence_type', () => {
    expect(
      validateImpactContract({
        ...base,
        votes: [
          {
            deputy_id: 'marcel-van-hattem',
            proposition_version_id: 'versao-PEC-18-2025-subst-1',
            value: 'sim',
            absence_type: 'estrategica',
            recorded_at: '2025-11-12T14:30:00Z',
            source: 'https://www.camara.leg.br/registro-votacao/12345',
          },
        ],
      }).ok,
    ).toBe(false);
  });

  it('rejeita nao + absence_type', () => {
    expect(
      validateImpactContract({
        ...base,
        votes: [
          {
            deputy_id: 'marcel-van-hattem',
            proposition_version_id: 'versao-PEC-18-2025-subst-1',
            value: 'nao',
            absence_type: 'justificada',
            recorded_at: '2025-11-12T14:30:00Z',
            source: 'https://www.camara.leg.br/registro-votacao/12345',
          },
        ],
      }).ok,
    ).toBe(false);
  });

  it('rejeita ausente + null', () => {
    expect(
      validateImpactContract({
        ...base,
        votes: [
          {
            deputy_id: 'marcel-van-hattem',
            proposition_version_id: 'versao-PEC-18-2025-subst-1',
            value: 'ausente',
            absence_type: null,
            recorded_at: '2025-11-12T14:30:00Z',
            source: 'https://www.camara.leg.br/registro-votacao/12345',
          },
        ],
      }).ok,
    ).toBe(false);
  });

  it('rejeita obstrucao + null', () => {
    expect(
      validateImpactContract({
        ...base,
        votes: [
          {
            deputy_id: 'marcel-van-hattem',
            proposition_version_id: 'versao-PEC-18-2025-subst-1',
            value: 'obstrucao',
            absence_type: null,
            recorded_at: '2025-11-12T14:30:00Z',
            source: 'https://www.camara.leg.br/registro-votacao/12345',
          },
        ],
      }).ok,
    ).toBe(false);
  });
});
