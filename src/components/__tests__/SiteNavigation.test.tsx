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
});
