# QA — Revalidação bounded das fontes nominais do Senado

**Data:** 2026-08-19 07:09 UTC  
**Modo:** reconnaissance read-only; fail-closed

## Objetivo

Refazer os seis GETs oficiais do catálogo nominal do Senado, preservando bytes e
SHA-256, antes de qualquer parser factual ou aplicação remota.

## Evidência verificada

- 6/6 URLs oficiais responderam HTTP 200 após `curl` com retry controlado.
- 0/6 coincidiram simultaneamente em bytes e SHA-256 com o manifesto versionado
  `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
- Resultados observados:
  - 2025/6341: 138358 bytes, `sha256:00bda2443a34f9e3c1854fe501a8a6a1323b260d055e7eca228f343e408eb0e9`
  - 2025/1186: 138557 bytes, `sha256:57989aa916de00501d79500b0b64c38adaf7e15109a614d885a4455f6f217dad`
  - 2025/825: 138150 bytes, `sha256:4cf20ca8c9f451a1bb8903255b4b02288db8bb5f3dd59759bdbcc6ecb48bf621`
  - 2026/6341: 97445 bytes, `sha256:d2245e6e58680dc0a0b8e5df1150ab9e0a70163158a43df27948dc5964af3585`
  - 2026/1186: 97428 bytes, `sha256:ff83ddc4f698925b94c792c1b5e0f1ec393ec61fb74c7fd64c4e555a0feb04a6`
  - 2026/825: 97375 bytes, `sha256:f5c8d32b35b8d9c43384c952fbd3f34554729c8494d7ebe46d8de5d2d73ed948`
- Artefato transitório completo: `.orchestrator/runtime/senado-scout/revalidation.json`.
- Dry-run do writer: `planned=6`, `already_existing=0`, `missing=0`,
  `inserted=0`, `votes_touched=0`; nenhuma consulta ou escrita remota foi feita
  no modo dry-run.

## Gates locais

- Node `v24.19.0`.
- Vitest: 78 arquivos / 367 testes verdes.
- TypeScript, schema de impacto, `data:check`, build e `git diff --check` verdes.
- Snapshot: 1003 candidaturas / 988 fotos.

## Resultado e bloqueio

O catálogo oficial continua volátil/derivado: HTTP 200 não implica identidade
binária do PDF. O manifesto não foi substituído automaticamente. Senado segue
fail-closed para parser, votos, identidades, FKs e aplicação remota.

Nenhum UUID, candidato TSE, legislador, voto, proposição, matriz, claim, RPC,
RLS, Supabase ou Cloudflare foi alterado.

## Publicação verificada

- Commit `da85075c32d5b36b4121b11973d5d686b3ddbde2` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32226647319`, concluiu `success` com `headSha` idêntico.
- Produção raiz e `/release.json` responderam HTTP 200; `/release.json` confirmou
  o SHA completo, release `da85075-20260819T071125205Z`, versão `0.2.399` e
  snapshot com 1003 candidaturas.

## Próximo passo bounded

Preservar os seis payloads transitórios para comparação de conteúdo e revisar a
causa da deriva de bytes/PDF antes de gerar novo manifesto. Em paralelo,
continuar apenas com outro lote independente ou verificação de release; não
aplicar fontes/votos sem hash e envelope oficialmente reconciliados.
