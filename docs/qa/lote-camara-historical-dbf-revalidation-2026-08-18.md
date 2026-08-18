# QA — revalidação dos DBFs nominais históricos Câmara

- Data/hora: 2026-08-18 18:13 UTC
- Objetivo: refazer os seis GETs oficiais dos dois gaps históricos e verificar HTTP, bytes e SHA-256 contra o catálogo versionado, sem promover votos ou identidades.

## O que foi verificado

- Seis URLs oficiais `https://www.camara.leg.br/Internet/votacaodbf/56Primeira/*.dbf` foram consultadas sequencialmente.
- Resultado: **6/6 HTTP 200**, cada arquivo com **44.312 bytes**, e **6/6 SHA-256 coincidentes** com `data/legislative-import/camara/historical-dbf-manifest.json`.
- Artefato de revalidação: `.orchestrator/runtime/camara-historical-scout/dbf-revalidation-2026-08-18.json`.
- O catálogo cobre PEC 6/2019 (`CD190242`, `CD190244`) e PL 3723/2019 (`CD190396`–`CD190400`), mantendo URL e hash oficiais.

## Estado dos dados e segurança

- `remote_apply=false`; nenhum voto, candidato, identidade histórica, UUID, FK, `source_reference`, matriz ou RPC foi criado/alterado.
- Os quatro registros de Henrique Fontana continuam `position=outro` e fail-closed. A revalidação de fonte, isoladamente, não prova cargo histórico nem vínculo nominal aplicável.
- Nenhuma URL, hash, voto ou identidade foi inventada.

## Bloqueios reais

- Continua pendente a ligação factual exata entre cada registro nominal, parlamentar/UF, proposição, data e identidade remota elegível.

## Próximo passo bounded

- Reconciliar os registros dos DBFs revalidados somente por identidade oficial exata e evento/proposição/data correspondentes; manter ambiguidades e `position=outro` fora de qualquer aplicação remota.

## Publicação verificada

- Backup Cloudflare `334951434`, run `32169951790`, concluiu `success` em 55s com `headSha=b08eab0baf602ecb6ac8d188dcf758444fbaf664`.
- A produção respondeu HTTP 200; a verificação inicial ainda apontava o release anterior (`4fb426b...`) antes da propagação. O commit de documentação deste QA será publicado em novo run, sem considerar o release anterior como prova final deste estado.

- Verificação final: backup `334951434`, run `32170124260`, `success`, `headSha=8302b29608d8b3e8fe6ca434fde2a8d27c193e82`; produção HTTP 200 e `/release.json` com o mesmo SHA, versão `0.2.342`.
