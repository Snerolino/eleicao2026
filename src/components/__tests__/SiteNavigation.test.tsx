import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SiteFooter } from '../SiteFooter';
import { SiteHeader } from '../SiteHeader';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('SiteNavigation', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('não expõe link público para a área admin no header nem no footer', () => {
    renderWithRouter(
      <>
        <SiteHeader />
        <SiteFooter />
      </>
    );

    expect(screen.queryByRole('link', { name: /^admin$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /administração/i })).not.toBeInTheDocument();
  });

  it('mantém navegação e controles no masthead editorial', () => {
    renderWithRouter(<SiteHeader />);

    expect(screen.getByText('Eleições 2026 · Rio Grande do Sul')).toBeInTheDocument();
    expect(screen.getByText('Fonte, data e confiança em cada informação')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transparência eleitoral rs — página inicial/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /navegação principal/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /modo escuro/i })).toBeInTheDocument();
  });
});
