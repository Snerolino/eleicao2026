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
          editorial_reviews: [],
        },
        {
          id: 'claim-rejected',
          category: 'plataforma',
          content: 'Claim rejeitada arquivada',
          confidence_score: 2,
          candidate_id: 'candidate-2',
          source_document_id: 'source-2',
          candidates: { full_name: 'CANDIDATO JÁ REVISADO', party: 'TSE', position: 'senador' },
          source_references: { source_name: 'Arquivo', url: null },
          editorial_reviews: [
            { decision: 'rejected', reviewed_at: '2026-08-04T07:00:00Z', notes: 'Rejeitado no painel.' },
          ],
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
    expect(screen.getByRole('heading', { name: /arquivo de claims revisadas/i })).toBeInTheDocument();
    expect(screen.getByText(/1 claim arquivada/i)).toBeInTheDocument();
    expect(screen.getByText(/claim rejeitada arquivada/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^rejeitar$/i })).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /aprovar e publicar/i }));

    await waitFor(() => {
      expect(mocks.from).toHaveBeenCalledWith('editorial_reviews');
      expect(mocks.rpc).toHaveBeenCalledWith('publish_claim', { p_claim_id: 'claim-1' });
    });
  });

  it('rejeita claim, registra no arquivo de revisões e limpa da fila sem publicar', async () => {
    const reviewInsert = vi.fn().mockResolvedValue({ error: null });
    mocks.from.mockImplementation((table: string) => {
      if (table === 'editor_roles') return editorRoleQuery();
      if (table === 'claims') return pendingClaimsQuery();
      if (table === 'editorial_reviews') return { insert: reviewInsert };
      throw new Error(`Tabela inesperada: ${table}`);
    });

    renderAdmin();

    fireEvent.change(await screen.findByLabelText(/e-mail/i), {
      target: { value: 'admin@votopraquem.org' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senha-local' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/claim em revisão/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^rejeitar$/i }));

    await waitFor(() => {
      expect(reviewInsert).toHaveBeenCalledWith(expect.objectContaining({
        claim_id: 'claim-1',
        decision: 'rejected',
      }));
      expect(mocks.rpc).not.toHaveBeenCalled();
      expect(screen.getByText(/nenhuma claim em/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^rejeitar$/i })).not.toBeInTheDocument();
      expect(screen.getByText(/claim arquivada como rejeitada/i)).toBeInTheDocument();
    });
  });

  it('edita conteúdo de uma claim pendente antes de publicar', async () => {
    const updateQuery = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
    mocks.from.mockImplementation((table: string) => {
      if (table === 'editor_roles') return editorRoleQuery();
      if (table === 'claims') return { ...pendingClaimsQuery(), update: updateQuery };
      if (table === 'editorial_reviews') return reviewInsertQuery();
      throw new Error(`Tabela inesperada: ${table}`);
    });

    renderAdmin();

    fireEvent.change(await screen.findByLabelText(/e-mail/i), { target: { value: 'admin@votopraquem.org' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha-local' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/claim em revisão/i)).toBeInTheDocument();

    // abrir edição e alterar o texto
    fireEvent.click(screen.getAllByRole('button', { name: /^editar$/i })[0]);
    const textarea = await screen.findByLabelText(/editar conteúdo da claim em revisão/i);
    fireEvent.change(textarea, { target: { value: 'Conteúdo corrigido pelo editor' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar edição/i }));

    await waitFor(() => {
      expect(updateQuery).toHaveBeenCalledWith({ content: 'Conteúdo corrigido pelo editor' });
    });
    expect(screen.getByText(/conteúdo corrigido pelo editor/i)).toBeInTheDocument();

    // ainda pendente e publicável
    fireEvent.click(screen.getByRole('button', { name: /aprovar e publicar/i }));
    await waitFor(() => {
      expect(mocks.rpc).toHaveBeenCalledWith('publish_claim', { p_claim_id: 'claim-1' });
    });
  });

  it('edita e publica uma claim do arquivo de revisadas sem passar pela fila pendente', async () => {
    const updateQuery = vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
    const reviewInsert = vi.fn().mockResolvedValue({ error: null });
    mocks.from.mockImplementation((table: string) => {
      if (table === 'editor_roles') return editorRoleQuery();
      if (table === 'claims') return { ...pendingClaimsQuery(), update: updateQuery };
      if (table === 'editorial_reviews') return { insert: reviewInsert };
      throw new Error(`Tabela inesperada: ${table}`);
    });

    renderAdmin();

    fireEvent.change(await screen.findByLabelText(/e-mail/i), { target: { value: 'admin@votopraquem.org' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha-local' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/claim rejeitada arquivada/i)).toBeInTheDocument();

    // a claim arquivada tem botão editar
    fireEvent.click(screen.getAllByRole('button', { name: /^editar$/i }).pop()!);
    const textarea = await screen.findByLabelText(/editar conteúdo da claim rejeitada arquivada/i);
    fireEvent.change(textarea, { target: { value: 'Plataforma reformulada pelo editor' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar edição/i }));

    await waitFor(() => {
      expect(updateQuery).toHaveBeenCalledWith({ content: 'Plataforma reformulada pelo editor' });
    });

    // publica a partir do arquivo: review aprovado + rpc
    fireEvent.click(screen.getByRole('button', { name: /publicar claim arquivada/i }));
    await waitFor(() => {
      expect(reviewInsert).toHaveBeenCalledWith(expect.objectContaining({
        claim_id: 'claim-rejected',
        decision: 'approved',
      }));
      expect(mocks.rpc).toHaveBeenCalledWith('publish_claim', { p_claim_id: 'claim-rejected' });
    });
  });
});
