# QA — lote Senado nominal: catálogo de fontes e reconciliação de identidade/FK

**Data:** 2026-08-19 UTC  
**Status:** preparação read-only concluída; aplicação remota bloqueada por catálogo de `source_references`

## Objetivo

Concluir o chunk seguinte ao scout nominal do Senado: revalidar os seis endpoints oficiais, versionar o catálogo transitório de URL/HTTP/bytes/SHA-256 e conferir, sem escrita, as identidades e o schema/FK remoto.

## Fonte oficial revalidada

Endpoint-base oficial:

`https://legis.senado.leg.br/parlam-servicosweb/api/v1/relatorios/votacoes-nominais/ano/{ano}/parlamentar/{id}`

Foram refeitos seis GETs sequenciais para os parlamentares RS `6341`, `1186` e `825`, nos anos 2025 e 2026. Resultado: **6/6 HTTP 200**, payload PDF e SHA-256 calculado para todos.

Catálogo transitório:

`.orchestrator/runtime/senado-scout/endpoint-catalog-2026-08-19.json`

A diferença de bytes/SHA em relação ao probe anterior foi preservada como evidência de que o portal entrega PDFs dinamicamente; por isso o writer deve refazer o GET e validar o manifesto imediatamente antes de qualquer aplicação, nunca confiar em hash antigo.

## Schema e identidade remota — somente leitura

`supabase db query --linked` confirmou:

- `candidates.tse_candidate_id` existe e é `text`;
- `legislators (id, external_id, house, full_name, party, term_start, term_end, source_reference_id)` existe;
- `legislative_votes` possui `legislator_id`, `candidate_id` e `source_reference_id`;
- `voting_events` possui `source_reference_id`;
- `source_references` possui `url` e `content_hash`.

Os três IDs oficiais foram resolvidos exatamente no catálogo remoto de `legislators`, sem inferência nominal:

| external_id | nome remoto | casa | partido | source_reference_id |
|---|---|---|---|---|
| 1186 | Luis Carlos Heinze | senado | PP | `1a0da388-6daa-4037-a34a-8892c6e7d59e` |
| 6341 | Antonio Hamilton Martins Mourão | senado | REPUBLICANOS | `71765ea6-b3b2-4bec-9578-5f423bd9be52` |
| 825 | Paulo Paim | senado | PT | `1407e000-0cba-4323-bf0a-5cef35a685d2` |

A consulta exata de candidatos RS por nome não retornou linhas; portanto nenhum voto foi promovido para `candidate_id`. A rota correta para este envelope continua sendo `legislator_id` após validação de fonte e período.

## Catálogo remoto de fontes

Consulta exata por URL das seis referências oficiais retornou **0/6** correspondências em `source_references`. Não existe ainda UUID remoto resolvido para os endpoints; não é seguro preencher `source_reference_id` nem aplicar proposições, eventos ou votos.

Artefato da reconciliação:

`.orchestrator/runtime/senado-scout/source-reference-reconciliation-2026-08-19.json`

## Resultado e bloqueio

- Nenhuma proposição, versão, evento, voto, identidade, FK, `source_reference`, matriz, claim, RPC, RLS, Supabase ou Cloudflare foi alterado.
- A identidade/FK dos três legisladores está resolvida de forma exata.
- O item permanece **fail-closed** por ausência das seis referências no catálogo remoto e pela necessidade de um envelope com URL completa, hash e validação de bytes refeita pelo writer.
- O bloqueio global de cobertura permanece real: Senado sem fontes publicadas no auditor estrito anterior.

## Próximo passo bounded

Preparar catálogo idempotente das seis `source_references`, com manifesto de bytes/SHA-256 e categoria aceita pelo schema remoto; depois revalidar o catálogo e as identidades imediatamente antes de um eventual `--apply`. Não promover candidatos nem inserir votos enquanto qualquer URL/hash/FK divergir.
