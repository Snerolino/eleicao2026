import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { User } from '@supabase/supabase-js';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { sanitizeUrl } from '@/utils/sanitizeUrl';

const adminOwner = 'admin@votopraquem.org';

type EditorialRole = 'editor' | 'admin';

type PendingClaim = {
  id: string;
  category: string;
  content: string;
  confidence_score: number;
  candidate_id: string | null;
  source_document_id: string | null;
  candidates?: {
    full_name: string;
    party: string;
    position: string;
  } | null;
  source_references?: {
    source_name: string;
    url: string | null;
  } | null;
  editorial_reviews?: EditorialReview[] | null;
};

type EditorialDecision = 'approved' | 'needs_changes' | 'rejected';

type EditorialReview = {
  decision: EditorialDecision;
  notes: string | null;
  reviewed_at: string | null;
};

type PendingImpactMatrix = {
  id: string;
  proposition_version_id: string;
  methodology_version: string;
  severity: number;
  structural_type: string;
  review_status: string;
  impact_assessments?: Array<{
    id: string;
    group_slug: string;
    impact_direction: string;
    defending_vote: string | null;
    rationale: string;
    confidence: number;
  }> | null;
};

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

function formatCategory(category: string) {
  return category.replace(/_/g, ' ');
}

export function AdminPage() {
  const [email, setEmail] = useState(adminOwner);
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<EditorialRole | null>(null);
  const [claims, setClaims] = useState<PendingClaim[]>([]);
  const [reviewedClaims, setReviewedClaims] = useState<PendingClaim[]>([]);
  const [impactMatrices, setImpactMatrices] = useState<PendingImpactMatrix[]>([]);
  const [status, setStatus] = useState<LoadState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [busyClaimId, setBusyClaimId] = useState<string | null>(null);
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [busyMatrixId, setBusyMatrixId] = useState<string | null>(null);
  const [matrixNotes, setMatrixNotes] = useState<Record<string, string>>({});

  usePageMetadata(
    'Administração — Portal Transparência Eleitoral RS',
    'Painel operacional seguro para revisar, aprovar e publicar claims editoriais do portal.'
  );

  async function loadEditorialQueue(currentUser: User) {
    if (!supabase) return;

    setStatus('loading');
    setMessage(null);

    const { data: roleData, error: roleError } = await supabase
      .from('editor_roles')
      .select('role')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (roleError || !roleData || !['editor', 'admin'].includes(String(roleData.role))) {
      setRole(null);
      setClaims([]);
      setReviewedClaims([]);
      setStatus('error');
      setMessage('Usuário autenticado sem papel editorial. Peça inclusão em editor_roles.');
      return;
    }

    setRole(roleData.role as EditorialRole);

    const { data, error } = await supabase
      .from('claims')
      .select(`
        id,
        category,
        content,
        confidence_score,
        candidate_id,
        source_document_id,
        candidates(full_name, party, position),
        source_references(source_name, url),
        editorial_reviews(decision, notes, reviewed_at)
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true });

    if (error) {
      setClaims([]);
      setReviewedClaims([]);
      setStatus('error');
      setMessage('Falha ao carregar claims pendentes. Verifique RLS, relação source_references e papel editorial.');
      return;
    }

    const loadedClaims = (data ?? []) as unknown as PendingClaim[];
    setClaims(loadedClaims.filter((claim) => (claim.editorial_reviews ?? []).length === 0));
    setReviewedClaims(
      loadedClaims.filter((claim) =>
        (claim.editorial_reviews ?? []).some((review) => ['rejected', 'needs_changes'].includes(review.decision))
      )
    );
    setStatus('ready');
    await loadImpactMatrices();
  }

  async function loadImpactMatrices() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('impact_matrices')
        .select('id, proposition_version_id, methodology_version, severity, structural_type, review_status, impact_assessments(id, group_slug, impact_direction, defending_vote, rationale, confidence)')
        .eq('review_status', 'pending_review')
        .order('created_at', { ascending: true });
      if (error) {
        setImpactMatrices([]);
        return;
      }
      setImpactMatrices((data ?? []) as unknown as PendingImpactMatrix[]);
    } catch {
      setImpactMatrices([]);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initSession() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      if (cancelled || !sessionUser) return;
      setUser(sessionUser);
      await loadEditorialQueue(sessionUser);
    }

    void initSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;

    setStatus('loading');
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session?.user) {
      setUser(null);
      setStatus('error');
      setMessage('Login administrativo falhou. Confira e-mail, senha e Supabase Auth.');
      return;
    }

    setUser(data.session.user);
    await loadEditorialQueue(data.session.user);
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setClaims([]);
    setReviewedClaims([]);
    setStatus('idle');
    setMessage(null);
    setPassword('');
  }

  async function reviewClaim(claim: PendingClaim, decision: EditorialDecision) {
    if (!supabase || !user) return;

    setBusyClaimId(claim.id);
    setMessage(null);

    const notesByDecision: Record<EditorialDecision, string> = {
      approved: 'Aprovado pelo painel administrativo. Publicação feita via RPC publish_claim().',
      needs_changes: 'Arquivado pelo painel administrativo para ajustes; claim removida da fila pendente.',
      rejected: 'Arquivado pelo painel administrativo como rejeitado; claim removida da fila pendente.',
    };
    const notes = notesByDecision[decision];

    const { error: reviewError } = await supabase.from('editorial_reviews').insert({
      claim_id: claim.id,
      reviewer_id: user.id,
      decision,
      notes,
    });

    if (reviewError) {
      setBusyClaimId(null);
      setMessage('Falha ao registrar revisão editorial. Nada foi publicado.');
      return;
    }

    if (decision === 'approved') {
      const { error: publishError } = await supabase.rpc('publish_claim', { p_claim_id: claim.id });
      if (publishError) {
        setBusyClaimId(null);
        setMessage('Revisão aprovada, mas a publicação via RPC falhou. Verifique fonte pública e permissões.');
        return;
      }
    }

    setClaims((current) => current.filter((item) => item.id !== claim.id));
    setReviewedClaims((current) => current.filter((item) => item.id !== claim.id));
    if (decision !== 'approved') {
      setReviewedClaims((current) => [
        {
          ...claim,
          editorial_reviews: [{ decision, notes, reviewed_at: new Date().toISOString() }],
        },
        ...current.filter((item) => item.id !== claim.id),
      ]);
    }
    setEditingClaimId(null);
    setBusyClaimId(null);
    setMessage(decision === 'approved' ? 'Claim aprovada e publicada.' : `Claim arquivada como ${decision === 'rejected' ? 'rejeitada' : 'ajustes necessários'}.`);
  }

  function startEditing(claim: PendingClaim) {
    setEditingClaimId(claim.id);
    setEditingContent(claim.content);
    setMessage(null);
  }

  async function saveEditing(claim: PendingClaim) {
    if (!supabase || editingClaimId !== claim.id) return;

    const nextContent = editingContent.trim();
    if (!nextContent) {
      setMessage('Conteúdo não pode ficar vazio. A edição não foi salva.');
      return;
    }

    setBusyClaimId(claim.id);
    setMessage(null);

    const { error } = await supabase.from('claims').update({ content: nextContent }).eq('id', claim.id);
    if (error) {
      setBusyClaimId(null);
      setMessage('Falha ao salvar edição da claim. Nada foi alterado.');
      return;
    }

    const updatedClaim = { ...claim, content: nextContent };
    setClaims((current) => current.map((item) => (item.id === claim.id ? updatedClaim : item)));
    setReviewedClaims((current) => current.map((item) => (item.id === claim.id ? updatedClaim : item)));
    setEditingClaimId(null);
    setBusyClaimId(null);
    setMessage('Edição salva. A claim segue aguardando revisão/publicação.');
  }

  async function approveImpactMatrix(matrix: PendingImpactMatrix) {
    if (!supabase || !user) return;
    setBusyMatrixId(matrix.id);
    setMessage(null);
    const notes = matrixNotes[matrix.id]?.trim() || 'Aprovação registrada pelo painel administrativo.';
    const { data: existingReview, error: existingReviewError } = await supabase
      .from('impact_reviews')
      .select('id')
      .eq('impact_matrix_id', matrix.id)
      .eq('reviewer_type', 'curadoria_interna')
      .eq('decision', 'approved')
      .limit(1);
    if (existingReviewError) {
      setBusyMatrixId(null);
      setMessage(`Não foi possível verificar a revisão existente: ${existingReviewError.message}`);
      return;
    }
    const { error: reviewError } = existingReview?.length
      ? { error: null }
      : await supabase.from('impact_reviews').insert({
          impact_matrix_id: matrix.id,
          reviewer_id: user.id,
          reviewer_type: 'curadoria_interna',
          decision: 'approved',
          notes,
        });
    if (reviewError) {
      setBusyMatrixId(null);
      setMessage(`Nota/revisão não registrada: ${reviewError.message}`);
      return;
    }
    const { error } = await supabase.rpc('approve_impact_matrix', { p_matrix_id: matrix.id });
    if (error) {
      setBusyMatrixId(null);
      setMessage(`Matriz não aprovada: ${error.message}`);
      return;
    }
    setImpactMatrices((current) => current.filter((item) => item.id !== matrix.id));
    setBusyMatrixId(null);
    setMessage('Matriz aprovada pela RPC editorial.');
  }

  async function reviewImpactMatrix(matrix: PendingImpactMatrix, decision: 'needs_changes' | 'rejected') {
    if (!supabase || !user) return;
    const notes = matrixNotes[matrix.id]?.trim();
    if (!notes) {
      setMessage('Registre instruções ou justificativa antes de pedir ajustes/rejeitar uma matriz.');
      return;
    }
    setBusyMatrixId(matrix.id);
    setMessage(null);
    const { error } = await supabase.from('impact_reviews').insert({
      impact_matrix_id: matrix.id,
      reviewer_id: user.id,
      reviewer_type: 'curadoria_interna',
      decision,
      notes,
    });
    if (error) {
      setBusyMatrixId(null);
      setMessage(`Revisão não registrada: ${error.message}`);
      return;
    }
    setImpactMatrices((current) => current.filter((item) => item.id !== matrix.id));
    setBusyMatrixId(null);
    setMessage(decision === 'rejected' ? 'Matriz rejeitada e registrada no histórico.' : 'Matriz devolvida para ajustes.');
  }

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline"
      >
        ← Voltar à lista pública
      </Link>

      <section className="mt-6 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted-ink)]">
          Operação interna
        </p>
        <h1 className="mt-2 text-3xl">Administração</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-[var(--color-muted-ink)]">
          Painel único para autenticação, decisão editorial, instruções de revisão e aprovação humana via RPC. Claims e matrizes devem ser validadas aqui; não use escrita direta no Supabase. Responsável provisório: <strong>{adminOwner}</strong>.
        </p>
        <p className="mt-3 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Modo seguro: sem service role no navegador. O frontend usa Supabase Auth, RLS, <code>editor_roles</code>, <code>editorial_reviews</code> e RPC <code>publish_claim()</code>.
        </p>
      </section>

      {!isSupabaseConfigured || !supabase ? (
        <section className="mt-6 rounded-md border border-red-300 bg-red-50 p-5 text-sm text-red-900">
          Supabase não configurado neste build. Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> para habilitar login administrativo.
        </section>
      ) : null}

      {isSupabaseConfigured && supabase && !user ? (
        <section className="mt-6 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-6">
          <h2 className="text-2xl">Login administrativo</h2>
          <form className="mt-4 grid gap-4 md:max-w-md" onSubmit={handleLogin}>
            <label className="grid gap-1 text-sm">
              <span className="font-mono text-xs uppercase tracking-wider">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2"
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-mono text-xs uppercase tracking-wider">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2"
                required
              />
            </label>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-sm border border-[var(--color-institutional)] px-3 py-2 font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] hover:bg-[var(--color-institutional)] hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              {status === 'loading' ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </section>
      ) : null}

      {message ? (
        <p className="mt-6 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-4 py-3 text-sm" role="status">
          {message}
        </p>
      ) : null}

      {user && role ? (
        <section className="mt-6 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted-ink)]">
                Logado como {role}
              </p>
              <h2 className="mt-2 text-2xl">Claims aguardando revisão</h2>
              <p className="mt-2 text-sm text-[var(--color-muted-ink)]">
                Verifique fonte e conteúdo antes de aprovar. Aprovação publica via RPC transacional.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider"
            >
              Sair
            </button>
          </div>

          {status === 'loading' ? <p className="mt-4">Carregando fila editorial…</p> : null}

          {status === 'ready' && claims.length === 0 ? (
            <p className="mt-4 rounded-sm border border-[var(--color-border-editorial)] p-4 text-sm text-[var(--color-muted-ink)]">
              Nenhuma claim em <code>pending_review</code> no momento.
            </p>
          ) : null}

          <section className="mt-8 border-t border-[var(--color-border-editorial)] pt-6" aria-label="Matrizes de impacto pendentes">
            <h2 className="text-2xl">Matrizes de impacto pendentes</h2>
            <p className="mt-2 text-sm text-[var(--color-muted-ink)]">
              Revise a evidência e use a RPC protegida para aprovar. Matrizes com severity alta ou confiança baixa exigem revisão externa registrada.
            </p>
            {impactMatrices.length === 0 ? (
              <p className="mt-4 rounded-sm border border-[var(--color-border-editorial)] p-4 text-sm text-[var(--color-muted-ink)]">
                Nenhuma matriz ALRS pendente nesta sessão.
              </p>
            ) : (
              <div className="mt-4 grid gap-4">
                {impactMatrices.map((matrix) => (
                  <article key={matrix.id} className="rounded-sm border border-[var(--color-border-editorial)] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="text-xl">{matrix.proposition_version_id}</h3>
                        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
                          {matrix.structural_type} · severity {matrix.severity} · {matrix.methodology_version}
                        </p>
                      </div>
                      <span className="font-mono text-xs uppercase tracking-wider text-amber-800">{matrix.review_status}</span>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm">
                      {(matrix.impact_assessments ?? []).map((assessment) => (
                        <li key={assessment.id} className="rounded-sm bg-[var(--color-paper-muted)] p-3">
                          <strong>{assessment.group_slug}</strong> · {assessment.impact_direction} · voto defensor {assessment.defending_vote ?? 'não aplicável'} · confiança {assessment.confidence}
                          <p className="mt-1 text-[var(--color-muted-ink)]">{assessment.rationale}</p>
                        </li>
                      ))}
                    </ul>
                    <label className="mt-4 grid gap-1 text-sm">
                      <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
                        Instruções e observações da revisão
                      </span>
                      <textarea
                        value={matrixNotes[matrix.id] ?? ''}
                        onChange={(event) => setMatrixNotes((current) => ({ ...current, [matrix.id]: event.target.value }))}
                        rows={3}
                        placeholder="Registre contexto, ressalvas ou instruções úteis para a auditoria desta aprovação."
                        className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 leading-relaxed"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busyMatrixId === matrix.id}
                      onClick={() => void approveImpactMatrix(matrix)}
                      className="mt-4 rounded-sm border border-green-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-green-800 disabled:cursor-wait disabled:opacity-60"
                    >
                      {busyMatrixId === matrix.id ? 'Aprovando…' : 'Aprovar matriz via RPC'}
                    </button>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyMatrixId === matrix.id}
                        onClick={() => void reviewImpactMatrix(matrix, 'needs_changes')}
                        className="rounded-sm border border-amber-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-amber-800 disabled:cursor-wait disabled:opacity-60"
                      >
                        Pedir ajustes
                      </button>
                      <button
                        type="button"
                        disabled={busyMatrixId === matrix.id}
                        onClick={() => void reviewImpactMatrix(matrix, 'rejected')}
                        className="rounded-sm border border-red-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-red-800 disabled:cursor-wait disabled:opacity-60"
                      >
                        Rejeitar matriz
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="mt-5 grid gap-4">
            {claims.map((claim) => (
              <article key={claim.id} className="rounded-sm border border-[var(--color-border-editorial)] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                  <div>
                    <h3 className="text-xl">{claim.candidates?.full_name ?? 'Candidato não identificado'}</h3>
                    <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
                      {claim.candidates?.party ?? '—'} · {claim.candidates?.position ?? '—'} · {formatCategory(claim.category)} · confiança {claim.confidence_score}
                    </p>
                  </div>
                  {(() => {
                    const safeUrl = sanitizeUrl(claim.source_references?.url);
                    return safeUrl ? (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline"
                      >
                        Fonte: {claim.source_references?.source_name}
                      </a>
                    ) : (
                      <span className="font-mono text-xs uppercase tracking-wider text-red-700">Sem fonte pública</span>
                    );
                  })()}
                </div>
                <p className="mt-3 leading-relaxed">{claim.content}</p>
                {editingClaimId === claim.id ? (
                  <label className="mt-3 grid gap-1 text-sm">
                    <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
                      Editar conteúdo da {claim.content}
                    </span>
                    <textarea
                      value={editingContent}
                      onChange={(event) => setEditingContent(event.target.value)}
                      rows={5}
                      className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 leading-relaxed"
                    />
                  </label>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyClaimId === claim.id || editingClaimId !== null}
                    onClick={() => startEditing(claim)}
                    className="rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Editar
                  </button>
                  {editingClaimId === claim.id ? (
                    <button
                      type="button"
                      disabled={busyClaimId === claim.id}
                      onClick={() => void saveEditing(claim)}
                      className="rounded-sm border border-blue-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Salvar edição
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyClaimId === claim.id || !claim.source_document_id || editingClaimId !== null}
                    onClick={() => void reviewClaim(claim, 'approved')}
                    className="rounded-sm border border-green-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Aprovar e publicar
                  </button>
                  <button
                    type="button"
                    disabled={busyClaimId === claim.id || editingClaimId !== null}
                    onClick={() => void reviewClaim(claim, 'needs_changes')}
                    className="rounded-sm border border-amber-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Pedir ajustes
                  </button>
                  <button
                    type="button"
                    disabled={busyClaimId === claim.id || editingClaimId !== null}
                    onClick={() => void reviewClaim(claim, 'rejected')}
                    className="rounded-sm border border-red-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Rejeitar
                  </button>
                </div>
              </article>
            ))}
          </div>

          {reviewedClaims.length > 0 ? (
            <section
              className="mt-8 rounded-sm border border-dashed border-[var(--color-border-editorial)] p-4"
              aria-label="Arquivo de claims revisadas"
            >
              <h3 className="text-xl">Arquivo de claims revisadas</h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
                {reviewedClaims.length} {reviewedClaims.length === 1 ? 'claim arquivada' : 'claims arquivadas'} fora da fila pendente.
              </p>
              <ul className="mt-3 space-y-3">
                {reviewedClaims.map((claim) => {
                  const lastReview = claim.editorial_reviews?.[0];
                  return (
                    <li key={claim.id} className="rounded-sm border border-[var(--color-border-editorial)] p-3 text-sm">
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
                          {claim.candidates?.full_name ?? 'Candidato não identificado'} · {lastReview?.decision === 'rejected' ? 'rejeitada' : 'ajustes necessários'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busyClaimId === claim.id || editingClaimId !== null}
                            onClick={() => startEditing(claim)}
                            className="rounded-sm border border-[var(--color-border-editorial)] px-2 py-1 font-mono text-xs uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Editar
                          </button>
                          {editingClaimId === claim.id ? (
                            <button
                              type="button"
                              disabled={busyClaimId === claim.id}
                              onClick={() => void saveEditing(claim)}
                              className="rounded-sm border border-blue-700 px-2 py-1 font-mono text-xs uppercase tracking-wider text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Salvar edição
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={busyClaimId === claim.id || !claim.source_document_id || editingClaimId !== null}
                            onClick={() => void reviewClaim(claim, 'approved')}
                            className="rounded-sm border border-green-700 px-2 py-1 font-mono text-xs uppercase tracking-wider text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Publicar claim arquivada
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 leading-relaxed">{claim.content}</p>
                      {editingClaimId === claim.id ? (
                        <label className="mt-3 grid gap-1">
                          <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
                            Editar conteúdo da {claim.content}
                          </span>
                          <textarea
                            value={editingContent}
                            onChange={(event) => setEditingContent(event.target.value)}
                            rows={5}
                            className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 leading-relaxed"
                          />
                        </label>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
