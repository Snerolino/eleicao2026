-- Estende a RPC factual para criar versões ALRS faltantes com tipo normalizado.
create or replace function public.ensure_alrs_nominal_proposition_version(p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_prop_id uuid;
  v_version_id uuid;
  v_source_id uuid;
  output jsonb := '[]'::jsonb;
  v_external_id text;
  v_version_key text;
  v_type text;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then raise exception 'editor_role_required'; end if;
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'rows_must_be_array'; end if;
  for item in select value from jsonb_array_elements(p_rows)
  loop
    v_external_id := nullif(item->>'external_id', '');
    v_version_key := nullif(item->>'version_key', '');
    v_type := lower(coalesce(nullif(item->>'proposition_type', ''), 'outro'));
    if v_type not in ('pec','pl','plp','pld','lei','outro') then raise exception 'invalid_proposition_type'; end if;
    if v_external_id is null or v_version_key is null or nullif(item->>'title', '') is null or nullif(item->>'source_url', '') is null or nullif(item->>'source_sha256', '') is null then raise exception 'official_proposition_fields_required'; end if;
    insert into source_references (source_name, source_category, url, title, content_hash)
    values ('ALRS — Portal da Transparência — matéria oficial', 'oficial', item->>'source_url', item->>'title', item->>'source_sha256')
    on conflict (content_hash) do update set fetched_at = now()
    returning id into v_source_id;
    select lp.id into v_prop_id from legislative_propositions lp where lp.house='alrs' and lp.external_id=v_external_id;
    if v_prop_id is null then
      insert into legislative_propositions (external_id, house, proposition_type, number, year, title, official_url)
      values (v_external_id, 'alrs', v_type, (item->>'number')::integer, (item->>'year')::integer, item->>'title', item->>'source_url') returning id into v_prop_id;
    end if;
    select pv.id into v_version_id from proposition_versions pv where pv.proposition_id=v_prop_id and pv.version_key=v_version_key;
    if v_version_id is null then
      insert into proposition_versions (proposition_id, version_key, version_label, text_hash, source_reference_id, effective_from)
      values (v_prop_id, v_version_key, 'Versão oficial ALRS — matéria', 'alrs:' || md5(item->>'title'), v_source_id, coalesce((item->>'effective_from')::timestamptz, now())) returning id into v_version_id;
    end if;
    output := output || jsonb_build_array(jsonb_build_object('external_id', v_external_id, 'proposition_version_id', v_version_id));
  end loop;
  return output;
end;
$$;
revoke all on function public.ensure_alrs_nominal_proposition_version(jsonb) from public;
grant execute on function public.ensure_alrs_nominal_proposition_version(jsonb) to authenticated;
