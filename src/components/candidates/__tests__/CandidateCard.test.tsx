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

function renderCard(value: CandidateWithClaims = candidate) {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <CandidateCard candidate={value} />
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

  it('não inventa rodapé ou mensagem editorial quando não há claim publicada', () => {
    const { container } = renderCard();

    expect(screen.queryByText(/não confirmado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/outra fonte/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sem dados públicos verificados/i)).not.toBeInTheDocument();
    expect(container.querySelector('article')).toHaveAttribute('data-source-category', 'outro');
    expect(container.querySelector('article')).toHaveStyle({ borderLeftColor: 'var(--color-unverified)' });
  });

  it('usa a categoria da fonte publicada como lombada editorial', () => {
    const withPressClaim: CandidateWithClaims = {
      ...candidate,
      claims: [{
        id: 'claim-1',
        candidate_id: candidate.id,
        category: 'summary',
        content: 'Resumo publicado com fonte de imprensa.',
        confidence_score: 4,
        status: 'published',
        source_document_id: 'source-1',
        source_document: {
          id: 'source-1',
          source_name: 'Veículo fixture',
          source_category: 'imprensa',
          url: 'https://example.com/fonte',
          fetched_at: '2026-08-17T00:00:00Z',
        },
      }],
    };
    const { container } = renderCard(withPressClaim);
    expect(container.querySelector('article')).toHaveAttribute('data-source-category', 'imprensa');
    expect(container.querySelector('article')).toHaveStyle({ borderLeftColor: 'var(--color-press)' });
    expect(screen.getByText(/resumo publicado/i)).toBeInTheDocument();
  });

  it('exibe badge de mandato anterior para candidato com histórico legislativo ou eletivo', () => {
    const withMandate: CandidateWithClaims = {
      ...candidate,
      voting_profiles: [
        {
          house: 'alrs',
          total_votes: 5,
          votos_sim: 3,
          votos_nao: 2,
          votos_abstencao: 0,
          votos_ausente: 0,
          votos_obstrucao: 0,
          nominal_balance: 0.2,
        },
      ],
    };
    const { container } = renderCard(withMandate);

    expect(container.querySelector('article')).toHaveAttribute('data-experience-type', 'mandato_anterior');
    expect(screen.getByText(/mandato anterior/i)).toBeInTheDocument();
  });

  it('exibe badge de 1ª candidatura para candidato estreante', () => {
    const { container } = renderCard(candidate);

    expect(container.querySelector('article')).toHaveAttribute('data-experience-type', 'estreante');
    expect(screen.getByText(/1ª candidatura/i)).toBeInTheDocument();
  });
});
