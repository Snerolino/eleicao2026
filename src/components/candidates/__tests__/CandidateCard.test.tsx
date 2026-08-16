import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { CandidateCard } from '../CandidateCard';
import type { CandidateWithClaims } from '@/types/election';

const candidate: CandidateWithClaims = {
  id: 'candidate-1',
  slug: 'candidata_teste_1',
  tse_candidate_id: '1',
  full_name: 'Candidata Teste',
  party: 'TSE',
  ballot_number: 1234,
  position: 'deputado_federal',
  position_label: 'Deputado Federal',
  photo_url: null,
  photo_source_url: 'https://divulgacandcontas.tse.jus.br/foto',
  state: 'RS',
  election_year: 2026,
  registration_status: 'registration_requested',
  claims: [],
};

function renderCard() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <CandidateCard candidate={candidate} />
    </MemoryRouter>,
  );
}

describe('CandidateCard acessibilidade/performance', () => {
  it('usa foco visível no card inteiro sem duplicar anel no link estendido', () => {
    const { container } = renderCard();

    const card = container.querySelector('article');
    expect(card).toHaveClass('focus-within:ring-2');
    expect(card).toHaveClass('focus-within:border-[var(--color-institutional)]');

    const dossierLink = screen
      .getAllByRole('link', { name: /candidata teste/i })
      .find((link) => link.getAttribute('href') === '/candidatos/candidata_teste_1');
    expect(dossierLink).toHaveClass(
      'focus-visible:outline-none',
    );
  });

  it('dá contexto ao link repetido de fonte da foto', () => {
    const { container } = renderCard();

    expect(screen.getByRole('link', { name: /abrir fonte da foto de candidata teste/i })).toHaveAttribute(
      'href',
      candidate.photo_source_url,
    );
    expect(screen.getByRole('link', { name: /abrir fonte da foto de candidata teste/i })).toHaveClass('z-10');
    expect(container).toHaveTextContent(/fonte/i);
  });

  it('não acusa "Outra fonte / Não confirmado" quando não há dados públicos verificados', () => {
    renderCard();

    // Candidato sem claims não deve exibir badge que pareça dado real.
    expect(screen.queryByText(/não confirmado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/outra fonte/i)).not.toBeInTheDocument();
    // Deve mostrar estado honesto de ausência de dados públicos verificados.
    expect(screen.getByText(/sem dados públicos verificados/i)).toBeInTheDocument();
  });
});
