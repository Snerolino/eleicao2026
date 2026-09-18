import { FormEvent, Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { User } from '@supabase/supabase-js';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { sanitizeUrl } from '@/utils/sanitizeUrl';
import { validateEditorialDecisionEnvelope } from '@/domain/impact/editorialBatch';
import { OperationalProgressPanel } from '@/components/admin/OperationalProgressPanel';
import p2EditorialPack from '../../data/legislative-import/alrs/p2-microbatch-2-editorial-review-pack.json';
import p2EditorialPack4 from '../../data/legislative-import/alrs/p2-microbatch-4-editorial-review-pack.json';
import p2EditorialPack5 from '../../data/legislative-import/alrs/p2-microbatch-5-editorial-review-pack.json';
import p2ExternalEditorialDispositions from '../../data/legislative-import/alrs/p2-external-editorial-dispositions-15-v1.json';
import editorialBatchManifest from '../../data/legislative-import/alrs/editorial-batches/manifest-v1.json';

const editorialBatchFiles = import.meta.glob('../../data/legislative-import/alrs/editorial-batches/alrs-editorial-*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

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

type P2Disposition = 'assess' | 'no_direct_population_group' | 'taxonomy_gap' | 'excluded';

type P2EditorialItem = {
  proposition_version_id: string;
  review_key: string;
  title: string;
  official_match_key: string;
  proposition_page: string;
  editorial_disposition: 'pending_review';
  source_urls: string[];
};

const p2EditorialItems = [...(p2EditorialPack.items ?? []), ...(p2EditorialPack4.items ?? []), ...(p2EditorialPack5.items ?? [])] as P2EditorialItem[];
const p2EditorialVersionIds = [...new Set(p2EditorialItems.map((item) => item.proposition_version_id))];

type BatchDecision = {
  proposition_version_id: string;
  review_key: string;
  decision: 'approved' | 'needs_changes';
  notes?: string;
  rationale?: string;
  disposition?: P2Disposition;
  matrix?: { severity?: number; structural_type?: string };
  assessments?: Array<{ group_slug?: string; impact_direction?: string; defending_vote?: string | null; confidence?: number; rationale?: string }>;
};

type BatchContext = {
  batch_id: string;
  batch_sha256: string;
  items: Array<{
    proposition_version_id: string;
    review_key: string;
    title?: string;
    recommended_disposition?: P2Disposition | null;
    rationale?: string | null;
    recommended_rationale?: string | null;
    disposition?: P2Disposition | null;
    source_gate?: string;
    official_event_type?: string;
  }>;
};

type BatchReceipt = {
  fileName: string;
  bytes: number;
  sha256: string | null;
  batchId: string;
  batchSha256: string;
  itemCount: number;
  receivedAt: string;
  phase: 'received' | 'processing' | 'confirmed' | 'failed';
};

const editorialBatchContexts = (editorialBatchManifest.batches ?? [])
  .map((descriptor) => editorialBatchFiles[`../../data/legislative-import/alrs/editorial-batches/${descriptor.file}`])
  .filter(Boolean) as BatchContext[];

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type OperationFeedback = { kind: 'success' | 'error'; title: string; detail: string };

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
  const [p2Decisions, setP2Decisions] = useState<Record<string, P2Disposition>>({});
  const [p2Notes, setP2Notes] = useState<Record<string, string>>({});
  const [p2Completed, setP2Completed] = useState<Set<string>>(new Set());
  const [busyP2Id, setBusyP2Id] = useState<string | null>(null);
  const [showReviewedP2, setShowReviewedP2] = useState(false);
  const [batchDecisions, setBatchDecisions] = useState<BatchDecision[] | null>(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchContext, setBatchContext] = useState<BatchContext | null>(null);
  const [batchReceipt, setBatchReceipt] = useState<BatchReceipt | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<OperationFeedback | null>(null);

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

    try {
      const { data: p2Dispositions } = await (supabase as any)
        .from('impact_editorial_dispositions')
        .select('proposition_version_id, status')
        .in('proposition_version_id', p2EditorialVersionIds)
        .eq('status', 'approved');
      setP2Completed(new Set((p2Dispositions ?? []).map((row: { proposition_version_id: string }) => row.proposition_version_id)));
    } catch {
      setP2Completed(new Set());
    }

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
      console.error(existingReviewError);
      setMessage('Não foi possível verificar a revisão existente.');
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
      console.error(reviewError);
      setMessage('Nota/revisão não registrada.');
      return;
    }
    const { error } = await supabase.rpc('approve_impact_matrix', { p_matrix_id: matrix.id });
    if (error) {
      setBusyMatrixId(null);
      console.error(error);
      setMessage('Matriz não aprovada.');
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
      console.error(error);
      setMessage('Revisão não registrada.');
      return;
    }
    setImpactMatrices((current) => current.filter((item) => item.id !== matrix.id));
    setBusyMatrixId(null);
    setMessage(decision === 'rejected' ? 'Matriz rejeitada e registrada no histórico.' : 'Matriz devolvida para ajustes.');
  }

  async function recordP2Disposition(item: P2EditorialItem) {
    if (!supabase || !user) return;
    const disposition = p2Decisions[item.proposition_version_id];
    const rationale = p2Notes[item.proposition_version_id]?.trim();
    if (!disposition || !rationale || rationale.length < 20) {
      setOperationFeedback({ kind: 'error', title: 'Falta completar a decisão', detail: 'Escolha uma disposição e registre uma justificativa de pelo menos 20 caracteres.' });
      return;
    }
    setBusyP2Id(item.proposition_version_id);
    setMessage(null);
    setOperationFeedback(null);
    try {
    const { error } = await (supabase as any).rpc('record_impact_editorial_disposition', {
      p_proposition_version_id: item.proposition_version_id,
      p_review_key: item.review_key,
      p_title: item.title,
      p_disposition: disposition,
      p_rationale: rationale,
    });
    if (error) {
      console.error(error);
      setBusyP2Id(null);
      setOperationFeedback({ kind: 'error', title: 'A disposição não foi registrada', detail: `A operação foi recusada: ${error.message ?? 'erro retornado pela RPC'}. O item continua na fila.` });
      return;
    }
    const { data: saved, error: readBackError } = await (supabase as any)
      .from('impact_editorial_dispositions')
      .select('proposition_version_id, review_key, disposition, rationale, status')
      .eq('proposition_version_id', item.proposition_version_id)
      .maybeSingle();
    const confirmed = !readBackError
      && saved?.proposition_version_id === item.proposition_version_id
      && saved?.review_key === item.review_key
      && saved?.disposition === disposition
      && saved?.rationale === rationale
      && saved?.status === 'approved';
    if (!confirmed) {
      setBusyP2Id(null);
      setOperationFeedback({ kind: 'error', title: 'Enviado, mas não confirmado', detail: 'O read-back remoto divergiu. O item continua pendente para evitar uma falsa confirmação.' });
      return;
    }
    setP2Completed((current) => new Set(current).add(item.proposition_version_id));
    setBusyP2Id(null);
    setOperationFeedback({ kind: 'success', title: 'Disposição enviada com sucesso', detail: `${item.official_match_key} confirmado no Supabase por read-back exato.` });
    } catch (error) {
      console.error(error);
      setBusyP2Id(null);
      const detail = error instanceof Error ? error.message : 'erro inesperado no navegador';
      setOperationFeedback({ kind: 'error', title: 'Não foi possível concluir a revisão', detail: `Falha ao enviar ou confirmar a disposição: ${detail}. O item continua pendente.` });
    }
  }

  async function loadBatchDecisions(event: FormEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      const fileBytes = await file.arrayBuffer();
      const fileHash = globalThis.crypto?.subtle
        ? Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', fileBytes))).map((byte) => byte.toString(16).padStart(2, '0')).join('')
        : null;
      const payload = JSON.parse(await file.text()) as { packet_type?: string; batch_id?: string; batch_sha256?: string; items?: BatchDecision[]; decisions?: BatchDecision[] };
      const contexts = [...editorialBatchContexts, p2ExternalEditorialDispositions] as BatchContext[];
      const items = payload.items ?? payload.decisions ?? [];
      if (payload.packet_type === 'alrs_human_editorial_review_download' || items.length === 141) {
        setBatchDecisions(null);
        setBatchContext(null);
        setBatchReceipt(null);
        const detail = 'Este arquivo é o pacote de referência das 141 matérias, não um lote de decisões. Abra um dos seis arquivos alrs-editorial-00X.json, preencha as decisões humanas e envie somente esse lote.';
        setOperationFeedback({ kind: 'error', title: 'Pacote de referência, não decisões', detail });
        setMessage(detail);
        return;
      }
      let context = contexts.find((candidate) => candidate.batch_id === payload.batch_id && candidate.batch_sha256 === payload.batch_sha256);
      if (!context && !payload.batch_id && !payload.batch_sha256) {
        const matches = contexts.filter((candidate) => candidate.items.length === items.length && candidate.items.every((expected) => items.some((received) => received.proposition_version_id === expected.proposition_version_id && received.review_key === expected.review_key)));
        if (matches.length === 1) context = matches[0];
      }
      const validation = context
        ? await validateEditorialDecisionEnvelope(context, { ...payload, batch_id: context.batch_id, batch_sha256: context.batch_sha256, items })
        : { valid: false, errors: ['batch_context_missing'], rows: items };
      if (!validation.valid || !context) {
        setBatchDecisions(null);
        setBatchContext(null);
        setBatchReceipt(null);
        setOperationFeedback({ kind: 'error', title: 'Arquivo recusado', detail: `O JSON não corresponde a nenhum lote congelado: ${validation.errors.join(', ')}.` });
        setMessage(`Lote recusado: ${validation.errors.join(', ')}.`);
        return;
      }
      setBatchContext(context);
      setBatchDecisions(items);
      setBatchReceipt({ fileName: file.name, bytes: file.size, sha256: fileHash, batchId: context.batch_id, batchSha256: context.batch_sha256, itemCount: items.length, receivedAt: new Date().toISOString(), phase: 'received' });
      setOperationFeedback({ kind: 'success', title: 'Arquivo recebido e validado', detail: `${file.name} foi lido no navegador: ${items.length} decisões, lote ${context.batch_id}, hash do lote conferido. O Supabase ainda não foi alterado; clique em “Enviar lote e confirmar” para iniciar a análise/aplicação autenticada.` });
      setMessage(`Lote válido carregado: ${items.filter((item) => item.decision === 'approved').length} approved e ${items.filter((item) => item.decision === 'needs_changes').length} exceções.`);
    } catch {
      setBatchDecisions(null);
      setBatchContext(null);
      setBatchReceipt(null);
      setOperationFeedback({ kind: 'error', title: 'Arquivo não recebido', detail: 'Não foi possível ler ou validar o JSON. Nenhuma operação remota foi iniciada.' });
      setMessage('JSON de decisões inválido.');
    }
  }

  async function applyBatchDecisions() {
    if (!supabase || !batchDecisions || !batchContext) return;
    setBatchBusy(true);
    setOperationFeedback(null);
    setBatchReceipt((current) => current ? { ...current, phase: 'processing' } : current);
    setMessage('Lendo disposições existentes antes do apply…');
    const ids = batchDecisions.map((decision) => decision.proposition_version_id);
    const rpcItems = batchDecisions.map((decision) => {
      const item = batchContext.items.find((candidate) => candidate.proposition_version_id === decision.proposition_version_id);
      return {
        proposition_version_id: decision.proposition_version_id,
        review_key: decision.review_key,
        title: item?.title ?? decision.proposition_version_id,
        disposition: decision.disposition,
        rationale: decision.rationale,
        notes: decision.notes,
        decision: decision.decision,
        status: decision.decision === 'needs_changes' ? 'needs_changes' : 'approved',
        event_type: item?.official_event_type,
      };
    });
    if (rpcItems.some((item) => !item.disposition || String(item.decision === 'needs_changes' ? item.notes : item.rationale ?? '').trim().length < 20)) {
      setBatchBusy(false);
      setBatchReceipt((current) => current ? { ...current, phase: 'failed' } : current);
      setMessage('Lote recusado: cada decisão precisa de disposição explícita e justificativa de pelo menos 20 caracteres.');
      return;
    }
    const { data: firstApply, error: applyError } = await (supabase as any).rpc('record_impact_editorial_batch', {
      p_batch_id: batchContext.batch_id,
      p_batch_sha256: batchContext.batch_sha256,
      p_items: rpcItems,
    });
    if (applyError) {
      setBatchBusy(false);
      setBatchReceipt((current) => current ? { ...current, phase: 'failed' } : current);
      setOperationFeedback({ kind: 'error', title: 'Lote não aplicado', detail: `A transação foi recusada; nenhum item foi confirmado. ${applyError.message}` });
      return;
    }
    setMessage('Read-back pós-apply…');
    const { data: readBackRows, error: readBackError } = await (supabase as any)
      .from('impact_editorial_dispositions')
      .select('proposition_version_id, review_key, disposition, rationale, status, batch_id, batch_sha256')
      .in('proposition_version_id', ids);
    const readBackById = new Map((readBackRows ?? []).map((row: { proposition_version_id: string }) => [row.proposition_version_id, row]));
    const readBackOk = !readBackError && batchDecisions.every((decision) => {
      const row = readBackById.get(decision.proposition_version_id) as { review_key?: string; disposition?: string; rationale?: string; status?: string; batch_id?: string; batch_sha256?: string } | undefined;
      return row?.review_key === decision.review_key
        && row.disposition === decision.disposition
        && row.rationale === (decision.decision === 'needs_changes' ? decision.notes : decision.rationale)
        && row.status === (decision.decision === 'needs_changes' ? 'needs_changes' : 'approved')
        && row.batch_id === batchContext.batch_id
        && row.batch_sha256 === batchContext.batch_sha256;
    });
    if (!readBackOk) {
      setBatchBusy(false);
      setBatchReceipt((current) => current ? { ...current, phase: 'failed' } : current);
      setOperationFeedback({ kind: 'error', title: 'Lote enviado, mas não confirmado', detail: `${readBackById.size}/${batchDecisions.length} linhas tiveram read-back exato. Nenhuma matriz foi publicada.` });
      return;
    }
    const { data: secondApply, error: secondError } = await (supabase as any).rpc('record_impact_editorial_batch', {
      p_batch_id: batchContext.batch_id,
      p_batch_sha256: batchContext.batch_sha256,
      p_items: rpcItems,
    });
    if (secondError || (secondApply?.conflicts ?? 0) > 0) {
      setBatchBusy(false);
      setBatchReceipt((current) => current ? { ...current, phase: 'failed' } : current);
      setOperationFeedback({ kind: 'error', title: 'Idempotência não confirmada', detail: 'O lote permanece sob revisão e não foi marcado como concluído.' });
      return;
    }
    setP2Completed((current) => new Set([...current, ...ids]));
    setBatchBusy(false);
    setBatchReceipt((current) => current ? { ...current, phase: 'confirmed' } : current);
    setOperationFeedback({ kind: 'success', title: 'Lote enviado e confirmado', detail: `${readBackById.size}/${batchDecisions.length} itens confirmados. Primeira execução: ${firstApply?.inserted ?? 0} novas; segunda execução: ${secondApply?.already_present ?? 0} já presentes.` });
  }

  const pendingP2Items = p2EditorialItems.filter((item) => !p2Completed.has(item.proposition_version_id));
  const reviewedP2Items = p2EditorialItems.filter((item) => p2Completed.has(item.proposition_version_id));
  const sortedP2Items = showReviewedP2 ? [...pendingP2Items, ...reviewedP2Items] : pendingP2Items;

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

      {operationFeedback ? (
        <section
          className={`mt-6 rounded-md border px-5 py-4 ${operationFeedback.kind === 'success' ? 'border-green-700 bg-green-50 text-green-950' : 'border-red-700 bg-red-50 text-red-950'}`}
          role={operationFeedback.kind === 'success' ? 'status' : 'alert'}
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-lg font-bold">{operationFeedback.kind === 'success' ? '✓' : '!'}</span>
            <div>
              <h2 className="font-semibold">{operationFeedback.title}</h2>
              <p className="mt-1 text-sm leading-relaxed">{operationFeedback.detail}</p>
            </div>
          </div>
        </section>
      ) : null}

      {user && role ? (
        <section className="mt-6 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted-ink)]">
                Logado como {role}
              </p>
              <h2 className="mt-2 text-2xl">Claims pendentes</h2>
              <p className="mt-2 text-sm text-[var(--color-muted-ink)]">
                Trabalhe na ordem: disposições ALRS, matrizes pendentes e depois claims. Cada ação confirma o resultado no servidor antes de retirar o item da fila.
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

          <OperationalProgressPanel />

          <section className="mt-6 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper-muted)] p-4" aria-label="Como usar a fila editorial">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">Como usar a fila</h2>
            <ol className="mt-3 grid gap-2 text-sm md:grid-cols-3">
              <li><strong>1. Disposição</strong><br /><span className="text-[var(--color-muted-ink)]">Escolha o destino da matéria e justifique com a fonte.</span></li>
              <li><strong>2. Confirmação</strong><br /><span className="text-[var(--color-muted-ink)]">Só considere concluído quando aparecer “enviada e confirmada”.</span></li>
              <li><strong>3. Assessment</strong><br /><span className="text-[var(--color-muted-ink)]">`assess` não publica score; abre a próxima revisão.</span></li>
            </ol>
          </section>

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

          <section className="mt-8 border-t-2 border-[var(--color-ink)] pt-6" aria-label="Aplicação editorial em lote">
            <h2 className="text-2xl">Aplicação editorial em lote</h2>
            <p className="mt-2 text-sm text-[var(--color-muted-ink)]">Carregue o JSON revisado externamente. O portal valida batch_id, batch_sha256 e review_key antes de chamar as RPCs autenticadas. Apenas decisões approved são aplicadas; needs_changes permanece como exceção.</p>
            <p className="mt-3 rounded-sm border border-blue-300 bg-blue-50 px-3 py-3 text-sm text-blue-950">
              Pacote para revisores: <a href="/editorial/alrs-ready-for-human-review-v1.json" download="alrs-ready-for-human-review-v1.json" className="font-semibold underline underline-offset-4">baixar as 141 matérias prontas para disposição</a>. O arquivo é somente para análise: decisões, aplicação remota e aprovação pública permanecem desativadas.
              <span className="mt-2 block">Para enviar decisões, use um arquivo de um lote: {editorialBatchManifest.batches?.map((batch, index) => <span key={batch.batch_id}>{index > 0 ? ' · ' : ''}<a href={`/editorial/${batch.file}`} download={batch.file} className="underline underline-offset-4">{batch.batch_id}</a></span>)}.</span>
            </p>
            <label className="mt-4 grid gap-2 text-sm">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">JSON de decisões de um dos {editorialBatchManifest.batches?.length ?? 0} lotes congelados</span>
              <input type="file" accept="application/json,.json" onChange={(event) => void loadBatchDecisions(event)} className="block w-full text-sm" />
            </label>
            {batchReceipt ? (
              <section className="mt-4 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper-muted)] p-4 text-sm" role="status" aria-live="polite">
                <p className="font-semibold">{batchReceipt.phase === 'received' ? 'Recebido e aguardando envio autenticado' : batchReceipt.phase === 'processing' ? 'Recebido e em análise/aplicação' : batchReceipt.phase === 'confirmed' ? 'Recebido, analisado e confirmado no Supabase' : 'Recebido, mas a aplicação não foi confirmada'}</p>
                <dl className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  <div><dt className="text-[var(--color-muted-ink)]">arquivo</dt><dd>{batchReceipt.fileName} · {batchReceipt.bytes.toLocaleString('pt-BR')} bytes</dd></div>
                  <div><dt className="text-[var(--color-muted-ink)]">lote</dt><dd>{batchReceipt.batchId} · {batchReceipt.itemCount} decisões</dd></div>
                  <div><dt className="text-[var(--color-muted-ink)]">hash do lote</dt><dd className="break-all">{batchReceipt.batchSha256}</dd></div>
                  <div><dt className="text-[var(--color-muted-ink)]">hash do arquivo</dt><dd className="break-all">{batchReceipt.sha256 ?? 'não disponível neste navegador'}</dd></div>
                </dl>
                <p className="mt-2 text-[var(--color-muted-ink)]">Recebido localmente em {new Date(batchReceipt.receivedAt).toLocaleString('pt-BR')}. Somente “confirmado no Supabase” significa read-back remoto e idempotência concluídos.</p>
              </section>
            ) : null}
            {batchDecisions ? <div className="mt-4 flex flex-wrap items-center gap-3"><span className="font-mono text-xs uppercase tracking-wider text-green-800">{batchDecisions.length} decisões validadas</span><button type="button" disabled={batchBusy} onClick={() => void applyBatchDecisions()} className="rounded-sm border border-green-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-green-800 disabled:opacity-60">{batchBusy ? 'Enviando e confirmando…' : 'Enviar lote e confirmar'}</button></div> : null}
          </section>

          <section className="mt-8 border-t border-[var(--color-border-editorial)] pt-6" aria-label="Lote P2 aguardando disposição editorial">
            <h2 className="text-2xl">Lote P2 — disposição editorial</h2>
            <p className="mt-2 text-sm text-[var(--color-muted-ink)]">
              Registre uma disposição por versão com base na fonte. Isso encaminha a matéria para assessment ou encerra a triagem; não publica voto, matriz ou score.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm bg-[var(--color-paper-muted)] px-4 py-3 text-sm">
              <strong>{pendingP2Items.length} pendentes</strong>
              <span className="text-[var(--color-muted-ink)]">{reviewedP2Items.length} confirmados nesta sessão</span>
              {reviewedP2Items.length > 0 ? (
                <button
                  type="button"
                  aria-expanded={showReviewedP2}
                  onClick={() => setShowReviewedP2((current) => !current)}
                  className="ml-auto rounded-sm border border-[var(--color-border-editorial)] px-3 py-2 font-mono text-xs uppercase tracking-wider"
                >
                  {showReviewedP2 ? 'Ocultar confirmados' : 'Mostrar confirmados'}
                </button>
              ) : null}
            </div>
            <div className="mt-4 grid gap-4">
              {sortedP2Items.map((item, index) => {
                const completed = p2Completed.has(item.proposition_version_id);
                const showPendingHeading = index === 0 && pendingP2Items.length > 0;
                const showReviewedHeading = index === pendingP2Items.length && reviewedP2Items.length > 0;
                return (
                  <Fragment key={item.proposition_version_id}>
                    {showPendingHeading ? <h3 className="border-b-2 border-[var(--color-ink)] pb-2 font-mono text-xs uppercase tracking-widest">Precisam de atenção</h3> : null}
                    {showReviewedHeading ? <h3 className="mt-6 border-b border-[var(--color-border-editorial)] pb-2 font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">Já revisados</h3> : null}
                    <details key={item.proposition_version_id} open={!completed && index === 0} className="rounded-sm border border-[var(--color-border-editorial)] p-4">
                    <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg">{item.official_match_key}</h3>
                          <p className="mt-1 leading-relaxed">{item.title}</p>
                        </div>
                        <span className="font-mono text-xs uppercase tracking-wider text-amber-800">
                          {completed ? 'já registrada no portal' : 'pending_review'}
                        </span>
                      </div>
                    </summary>
                    <div className="mt-3 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-wider">
                      {(() => {
                        const safeUrl = sanitizeUrl(item.proposition_page);
                        return safeUrl ? <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-institutional)] underline-offset-4 hover:underline">Fonte da proposição</a> : <span>Fonte da proposição (link inválido)</span>;
                      })()}
                      {item.source_urls.slice(0, 2).map((sourceUrl) => {
                        const safeUrl = sanitizeUrl(sourceUrl);
                        return safeUrl ? <a key={sourceUrl} href={safeUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-institutional)] underline-offset-4 hover:underline">Fonte do voto</a> : <span key={sourceUrl}>Fonte do voto (link inválido)</span>;
                      })}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                      <label className="grid gap-1 text-sm">
                        <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">1. Disposição obrigatória</span>
                        <select
                          value={p2Decisions[item.proposition_version_id] ?? ''}
                          disabled={completed}
                          onChange={(event) => setP2Decisions((current) => ({ ...current, [item.proposition_version_id]: event.target.value as P2Disposition }))}
                          className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2"
                        >
                          <option value="">Selecione…</option>
                          <option value="assess">Enviar para assessment</option>
                          <option value="no_direct_population_group">Sem grupo populacional direto</option>
                          <option value="taxonomy_gap">Lacuna de taxonomia</option>
                          <option value="excluded">Excluir da fila</option>
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">2. Justificativa <span className="normal-case">(mínimo 20 caracteres)</span></span>
                        <textarea
                          value={p2Notes[item.proposition_version_id] ?? ''}
                          disabled={completed}
                          onChange={(event) => setP2Notes((current) => ({ ...current, [item.proposition_version_id]: event.target.value }))}
                          rows={3}
                          placeholder="Explique a decisão com base na fonte oficial e no escopo da versão."
                          className="rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 leading-relaxed"
                        />
                        <span className="font-mono text-[0.68rem] text-[var(--color-muted-ink)]">
                          {(p2Notes[item.proposition_version_id] ?? '').trim().length}/20 caracteres mínimos
                        </span>
                      </label>
                    </div>
                    <button
                      type="button"
                      disabled={completed || busyP2Id === item.proposition_version_id}
                      onClick={() => void recordP2Disposition(item)}
                      className="mt-3 rounded-sm border border-green-700 px-3 py-2 font-mono text-xs uppercase tracking-wider text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {completed ? 'Disposição confirmada' : busyP2Id === item.proposition_version_id ? 'Enviando e confirmando…' : 'Enviar e confirmar disposição'}
                    </button>
                  </details>
                  </Fragment>
                );
              })}
            </div>
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
