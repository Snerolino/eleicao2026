# QA — revalidação das fontes nominais do Senado

**Data:** 2026-08-20 03:57 UTC  
**Modo:** reconhecimento oficial read-only; fail-closed

## Objetivo

Repetir sequencialmente os seis GETs oficiais do manifesto
`data/legislative-import/senado/nominal-source-manifest-2026-08-19.json` e
verificar HTTP, assinatura PDF, tamanho e SHA-256 antes de qualquer publicação
factual.

## Resultado verificado

- 6/6 respostas HTTP válidas.
- 6/6 prefixos PDF válidos (`%PDF-1.5`).
- 2/6 tamanhos coincidentes com o manifesto.
- 0/6 SHA-256 coincidentes com o manifesto.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas,
  0 ausentes, 0 inserções e 0 votos tocados.
- Evidência transitória: `.orchestrator/runtime/senado-revalidation-current.json`,
  gerada em `2026-08-20T03:57:36Z`.

## Bloqueio factual

O endpoint oficial está acessível e retorna PDFs, mas o conteúdo baixado deriva
em todos os seis SHA-256 do manifesto versionado. O gate de integridade não foi
atingido; portanto não foram atualizados manifesto, fontes, votos, snapshot,
Supabase ou claims. A deriva não autoriza substituir o hash por um novo valor.

## Gates locais

- `npm run test`: verde — 81 arquivos, 371 testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde — 1003 candidaturas, 988 fotos.
- `npm run build`: verde — sitemap com 1003 candidatos e `release.json` gerado.
- `git diff --check`: verde.

## Publicação/verificação

Não houve mutação funcional neste tick. A verificação remota já observada antes
do tick respondeu HTTP 200 na raiz e em `/release.json`; a produção permanece
com snapshot público de 1003 candidaturas. Não foi criado commit neste tick
porque a documentação/estado foram alterados por outra execução concorrente do
control plane e a worktree foi novamente confirmada limpa antes do fechamento.

## Próximo passo

Repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar votos enquanto
persistir a deriva SHA-256; manter em paralelo a reconciliação read-only da fonte
completa do dataset e a fila editorial independente de R4.
