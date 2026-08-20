# QA — Revalidação de fontes nominais do Senado (2026-08-20 00:32 UTC)

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

## Estado dos dados

O manifesto versionado continua divergente do conteúdo atualmente servido pelas URLs oficiais. Nenhum voto, fonte, manifesto, snapshot público ou registro remoto foi alterado. O item permanece **fail-closed**.

## Gates locais

- Doctor: `OK=48 WARN=5 FAIL=1`; o único FAIL é o shell em Node `v22.22.2`, enquanto o projeto exige Node 24. OpenCode ausente, Ollama sem resposta e rota MCP não exercitada permanecem avisos de infraestrutura/opcionais.
- Testes: **81 arquivos / 371 testes aprovados**.
- TypeScript: aprovado (`npx tsc --noEmit`).
- Contrato de impacto: aprovado.
- `data:check`: **1003 candidaturas / 988 fotos**, aprovado.
- Build Vite/PWA/sitemap/release: aprovado; sitemap com 1003 candidatos + 2 URLs estáticas.
- `git diff --check`: aprovado.
- Worktree: limpa após os gates, antes desta documentação.

## Bloqueios

A deriva SHA-256 persiste em **6/6** fontes; portanto não há autorização factual para gerar novo manifesto ou executar `--apply`. Não inventar hash, URL, identidade ou voto.

## Próximo passo

Repetir os seis GETs oficiais no próximo tick sem atualizar o manifesto e sem aplicar votos enquanto a deriva persistir. A lane de publicação documental segue independente e pode publicar este QA após os gates.
