import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CandidateWithClaims } from '@/types/election';
import { ComparePage } from '../ComparePage';

const { queryState } = vi.hoisted(() => ({
  queryState: {
    value: {} as Record<string, unknown>,
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => queryState.value,
}));

vi.mock('@/services/candidates', () => ({
  fetchAllCandidates: vi.fn(),
}));

vi.mock('@/hooks/usePageMetadata', () => ({
  usePageMetadata: vi.fn(),
}));

function candidate(
  id: string,
  name: string,
  party: string,
  number: number,
  gender = 'MASCULINO',
  race = 'BRANCA',
): CandidateWithClaims {
  return {
    id,
    slug: `${name.toLowerCase().replace(/\s+/g, '_')}_${id}`,
    tse_candidate_id: id,
    full_name: name,
    party,
    ballot_number: number,
    position: 'deputado_federal',
    position_label: 'Deputado Federal',
    photo_url: null,
    photo_source_url: null,
    ballot_name: null,
    state: 'RS',
    election_year: 2026,
    registration_status: 'registration_requested',
    gender,
    race,
    claims: [],
  };
}

const candidates = [
  candidate('tse-1', 'Ada Cristina Munaretto', 'PDT', 1234, 'FEMININO', 'BRANCA'),
  candidate('tse-2', 'João Batista Garcia Dias', 'PT', 5678, 'MASCULINO', 'PARDA'),
  candidate('tse-3', 'Ademar Silva', 'MDB', 9012, 'MASCULINO', 'PRETA'),
];

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="url atual">{`${location.pathname}${location.search}`}</output>;
}

function renderCompare(initialEntry = '/comparar') {
  return render(
    <MemoryRouter
      initialEntries={[initialEntry]}
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <ComparePage />
      <LocationProbe />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  queryState.value = {
    data: candidates,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  };
});

describe('ComparePage H5.3', () => {
  it('preserva parâmetros compartilháveis enquanto os candidatos carregam', () => {
    queryState.value = {
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    };

    renderCompare('/comparar?candidatos=tse-1,tse-2');

    const urlText = screen.getByLabelText(/url atual/i).textContent;
    expect(decodeURIComponent(urlText || '')).toContain('/comparar?candidatos=tse-1,tse-2');
    expect(screen.getAllByRole('status')[0]).toHaveTextContent(/carregando candidatos/i);
  });

  it('abre comparação compartilhável com 2 a 4 candidaturas pela URL', () => {
    renderCompare('/comparar?candidatos=tse-1,tse-2');

    expect(screen.getByText(/2 selecionados/i)).toBeInTheDocument();
    const selectedRegion = screen.getByRole('region', { name: /selecionados/i });
    expect(within(selectedRegion).getAllByText('Ada Cristina Munaretto').length).toBeGreaterThan(0);
    expect(within(selectedRegion).getAllByText('João Batista Garcia Dias').length).toBeGreaterThan(0);
    expect(within(selectedRegion).getByRole('link', { name: /ver comparação/i })).toHaveAttribute(
      'href',
      '#comparacao'
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('mostra o resumo e a tabela de comparação antes da lista completa de seleção', () => {
    renderCompare('/comparar?candidatos=tse-1,tse-2');

    const selectedRegion = screen.getByRole('region', { name: /selecionados/i });
    const selectorRegion = screen.getByRole('region', { name: /lista de candidatos/i });

    expect(
      selectedRegion.compareDocumentPosition(selectorRegion) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('atualiza a rota compartilhável ao selecionar candidaturas', async () => {
    renderCompare('/comparar');

    fireEvent.click(screen.getByRole('button', { name: /ada cristina munaretto/i }));
    fireEvent.click(screen.getByRole('button', { name: /joão batista garcia dias/i }));

    const urlText2 = screen.getByLabelText(/url atual/i).textContent;
    expect(decodeURIComponent(urlText2 || '')).toContain('/comparar?candidatos=tse-1,tse-2');
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('limita rota compartilhável a 4 candidaturas válidas', () => {
    renderCompare('/comparar?candidatos=tse-1,tse-invalido,tse-2,tse-3,tse-extra');

    expect(screen.getByText(/3 selecionados/i)).toBeInTheDocument();
    expect(decodeURIComponent(screen.getByLabelText(/url atual/i).textContent || '')).toContain('/comparar?candidatos=tse-1,tse-2,tse-3');
  });

  it('filtra a lista de seleção por partido, mulheres e cor/raça sem remover selecionados da rota', () => {
    renderCompare('/comparar?candidatos=tse-1,tse-2');

    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por partido/i }), {
      target: { value: 'MDB' },
    });
    const selectorRegion = screen.getByRole('region', { name: /lista de candidatos/i });
    expect(within(selectorRegion).getByText('Ademar Silva')).toBeInTheDocument();
    expect(within(selectorRegion).queryByText('Ada Cristina Munaretto')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por partido/i }), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /mostrar somente mulheres/i }));
    expect(within(selectorRegion).getByText('Ada Cristina Munaretto')).toBeInTheDocument();
    expect(within(selectorRegion).queryByText('João Batista Garcia Dias')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por cor\/raça/i }), {
      target: { value: 'BRANCA' },
    });
    expect(decodeURIComponent(screen.getByLabelText(/url atual/i).textContent || '')).toContain('/comparar?candidatos=tse-1,tse-2');
    expect(screen.getByText(/1 de 3 candidatos disponíveis/i)).toHaveTextContent(/mulheres/i);
    expect(screen.getByRole('option', { name: 'Não informado' })).toBeInTheDocument();
  });
});
