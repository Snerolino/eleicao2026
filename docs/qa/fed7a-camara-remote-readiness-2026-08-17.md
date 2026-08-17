# QA — FED-7A: prontidão remota Câmara

**Data:** 2026-08-17
**Status:** catálogo metadata preparado; aplicação remota bloqueada por gates de FK

## Entrega

Foi preparado o catálogo de quatro fontes oficiais do lote PLP 230/2025:

- proposição `2580259`;
- inteiro teor do substitutivo `codteor=3170169`;
- evento `2580259-24`;
- votos nominais do evento.

Artefatos:

- `source-catalog.json` — 4 fontes, 4 hashes, 0 UUID remoto inventado;
- `source-references.sql` — somente `source_references`, sem SQL factual;
- `manifest.json` — gates, bloqueios e scan de segredos.

## Gates preservados

O pacote permanece remoto-readiness:

- `source_ids_resolved=0`;
- `resolved_remote_candidate_ids=0`;
- 4 TSE IDs aguardando lookup remoto;
- `factual_sql_generated=false`;
- `remote_apply=false`;
- `impact_apply=false`;
- `public_approval=false`.

Não usei UUID do snapshot como FK remota. A resolução deve consultar o Supabase
remoto por `tse_candidate_id`; depois, source-reference upsert e factual write
continuam gates separados.

## Validação

- testes FED-7A: **3** passando;
- regressão FED-6: **3** passando;
- SQL contém somente `source_references`;
- scan de `service_role`, `apikey`, `Authorization` e `Bearer`: limpo;
- `git diff --check`: passou.

O doctor local identificou um bloqueio de ambiente não introduzido por esta fase:
o shell usa Node `v22.22.2`, enquanto o projeto exige Node `>=24 <25`. Por isso,
o gate completo deve ser repetido em Node 24 antes de qualquer aplicação remota.
