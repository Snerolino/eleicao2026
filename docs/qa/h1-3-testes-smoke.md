# H1.3 — Testes do serviço e smoke de navegador

Base: `h0-contencao-restauracao`
Data: 2026-07-30
Guia: Fase 1 — H1.3

## Implementado

- `src/services/candidates.ts` passa a exportar funções de mapeamento para teste direto:
  - `mapCandidate`
  - `mapClaim`
  - `fetchPublishedClaims`
- `src/services/__tests__/candidates.test.ts` expandido para cobrir:
  - normalização de cargos oficiais e desconhecidos;
  - `ballot_number` nulo;
  - `source_references` objeto, array, nulo e ausente;
  - clamp de `confidence_score` para 1..5;
  - normalização de categoria de fonte;
  - fallback de `source_document_id`;
  - `fetchPublishedClaims([])` sem chamada remota;
  - filtragem defensiva para somente `published`;
  - erro Supabase em `claims`;
  - `candidates` 500;
  - resposta vazia de `candidates`;
  - resposta vazia de `claims`;
  - exceção de rede/timeout simulado.
- Novo smoke de navegador: `scripts/smoke-browser.mjs`.
- Novos scripts npm:
  - `npm run smoke:local` — sobe preview local de `dist` e executa smoke;
  - `npm run smoke:preview` — executa smoke contra `SMOKE_URL`/`--url`.
- CI atualizado:
  - PR instala Chromium Playwright e roda smoke local após build;
  - deploy em `main` roda smoke de produção pós-publicação.
- PWA corrigido após smoke revelar bug real:
  - `navigateFallback` mudou de `/offline.html` para `/index.html`, preservando rotas SPA offline;
  - removido `cacheWillUpdate` que reescrevia arrays de `claims` com `_sw_cached_at` e alterava o shape JSON.
- Teste `scripts/__tests__/pwa-workbox.test.mjs` garante:
  - fallback SPA via `index.html`;
  - claims em `StaleWhileRevalidate`;
  - ausência de mutação do payload no service worker.

## Smoke local coberto

- Home sem filtro não pode renderizar estado vazio se snapshot tem registros.
- Contagem mínima: 69 cards.
- Busca por `ADEMAR`: retorna candidato visível.
- Download CSV: gera arquivo `.csv`.
- Detalhe: abre candidatura e encontra `h1`.
- Comparação: seleciona 2 candidaturas e renderiza tabela.
- Online: falha se houver console error, page error, request failed, HTTP 4xx/5xx.
- Offline básico: service worker precisa estar pronto e navegação offline precisa renderizar.

## Checks executados

- OpenCode `opencode/deepseek-v4-flash-free` usado para implementação inicial e revisão final.
- `npm run test -- --passWithNoTests` — OK, 11 arquivos, 68 testes.
- `npx tsc --noEmit` — OK.
- `npm run build` — OK, sitemap 71 URLs.
- `npm run smoke:local` — OK:
  - cards: 69;
  - busca: 1;
  - detalhe: `ADA CRISTINA MUNARETTO`;
  - service worker: pronto;
  - HTTP failures online: 0;
  - console errors online: 0.
- `npm run smoke:preview -- --url https://fa5c28a2.portal-transparencia-rs.pages.dev/` — OK:
  - cards: 69;
  - busca: 1;
  - detalhe: `JOÃO BATISTA GARCIA DIAS`;
  - service worker: pronto;
  - HTTP failures online: 0;
  - console errors online: 0.

## Bug encontrado pelo H1.3

O smoke automatizado reproduziu uma falha de PWA: após service worker controlar a página, navegação para `/comparar` podia cair em `offline.html`, mesmo online. Causa: `navigateFallback: '/offline.html'`. Corrigido para `navigateFallback: '/index.html'`.

## Risco residual

- O smoke de produção só terá valor completo após merge/deploy de `main` com o novo workflow.
- Playwright adiciona dependência de browser no CI; a instalação do Chromium foi mantida sem `install-deps` para evitar sudo local. No GitHub runner, se faltar biblioteca de sistema, ajustar para `npx playwright install --with-deps chromium`.
- O preview Cloudflare emite ruído externo conhecido de `cloudflareinsights.com/cdn-cgi/rum`; o smoke ignora esse endpoint específico, mas continua falhando para 4xx/5xx e request failures do app/Supabase.
