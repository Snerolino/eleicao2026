# QA — revalidação das fontes nominais do Senado (2026-08-19 22:38 UTC)

## Objetivo
Repetir, em modo read-only e fail-closed, os seis GETs oficiais do catálogo nominal do Senado e verificar se o manifesto versionado continua íntegro antes de qualquer aplicação factual.

## Entregue e verificado
- Reconhecimento sequencial das 6 URLs oficiais do manifesto `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
- Evidência runtime: `.orchestrator/runtime/senado-revalidation-current.json`.
- Resultado: **6/6 HTTP 200**, **6/6 prefixos PDF válidos**, **3/6 coincidências de bytes**, **0/6 coincidências SHA-256**.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`.
- Nenhuma escrita Supabase, atualização de manifesto ou publicação factual foi executada.

## Gates locais
Executados com Node `v24.19.0`:
- `npm run test`: **81 arquivos / 371 testes aprovados**.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado — **1003 candidaturas / 988 fotos oficiais**.
- `npm run build`: aprovado; sitemap com **1003 candidatos + 2 URLs estáticas** e `release.json` gerado.
- `git diff --check`: aprovado.
- Worktree iniciou limpa e permanece sem alterações antes desta documentação.

## Bloqueio real
O manifesto versionado permanece divergente dos bytes atuais do portal oficial em 3/6 respostas e divergente em SHA-256 nas 6/6. Como a identidade exata do conteúdo não pode ser provada, o lote factual permanece bloqueado por **deriva de fonte**. Não gerar manifesto novo automaticamente e não aplicar votos.

O `npm run orch:doctor` segue com FAIL restrito ao shell usando Node 22.22.2, enquanto os gates do projeto foram executados explicitamente com Node 24.19.0. OpenCode ausente e Ollama sem resposta continuam WARN opcionais.

## Próximo passo
No próximo tick, repetir os seis GETs oficiais sem alterar o manifesto; manter a reconciliação local e a publicação documental independentes do bloqueio factual. Só avançar para aplicação após R0, fonte/hash estáveis, dry-run e prova de idempotência.
