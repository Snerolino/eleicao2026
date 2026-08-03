# E0 — Cobertura mínima majoritária

Data: 2026-08-03
Escopo: 6 candidaturas majoritárias do snapshot público.
Status: **fechado em produção** após revisão humana no `/admin`.

## Critério E0

Cada candidatura majoritária deve ter pelo menos:

- 1 claim `historico_politico`;
- 1 claim `plataforma`;
- `source_document_id` apontando para `source_references` pública;
- publicação somente por revisão humana + RPC `publish_claim()`.

## Estado confirmado no Supabase remoto

| Candidatura | Cargo | Histórico | Plataforma | Fonte principal |
|---|---|---|---|---|
| PRISCILA VOIGT SEVERIANO | governador | `published` | `published` | Sul21 |
| NAFTALY PEREIRA DO NASCIMENTO | vice-governador | `published` | `published` | Sul21 |
| MANUELA PINTO VIEIRA D'ÁVILA | senador | `published` | `published` | Câmara / Revista Movimento |
| PAULO ROBERTO SEVERO PIMENTA | senador | `published` | `published` | Câmara / YouTube |
| LUCIANO SCHAFER | senador | `published` | `published` | GZH / Sul21 |
| TANIA MARA SANTORO PERES | senador | `published` | `published` | Sul21 |

Resumo:

- 12/12 categorias E0 existem no banco como `published`.
- 6/6 candidaturas majoritárias têm histórico + plataforma publicados.
- 0/12 sem fonte pública.
- 0/12 publicadas por bypass/service role neste bloco: as publicações pendentes foram aprovadas pela revisão humana no `/admin` e publicadas via RPC.

## Evidência de consulta Supabase

Consulta usada:

```sql
with major as (
  select id, tse_candidate_id, full_name, position, party
  from public.candidates
  where tse_candidate_id in (
    '210002533355','210002533354','210002533581',
    '210002533584','210002533435','210002533434'
  )
), wanted as (
  select * from (values ('historico_politico'), ('plataforma')) as v(category)
)
select m.tse_candidate_id, m.full_name, m.position, w.category,
       coalesce(cl.status, 'missing') as status,
       sr.source_name
from major m
cross join wanted w
left join lateral (
  select * from public.claims cl
  where cl.candidate_id = m.id
    and cl.category = w.category
    and cl.status in ('pending_review','published','corrected')
  order by case cl.status when 'published' then 1 when 'corrected' then 2 else 3 end,
           cl.created_at desc
  limit 1
) cl on true
left join public.source_references sr on sr.id = cl.source_document_id
order by m.position, m.full_name, w.category;
```

Resultado validado: todas as 12 linhas retornaram `status = 'published'`.

## Evidência de UI pública

Validação Playwright em produção (`https://rs.votopraquem.org/`) abriu os 6 dossiês majoritários e verificou que as seções **Histórico político** e **Plataforma** têm pelo menos 1 claim e não exibem “Ainda não verificado”:

- `priscila_voigt_severiano_210002533355` — OK
- `naftaly_pereira_do_nascimento_210002533354` — OK
- `manuela_pinto_vieira_d_avila_210002533581` — OK
- `paulo_roberto_severo_pimenta_210002533584` — OK
- `luciano_schafer_210002533435` — OK
- `tania_mara_santoro_peres_210002533434` — OK

## Gate E0

**Fechado.**

Próximo passo do planejamento: ampliar relatório/checklist de cobertura editorial e seguir para fotos sem match ou expansão para deputados federais em exercício.
