-- Migration: Iniciar dossiê federal de Maurício Dziedricki como pending_review
-- Data: 2026-08-04
-- Regra: claims entram como pending_review; publicação exige revisão humana + RPC publish_claim().
-- Fontes oficiais rastreáveis: perfil institucional da Câmara dos Deputados + site oficial de campanha.

with fontes as (
  insert into public.source_references (source_name, source_category, url, title, content_hash)
  values
    (
      'Câmara dos Deputados — perfil institucional Maurício Dziedricki',
      'oficial',
      'https://www.camara.leg.br/deputados/75431/biografia',
      'Maurício Dziedricki — Biografia — Portal da Câmara dos Deputados',
      'bloco4-2026-mauricio-dziedricki-camara'
    ),
    (
      'Site oficial de campanha — Maurício Dziedricki',
      'outro',
      'https://www.depmauriciors.com.br/',
      'Maurício Dziedricki — Novas ideias como deputado pelo Rio Grande do Sul e pelo Brasil',
      'bloco4-2026-mauricio-dziedricki-site-oficial'
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
   where content_hash in (
     'bloco4-2026-mauricio-dziedricki-camara',
     'bloco4-2026-mauricio-dziedricki-site-oficial'
   )
), candidato as (
  select id
    from public.candidates
   where tse_candidate_id = '210002534272'
     and position = 'deputado_federal'
), claims_seed(category, content, confidence_score, source_hash) as (
  values
    (
      'historico_politico',
      'Maurício Dziedricki é advogado, natural de Curitiba-PR, e iniciou a vida pública aos 19 anos. Foi vereador de Porto Alegre por dois mandatos, o mais jovem secretário municipal da capital, secretário de Estado e deputado estadual antes de eleger-se deputado federal pelo Rio Grande do Sul em 2018 com quase 85 mil votos; em 2026 disputa a reeleição pelo PODE. Fonte: perfil institucional da Câmara dos Deputados e site oficial de campanha.',
      4,
      'bloco4-2026-mauricio-dziedricki-camara'
    ),
    (
      'plataforma',
      'Na campanha de 2026, Maurício Dziedricki apresenta como plataforma as "novas ideias" e a política de escuta para transformar demandas em resultados, com pautas como o Programa Gaúcho de Microcrédito (+100 mil empreendedores beneficiados), entregas a municípios (R$ 180 milhões; mais de 450 municípios atendidos), o Banco de Combate ao Câncer e o Cadastro de Pedófilos. A formulação deve ser revisada editorialmente por estar baseada em material de campanha/site oficial.',
      3,
      'bloco4-2026-mauricio-dziedricki-site-oficial'
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