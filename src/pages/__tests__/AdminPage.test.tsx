import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminPage } from '../AdminPage';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('@/hooks/usePageMetadata', () => ({
  usePageMetadata: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: mocks.getSession,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    },
    from: mocks.from,
    rpc: mocks.rpc,
  },
}));

function pendingClaimsQuery() {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'claim-1',
          category: 'historico_politico',
          content: 'Claim em revisão',
          confidence_score: 4,
          candidate_id: 'candidate-1',
          source_document_id: 'source-1',
          candidates: { full_name: 'PRISCILA VOIGT SEVERIANO', party: 'UP', position: 'governador' },
          source_references: { source_name: 'Sul21', url: 'https://sul21.com.br' },
        },
      ],
      error: null,
    }),
  };
}

function editorRoleQuery(role = 'admin') {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { role }, error: null }),
  };
}

function reviewInsertQuery() {
  return {
    insert: vi.fn().mockResolvedValue({ error: null }),
  };
}

function renderAdmin() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>
  );
}

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'admin-user', email: 'admin@votopraquem.org' } } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.from.mockImplementation((table: string) => {
      if (table === 'editor_roles') return editorRoleQuery();
      if (table === 'claims') return pendingClaimsQuery();
      if (table === 'editorial_reviews') return reviewInsertQuery();
      throw new Error(`Tabela inesperada: ${table}`);
    });
  });

  it('exige login antes de mostrar a fila editorial', async () => {
    renderAdmin();

    expect(await screen.findByRole('heading', { name: /login administrativo/i })).toBeInTheDocument();
    expect(screen.queryByText(/claim em revisão/i)).not.toBeInTheDocument();
  });

  it('autentica admin, lista pending_review e publica via review aprovado + rpc', async () => {
    renderAdmin();

    fireEvent.change(await screen.findByLabelText(/e-mail/i), {
      target: { value: 'admin@votopraquem.org' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senha-local' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/claim em revisão/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /aprovar e publicar/i }));

    await waitFor(() => {
      expect(mocks.from).toHaveBeenCalledWith('editorial_reviews');
      expect(mocks.rpc).toHaveBeenCalledWith('publish_claim', { p_claim_id: 'claim-1' });
    });
  });
});
