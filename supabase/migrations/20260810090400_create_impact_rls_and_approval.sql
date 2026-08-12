-- Migration: Fase 1 — RLS das tabelas de impacto + RPC de aprovação
-- Data: 2026-08-10
-- Fase Supabase 2 (GUIA §13–14)
-- Tabelas novas nascem protegidas. Público anônimo lê somente estados
-- publicáveis; nada de rascunho/pending/reviews cruas na superfície.
-- PG14 compatible.

-- ============================================================================
-- 1. Habilitar RLS em todas as tabelas novas
-- ============================================================================
alter table legislative_propositions enable row level security;
alter table proposition_versions enable row level security;
alter table voting_events enable row level security;
alter table legislative_votes enable row level security;
alter table beneficiary_groups enable row level security;
alter table beneficiary_group_aliases enable row level security;
alter table impact_matrices enable row level security;
alter table impact_assessments enable row level security;
alter table impact_assessment_sources enable row level security;
alter table impact_reviews enable row level security;
alter table impact_contestations enable row level security;

-- ============================================================================
-- 2. Público anônimo PODE ler (GUIA §13)
-- ============================================================================
-- Núcleo legislativo factual
drop policy if exists "legislative_propositions_public_read" on legislative_propositions;
create policy "legislative_propositions_public_read" on legislative_propositions
  for select using (true);

drop policy if exists "proposition_versions_public_read" on proposition_versions;
create policy "proposition_versions_public_read" on proposition_versions
  for select using (true);

drop policy if exists "voting_events_public_read" on voting_events;
create policy "voting_events_public_read" on voting_events
  for select using (true);

drop policy if exists "legislative_votes_public_read" on legislative_votes;
create policy "legislative_votes_public_read" on legislative_votes
  for select using (true);

-- Vocabulário
drop policy if exists "beneficiary_groups_public_read" on beneficiary_groups;
create policy "beneficiary_groups_public_read" on beneficiary_groups
  for select using (true);

drop policy if exists "beneficiary_group_aliases_public_read" on beneficiary_group_aliases;
create policy "beneficiary_group_aliases_public_read" on beneficiary_group_aliases
  for select using (true);

-- Matriz: somente approved e contested
drop policy if exists "impact_matrices_public_read" on impact_matrices;
create policy "impact_matrices_public_read" on impact_matrices
  for select using (review_status in ('approved','contested'));

drop policy if exists "impact_assessments_public_read" on impact_assessments;
create policy "impact_assessments_public_read" on impact_assessments
  for select using (
    exists (
      select 1 from impact_matrices m
      where m.id = impact_assessments.impact_matrix_id
        and m.review_status in ('approved','contested')
    )
  );

drop policy if exists "impact_assessment_sources_public_read" on impact_assessment_sources;
create policy "impact_assessment_sources_public_read" on impact_assessment_sources
  for select using (
    exists (
      select 1 from impact_assessments a
      join impact_matrices m on m.id = a.impact_matrix_id
      where a.id = impact_assessment_sources.assessment_id
        and m.review_status in ('approved','contested')
    )
  );

-- Contestações públicas (estado aberto visível para o fluxo de análise)
drop policy if exists "impact_contestations_public_read" on impact_contestations;
create policy "impact_contestations_public_read" on impact_contestations
  for select using (status in ('open','under_review','resolved'));

-- ============================================================================
-- 3. Público anônimo NÃO lê (rascunho, pending, reviews cruas)
-- ============================================================================
-- impact_reviews: somente revisores/autores (nada de análise crua pública)
drop policy if exists "impact_reviews_internal_read" on impact_reviews;
create policy "impact_reviews_internal_read" on impact_reviews
  for select using (
    auth.uid() is not null and public.has_editor_role(auth.uid())
  );

drop policy if exists "impact_reviews_editor_insert" on impact_reviews;
create policy "impact_reviews_editor_insert" on impact_reviews
  for insert with check (
    auth.uid() is not null and public.has_editor_role(auth.uid())
  );

-- ============================================================================
-- 4. Aprovação transacional da matriz (GUIA §14) — espelha publish_claim
-- ============================================================================
create or replace function public.impact_matrix_has_internal_approval(p_matrix_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.impact_reviews r
    where r.impact_matrix_id = p_matrix_id
      and r.decision = 'approved'
      and r.reviewer_type = 'curadoria_interna'
      and public.has_editor_role(r.reviewer_id)
  );
$$;

create or replace function public.impact_matrix_has_external_approval(p_matrix_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.impact_reviews r
    where r.impact_matrix_id = p_matrix_id
      and r.decision = 'approved'
      and r.reviewer_type = 'painel_externo'
  );
$$;

create or replace function public.impact_matrix_has_blocking_contestation(p_matrix_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.impact_assessments a
    join public.impact_contestations c on c.assessment_id = a.id
    where a.impact_matrix_id = p_matrix_id
      and c.status in ('open','under_review')
  );
$$;

create or replace function public.approve_impact_matrix(p_matrix_id uuid)
returns public.impact_matrices
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_matrix public.impact_matrices%rowtype;
  v_min_confidence numeric;
begin
  select * into v_matrix from public.impact_matrices where id = p_matrix_id;
  if not found then
    raise exception 'matriz inexistente' using errcode = 'P0001';
  end if;

  if v_matrix.review_status <> 'pending_review' then
    raise exception 'matriz não está em pending_review' using errcode = 'P0001';
  end if;

  -- 3. existe pelo menos um assessment válido OU explicitamente nenhum grupo
  if not exists (
    select 1 from public.impact_assessments a where a.impact_matrix_id = p_matrix_id
  ) and not v_matrix.generated_by_ai then
    -- matriz sem assessments só é válida se marcada explicitamente como tal;
    -- generated_by_ai=false + zero assessments = sem grupo justificado
    raise exception 'matriz sem assessments nem marcação explícita de nenhum grupo'
      using errcode = 'P0001';
  end if;

  -- 4–5. assessments válidos: fontes suficientes e confidence na faixa
  if exists (
    select 1
    from public.impact_assessments a
    where a.impact_matrix_id = p_matrix_id
      and (
        a.confidence <= 0 or a.confidence > 1
        or not exists (
          select 1 from public.impact_assessment_sources s
          where s.assessment_id = a.id
        )
      )
  ) then
    raise exception 'assessment com confidence fora da faixa ou sem fontes suficientes'
      using errcode = 'P0001';
  end if;

  -- 6. defending_vote obedece metodologia (garantido por trigger, rechecado aqui)
  if exists (
    select 1
    from public.impact_assessments a
    where a.impact_matrix_id = p_matrix_id
      and (
        (a.impact_direction in ('positive','negative') and a.defending_vote is null)
        or (a.impact_direction = 'unclear' and a.defending_vote is not null)
      )
  ) then
    raise exception 'defending_vote não obedece a metodologia' using errcode = 'P0001';
  end if;

  -- 7. revisão interna aprovada
  if not public.impact_matrix_has_internal_approval(p_matrix_id) then
    raise exception 'revisão interna aprovada obrigatória' using errcode = 'P0001';
  end if;

  -- 8. severity >= 4 → painel externo
  if v_matrix.severity >= 4
     and not public.impact_matrix_has_external_approval(p_matrix_id) then
    raise exception 'severity >= 4 exige revisão externa (painel) aprovada' using errcode = 'P0001';
  end if;

  -- 9. qualquer confidence < 0.6 → painel externo
  select min(a.confidence) into v_min_confidence
  from public.impact_assessments a
  where a.impact_matrix_id = p_matrix_id;

  if v_min_confidence is not null and v_min_confidence < 0.6
     and not public.impact_matrix_has_external_approval(p_matrix_id) then
    raise exception 'confidence < 0.6 exige revisão externa (painel) aprovada' using errcode = 'P0001';
  end if;

  -- 10. sem contestação bloqueante
  if public.impact_matrix_has_blocking_contestation(p_matrix_id) then
    raise exception 'contestação bloqueante aberta' using errcode = 'P0001';
  end if;

  update public.impact_matrices
     set review_status = 'approved',
         approved_at = now(),
         updated_at = now()
   where id = p_matrix_id
   returning * into v_matrix;

  return v_matrix;
end;
$$;

-- ============================================================================
-- 5. Grants de leitura pública (privilégio base para a RLS ser avaliada)
-- Sem o GRANT, o Postgres barra com 42501 antes de avaliar a policy.
-- ============================================================================
grant select on table
  legislative_propositions,
  proposition_versions,
  voting_events,
  legislative_votes,
  beneficiary_groups,
  beneficiary_group_aliases,
  impact_matrices,
  impact_assessments,
  impact_assessment_sources,
  impact_contestations
to anon, authenticated;

grant select on table impact_reviews to authenticated;
grant insert, update, delete on table impact_reviews to authenticated;

alter default privileges in schema public
  grant select on tables to anon, authenticated;

revoke all on function public.approve_impact_matrix(uuid) from public, anon;
grant execute on function public.approve_impact_matrix(uuid) to authenticated;
