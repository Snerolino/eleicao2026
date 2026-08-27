-- Permite materialização de tabelas derivadas somente por editor/admin autenticado.
grant select, insert, update on public.legislator_vote_index to authenticated;
grant select, insert, update on public.legislator_vote_profile to authenticated;

drop policy if exists "legislator_vote_index_editor_write" on public.legislator_vote_index;
create policy "legislator_vote_index_editor_write" on public.legislator_vote_index
  for all to authenticated
  using (public.has_editor_role(auth.uid()))
  with check (public.has_editor_role(auth.uid()));

drop policy if exists "legislator_vote_profile_editor_write" on public.legislator_vote_profile;
create policy "legislator_vote_profile_editor_write" on public.legislator_vote_profile
  for all to authenticated
  using (public.has_editor_role(auth.uid()))
  with check (public.has_editor_role(auth.uid()));
