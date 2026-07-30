-- Migration: H3.2 upsert idempotente e retirada segura
-- Objetivo: classificar inserted/updated/unchanged/withdrawn_candidate/needs_review
-- sem retirar candidaturas quando a cobertura do dataset não for explicitamente completa.

-- A mudança amplia a assinatura com coverage_complete default false.
-- Remover overloads antigos evita ambiguidade no PostgREST/RPC.
drop function if exists public.rpc_upsert_candidates(text, boolean);
drop function if exists public.rpc_upsert_candidates(text, boolean, boolean);
drop function if exists public.upsert_candidates_from_staging(text, boolean);
drop function if exists public.upsert_candidates_from_staging(text, boolean, boolean);

create or replace function public.upsert_candidates_from_staging(
  uf_filter text default 'RS',
  dry_run boolean default true,
  coverage_complete boolean default false
)
returns table (
  acao text,
  sq_candidato text,
  full_name text,
  party text,
  ballot_number int,
  posicao text,
  registration_status text
)
language plpgsql
as $func$
declare
  v record;
  existing public.candidates%rowtype;
  changed boolean;
  missing record;
begin
  for v in
    select * from public.tse_candidates_for_upsert
    where state = uf_filter
  loop
    select * into existing
    from public.candidates c
    where c.tse_candidate_id = v.tse_candidate_id
    limit 1;

    sq_candidato := v.sq_candidato;
    full_name := v.full_name;
    party := v.party;
    ballot_number := v.ballot_number;
    posicao := v.position;
    registration_status := v.registration_status;

    if not found then
      acao := 'inserted';

      if not dry_run then
        insert into public.candidates (
          full_name, party, ballot_number, position, state,
          election_year, tse_candidate_id, ballot_name,
          registration_status, data_origin, slug,
          federation, coalition,
          first_seen_at, last_seen_at
        ) values (
          v.full_name, v.party, v.ballot_number, v.position, v.state,
          2026, v.tse_candidate_id, v.ballot_name,
          v.registration_status, 'tse_import',
          public.candidate_public_slug(v.full_name, v.tse_candidate_id),
          v.federation, v.coalition,
          now(), now()
        );
      end if;

      return next;
      continue;
    end if;

    changed :=
      existing.full_name is distinct from v.full_name
      or existing.party is distinct from v.party
      or existing.ballot_number is distinct from v.ballot_number
      or existing.position is distinct from v.position
      or existing.state is distinct from v.state
      or existing.ballot_name is distinct from v.ballot_name
      or existing.registration_status is distinct from v.registration_status
      or existing.federation is distinct from v.federation
      or existing.coalition is distinct from v.coalition;

    if changed then
      acao := 'updated';

      if not dry_run then
        update public.candidates
        set
          full_name = v.full_name,
          party = v.party,
          ballot_number = v.ballot_number,
          position = v.position,
          state = v.state,
          ballot_name = v.ballot_name,
          registration_status = v.registration_status,
          data_origin = 'tse_import',
          federation = v.federation,
          coalition = v.coalition,
          first_seen_at = public.candidates.first_seen_at,
          last_seen_at = now()
        where public.candidates.id = existing.id;
      end if;
    else
      acao := 'unchanged';

      if not dry_run then
        update public.candidates
        set
          first_seen_at = public.candidates.first_seen_at,
          last_seen_at = now()
        where public.candidates.id = existing.id;
      end if;
    end if;

    return next;
  end loop;

  for missing in
    select c.*
    from public.candidates c
    where c.data_origin = 'tse_import'
      and c.state = uf_filter
      and c.tse_candidate_id is not null
      and not exists (
        select 1
        from public.tse_candidates_for_upsert s
        where s.state = uf_filter
          and s.tse_candidate_id = c.tse_candidate_id
      )
  loop
    sq_candidato := missing.tse_candidate_id;
    full_name := missing.full_name;
    party := missing.party;
    ballot_number := missing.ballot_number;
    posicao := missing.position;

    if coverage_complete then
      acao := 'withdrawn_candidate';
      registration_status := 'withdrawn';

      if not dry_run then
        update public.candidates
        set
          registration_status = 'withdrawn',
          first_seen_at = public.candidates.first_seen_at,
          last_seen_at = now()
        where public.candidates.id = missing.id;
      end if;
    else
      acao := 'needs_review';
      registration_status := missing.registration_status;
      -- missing_from_partial_dataset: sem coverage_complete, ausência não é evidência de retirada.
    end if;

    -- missing_from_complete_dataset: só ocorre quando coverage_complete=true.
    return next;
  end loop;
end;
$func$;

create or replace function public.rpc_upsert_candidates(
  uf_filter text default 'RS',
  dry_run boolean default true,
  coverage_complete boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_result json;
begin
  if current_setting('request.jwt.claim.role', true) != 'service_role' then
    raise exception 'Apenas service_role pode executar upsert.';
  end if;

  select json_agg(row_to_json(t)) into v_result
  from public.upsert_candidates_from_staging(uf_filter, dry_run, coverage_complete) t;

  return coalesce(v_result, '[]'::json);
end;
$func$;

revoke all on function public.upsert_candidates_from_staging(text, boolean, boolean) from public, anon, authenticated;
revoke all on function public.rpc_upsert_candidates(text, boolean, boolean) from public, anon, authenticated;
grant execute on function public.upsert_candidates_from_staging(text, boolean, boolean) to service_role;
grant execute on function public.rpc_upsert_candidates(text, boolean, boolean) to service_role;

comment on function public.rpc_upsert_candidates(text, boolean, boolean) is
  'RPC administrativa TSE: classifica inserted/updated/unchanged/withdrawn_candidate/needs_review; coverage_complete evita retirada por dataset parcial.';
