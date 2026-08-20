# QA — Revalidação de fontes nominais do Senado (2026-08-20 01:11 UTC)

## Objetivo

Reexecutar, em modo read-only e bounded, os seis GETs oficiais do manifesto nominal do Senado e confirmar se a deriva de bytes/SHA-256 foi resolvida antes de qualquer aplicação factual.

## Entregue e verificado

- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado com `flock -n`.
- Reconhecimento oficial sequencial: **6/6 HTTP 200**.
- Prefixo PDF `%PDF-1.5`: **6/6 válidos**.
- Coincidência de bytes contra o manifesto: **3/6**.
- Coincidência SHA-256 contra o manifesto: **0/6**.
- Evidência transitória: `.orchestrator/runtime/senado-revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- `npm run data:check`: **1003 candidaturas / 988 fotos**, aprovado.

## Estado dos dados

O manifesto versionado continua divergente do conteúdo atualmente servido pelas URLs oficiais. Nenhum voto, fonte, manifesto, snapshot público ou registro remoto foi alterado. O item permanece **fail-closed**.

## Gates locais

- Node usado nos gates: `v24.19.0`.
- Testes: **81 arquivos / 371 testes aprovados**.
- TypeScript: aprovado (`npx tsc --noEmit`).
- Contrato de impacto: aprovado (`node scripts/validate-impact-schema.mjs`).
- Build Vite/PWA/sitemap/release: aprovado; sitemap com 1003 candidatos + 2 URLs estáticas; `release.json` gerado.
- `git diff --check`: aprovado.
- Worktree limpa antes deste relatório; alteração limitada à documentação deste tick.

## Bloqueios

A deriva SHA-256 persiste em **6/6** fontes; portanto não há autorização factual para gerar novo manifesto ou executar `--apply`. Não inventar hash, URL, identidade ou voto.

O doctor do shell cron continua com FAIL restrito ao Node `v22.22.2` (o projeto exige Node 24); OpenCode ausente e Ollama sem resposta permanecem WARN opcionais. Os gates desta execução foram feitos explicitamente com Node 24.19.0.

- Auditoria read-only do mirror `../dataset2026/candidatos` não encontrou um CSV único equivalente ao snapshot: os arquivos estão segmentados e o `lista_candidatos_2026.csv` atual tem 322 IDs; a auditoria não alterou snapshot nem inferiu ausência de candidatos. Requer reconciliação do contrato de ingestão antes de qualquer sincronização.

## Publicação e produção

- Commit documental: `fc97b5e3af6b1202dbfaa0ce232ba83dd59bdb69`, publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32320190679`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz: HTTP 200.
- `https://rs.votopraquem.org/release.json`: HTTP 200; release `fc97b5e-20260820T011314753Z`, SHA completo idêntico e snapshot `row_count=1003`.

## Próximo passo

Repetir os seis GETs oficiais no próximo tick sem atualizar o manifesto e sem aplicar votos enquanto a deriva persistir. A lane de publicação documental segue independente; a lane factual continua bloqueada somente para este item.
