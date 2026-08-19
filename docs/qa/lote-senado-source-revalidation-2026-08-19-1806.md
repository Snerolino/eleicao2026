# QA — revalidação das fontes nominais do Senado (2026-08-19 18:06 UTC)

## Objetivo

Refazer, em modo somente leitura, os seis GETs oficiais dos relatórios nominais
 do Senado e decidir se o manifesto versionado pode ser usado para qualquer
 aplicação factual.

## Entregue e verificado

- 6/6 URLs oficiais responderam HTTP 200.
- 6/6 respostas têm prefixo PDF válido `255044462d312e35`.
- 3/6 respostas coincidiram em bytes com o manifesto versionado.
- 0/6 respostas coincidiram em SHA-256 com o manifesto versionado.
- Evidência bruta: `.orchestrator/runtime/senado-revalidation-current.json`.
- Nenhum manifesto foi alterado e nenhum voto foi escrito.
- Dry-run do writer: `planned=6`, `already_existing=0`, `missing=0`,
  `inserted=0`, `votes_touched=0`.

## Estado dos dados

- Snapshot público: 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Reconciliação factual do Senado permanece **fail-closed**: as respostas
  oficiais são válidas como transporte, mas continuam divergentes do hash do
  manifesto e não podem alimentar aplicação remota.

## Gates locais (Node 24.19.0)

- Testes: 81 arquivos / 371 testes, todos passaram.
- TypeScript: passou (`npx tsc --noEmit`).
- Contrato de schema: passou (`node scripts/validate-impact-schema.mjs`).
- Dados públicos: passou (`npm run data:check`).
- Build Vite/PWA/sitemap/release: passou; sitemap com 1003 candidatos + 2
  estáticas; release local `eab91ce-20260819T180545674Z`.
- `git diff --check`: passou.
- Working tree: limpa após os gates.

## Bloqueios reais

- O conteúdo retornado pelo portal oficial continua mudando em relação ao
  manifesto: 0/6 SHA-256 coincidem. Não é seguro gerar novo manifesto ou
  aplicar votos sem um novo processo de captura/aprovação do catálogo.
- `npm run orch:doctor` no shell do cron continua com FAIL porque esse shell
  usa Node 22.22.2, enquanto o projeto exige Node 24. O tick executou os gates
  com Node 24.19.0 disponível localmente. OpenCode ausente e Ollama sem
  resposta permanecem WARN opcionais.

## Próximo passo

No próximo tick, repetir os seis GETs oficiais sem gerar manifesto novo nem
aplicar votos enquanto persistir a deriva SHA-256. Manter a preparação local e
publicação documental independentes do item factual bloqueado.
