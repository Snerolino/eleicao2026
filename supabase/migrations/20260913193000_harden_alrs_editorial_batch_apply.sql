-- Harden ALRS editorial disposition writes with batch provenance and atomic Auth/RPC apply.
-- Remote apply requires an explicit schema gate; this file is local until then.

alter table public.impact_editorial_dispositions
  add column if not exists batch_id text,
  add column if not exists batch_sha256 text;

alter table public.impact_editorial_dispositions
  drop constraint if exists impact_editorial_dispositions_batch_sha256_check;
alter table public.impact_editorial_dispositions
  add constraint impact_editorial_dispositions_batch_sha256_check
  check (batch_sha256 is null or batch_sha256 ~ '^[0-9a-f]{64}$');

create index if not exists impact_editorial_dispositions_batch_idx
  on public.impact_editorial_dispositions (batch_id, batch_sha256);

create or replace function public.record_impact_editorial_batch(
  p_batch_id text,
  p_batch_sha256 text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_item jsonb;
  v_id uuid;
  v_existing public.impact_editorial_dispositions%rowtype;
  v_status text;
  v_disposition text;
  v_rationale text;
  v_review_key text;
  v_count integer;
  v_unique integer;
  v_inserted integer := 0;
  v_already_present integer := 0;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then
    raise exception 'editor role required' using errcode = '42501';
  end if;
  if coalesce(trim(p_batch_id), '') = '' or p_batch_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'batch provenance invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'batch items must be a non-empty array' using errcode = '22023';
  end if;

  select count(*)::integer, count(distinct value->>'proposition_version_id')::integer
    into v_count, v_unique
    from jsonb_array_elements(p_items) as value;
  if v_count <> v_unique then
    raise exception 'duplicate proposition_version_id in batch' using errcode = '22023';
  end if;

  -- Validate every row and every pre-existing row before inserting anything.
  for v_item in select value from jsonb_array_elements(p_items) as value loop
    begin
      v_id := (v_item->>'proposition_version_id')::uuid;
    exception when invalid_text_representation then
      raise exception 'invalid proposition_version_id' using errcode = '22023';
    end;
    v_review_key := nullif(trim(v_item->>'review_key'), '');
    v_disposition := v_item->>'disposition';
    v_status := coalesce(v_item->>'status', case when v_item->>'decision' = 'needs_changes' then 'needs_changes' else 'approved' end);
    v_rationale := trim(coalesce(case when v_status = 'needs_changes' then v_item->>'notes' else v_item->>'rationale' end, ''));
    if v_review_key is null or v_disposition not in ('assess', 'no_direct_population_group', 'taxonomy_gap', 'excluded') then
      raise exception 'invalid editorial decision row' using errcode = '22023';
    end if;
    if v_status not in ('approved', 'needs_changes') or char_length(v_rationale) < 20 then
      raise exception 'invalid editorial status or rationale' using errcode = '22023';
    end if;
    if v_status = 'approved' and (v_item->>'decision') is distinct from 'approved' then
      raise exception 'approved status requires approved decision' using errcode = '22023';
    end if;
    if v_status = 'needs_changes' and (v_item->>'decision') is distinct from 'needs_changes' then
      raise exception 'needs_changes status requires needs_changes decision' using errcode = '22023';
    end if;
    if v_item->>'event_type' = 'procedural_confirmed' and v_disposition = 'assess' then
      raise exception 'procedural item cannot receive assess' using errcode = '22023';
    end if;

    select * into v_existing
      from public.impact_editorial_dispositions
      where proposition_version_id = v_id and methodology_version = '1.0.0'
      for update;
    if found and not (
      v_existing.review_key = v_review_key
      and v_existing.disposition = v_disposition
      and v_existing.rationale = v_rationale
      and v_existing.status = v_status
    ) then
      raise exception 'conflicting existing editorial disposition for %', v_id using errcode = 'P0001';
    end if;
  end loop;

  for v_item in select value from jsonb_array_elements(p_items) as value loop
    v_id := (v_item->>'proposition_version_id')::uuid;
    v_review_key := trim(v_item->>'review_key');
    v_disposition := v_item->>'disposition';
    v_status := coalesce(v_item->>'status', case when v_item->>'decision' = 'needs_changes' then 'needs_changes' else 'approved' end);
    v_rationale := trim(coalesce(case when v_status = 'needs_changes' then v_item->>'notes' else v_item->>'rationale' end, ''));
    select * into v_existing
      from public.impact_editorial_dispositions
      where proposition_version_id = v_id and methodology_version = '1.0.0';
    if found then
      update public.impact_editorial_dispositions
         set batch_id = p_batch_id, batch_sha256 = p_batch_sha256, reviewer_id = auth.uid(), updated_at = now()
       where id = v_existing.id;
      v_already_present := v_already_present + 1;
    else
      insert into public.impact_editorial_dispositions
        (proposition_version_id, methodology_version, review_key, title, disposition, rationale, reviewer_id, status, batch_id, batch_sha256)
      values
        (v_id, '1.0.0', v_review_key, coalesce(v_item->>'title', v_id::text), v_disposition, v_rationale, auth.uid(), v_status, p_batch_id, p_batch_sha256);
      v_inserted := v_inserted + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'batch_id', p_batch_id,
    'batch_sha256', p_batch_sha256,
    'inserted', v_inserted,
    'already_present', v_already_present,
    'conflicts', 0,
    'rows', v_count,
    'reviewer_id', auth.uid()
  );
end;
$$;

revoke all on function public.record_impact_editorial_batch(text, text, jsonb) from public, anon;
grant execute on function public.record_impact_editorial_batch(text, text, jsonb) to authenticated;

-- Single-item manual flow remains supported but cannot silently overwrite a different decision.
create or replace function public.record_impact_editorial_disposition(
  p_proposition_version_id uuid,
  p_review_key text,
  p_title text,
  p_disposition text,
  p_rationale text
)
returns public.impact_editorial_dispositions
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_row public.impact_editorial_dispositions%rowtype;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then
    raise exception 'editor role required' using errcode = '42501';
  end if;
  if p_disposition not in ('assess', 'no_direct_population_group', 'taxonomy_gap', 'excluded')
     or char_length(trim(coalesce(p_rationale,''))) < 20 then
    raise exception 'invalid editorial disposition' using errcode = '22023';
  end if;
  select * into v_row
    from public.impact_editorial_dispositions
    where proposition_version_id = p_proposition_version_id and methodology_version = '1.0.0'
    for update;
  if found and (v_row.review_key <> p_review_key or v_row.disposition <> p_disposition or v_row.rationale <> trim(p_rationale)) then
    raise exception 'conflicting existing editorial disposition' using errcode = 'P0001';
  end if;
  if found then return v_row; end if;
  insert into public.impact_editorial_dispositions
    (proposition_version_id, methodology_version, review_key, title, disposition, rationale, reviewer_id, status)
  values
    (p_proposition_version_id, '1.0.0', p_review_key, p_title, p_disposition, trim(p_rationale), auth.uid(), 'approved')
  returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.record_impact_editorial_disposition(uuid, text, text, text, text) from public, anon;
grant execute on function public.record_impact_editorial_disposition(uuid, text, text, text, text) to authenticated;
