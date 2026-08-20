# QA — revalidação das fontes nominais do Senado

**Data:** 2026-08-20 04:34 UTC  
**Modo:** reconhecimento oficial read-only; fail-closed

## Objetivo

Repetir sequencialmente os seis GETs oficiais do manifesto
`data/legislative-import/senado/nominal-source-manifest-2026-08-19.json` e
verificar HTTP, assinatura PDF, tamanho e SHA-256 antes de qualquer publicação
factual.

## Resultado verificado

- 6/6 respostas HTTP válidas.
- 6/6 prefixos PDF válidos (`%PDF-1.5`).
- 3/6 tamanhos coincidentes com o manifesto.
- 0/6 SHA-256 coincidentes com o manifesto.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas,
  0 ausentes, 0 inserções e 0 votos tocados.
- Evidência transitória: `.orchestrator/runtime/senado-revalidation-current.json`,
  gerada em `2026-08-20T04:34:19Z`.

## Bloqueio factual

O endpoint oficial está acessível e retorna PDFs, mas o conteúdo baixado deriva
nos seis SHA-256 do manifesto versionado. O gate de integridade não foi
atingido; portanto não foram atualizados manifesto, fontes, votos, snapshot,
Supabase ou claims. A deriva não autoriza substituir o hash por um novo valor.

## Gates locais

- Doctor: `FAIL` apenas porque o shell cron usa Node 22.22.2 e o projeto exige
  Node 24; OpenCode ausente e Ollama sem resposta são `WARN` opcionais.
- O dry-run remoto/local de fontes concluiu com exit code 0 e zero mutações.
- A worktree estava limpa antes do tick; gates completos anteriores permanecem
  registrados no checkpoint imediatamente anterior.

## Publicação/verificação

- Commit `e90edd3ff3ab9bffad3a3ae59148b791d29f08a8` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32332454671`, concluiu `completed/success` com `headSha` idêntico.
- Produção raiz HTTP 200 e `/release.json` HTTP 200.
- Release de produção `e90edd3-20260820T043621374Z`, SHA completo idêntico e snapshot `row_count=1003`.

## Próximo passo

Repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto
persistir a deriva SHA-256; manter em paralelo a reconciliação read-only da
fonte completa do dataset e a fila editorial independente de R4.
