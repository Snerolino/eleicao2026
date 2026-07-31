-- Migration: H4.2 — Aprovação transacional de claims
-- Data: 2026-07-30
-- Objetivo: publicar/corrigir/retratar claims somente por funções auditáveis e restritas.
-- PG14 compatible.

-- Claims públicas incluem publicadas e corrigidas. Retratadas ficam fora da superfície pública.
drop policy if exists "claims_public_read_published" on public.claims;
create policy "claims_public_read_published" on public.claims
  for select using (status in ('published', 'corrected'));

create index if not exists idx_editorial_reviews_claim_decision
  on public.editorial_reviews (claim_id, decision, reviewed_at desc);

create index if not exists idx_claims_previous_version_id
  on public.claims (previous_version_id);

create or replace function public.claim_has_approved_review(p_claim_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.editorial_reviews er
    where er.claim_id = p_claim_id
      and er.decision = 'approved'
      and public.has_editor_role(er.reviewer_id)
  );
$$;

create or replace function public.assert_editorial_actor()
returns void
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' then
    return;
  end if;

  if auth.uid() is null or not public.has_editor_role(auth.uid()) then
    raise exception 'editor_role_required'
      using errcode = '42501';
  end if;
end;
$$;

create or replace function public.publish_claim(p_claim_id uuid)
returns public.claims
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_claim public.claims%rowtype;
begin
  perform public.assert_editorial_actor();

  select *
    into v_claim
    from public.claims
   where id = p_claim_id
   for update;

  if not found then
    raise exception 'claim_not_found'
      using errcode = 'P0002';
  end if;

  if v_claim.status <> 'pending_review' then
    raise exception 'claim_must_be_pending_review'
      using errcode = '23514';
  end if;

  if v_claim.candidate_id is null then
    raise exception 'claim_candidate_required'
      using errcode = '23514';
  end if;

  if v_claim.source_document_id is null then
    raise exception 'claim_source_reference_required'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.source_references sr
    where sr.id = v_claim.source_document_id
  ) then
    raise exception 'claim_public_source_reference_required'
      using errcode = '23514';
  end if;

  if not public.claim_has_approved_review(p_claim_id) then
    raise exception 'claim_approved_review_required'
      using errcode = '23514';
  end if;

  update public.claims
     set status = 'published',
         published_at = coalesce(public.claims.published_at, now())
   where id = p_claim_id
   returning * into v_claim;

  return v_claim;
end;
$$;

create or replace function public.correct_claim(
  p_claim_id uuid,
  p_content text,
  p_notes text default null
)
returns public.claims
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_original public.claims%rowtype;
  v_new public.claims%rowtype;
  v_reviewer uuid := auth.uid();
begin
  perform public.assert_editorial_actor();

  select *
    into v_original
    from public.claims
   where id = p_claim_id
   for update;

  if not found then
    raise exception 'claim_not_found'
      using errcode = 'P0002';
  end if;

  if v_original.status not in ('published', 'corrected') then
    raise exception 'claim_must_be_public_to_correct'
      using errcode = '23514';
  end if;

  if nullif(trim(coalesce(p_content, '')), '') is null then
    raise exception 'corrected_content_required'
      using errcode = '23514';
  end if;

  insert into public.claims (
    candidate_id,
    category,
    content,
    source_document_id,
    source_char_offset,
    confidence_score,
    status,
    previous_version_id,
    published_at
  ) values (
    v_original.candidate_id,
    v_original.category,
    trim(p_content),
    v_original.source_document_id,
    v_original.source_char_offset,
    v_original.confidence_score,
    'corrected',
    p_claim_id,
    now()
  )
  returning * into v_new;

  if v_reviewer is not null then
    insert into public.editorial_reviews (claim_id, reviewer_id, decision, notes)
    values (v_new.id, v_reviewer, 'approved', coalesce(p_notes, 'Correção publicada por função transacional.'));
  end if;

  return v_new;
end;
$$;

create or replace function public.retract_claim(
  p_claim_id uuid,
  p_notes text default null
)
returns public.claims
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_claim public.claims%rowtype;
  v_reviewer uuid := auth.uid();
begin
  perform public.assert_editorial_actor();

  select *
    into v_claim
    from public.claims
   where id = p_claim_id
   for update;

  if not found then
    raise exception 'claim_not_found'
      using errcode = 'P0002';
  end if;

  if v_claim.status not in ('published', 'corrected') then
    raise exception 'claim_must_be_public_to_retract'
      using errcode = '23514';
  end if;

  update public.claims
     set status = 'retracted'
   where id = p_claim_id
   returning * into v_claim;

  if v_reviewer is not null then
    insert into public.editorial_reviews (claim_id, reviewer_id, decision, notes)
    values (p_claim_id, v_reviewer, 'approved', coalesce(p_notes, 'Retração registrada por função transacional.'));
  end if;

  return v_claim;
end;
$$;

revoke all on function public.claim_has_approved_review(uuid) from public, anon;
revoke all on function public.assert_editorial_actor() from public, anon;
revoke all on function public.publish_claim(uuid) from public, anon;
revoke all on function public.correct_claim(uuid, text, text) from public, anon;
revoke all on function public.retract_claim(uuid, text) from public, anon;

grant execute on function public.publish_claim(uuid) to authenticated, service_role;
grant execute on function public.correct_claim(uuid, text, text) to authenticated, service_role;
grant execute on function public.retract_claim(uuid, text) to authenticated, service_role;
