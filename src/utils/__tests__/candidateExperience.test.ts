import { describe, expect, it } from 'vitest';
import { hasPreviousMandate, candidateExperienceBadge } from '../candidateExperience';
import type { CandidateWithClaims } from '@/types/election';

describe('candidateExperience', () => {
  const baseCandidate: CandidateWithClaims = {
    id: 'cand-1',
    full_name: 'Candidato Teste',
    party: 'PARTIDO',
    position: 'deputado_estadual',
    position_label: 'Deputado Estadual',
    ballot_number: 1234,
    photo_url: null,
    photo_source_url: null,
    claims: [],
  };

  it('identifica candidato com votos nominais como portador de mandato anterior', () => {
    const candidate: CandidateWithClaims = {
      ...baseCandidate,
      voting_profiles: [
        {
          house: 'alrs',
          total_votes: 15,
          votos_sim: 10,
          votos_nao: 5,
          votos_abstencao: 0,
          votos_ausente: 0,
          votos_obstrucao: 0,
          nominal_balance: 0.5,
        },
      ],
    };

    expect(hasPreviousMandate(candidate)).toBe(true);
    const badge = candidateExperienceBadge(candidate);
    expect(badge.label).toBe('Mandato anterior');
    expect(badge.type).toBe('mandato_anterior');
  });

  it('identifica candidato com claim de histórico político eletivo', () => {
    const candidate: CandidateWithClaims = {
      ...baseCandidate,
      claims: [
        {
          id: 'claim-1',
          candidate_id: 'cand-1',
          category: 'historico_politico',
          content: 'Eleito em 2022 para Deputado Estadual pelo RS.',
          confidence_score: 5,
          status: 'published',
          source_document_id: null,
          source_document: null,
        },
      ],
    };

    expect(hasPreviousMandate(candidate)).toBe(true);
    const badge = candidateExperienceBadge(candidate);
    expect(badge.label).toBe('Mandato anterior');
  });

  it('identifica candidato estreante sem histórico eletivo nem votos', () => {
    const candidate: CandidateWithClaims = {
      ...baseCandidate,
      claims: [
        {
          id: 'claim-2',
          candidate_id: 'cand-1',
          category: 'plataforma',
          content: 'Defende investimentos em tecnologia.',
          confidence_score: 4,
          status: 'published',
          source_document_id: null,
          source_document: null,
        },
      ],
    };

    expect(hasPreviousMandate(candidate)).toBe(false);
    const badge = candidateExperienceBadge(candidate);
    expect(badge.label).toBe('1ª candidatura');
    expect(badge.type).toBe('estreante');
  });
});
