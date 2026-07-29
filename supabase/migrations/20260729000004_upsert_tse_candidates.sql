-- Migration: 20260729000004_upsert_tse_candidates
-- RPC de upsert: staging → candidates (chamada pelo pipeline --import)

-- 1. Função principal
create or replace function upsert_candidates_from_staging(
  uf_filter text default 'RS',
  dry_run boolean default true
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
begin
  for v in
    select * from tse_candidates_for_upsert
    where state = uf_filter
  loop
    if dry_run then
      acao := 'dry-run';
      sq_candidato := v.sq_candidato;
      full_name := v.full_name;
      party := v.party;
      ballot_number := v.ballot_number;
      posicao := v.position;
      registration_status := v.registration_status;
      return next;
    else
      -- Gerar slug único (normalizado + sufixo se conflito)
      insert into candidates (
        full_name, party, ballot_number, position, state,
        election_year, tse_candidate_id, ballot_name,
        registration_status, data_origin, slug,
        federation, coalition,
        first_seen_at, last_seen_at
      )
      select
        v.full_name, v.party, v.ballot_number, v.position, v.state,
        2026, v.tse_candidate_id, v.ballot_name,
        v.registration_status, 'tse_import',
        case
          when not exists (select 1 from candidates where slug = lower(regexp_replace(regexp_replace(v.full_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '_', 'g')))
          then lower(regexp_replace(regexp_replace(v.full_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '_', 'g'))
          else lower(regexp_replace(regexp_replace(v.full_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '_', 'g')) || '_' || v.tse_candidate_id
        end,
        v.federation, v.coalition,
        coalesce(
          (select first_seen_at from candidates c2 where c2.tse_candidate_id = v.tse_candidate_id),
          now()
        ),
        now()
      on conflict (tse_candidate_id) where tse_candidate_id is not null
      do update set
        full_name = excluded.full_name,
        party = excluded.party,
        ballot_number = excluded.ballot_number,
        position = excluded.position,
        state = excluded.state,
        ballot_name = excluded.ballot_name,
        registration_status = excluded.registration_status,
        data_origin = 'tse_import',
        federation = excluded.federation,
        coalition = excluded.coalition,
        last_seen_at = now();

      if found then
        acao := 'updated';
      else
        acao := 'unchanged';
      end if;

      sq_candidato := v.sq_candidato;
      full_name := v.full_name;
      party := v.party;
      ballot_number := v.ballot_number;
      posicao := v.position;
      registration_status := v.registration_status;
      return next;
    end if;
  end loop;
end;
$func$;

-- 2. RPC wrapper (security definer, service_role only)
create or replace function rpc_upsert_candidates(
  uf_filter text default 'RS',
  dry_run boolean default true
)
returns json
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_result json;
begin
  -- Verificação extra: security definer + service_role
  if current_setting('request.jwt.claim.role', true) != 'service_role' then
    raise exception 'Apenas service_role pode executar upsert.';
  end if;

  select json_agg(row_to_json(t)) into v_result
  from upsert_candidates_from_staging(uf_filter, dry_run) t;

  return coalesce(v_result, '[]'::json);
end;
$func$;