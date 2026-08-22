-- Migration: harden impact approval RPC and legislators RLS
-- Date: 2026-08-22
-- Purpose: require editor caller, remove PUBLIC helper execution, protect legislators
-- Remote apply: pending explicit authorization

-- Public legislative identities are readable, but not writable by anon/authenticated.
alter table if exists public.legislators enable row level security;
drop policy if exists "legislators_public_read" on public.legislators;
create policy "legislators_public_read" on public.legislators
  for select to anon, authenticated
  using (true);
revoke insert, update, delete on table public.legislators from anon, authenticated;
grant select on table public.legislators to anon, authenticated;

-- These helpers are internal implementation details of approve_impact_matrix.
revoke execute on function public.impact_matrix_has_internal_approval(uuid) from public, anon, authenticated;
revoke execute on function public.impact_matrix_has_external_approval(uuid) from public, anon, authenticated;
revoke execute on function public.impact_matrix_has_blocking_contestation(uuid) from public, anon, authenticated;

create or replace function public.impact_matrix_has_internal_approval(p_matrix_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.impact_reviews r
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
    select 1 from public.impact_reviews r
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
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then
    raise exception 'editor role required' using errcode = '42501';
  end if;

  select * into v_matrix from public.impact_matrices where id = p_matrix_id;
  if not found then
    raise exception 'matriz inexistente' using errcode = 'P0001';
  end if;
  if v_matrix.review_status <> 'pending_review' then
    raise exception 'matriz não está em pending_review' using errcode = 'P0001';
  end if;

  -- A disposition without a direct group does not create an impact matrix.
  -- Therefore every matrix reaching this RPC must have at least one assessment.
  if not exists (select 1 from public.impact_assessments a where a.impact_matrix_id = p_matrix_id) then
    raise exception 'matriz sem assessments' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.impact_assessments a
    where a.impact_matrix_id = p_matrix_id
      and (a.confidence <= 0 or a.confidence > 1
        or not exists (select 1 from public.impact_assessment_sources s where s.assessment_id = a.id))
  ) then
    raise exception 'assessment com confidence fora da faixa ou sem fontes suficientes' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.impact_assessments a
    where a.impact_matrix_id = p_matrix_id
      and ((a.impact_direction in ('positive','negative') and a.defending_vote is null)
        or (a.impact_direction = 'unclear' and a.defending_vote is not null))
  ) then
    raise exception 'defending_vote não obedece a metodologia' using errcode = 'P0001';
  end if;

  if not public.impact_matrix_has_internal_approval(p_matrix_id) then
    raise exception 'revisão interna aprovada obrigatória' using errcode = 'P0001';
  end if;
  if v_matrix.severity >= 4 and not public.impact_matrix_has_external_approval(p_matrix_id) then
    raise exception 'severity >= 4 exige revisão externa (painel) aprovada' using errcode = 'P0001';
  end if;

  select min(a.confidence) into v_min_confidence
  from public.impact_assessments a where a.impact_matrix_id = p_matrix_id;
  if v_min_confidence is not null and v_min_confidence < 0.6
     and not public.impact_matrix_has_external_approval(p_matrix_id) then
    raise exception 'confidence < 0.6 exige revisão externa (painel) aprovada' using errcode = 'P0001';
  end if;
  if public.impact_matrix_has_blocking_contestation(p_matrix_id) then
    raise exception 'contestação bloqueante aberta' using errcode = 'P0001';
  end if;

  update public.impact_matrices
     set review_status = 'approved', approved_at = now(), updated_at = now()
   where id = p_matrix_id
   returning * into v_matrix;
  return v_matrix;
end;
$$;

revoke all on function public.approve_impact_matrix(uuid) from public, anon;
grant execute on function public.approve_impact_matrix(uuid) to authenticated;
