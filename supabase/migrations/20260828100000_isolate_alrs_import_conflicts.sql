-- Corrige importação ALRS para isolar conflitos sem abortar o lote.
create or replace function public.import_alrs_nominal_votes(p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare item jsonb; candidate uuid; version_id uuid; event_id uuid; source_id uuid; event_external_id text; vote_value text; vote_date timestamptz; inserted_count integer := 0; existing_count integer := 0; conflict_count integer := 0; item_count integer := 0;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then raise exception 'editor_role_required'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'rows_must_be_array'; end if;
  for item in select value from jsonb_array_elements(p_rows) loop
    item_count := item_count + 1; candidate := nullif(item->>'candidate_id','')::uuid; version_id := nullif(item->>'proposition_version_id','')::uuid; vote_value := item->>'value'; vote_date := (item->>'occurred_at')::timestamptz;
    if candidate is null or version_id is null or vote_value not in ('sim','nao','abstencao','ausente','obstrucao') or vote_date is null then raise exception 'invalid_factual_row_at_%',item_count; end if;
    if not exists(select 1 from candidates c where c.id=candidate) then raise exception 'candidate_fk_missing_at_%',item_count; end if;
    if not exists(select 1 from proposition_versions pv join legislative_propositions lp on lp.id=pv.proposition_id where pv.id=version_id and lp.house='alrs') then raise exception 'alrs_proposition_version_fk_missing_at_%',item_count; end if;
    if nullif(item->>'source_url','') is null or nullif(item->>'source_sha256','') is null then raise exception 'official_source_required_at_%',item_count; end if;
    insert into source_references(source_name,source_category,url,title,content_hash) values('ALRS — Portal da Transparência — votação nominal','oficial',item->>'source_url','Votação nominal ALRS',item->>'source_sha256') on conflict(content_hash) do update set fetched_at=now() returning id into source_id;
    event_external_id := 'alrs-nominal-' || md5(version_id::text || '|' || to_char(vote_date at time zone 'UTC','YYYY-MM-DD'));
    select ve.id into event_id from voting_events ve where ve.house='alrs' and ve.external_id=event_external_id;
    if event_id is null then insert into voting_events(proposition_version_id,external_id,house,occurred_at,source_reference_id) values(version_id,event_external_id,'alrs',vote_date,source_id) returning id into event_id; end if;
    if exists(select 1 from legislative_votes lv where lv.voting_event_id=event_id and lv.candidate_id=candidate) then
      if exists(select 1 from legislative_votes lv where lv.voting_event_id=event_id and lv.candidate_id=candidate and lv.value=vote_value) then existing_count := existing_count + 1; else conflict_count := conflict_count + 1; end if;
    else
      insert into legislative_votes(voting_event_id,candidate_id,value,recorded_at,source_reference_id) values(event_id,candidate,vote_value,vote_date,source_id); inserted_count := inserted_count + 1;
    end if;
  end loop;
  return jsonb_build_object('rows_received',item_count,'inserted',inserted_count,'already_present',existing_count,'conflicts',conflict_count,'remote_apply',true);
end;
$$;
