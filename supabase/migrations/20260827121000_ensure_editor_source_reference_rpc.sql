-- Registra metadado público de fonte para o fluxo Auth editorial.
create or replace function public.ensure_editor_source_reference(p_source_name text, p_url text, p_title text, p_content_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if auth.uid() is null or not public.has_editor_role(auth.uid()) then raise exception 'editor_role_required'; end if;
  if p_source_name is null or p_url !~ '^https?://' or p_title is null or p_content_hash is null then raise exception 'invalid_source_reference'; end if;
  insert into source_references (source_name,source_category,url,title,content_hash)
  values (p_source_name,'oficial',p_url,p_title,p_content_hash)
  on conflict (content_hash) do update set url=excluded.url,title=excluded.title,fetched_at=now()
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.ensure_editor_source_reference(text,text,text,text) from public;
grant execute on function public.ensure_editor_source_reference(text,text,text,text) to authenticated;
