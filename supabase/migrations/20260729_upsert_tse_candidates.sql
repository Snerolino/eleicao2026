-- Migration: 20260729_upsert_tse_candidates
-- RPC para upsert de staging → candidates (executar após import)

-- 1. Função transacional de upsert
-- Usa os dados mais recentes de tse_candidates_staging para cada sq_candidato
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
  position text,
  registration_status text
)
language plpgsql
as $$
declare
  v_rec record;
begin
  for v_rec in
    select
      sq_candidato,
      full_name,
      ballot_name,
      party,
      ballot_number,
      position,
      state,
      federation,
      coalition,
      tse_candidate_id,
      registration_status,
      imported_at
    from tse_candidates_for_upsert
    where state = uf_filter
  loop
    if dry_run then
      acao := 'dry-run';
      sq_candidato := v_rec.sq_candidato;
      full_name := v_rec.full_name;
      party := v_rec.party;
      ballot_number := v_rec.ballot_number;
      position := v_rec.position;
      registration_status := v_rec.registration_status;
      return next;
    else
      insert into candidates (
        full_name,
        party,
        ballot_number,
        position,
        state,
        election_year,
        tse_candidate_id,
        ballot_name,
        registration_status,
        data_origin,
        federation,
        coalition,
        photo_url,
        photo_source_url,
        first_seen_at,
        last_seen_at
      ) values (
        v_rec.full_name,
        v_rec.party,
        v_rec.ballot_number,
        v_rec.position,
        v_rec.state,
        2026,
        v_rec.tse_candidate_id,
        v_rec.ballot_name,
        v_rec.registration_status,
        'tse_import',
        v_rec.federation,
        v_rec.coalition,
        null,
        null,
        coalesce(
          (select first_seen_at from candidates where tse_candidate_id = v_rec.tse_candidate_id),
          v_rec.imported_at
        ),
        now()
      )
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
        last_seen_at = now()
      where candidates.* is distinct from excluded.*;

      if found then
        acao := 'updated';
      else
        acao := 'unchanged';
      end if;

      sq_candidato := v_rec.sq_candidato;
      full_name := v_rec.full_name;
      party := v_rec.party;
      ballot_number := v_rec.ballot_number;
      position := v_rec.position;
      registration_status := v_rec.registration_status;
      return next;
    end if;
  end loop;

  if not dry_run then
    -- Marcar candidatos que sumiram do TSE como withdrawn
    update candidates
    set
      registration_status = 'withdrawn',
      last_seen_at = now()
    where
      state = uf_filter
      and data_origin = 'tse_import'
      and tse_candidate_id is not null
      and tse_candidate_id not in (
        select sq_candidato from tse_candidates_staging where sg_uf = uf_filter
      )
      and registration_status not in ('withdrawn', 'cancelled', 'replaced');
  end if;
end;
$$;

-- 2. RPC wrapper para executar via REST API (Service Role apenas)
create or replace function rpc_upsert_candidates(
  uf_filter text default 'RS',
  dry_run boolean default true
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  -- Só pode ser chamada por role de serviço (service_role)
  if not (select rolname from pg_roles where oid = current_role) in ('service_role', 'postgres') then
    raise exception 'Apenas service_role pode executar upsert.';
  end if;

  select json_agg(row_to_json(t))
  into v_result
  from upsert_candidates_from_staging(uf_filter, dry_run) t;

  return coalesce(v_result, '[]'::json);
end;
$$;

-- 3. Trigger para evitar escrita direta em candidates com data_origin='tse_import'
create or replace function check_tse_import_write()
returns trigger language plpgsql as $$
begin
  if new.data_origin = 'tse_import' and current_role not in ('service_role', 'postgres') then
    raise exception 'Registros com data_origin=tse_import só podem ser alterados via rpc_upsert_candidates.';
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_check_tse_import_write on candidates;
create trigger trigger_check_tse_import_write
  before insert or update on candidates
  for each row
  execute function check_tse_import_write();
