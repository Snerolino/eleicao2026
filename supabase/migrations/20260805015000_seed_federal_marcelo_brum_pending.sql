-- Migration: Iniciar dossiê federal de Marcelo Brum como pending_review (histórico)
-- Data: 2026-08-05
-- Regra: claims entram como pending_review; publicação exige revisão humana + RPC publish_claim().
-- Fonte oficial: biografia institucional da Câmara dos Deputados.
-- Plataforma NÃO inferida: sem fonte de campanha PODE rastreável sólida encontrada; página de partido é de legenda anterior (Republicanos/2022).

with fontes as (
  insert into public.source_references (source_name, source_category, url, title, content_hash)
  values
    (
      'Câmara dos Deputados — biografia institucional Marcelo Brum',
      'oficial',
      'https://www.camara.leg.br/deputados/205863/biografia',
      'Marcelo Brum — Biografia — Portal da Câmara dos Deputados',
      'bloco4-2026-marcelo-brum-camara'
    )
  on conflict (content_hash) do update
    set source_name = excluded.source_name,
        source_category = excluded.source_category,
        url = excluded.url,
        title = excluded.title
  returning id, content_hash
), fontes_resolvidas as (
  select id, content_hash from fontes
  union
  select id, content_hash
    from public.source_references
   where content_hash in ('bloco4-2026-marcelo-brum-camara')
), candidato as (
  select id
    from public.candidates
   where tse_candidate_id = '210002534292'
     and position = 'deputado_federal'
), claims_seed(category, content, confidence_score, source_hash) as (
  values
    (
      'historico_politico',
      'Marcelo de Brum da Costa, conhecido como Marcelo Brum, nasceu em Santiago-RS em 25/11/1972 e é comunicador. Foi eleito deputado federal pelo RS na legislatura 2019-2023, inicialmente pelo PSL, avançando depois para o Republicanos, tendo exercido o mandato majoritariamente como suplente. Em 2026 disputa uma vaga federal pelo PODE. Fonte: biografia institucional da Câmara dos Deputados.',
      4,
      'bloco4-2026-marcelo-brum-camara'
    )
)
insert into public.claims (candidate_id, category, content, confidence_score, source_document_id, status)
select c.id,
       s.category,
       s.content,
       s.confidence_score,
       f.id,
       'pending_review'
  from candidato c
  join claims_seed s on true
  join fontes_resolvidas f on f.content_hash = s.source_hash
 where not exists (
   select 1
     from public.claims existing
    where existing.candidate_id = c.id
      and existing.category = s.category
      and existing.status in ('pending_review', 'published', 'corrected')
 );