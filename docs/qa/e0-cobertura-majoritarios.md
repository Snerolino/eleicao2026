# E0 — Cobertura mínima majoritária

Data: 2026-08-03  
Escopo: 6 candidaturas majoritárias do snapshot público.

## Critério E0

Cada candidatura majoritária deve ter pelo menos:

- 1 claim `historico_politico`;
- 1 claim `plataforma`;
- `source_document_id` apontando para `source_references` pública;
- publicação somente por revisão humana + RPC `publish_claim()`.

## Estado atual no Supabase remoto

| Candidatura | Cargo | Histórico | Plataforma | Observação |
|---|---|---|---|---|
| PRISCILA VOIGT SEVERIANO | governador | `published` | `published` | dossiê mínimo já visível |
| NAFTALY PEREIRA DO NASCIMENTO | vice-governador | `published` | `pending_review` | aprovar plataforma de chapa no `/admin` se revisão editorial concordar |
| MANUELA PINTO VIEIRA D'ÁVILA | senador | `pending_review` | `published` | aprovar histórico com fonte Câmara |
| PAULO ROBERTO SEVERO PIMENTA | senador | `published` | `pending_review` | plataforma tem fonte audiovisual e confiança 2; revisar com atenção |
| LUCIANO SCHAFER | senador | `published` | `pending_review` | aprovar plataforma de chapa no `/admin` se revisão editorial concordar |
| TANIA MARA SANTORO PERES | senador | `pending_review` | `pending_review` | histórico é candidatura/integração à chapa; biografia própria ainda pendente |

Resumo:

- 12/12 categorias E0 existem no banco como `published` ou `pending_review`.
- 6/12 já estão `published`.
- 6/12 aguardam revisão humana no `/admin`.
- 0/12 sem fonte pública.
- 0/12 inseridas diretamente como `published` neste bloco.

## Claims aguardando aprovação humana

1. Naf Nascimento — `plataforma` — Sul21/UP, plataforma de chapa.
2. Manuela D'Ávila — `historico_politico` — Câmara dos Deputados.
3. Paulo Pimenta — `plataforma` — YouTube/material audiovisual sobre reconstrução do RS; revisar fonte antes de aprovar.
4. Luciano do MLB — `plataforma` — Sul21/UP, plataforma de chapa.
5. Tânia Peres — `historico_politico` — Sul21/UP, candidatura na chapa.
6. Tânia Peres — `plataforma` — Sul21/UP, plataforma de chapa.

## Evidência de consulta

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

## Próximo gate

E0 só fecha completamente após o administrador revisar e aprovar no `/admin` as 6 claims pendentes. Depois disso, rodar:

```bash
npm run data:refresh
npm run data:check
npm run smoke:local
```

e validar publicamente 6/6 dossiês majoritários visíveis.
