# QA — revalidação de fontes nominais do Senado (2026-08-19T12:59Z)

## Objetivo
Repetir os seis GETs oficiais do catálogo nominal do Senado em modo read-only, sem gerar manifesto novo e sem aplicar votos enquanto persistir a deriva binária.

## Entregue e verificado
- GETs oficiais: 6/6 HTTP 200.
- Prefixo PDF (`%PDF-`): 6/6.
- Coincidência de bytes contra o manifesto versionado: 2/6.
- Coincidência SHA-256 contra o manifesto versionado: 0/6.
- Evidência transitória: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Nenhuma escrita factual remota foi executada.

## Estado dos dados
- Reconciliação explícita do CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` contra `data/public-candidates.json`: 1003/1003 IDs, 0 somente no dataset e 0 somente no snapshot.
- `npm run data:check`: 1003 candidaturas públicas e 988 fotos oficiais.
- Senado permanece fail-closed até fonte estável e gates R0/schema/FK/dry-run/idempotência.

## Gates locais (Node 24.19.0)
- `npm run test`: 81 arquivos, 371 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado.
- `npm run build`: aprovado; sitemap com 1003 candidatos + 2 estáticas; `release.json` gerado.
- `git diff --check`: aprovado.

## Bloqueios reais
- Deriva binária persistente: somente 2/6 tamanhos e 0/6 SHA-256 coincidem com o manifesto. Não gerar manifesto novo automaticamente e não aplicar dados factuais.
- `npm run orch:doctor -- --smoke`: `OK=51 WARN=5 FAIL=1`; o FAIL é Node 22.22.2 no shell cron, enquanto os gates foram executados com Node 24.19.0. OpenCode ausente é WARN opcional.

## Publicação/verificação do estado anterior
- Antes deste QA, `HEAD` e `origin/main` estavam em `d4fd3524c53d1833714410ba3e05cf8675c961cf`.
- Produção raiz: HTTP 200; `/release.json` confirma o mesmo SHA, versão `0.2.436` e snapshot 1003.
- Backup Cloudflare `334951434`, run `32251738328`: `completed/success`, `headSha` idêntico.

## Publicação verificada
- Commit `21cc1b6c5098dc5c33e6dcf5a14af6c164d90673` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32255815222`: `completed/success`, `headSha` idêntico.
- Produção raiz: HTTP 200.
- `/release.json` propagou e confirmou SHA completo `21cc1b6c5098dc5c33e6dcf5a14af6c164d90673`.

## Próximo passo bounded
No próximo tick, repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.
