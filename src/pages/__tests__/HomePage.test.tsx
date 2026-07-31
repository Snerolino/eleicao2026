import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CandidateWithClaims } from '@/types/election';
import { HomePage } from '../HomePage';

const { queryState, flags } = vi.hoisted(() => ({
  queryState: {
    value: {} as Record<string, unknown>,
  },
  flags: {
    claimsDegraded: false,
    fromSnapshot: false,
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => queryState.value,
}));

vi.mock('@/services/candidates', () => ({
  fetchAllCandidates: vi.fn(),
  wasLastClaimsFetchDegraded: () => flags.claimsDegraded,
  wasLastCandidatesFetchFromSnapshot: () => flags.fromSnapshot,
}));

vi.mock('@/hooks/usePageMetadata', () => ({
  usePageMetadata: vi.fn(),
}));

const officialCandidate: CandidateWithClaims = {
  id: 'candidate-1',
  slug: 'candidata_oficial_1',
  tse_candidate_id: '1',
  full_name: 'Candidata Oficial',
  party: 'TSE',
  ballot_number: 1234,
  position: 'deputado_federal',
  position_label: 'Deputado Federal',
  photo_url: null,
  photo_source_url: null,
  ballot_name: null,
  state: 'RS',
  election_year: 2026,
  registration_status: 'registration_requested',
  claims: [],
};

function renderHome() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <HomePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  flags.claimsDegraded = false;
  flags.fromSnapshot = false;
  queryState.value = {
    data: [officialCandidate],
    dataUpdatedAt: Date.UTC(2026, 6, 31, 9, 0, 0),
    isLoading: false,
    isError: false,
    isSuccess: true,
    refetch: vi.fn(),
  };
});

describe('HomePage estados honestos H5.2', () => {
  it('mostra fatal-error sem mensagem de lista vazia quando a consulta falha', () => {
    queryState.value = {
      data: undefined,
      dataUpdatedAt: 0,
      isLoading: false,
      isError: true,
      isSuccess: false,
      refetch: vi.fn(),
    };

    renderHome();

    expect(screen.getByRole('alert')).toHaveTextContent(/indisponibilidade temporária/i);
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.queryByText(/nenhum candidato está disponível/i)).not.toBeInTheDocument();
  });

  it('diferencia lista oficial vazia de erro de rede', () => {
    queryState.value = {
      data: [],
      dataUpdatedAt: Date.UTC(2026, 6, 31, 9, 0, 0),
      isLoading: false,
      isError: false,
      isSuccess: true,
      refetch: vi.fn(),
    };

    renderHome();

    expect(screen.getByRole('status', { name: /estado da lista/i })).toHaveTextContent(
      /nenhuma candidatura oficial encontrada/i,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('filtro sem resultado permite limpar filtros e não parece indisponibilidade', async () => {
    renderHome();

    fireEvent.change(screen.getByRole('searchbox', { name: /buscar candidatos/i }), {
      target: { value: 'zzzz-sem-resultado' },
    });

    expect(await screen.findByText(/nenhum candidato corresponde aos filtros atuais/i)).toBeInTheDocument();
    expect(screen.queryByText(/nenhum candidato está disponível/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /limpar filtros/i }));

    await waitFor(() => {
      expect(screen.getByText('Candidata Oficial')).toBeInTheDocument();
    });
  });

  it('degradação de claims não impede busca nem navegação', () => {
    flags.claimsDegraded = true;

    renderHome();

    expect(screen.getByRole('status', { name: /editoria indisponível/i })).toHaveTextContent(
      /informações editoriais temporariamente indisponíveis/i,
    );
    expect(screen.getByRole('searchbox', { name: /buscar candidatos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /candidata oficial/i })).toHaveAttribute(
      'href',
      '/candidatos/candidata_oficial_1',
    );
  });

  it('fallback de snapshot identifica origem e mantém candidatos navegáveis', () => {
    flags.fromSnapshot = true;

    renderHome();

    expect(screen.getByText(/fallback oficial validado/i)).toBeInTheDocument();
    expect(screen.getByText('Candidata Oficial')).toBeInTheDocument();
  });
});
