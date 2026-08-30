-- Importação factual nominal da Câmara, restrita a editor/admin autenticado.
-- Não lê nem altera impacto, assessments, matrizes ou scores.
-- Cada item representa pessoa -> voto -> evento -> versão -> proposição.
create or replace function public.import_camara_nominal_votes(p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  candidate uuid;
  proposition uuid;
  version_id uuid;
  event_id uuid;
  source_id uuid;
  vote_value text;
  item_count integer := 0;
  inserted_count integer := 0;
  existing_count integer := 0;
  conflict_count integer := 0;
  proposition_count integer := 0;
  version_count integer := 0;
  event_count integer := 0;
  candidate_tse text;
  proposition_external text;
  event_external text;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then
    raise exception 'editor_role_required';
  end if;
  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'rows_must_be_array';
  end if;

  for item in select value from jsonb_array_elements(p_rows)
  loop
    item_count := item_count + 1;
    candidate_tse := nullif(item->>'candidate_tse_id', '');
    proposition_external := nullif(item->>'proposition_external_id', '');
    event_external := nullif(item->>'event_external_id', '');
    vote_value := item->>'value';

    if candidate_tse is null or proposition_external is null or event_external is null
       or vote_value not in ('sim','nao','abstencao','ausente','obstrucao')
       or nullif(item->>'recorded_at','') is null
       or nullif(item->>'occurred_at','') is null
       or nullif(item->>'proposition_source_url','') is null
       or nullif(item->>'proposition_source_hash','') is null
       or nullif(item->>'event_source_url','') is null
       or nullif(item->>'event_source_hash','') is null
       or nullif(item->>'vote_source_url','') is null
       or nullif(item->>'vote_source_hash','') is null then
      raise exception 'invalid_camara_factual_row_at_%', item_count;
    end if;

    select c.id into candidate from candidates c where c.tse_candidate_id = candidate_tse;
    if candidate is null then
      raise exception 'candidate_tse_fk_missing_at_%', item_count;
    end if;

    insert into source_references(source_name,source_category,url,title,content_hash)
    values ('Câmara dos Deputados — proposição','oficial',item->>'proposition_source_url','Proposição Câmara',item->>'proposition_source_hash')
    on conflict(content_hash) do update set fetched_at=now()
    returning id into source_id;

    insert into legislative_propositions(house,external_id,proposition_type,number,year,title,official_url)
    values ('camara',proposition_external,(item->>'proposition_type')::text,(item->>'proposition_number')::integer,(item->>'proposition_year')::integer,item->>'proposition_title',item->>'proposition_source_url')
    on conflict(house,external_id) do update set official_url=coalesce(legislative_propositions.official_url,excluded.official_url)
    returning id into proposition;
    if proposition is null then
      select id into proposition from legislative_propositions where house='camara' and external_id=proposition_external;
    else
      proposition_count := proposition_count + 1;
    end if;

    insert into source_references(source_name,source_category,url,title,content_hash)
    values ('Câmara dos Deputados — evento de votação','oficial',item->>'event_source_url','Evento de votação Câmara',item->>'event_source_hash')
    on conflict(content_hash) do update set fetched_at=now()
    returning id into source_id;

    insert into proposition_versions(proposition_id,version_key,version_label,text_hash,source_reference_id,effective_from)
    values (proposition,item->>'version_key',item->>'version_label',item->>'event_source_hash',source_id,(item->>'occurred_at')::timestamptz)
    on conflict(proposition_id,version_key) do update set source_reference_id=coalesce(proposition_versions.source_reference_id,excluded.source_reference_id)
    returning id into version_id;
    if version_id is null then
      select id into version_id from proposition_versions where proposition_id=proposition and version_key=item->>'version_key';
    else
      version_count := version_count + 1;
    end if;

    insert into voting_events(proposition_version_id,external_id,house,session_id,occurred_at,source_reference_id)
    values (version_id,event_external,'camara',item->>'event_session_id',(item->>'occurred_at')::timestamptz,source_id)
    on conflict(house,external_id) do update set source_reference_id=coalesce(voting_events.source_reference_id,excluded.source_reference_id)
    returning id into event_id;
    if event_id is null then
      select id into event_id from voting_events where house='camara' and external_id=event_external;
    else
      event_count := event_count + 1;
    end if;

    insert into source_references(source_name,source_category,url,title,content_hash)
    values ('Câmara dos Deputados — voto nominal','oficial',item->>'vote_source_url','Voto nominal Câmara',item->>'vote_source_hash')
    on conflict(content_hash) do update set fetched_at=now()
    returning id into source_id;

    if exists(select 1 from legislative_votes where voting_event_id=event_id and candidate_id=candidate) then
      if exists(select 1 from legislative_votes where voting_event_id=event_id and candidate_id=candidate and value=vote_value) then
        existing_count := existing_count + 1;
      else
        conflict_count := conflict_count + 1;
      end if;
    else
      insert into legislative_votes(voting_event_id,candidate_id,legislator_id,value,absence_type,recorded_at,source_reference_id)
      values(event_id,candidate,null,vote_value,case when vote_value='obstrucao' then 'obstrucao_coordenada' when vote_value='ausente' then 'justificada' else null end,(item->>'recorded_at')::timestamptz,source_id);
      inserted_count := inserted_count + 1;
    end if;
  end loop;

  return jsonb_build_object('rows_received',item_count,'propositions_created',proposition_count,'versions_created',version_count,'events_created',event_count,'inserted',inserted_count,'already_present',existing_count,'conflicts',conflict_count,'remote_apply',true);
end;
$$;

revoke all on function public.import_camara_nominal_votes(jsonb) from public;
grant execute on function public.import_camara_nominal_votes(jsonb) to authenticated;
