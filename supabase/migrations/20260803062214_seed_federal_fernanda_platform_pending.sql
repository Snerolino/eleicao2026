-- Migration: Adicionar claim de plataforma para Fernanda Melchionna em pending_review
-- Data: 2026-08-03
-- Regra: claim entra como pending_review; publicação exige revisão humana + RPC publish_claim().

with fonte as (
  insert into public.source_references (source_name, source_category, url, title, content_hash)
  values (
    'Radar do Congresso em Foco — Discursos de Fernanda Melchionna',
    'imprensa',
    'https://radar.congressoemfoco.com.br/parlamentar/1204407/discursos',
    'Dep. Fernanda Melchionna (PSOL-RS) — Discursos',
    'bloco4-2026-radar-fernanda-melchionna-discursos'
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
   where content_hash = 'bloco4-2026-radar-fernanda-melchionna-discursos'
), candidata as (
  select id
    from public.candidates
   where tse_candidate_id = '210002533902'
     and position = 'deputado_federal'
)
insert into public.claims (candidate_id, category, content, confidence_score, source_document_id, status)
select c.id,
       'plataforma',
       'Discursos recentes atribuídos a Fernanda Melchionna registram defesa de pautas como criminalização da misoginia como crime de ódio e redução da jornada com fim da escala 6 por 1. A formulação deve ser revisada editorialmente por estar baseada em atuação parlamentar/discursos, não em programa eleitoral oficial de 2026.',
       2,
       f.id,
       'pending_review'
  from candidata c
  cross join fonte_resolvida f
 where not exists (
   select 1
     from public.claims existing
    where existing.candidate_id = c.id
      and existing.category = 'plataforma'
      and existing.status in ('pending_review', 'published', 'corrected')
 );
