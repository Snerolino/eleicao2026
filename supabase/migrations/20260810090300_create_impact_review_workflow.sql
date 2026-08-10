-- Migration: Fase 1 — Workflow de revisão humana e contestação
-- Data: 2026-08-10
-- Fase Supabase 1 (GUIA §10), modelo §5.8–5.9
-- Revisão própria da matriz (editorial_reviews é semanticamente ligada a claims).
-- PG14 compatible.

-- ============================================================================
-- 5.8 impact_reviews
-- ============================================================================
create table if not exists impact_reviews (
  id uuid primary key default gen_random_uuid(),
  impact_matrix_id uuid not null references impact_matrices(id) on delete cascade,
  assessment_id uuid references impact_assessments(id) on delete cascade,
  reviewer_id uuid references auth.users(id),
  reviewer_type text not null check (reviewer_type in ('curadoria_interna','painel_externo')),
  panel_id text,
  decision text not null check (decision in ('approved','rejected','needs_changes')),
  notes text,
  reviewed_at timestamptz not null default now()
);

comment on table impact_reviews is 'Revisões da matriz (interna e painel externo) — nunca publicadas cruas';

create index if not exists idx_impact_reviews_matrix on impact_reviews (impact_matrix_id, decision, reviewed_at desc);

-- ============================================================================
-- 5.9 impact_contestations — promessa de contestação pública
-- ============================================================================
create table if not exists impact_contestations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references impact_assessments(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open','under_review','resolved','rejected')),
  reason text not null check (char_length(reason) >= 20),
  source_reference_id uuid references source_references(id),
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table impact_contestations is 'Contestações públicas — a justificativa original nunca é apagada';

create index if not exists idx_impact_contestations_assessment on impact_contestations (assessment_id);
