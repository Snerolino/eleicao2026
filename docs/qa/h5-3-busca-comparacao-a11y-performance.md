# H5.3 — Busca, comparação, acessibilidade e performance

Data: 2026-07-31
Guia: Fase 5 — H5.3

## Objetivo

Fechar o percurso público depois da estabilidade funcional: busca correta e performática, comparação compartilhável, foco visível e smoke em viewports obrigatórios.

## PRs antigos revisados

- PR #23 (`perf-home-page-filtering-151309200464608830`): rebase conceitual aplicado sem comentários gerados extensos. A busca agora cacheia termos normalizados por dataset.
- PR #22 (`palette-focus-visible-styles-7742419690182389493`): rebase conceitual aplicado em `src/theme.css`, sem versionar `.jules/palette.md`. O foco global cobre links, botões, inputs, selects e textarea.

## Implementado

Arquivos principais:

- `src/pages/HomePage.tsx`
- `src/pages/ComparePage.tsx`
- `src/theme.css`
- `scripts/smoke-browser.mjs`
- `src/pages/__tests__/HomePage.test.tsx`
- `src/pages/__tests__/ComparePage.test.tsx`
- `scripts/__tests__/h5-3-public-ux.test.mjs`

## Busca

Critérios preservados:

- nome com/sem acento;
- partido;
- número;
- cargo.

Performance:

- `HomePage` calcula `CandidateSearchCache` via `useMemo` quando `allCandidates` muda;
- cada digitação reaproveita `partyLower`, `nameNormalized` e `labelNormalized`;
- número continua comparado diretamente por string;
- agrupamento por cargo não foi memoizado porque o guia exige medição antes de otimizar, e o gargalo demonstrado no PR #23 era normalização de busca.

## Comparação

- `/comparar?candidatos=<id1>,<id2>` abre comparação já selecionada.
- Seleção/desseleção atualiza a URL compartilhável.
- IDs inválidos são descartados.
- Máximo de 4 candidaturas preservado.
- Tabela só aparece com 2 ou mais selecionados.

## Acessibilidade

- Foco visível global para `a`, `button`, `input`, `select`, `textarea`.
- Estados de H5.2 preservados com `role="alert"`/`role="status"` onde aplicável.
- Smoke segue validando navegação e controles principais.

## Viewports

`smoke-browser.mjs` valida a Home com candidatos nos viewports exigidos:

- 320×640
- 390×844
- 768×1024
- 1280×720 desktop

## Validações focadas

```bash
npm run test -- src/pages/__tests__/ComparePage.test.tsx scripts/__tests__/h5-3-public-ux.test.mjs src/pages/__tests__/HomePage.test.tsx scripts/__tests__/smoke-browser.test.mjs
```

Cobertura adicionada:

- comparação compartilhável abre com 2–4 candidaturas;
- seleção atualiza rota;
- rota descarta IDs inválidos;
- busca por acento, partido, número e cargo;
- foco visível global;
- smoke contém viewports H5.3;
- smoke valida rota compartilhável de comparação.

## Risco residual

Performance foi melhorada no ponto medido pelo PR #23 (normalização de busca). Não foi feita otimização adicional de agrupamento por cargo porque não houve evidência de ganho relevante; manter conforme guia: medir antes de otimizar.
