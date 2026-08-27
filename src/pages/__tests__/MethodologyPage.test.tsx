import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { MethodologyPage } from '../MethodologyPage';

vi.mock('@/hooks/usePageMetadata', () => ({
  usePageMetadata: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <MethodologyPage />
    </MemoryRouter>,
  );
}

describe('MethodologyPage harmonizada', () => {
  it('renderiza título principal e navegação rápida por seções', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 1, name: /metodologia de transparência & votações/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole('navigation', { name: /índice da metodologia/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /1\. como calculamos a pontuação das votações/i })).toHaveAttribute(
      'href',
      '#como-calculamos',
    );
  });

  it('detalha a metodologia da matriz de impacto e os 14 grupos populacionais', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /como calculamos a pontuação das votações/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /14 grupos populacionais contemplados/i }),
    ).toBeInTheDocument();

    expect(screen.getByText('Mulheres')).toBeInTheDocument();
    expect(screen.getByText('Povos indígenas')).toBeInTheDocument();
    expect(screen.getByText('Pessoas LGBTQIA+')).toBeInTheDocument();
    expect(screen.getByText('Pessoas com deficiência')).toBeInTheDocument();
    expect(screen.getByText('Agricultura familiar, assentados e sem-terra')).toBeInTheDocument();
  });

  it('apresenta a escala de pontuação (-1 a +1) e os 5 passos do método', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /como funciona o método em 5 passos/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 3, name: /como ler a pontuação final/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/começamos pelo que foi realmente votado/i)).toBeInTheDocument();
    expect(screen.getByText(/cruzamos a análise com o voto oficial do parlamentar/i)).toBeInTheDocument();
  });

  it('exibe a régua de confiança 1-5 e as categorias de fonte', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 2, name: /score de confiança e categorias de fontes/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/duas ou mais fontes de imprensa concordantes/i)).toBeInTheDocument();
    expect(screen.getByText(/fonte oficial isolada/i)).toBeInTheDocument();
  });
});
