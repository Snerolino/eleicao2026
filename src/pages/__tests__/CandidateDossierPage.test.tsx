import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CandidateWithClaims } from '@/types/election';
import { CandidateDossierPage } from '../CandidateDossierPage';

const { candidateQueryState, scoresQueryState } = vi.hoisted(() => ({
  candidateQueryState: { value: {} as Record<string, unknown> },
  scoresQueryState: { value: {} as Record<string, unknown> },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: unknown[] }) => {
    if (Array.isArray(queryKey) && queryKey[0] === 'candidate') {
      return candidateQueryState.value;
    }
    if (Array.isArray(queryKey) && queryKey[0] === 'candidate-category-scores') {
      return scoresQueryState.value;
    }
    return { data: undefined, isLoading: false, isError: false };
  },
}));

vi.mock('@/services/candidates', () => ({
  fetchCandidateById: vi.fn(),
}));

vi.mock('@/services/voteCategoryComparison', () => ({
  fetchVoteCategoryScores: vi.fn(),
}));

vi.mock('@/services/candidateVotes', () => ({
  getCandidateNominalVotes: vi.fn(() => [
    {
      house: 'camara',
      proposition_id: 'MPV 1313/2025',
      title: 'Auxílio Gás',
      vote_value: 'sim',
      date: '2025-05-10',
      source_url: 'https://camara.leg.br',
      source_label: 'Câmara dos Deputados',
      assessment_group: 'trabalhadores_informais',
      impact_direction: 'positive',
    },
  ]),
}));

vi.mock('@/hooks/usePageMetadata', () => ({
  usePageMetadata: vi.fn(),
}));

const mockCandidate: CandidateWithClaims = {
  id: '2b0a1506-b39f-5518-bb73-9e1f773cc7a0',
  slug: 'fernanda_melchionna_e_silva_210002533902',
  tse_candidate_id: '210002533902',
  full_name: 'FERNANDA MELCHIONNA E SILVA',
  party: 'PSOL',
  ballot_number: 5050,
  position: 'deputado_federal',
  position_label: 'Deputado Federal',
  photo_url: null,
  photo_source_url: null,
  ballot_name: 'FERNANDA MELCHIONNA',
  state: 'RS',
  election_year: 2026,
  registration_status: 'registration_requested',
  gender: 'FEMININO',
  race: 'BRANCA',
  claims: [],
  voting_profiles: [
    {
      house: 'camara',
      total_votes: 23,
      votos_sim: 11,
      votos_nao: 11,
      votos_abstencao: 1,
      votos_ausente: 0,
      votos_obstrucao: 0,
      nominal_balance: 0,
    },
  ],
  category_scores: [
    {
      group: 'trabalhadores_informais',
      score: 0.2,
      evaluated_propositions_count: 5,
      divergences_count: 2,
      favorable_votes: 3,
      unfavorable_votes: 2,
    },
    {
      group: 'mulheres',
      score: 0,
      evaluated_propositions_count: 2,
      divergences_count: 1,
      favorable_votes: 1,
      unfavorable_votes: 1,
    },
  ],
};

function renderDossier(slug = 'fernanda_melchionna_e_silva_210002533902') {
  return render(
    <MemoryRouter initialEntries={[`/candidato/${slug}`]}>
      <Routes>
        <Route path="/candidato/:slug" element={<CandidateDossierPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  candidateQueryState.value = {
    data: mockCandidate,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  };
  scoresQueryState.value = {
    data: [
      {
        candidate_id: mockCandidate.id,
        house: 'camara',
        group_slug: 'trabalhadores_informais',
        score: 0.2,
        methodology_version: '1.0.0',
        evaluated_propositions: 5,
        eligible_weight: 15,
        excluded_no_data: 0,
        contested_assessments: 0,
        average_confidence: 0.95,
      },
      {
        candidate_id: mockCandidate.id,
        house: 'camara',
        group_slug: 'mulheres',
        score: 0,
        methodology_version: '1.0.0',
        evaluated_propositions: 2,
        eligible_weight: 6,
        excluded_no_data: 0,
        contested_assessments: 0,
        average_confidence: 0.95,
      },
    ],
    isLoading: false,
    isError: false,
  };
});

describe('CandidateDossierPage', () => {
  it('renderiza dados do candidato, perfil de votações e barras por categoria', () => {
    renderDossier();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('FERNANDA MELCHIONNA E SILVA');
    expect(screen.getByText(/PSOL · nº 5050/i)).toBeInTheDocument();

    // Perfil de votações da Câmara
    expect(screen.getByText(/Registro legislativo · Câmara dos Deputados/i)).toBeInTheDocument();
    expect(screen.getByText(/23 votos individuais localizados/i)).toBeInTheDocument();

    // Fatos de votação
    expect(screen.getByText('Sim')).toBeInTheDocument();
    expect(screen.getByText('Não')).toBeInTheDocument();
    expect(screen.getByText('Abstenção')).toBeInTheDocument();

    // Barras de impacto por categoria
    expect(screen.getByText('Trabalhadores informais e de aplicativo')).toBeInTheDocument();
    expect(screen.getByText('Mulheres')).toBeInTheDocument();
    expect(screen.getAllByText('+0,20').length).toBeGreaterThan(0);
  });

  it('exibe barras por categoria via fallback de candidate.category_scores quando scoresQuery retorna vazio', () => {
    scoresQueryState.value = {
      data: [],
      isLoading: false,
      isError: false,
    };

    renderDossier();

    expect(screen.getByText('Trabalhadores informais e de aplicativo')).toBeInTheDocument();
    expect(screen.getByText('Mulheres')).toBeInTheDocument();
    expect(screen.getAllByText('+0,20').length).toBeGreaterThan(0);
  });
});
