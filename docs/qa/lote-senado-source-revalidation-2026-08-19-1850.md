# QA — revalidação das fontes nominais do Senado (2026-08-19 18:50 UTC)

## Objetivo

Executar um tick bounded de reconhecimento oficial read-only para os seis
relatórios nominais do Senado, repetir o dry-run do writer e manter a carga
factual bloqueada enquanto o manifesto versionado divergir das respostas atuais.

## Entregue e verificado

- 6/6 URLs oficiais responderam HTTP 200.
- 6/6 respostas têm prefixo PDF válido `255044462d312e35`.
- 3/6 respostas coincidiram em bytes com o manifesto versionado.
- 0/6 respostas coincidiram em SHA-256 com o manifesto versionado.
- Evidência bruta: `.orchestrator/runtime/senado-revalidation-current.json`.
- Nenhum manifesto foi alterado e nenhum voto foi escrito.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: `planned=6`,
  `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`.

## Estado dos dados

- Snapshot público: 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Reconciliação factual do Senado permanece **fail-closed**: as respostas
  oficiais são transportadas corretamente, mas a deriva SHA-256 impede usar o
  manifesto para qualquer aplicação remota.

## Gates locais (Node 24.19.0)

- Testes: 81 arquivos / 371 testes, todos passaram.
- TypeScript: passou (`npx tsc --noEmit`).
- Schema de impacto: passou.
- `npm run data:check`: passou (1003 candidaturas / 988 fotos).
- `npm run build`: passou; sitemap com 1003 candidatos + 2 URLs estáticas.
- `git diff --check`: passou.
- Worktree permaneceu limpa antes da documentação deste tick.

## Bloqueios reais

- Aplicação factual remota bloqueada por deriva SHA-256 em 6/6 entradas do
  manifesto; não é permitido gerar hash novo nem inventar substituição.
- `npm run orch:doctor -- --smoke` no shell cron reporta `FAIL` porque o shell
  usa Node 22.22.2 enquanto o projeto exige Node 24; os gates deste tick foram
  executados explicitamente com Node 24.19.0.
- OpenCode está ausente e Ollama não respondeu ao preflight do doctor; são rotas
  opcionais e não bloquearam a verificação local.

## Próximo passo

Repetir os seis GETs oficiais no próximo tick, sem gerar manifesto novo e sem
aplicar votos enquanto persistir a deriva SHA-256. Manter publicação apenas da
evidência documental e dos gates locais verdes.
