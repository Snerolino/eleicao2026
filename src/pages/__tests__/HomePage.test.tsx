import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
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
  gender: 'FEMININO',
  race: 'BRANCA',
  claims: [],
};

const accentCandidate: CandidateWithClaims = {
  ...officialCandidate,
  id: 'candidate-2',
  slug: 'jose_ademar_2',
  tse_candidate_id: '2',
  full_name: 'José Ademar',
  party: 'PDT',
  ballot_number: 5678,
  position: 'deputado_estadual',
  position_label: 'Deputado Estadual',
  gender: 'MASCULINO',
  race: 'PARDA',
};

const viceGovernorCandidate: CandidateWithClaims = {
  ...officialCandidate,
  id: 'candidate-3',
  slug: 'vice_teste_3',
  tse_candidate_id: '3',
  full_name: 'Vice Teste',
  party: 'UP',
  ballot_number: 80,
  position: 'vice_governador',
  position_label: 'Vice-governador',
  gender: 'FEMININO',
  race: 'PRETA',
};

function renderHome() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <HomePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
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
  it('expõe um h1 público para navegação por headings', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { level: 1, name: /candidatos 2026 no rio grande do sul/i })
    ).toBeInTheDocument();
  });

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

    fireEvent.click(screen.getByRole('button', { name: /limpar seleção/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /deputado federal/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /deputado federal/i }));
    expect(screen.getByText('Candidata Oficial')).toBeInTheDocument();
  });

  it('degradação de claims não impede busca nem navegação', () => {
    flags.claimsDegraded = true;

    renderHome();

    expect(screen.getByRole('status', { name: /editoria indisponível/i })).toHaveTextContent(
      /informações editoriais temporariamente indisponíveis/i,
    );
    expect(screen.getByRole('searchbox', { name: /buscar candidatos/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /deputado federal/i }));
    expect(screen.getByRole('link', { name: /candidata oficial/i })).toHaveAttribute(
      'href',
      '/candidatos/candidata_oficial_1',
    );
  });

  it('fallback de snapshot identifica origem e mantém candidatos navegáveis', () => {
    flags.fromSnapshot = true;

    renderHome();

    expect(screen.getByText(/fallback oficial validado/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /deputado federal/i }));
    expect(screen.getByText('Candidata Oficial')).toBeInTheDocument();
  });

  it('busca por acento, partido, número e cargo retorna resultados corretos', async () => {
    queryState.value = {
      ...queryState.value,
      data: [officialCandidate, accentCandidate],
    };
    renderHome();

    const search = screen.getByRole('searchbox', { name: /buscar candidatos/i });

    fireEvent.change(search, { target: { value: 'Jose' } });
    expect(await screen.findByText('José Ademar')).toBeInTheDocument();
    expect(screen.queryByText('Candidata Oficial')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'PDT' } });
    expect(await screen.findByText('José Ademar')).toBeInTheDocument();
    expect(screen.queryByText('Candidata Oficial')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: '1234' } });
    expect(await screen.findByText('Candidata Oficial')).toBeInTheDocument();
    expect(screen.queryByText('José Ademar')).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'estadual' } });
    expect(await screen.findByText('José Ademar')).toBeInTheDocument();
    expect(screen.queryByText('Candidata Oficial')).not.toBeInTheDocument();
  });

  it('oferece atalhos de cargo clicáveis e seção própria de vice-governador', async () => {
    queryState.value = {
      ...queryState.value,
      data: [officialCandidate, accentCandidate, viceGovernorCandidate],
    };
    renderHome();

    const nav = screen.getByRole('navigation', { name: /navegação por cargo/i });
    expect(within(nav).getByRole('button', { name: /vice-governador/i })).toHaveTextContent('1');

    fireEvent.click(within(nav).getByRole('button', { name: /vice-governador/i }));

    expect(await screen.findByText('Vice Teste')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /vice-governador/i }).length).toBeGreaterThan(0);
    expect(screen.queryByText('Candidata Oficial')).not.toBeInTheDocument();
  });

  it('filtra por partido, mulheres e cor/raça oficial sem perder a contagem pública', async () => {
    queryState.value = {
      ...queryState.value,
      data: [officialCandidate, accentCandidate, viceGovernorCandidate],
    };
    renderHome();

    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por partido/i }), {
      target: { value: 'PDT' },
    });
    expect(await screen.findByText('José Ademar')).toBeInTheDocument();
    expect(screen.queryByText('Candidata Oficial')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por partido/i }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /mostrar somente mulheres/i }));
    expect(await screen.findByText('Candidata Oficial')).toBeInTheDocument();
    expect(screen.getByText('Vice Teste')).toBeInTheDocument();
    expect(screen.queryByText('José Ademar')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por cor\/raça/i }), {
      target: { value: 'PRETA' },
    });
    expect(await screen.findByText('Vice Teste')).toBeInTheDocument();
    expect(screen.queryByText('Candidata Oficial')).not.toBeInTheDocument();
    expect(screen.getByText(/1 de 3 candidatos/i)).toHaveTextContent(/mulheres/i);
    expect(screen.getByText(/1 de 3 candidatos/i)).toHaveTextContent(/cor\/raça preta/i);
    expect(screen.getByRole('option', { name: 'Não informado' })).toBeInTheDocument();
  });

  it('renderiza Todos como resumo de cargos e abre um cargo sem despejar a lista inteira', () => {
    queryState.value = { ...queryState.value, data: [officialCandidate, accentCandidate, viceGovernorCandidate] };
    renderHome();
    expect(screen.getByRole('region', { name: /resumo por cargo/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /deputado estadual/i }));
    expect(screen.getByText('José Ademar')).toBeInTheDocument();
  });

  it('troca para compacta e salva somente o ID no navegador', () => {
    queryState.value = { ...queryState.value, data: [officialCandidate] };
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /deputado federal/i }));
    fireEvent.click(screen.getByRole('button', { name: /compacta/i }));
    expect(screen.getByRole('button', { name: /compacta/i })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /salvar candidata oficial neste navegador/i }));
    expect(screen.getByRole('button', { name: /remover candidata oficial dos salvos/i })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('votopraquem:saved-candidates:v1') ?? '[]')).toEqual(['1']);
  });

  it('preserva candidatos salvos enquanto a lista oficial ainda está carregando', () => {
    window.localStorage.setItem('votopraquem:saved-candidates:v1', JSON.stringify(['1']));
    queryState.value = { data: undefined, dataUpdatedAt: 0, isLoading: true, isError: false, isSuccess: false, refetch: vi.fn() };
    const view = renderHome();
    queryState.value = { ...queryState.value, data: [officialCandidate], isLoading: false, isSuccess: true };
    view.rerender(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    expect(JSON.parse(window.localStorage.getItem('votopraquem:saved-candidates:v1') ?? '[]')).toEqual(['1']);
  });

  it('mostra estado vazio de Salvos sem tratar como indisponibilidade', () => {
    queryState.value = { ...queryState.value, data: [officialCandidate] };
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /salvos/i }));
    expect(screen.getByText(/nenhum candidato salvo neste navegador/i)).toBeInTheDocument();
  });
});
