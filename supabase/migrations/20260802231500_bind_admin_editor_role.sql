-- Migration: Vincular admin@votopraquem.org a editor_roles quando usuário Auth existir
-- Data: 2026-08-02
-- Objetivo: deixar o login administrativo pronto sem criar senha/segredo por SQL.

insert into public.editor_roles (user_id, role)
select au.id, 'admin'
  from auth.users au
 where lower(au.email) = 'admin@votopraquem.org'
on conflict (user_id) do update
  set role = 'admin';
