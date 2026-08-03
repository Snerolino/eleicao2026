-- Migration: Iniciar Bloco 4 com histórico de deputada federal em exercício
-- Data: 2026-08-03
-- Escopo: Fernanda Melchionna, única correspondência direta entre bancada federal RS/Câmara e snapshot público atual.
-- Regra: claim entra como pending_review; publicação exige revisão humana + RPC publish_claim().

with fonte as (
  insert into public.source_references (source_name, source_category, url, title, content_hash)
  values (
    'Câmara dos Deputados — Fernanda Melchionna',
    'oficial',
    'https://www.camara.leg.br/deputados/204407',
    'Deputada Federal Fernanda Melchionna',
    'bloco4-2026-camara-fernanda-melchionna'
  )
  on conflict (content_hash) do update
    set source_name = excluded.source_name,
        source_category = excluded.source_category,
        url = excluded.url,
        title = excluded.title
  returning id, content_hash
), fonte_resolvida as (
  select id, content_hash from fonte
  union
  select id, content_hash
    from public.source_references
   where content_hash = 'bloco4-2026-camara-fernanda-melchionna'
), candidata as (
  select id
    from public.candidates
   where tse_candidate_id = '210002533902'
     and position = 'deputado_federal'
)
insert into public.claims (candidate_id, category, content, confidence_score, source_document_id, status)
select c.id,
       'historico_politico',
       'Fernanda Melchionna é deputada federal pelo Rio Grande do Sul. O perfil oficial da Câmara dos Deputados registra sua atuação na 57ª legislatura, partido PSOL, UF RS e situação em exercício.',
       4,
       f.id,
       'pending_review'
  from candidata c
  cross join fonte_resolvida f
 where not exists (
   select 1
     from public.claims existing
    where existing.candidate_id = c.id
      and existing.category = 'historico_politico'
      and existing.status in ('pending_review', 'published', 'corrected')
 );
