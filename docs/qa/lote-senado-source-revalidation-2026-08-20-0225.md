# QA — Revalidação de fontes nominais do Senado (2026-08-20 02:25 UTC)

## Objetivo

Executar um tick bounded read-only: repetir os seis GETs oficiais do manifesto nominal do Senado, manter a aplicação factual fail-closed e verificar a reconciliação do mirror `../dataset2026` sem inferir sincronização.

## Entregue e verificado

- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado no encerramento.
- Reconhecimento oficial sequencial: **6/6 HTTP 200**.
- Prefixo PDF `%PDF-1.5`: **6/6 válidos**.
- Coincidência de bytes contra o manifesto: **4/6**.
- Coincidência SHA-256 contra o manifesto: **0/6**.
- Evidência transitória: `.orchestrator/runtime/senado-revalidation-current.json`, gerada em `2026-08-20T02:25:47Z`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: **6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados**.

## Estado dos dados

A deriva SHA-256 persiste em todas as seis respostas oficiais; duas também divergem em bytes (2026/6341: 4 bytes a menos; 2026/825: 1 byte a menos). Nenhum voto, fonte, manifesto versionado, snapshot público ou registro remoto foi alterado. O item Senado permanece **fail-closed**.

A auditoria read-only do mirror confirmou que `../dataset2026/candidatos/lista_candidatos_2026.csv` possui 322 linhas/IDs `sq_candidato`, enquanto o snapshot público possui 1003 `tse_candidate_id`; há 681 IDs somente no snapshot. O CSV segmentado não é equivalente ao snapshot completo e não autoriza sincronização automática. SHA observado do CSV: `7c80d8260618ddc18ce62b44f12f7c463032c937f7f6ea5179cf75943f4207ea`; SHA do snapshot: `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.

## Gates locais

- Reconhecimento e dry-run executados com Node `v24.19.0`.
- Este tick não alterou código nem dados versionados; a bateria completa de gates permanece a do checkpoint anterior: 81 arquivos/371 testes, TypeScript, contrato de impacto, `data:check`, build e `git diff --check` verdes.
- Worktree iniciou limpa em `215528d89cd00a921c36f806c3c29dad88858e13`; alterações deste tick são somente este relatório e o checkpoint operacional.

## Bloqueios

A deriva SHA-256 6/6 impede gerar manifesto novo ou executar `--apply`. Não inventar hash, URL, identidade ou voto. A reconciliação do CSV segmentado do mirror também fica pendente por cobertura insuficiente, sem tratar a ausência como remoção.

## Publicação verificada

- Commit documental: `b9cf75d35a33c6012b2b75e80f60763629bf302f`, publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32324729127`, concluiu `completed/success` com `headSha` idêntico ao commit.
- Produção raiz: HTTP 200.
- `https://rs.votopraquem.org/release.json`: HTTP 200; release `b9cf75d-20260820T022842373Z`, `snapshot.row_count=1003`; `commit_sha` no payload veio nulo, mas o `headSha` do run confirma o commit publicado.
- Nenhuma escrita factual remota foi executada.

## Próximo passo

No próximo tick, repetir os seis GETs oficiais sem atualizar o manifesto nem aplicar votos enquanto persistir a deriva; manter a lane de publicação documental independente e investigar um artefato oficial completo do dataset antes de qualquer refresh do snapshot.
