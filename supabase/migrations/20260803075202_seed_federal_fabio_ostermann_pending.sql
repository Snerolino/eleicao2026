-- Migration: Iniciar dossiê federal de Fábio Ostermann como pending_review
-- Data: 2026-08-03
-- Regra: claims entram como pending_review; publicação exige revisão humana + RPC publish_claim().

with fontes as (
  insert into public.source_references (source_name, source_category, url, title, content_hash)
  values
    (
      'Site oficial de campanha — Fabio Ostermann',
      'outro',
      'https://www.fabioostermann.com.br/',
      'Fabio Ostermann Candidato Deputado Federal RS 2026',
      'bloco4-2026-fabio-ostermann-site-oficial'
    ),
    (
      'Site oficial de campanha — Fabio Ostermann: combate a privilégios',
      'outro',
      'https://www.fabioostermann.com.br/combate-a-privilegios-rs/',
      'Como Fábio Ostermann combateu privilégios no setor público',
      'bloco4-2026-fabio-ostermann-combate-privilegios'
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
     'bloco4-2026-fabio-ostermann-site-oficial',
     'bloco4-2026-fabio-ostermann-combate-privilegios'
   )
), candidato as (
  select id
    from public.candidates
   where tse_candidate_id = '210002533006'
     and position = 'deputado_federal'
), claims_seed(category, content, confidence_score, source_hash) as (
  values
    (
      'historico_politico',
      'Fábio Ostermann se apresenta como deputado estadual, professor, jurista e cientista político. Seu site oficial registra atuação no mandato estadual em temas como enfrentamento a privilégios, contenção de aumento de impostos e defesa de liberdades.',
      3,
      'bloco4-2026-fabio-ostermann-site-oficial'
    ),
    (
      'plataforma',
      'Como candidato a deputado federal pelo NOVO, Fábio Ostermann declara como pautas centrais a defesa de mais liberdade, menos impostos, combate a privilégios, simplificação tributária, desburocratização e liberdade econômica. A formulação deve ser revisada editorialmente por estar baseada em material de campanha/site oficial.',
      3,
      'bloco4-2026-fabio-ostermann-site-oficial'
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
