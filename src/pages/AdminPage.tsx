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
  const [status, setStatus] = useState<LoadState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [busyClaimId, setBusyClaimId] = useState<string | null>(null);

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
        source_references(source_name, url)
      `)
      .eq('status', 'pending_review')
      .order('created_at', { ascending: true });

    if (error) {
      setClaims([]);
      setStatus('error');
      setMessage('Falha ao carregar claims pendentes. Verifique RLS, relação source_references e papel editorial.');
      return;
    }

    setClaims((data ?? []) as unknown as PendingClaim[]);
    setStatus('ready');
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
    setStatus('idle');
    setMessage(null);
    setPassword('');
  }

  async function reviewClaim(claim: PendingClaim, decision: 'approved' | 'needs_changes' | 'rejected') {
    if (!supabase || !user) return;

    setBusyClaimId(claim.id);
    setMessage(null);

    const notes =
      decision === 'approved'
        ? 'Aprovado pelo painel administrativo. Publicação feita via RPC publish_claim().'
        : 'Revisão registrada pelo painel administrativo; claim não publicada.';

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
    setBusyClaimId(null);
    setMessage(decision === 'approved' ? 'Claim aprovada e publicada.' : 'Revisão registrada; claim segue fora da superfície pública.');
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
          Painel para login administrativo, verificação de claims em revisão, aprovação humana e publicação via RPC editorial. Responsável provisório: <strong>{adminOwner}</strong>.
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
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busyClaimId === claim.id || !claim.source_document_id}
                    onClick={() => void reviewClaim(claim, 'approved')}
                    className="rounded-sm border border-green-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Aprovar e publicar
                  </button>
                  <button
                    type="button"
                    disabled={busyClaimId === claim.id}
                    onClick={() => void reviewClaim(claim, 'needs_changes')}
                    className="rounded-sm border border-amber-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Pedir ajustes
                  </button>
                  <button
                    type="button"
                    disabled={busyClaimId === claim.id}
                    onClick={() => void reviewClaim(claim, 'rejected')}
                    className="rounded-sm border border-red-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Rejeitar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
