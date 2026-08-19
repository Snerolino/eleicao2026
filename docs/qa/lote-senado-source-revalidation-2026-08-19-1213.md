# QA — revalidação de fontes nominais do Senado (2026-08-19T12:13:10Z)

## Objetivo
Revalidar, em modo read-only e sequencial, os seis PDFs oficiais do catálogo nominal do Senado; manter o item fail-closed enquanto houver deriva binária contra o manifesto versionado.

## Entregue e verificado
- GETs oficiais: 6/6 HTTP 200.
- PDFs válidos (`%PDF-`): 6/6.
- Coincidência de bytes contra o manifesto: 4/6.
- Coincidência SHA-256 contra o manifesto: 0/6.
- Evidência transitória: `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- Nenhuma escrita em Supabase, votos, identidades, FKs ou `source_references` foi executada.

## Estado dos dados
- `npm run data:check`: 1003 candidaturas públicas e 988 fotos oficiais.
- Snapshot sem deriva de candidatos detectada neste tick.
- Senado permanece fail-closed até fonte estável e gates R0/schema/FK/dry-run/idempotência.

## Gates locais (Node 24.19.0)
- `npm run test`: 81 arquivos, 371 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado.
- `npm run build`: aprovado; sitemap com 1003 candidatos + 2 estáticas; `release.json` gerado.
- `git diff --check`: aprovado.

## Bloqueio real
Deriva binária persistente: 0/6 SHA-256 coincide com o manifesto. Não gerar manifesto novo automaticamente e não aplicar dados factuais.

## Próximo passo bounded
Publicar esta documentação e verificar o workflow backup/produção. No próximo tick, repetir os seis GETs sem gerar manifesto novo nem aplicar votos enquanto persistir a deriva.

## Publicação verificada (2026-08-19T12:15:30Z)
- Commit `7beebc10167e12f8d92ff845b797ad7b3107bf25` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32251540611`: `completed/success`, `headSha` idêntico.
- Produção raiz e `/release.json`: HTTP 200.
- `/release.json`: SHA `7beebc10167e12f8d92ff845b797ad7b3107bf25`, versão `0.2.435`, snapshot `1003`.
