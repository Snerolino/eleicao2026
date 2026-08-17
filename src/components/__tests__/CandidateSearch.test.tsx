import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CandidateSearch } from '../CandidateSearch';
import type { CandidateWithClaims } from '@/types/election';

const candidates: CandidateWithClaims[] = [{
  id: 'candidate-1',
  slug: 'candidata_fixture_1',
  tse_candidate_id: '1',
  full_name: 'Candidata Fixture',
  party: 'TST',
  ballot_number: 1234,
  position: 'deputado_estadual',
  position_label: 'Deputado Estadual',
  photo_url: null,
  photo_source_url: null,
  gender: 'FEMININO',
  race: 'PARDA',
  claims: [],
}];

function renderSearch(womenOnly = false) {
  const onWomenOnlyChange = vi.fn();
  render(
    <CandidateSearch
      candidates={candidates}
      query=""
      cargoFilter=""
      partyFilter=""
      womenOnly={womenOnly}
      raceFilter=""
      onQueryChange={vi.fn()}
      onCargoFilterChange={vi.fn()}
      onPartyFilterChange={vi.fn()}
      onWomenOnlyChange={onWomenOnlyChange}
      onRaceFilterChange={vi.fn()}
    />,
  );
  return { onWomenOnlyChange };
}

describe('CandidateSearch editorial e acessível', () => {
  it('preserva nomes acessíveis para busca e selects nativos', () => {
    renderSearch();

    expect(screen.getByRole('searchbox', { name: /buscar candidatos/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filtrar por cargo/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filtrar por partido/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filtrar por cor\/raça/i })).toBeInTheDocument();
  });

  it('mantém checkbox real dentro do chip e comunica a alteração', () => {
    const { onWomenOnlyChange } = renderSearch(true);
    const checkbox = screen.getByRole('checkbox', { name: /mulheres/i });

    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(onWomenOnlyChange).toHaveBeenCalledWith(false);
    expect(checkbox.closest('label')).toHaveClass('rounded-full');
    expect(checkbox.closest('label')).toHaveClass('focus-within:outline-2');
  });
});
