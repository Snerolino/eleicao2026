# QA — aplicação factual histórica Câmara (2026-08-19)

## Objetivo

Aplicar o envelope histórico Câmara somente após revalidação exata de identidade,
schema/FK e fontes; manter as 8 identidades bloqueadas fail-closed e provar
idempotência do writer.

## Evidência read-only antes da escrita

- GitHub API revalidada: `origin/main` estava em `16eb24be0666f9d5742daed68c9f5236e464ca01`.
- Produção respondeu HTTP 200; `/release.json` confirmou o mesmo SHA, versão `0.2.376` e snapshot com 1003 candidaturas.
- `supabase migration list --linked`: migrations locais/remotas alinhadas até `20260816100000`, incluindo `20260810090000`–`20260810090400` e `20260812000000`.
- Gate remoto de schema: `candidates` com `id,tse_candidate_id`; tabelas legislativas e `source_references` com as colunas exigidas; 1 FK de `legislative_votes.candidate_id`.
- Identidade exata: 18/18 candidatos do catálogo resolvidos por `tse_candidate_id`, com 18/18 pares TSE/UUID exatos.
- Fontes exatas: 7/7 URLs/hash em `source_references`; auditoria refez 7 GETs oficiais Câmara, todos HTTP 200, sem divergência de bytes/SHA-256.

## Escrita verificada

- Primeiro `--apply`: inseriu 2 proposições, 6 versões, 6 eventos e 84 votos; 84 votos tocados.
- `impact_touched=false`, `editorial_touched=false`, `rpc_called=false`.
- Segundo `--apply`: 2 proposições, 6 versões, 6 eventos e 84 votos existentes; 0 inserts, 0 updates e `votes_touched=0`.
- O contrato local confirmou 2/6/6/84, 7 fontes, 18 identidades elegíveis e 8 bloqueadas.
- Nenhuma das 8 identidades bloqueadas foi promovida; nenhuma matriz, claim ou RPC editorial foi alterada.

## Correção aplicada

O catálogo remoto possui duplicata histórica fora do envelope para a URL TSE. O
writer agora restringe a resolução às URLs esperadas pelo contrato antes de
validar duplicidade/hash; duplicatas dentro das 7 fontes esperadas continuam
falhando fechado.

## Gates locais

- Vitest: **78 arquivos / 366 testes**, exit 0.
- TypeScript: exit 0.
- `validate-impact-schema.mjs`: exit 0.
- `data:check`: exit 0 — **1003 candidaturas / 988 fotos**.
- `npm run build`: exit 0 — sitemap **1003 candidatos + 2 estáticas** e `release.json` gerado.
- `git diff --check`: exit 0.

## Publicação verificada

- Commit funcional `ff92c3e50b6caec2dcf43038c1292fccbf6cdcd9` está em `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32210316104`, concluiu `success` com `headSha` idêntico.
- Produção respondeu HTTP 200; após propagação, `/release.json` confirmou SHA `ff92c3e50b6caec2dcf43038c1292fccbf6cdcd9`, versão `0.2.377` e 1003 candidaturas.

## Próximo passo

Próximo chunk elegível: materializar/revalidar perfis nominais Câmara, preservando
separação por `(candidate_id, house)` e mantendo as 8 identidades históricas
bloqueadas fail-closed.
