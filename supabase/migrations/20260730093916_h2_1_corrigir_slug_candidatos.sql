-- Migration: H2.1 corrigir identidade pública de candidatos
-- Objetivo: usar tse_candidate_id como chave natural de integração e slug como identificador público de URL.
-- Esta migration é idempotente e preserva slugs existentes em reimportações.

create or replace function public.normalize_candidate_slug(input text)
returns text
language sql
immutable
as $$
  select trim(both '_' from regexp_replace(
    lower(translate(coalesce(input, ''),
      'ÁÀÂÃÄÅáàâãäåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
      'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'
    )),
    '[^a-z0-9]+', '_', 'g'
  ));
$$;

create or replace function public.candidate_public_slug(candidate_name text, candidate_tse_id text)
returns text
language sql
immutable
as $$
  select case
    when regexp_replace(coalesce(candidate_tse_id, ''), '\D', '', 'g') <> '' then
      coalesce(nullif(public.normalize_candidate_slug(candidate_name), ''), 'candidato')
      || '_' || regexp_replace(candidate_tse_id, '\D', '', 'g')
    else
      coalesce(nullif(public.normalize_candidate_slug(candidate_name), ''), 'candidato')
  end;
$$;

alter table public.candidates
  add column if not exists slug text;

update public.candidates
set slug = public.candidate_public_slug(full_name, tse_candidate_id)
where tse_candidate_id is not null
  and (slug is null or slug = '' or slug !~ '^[a-z0-9_]+$' or slug !~ ('_' || regexp_replace(tse_candidate_id, '\D', '', 'g') || '$'));

update public.candidates
set slug = public.normalize_candidate_slug(full_name) || '_' || substring(id::text from 1 for 8)
where slug is null or slug = '';

do $$
begin
  if exists (
    select 1
    from public.candidates
    group by slug
    having count(*) > 1
  ) then
    raise exception 'Slugs duplicados em public.candidates; resolver antes de UNIQUE.';
  end if;
end $$;

alter table public.candidates
  alter column slug set not null;

drop index if exists public.idx_candidates_slug;
create unique index if not exists idx_candidates_slug on public.candidates(slug);

alter table public.candidates
  drop constraint if exists chk_candidates_slug_format;

alter table public.candidates
  add constraint chk_candidates_slug_format
  check (slug ~ '^[a-z0-9_]+$');

-- Atualiza o upsert para inserir slug estável no primeiro import, sem reescrever slug em updates.
create or replace function public.upsert_candidates_from_staging(
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
    select * from public.tse_candidates_for_upsert
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
      insert into public.candidates (
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
        public.candidate_public_slug(v.full_name, v.tse_candidate_id),
        v.federation, v.coalition,
        coalesce(
          (select first_seen_at from public.candidates c2 where c2.tse_candidate_id = v.tse_candidate_id),
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
