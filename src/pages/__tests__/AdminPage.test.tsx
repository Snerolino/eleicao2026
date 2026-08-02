import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminPage } from '../AdminPage';

vi.mock('@/hooks/usePageMetadata', () => ({
  usePageMetadata: vi.fn(),
}));

function renderAdmin() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AdminPage />
    </MemoryRouter>,
  );
}

describe('AdminPage', () => {
  it('mostra painel operacional sem habilitar escrita insegura no frontend', () => {
    renderAdmin();

    expect(screen.getByRole('heading', { name: /administração/i })).toBeInTheDocument();
    expect(screen.getByText(/admin@votopraquem\.org/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar atualização tse/i })).toBeDisabled();
    expect(screen.getByText(/sem service role no navegador/i)).toBeInTheDocument();
    expect(screen.getByText(/autenticação e rls/i)).toBeInTheDocument();
  });
});
