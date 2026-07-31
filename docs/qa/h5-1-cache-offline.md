# H5.1 — Cache e modo offline honesto

Data: 2026-07-31
Guia: Fase 5 — H5.1

## Objetivo

Preservar a forma da API no cache PWA e oferecer modo offline previsível, sem esconder dados vencidos nem cachear respostas de erro.

## Implementado

Arquivos principais:

- `vite.config.ts`
- `src/components/DataFreshness.tsx`
- `src/services/publicCandidates.ts`
- `src/services/candidates.ts`
- `src/pages/HomePage.tsx`
- `scripts/smoke-browser.mjs`

### Workbox

- `navigateFallback` permanece em `/index.html`, preservando rotas SPA offline.
- `claims` continuam em `StaleWhileRevalidate` com TTL curto de 5 minutos.
- `candidates` agora têm limite explícito:
  - `maxEntries: 80`
  - `maxAgeSeconds: 86400`
- `claims` agora têm limite explícito:
  - `maxEntries: 120`
  - `maxAgeSeconds: 300`
- Ambos usam `cacheableResponse: { statuses: [0, 200] }`, evitando cache de 4xx/5xx.
- Não há `cacheWillUpdate`, `_sw_cached_at` nem reescrita de payload JSON; respostas de `claims` continuam array.

### Fallback público versionado

- `src/services/publicCandidates.ts` exporta metadados do manifesto `data/tse-source-manifest.json`:
  - `createdAt`
  - `scope`
- `fetchAllCandidates()` marca quando caiu no snapshot público versionado.
- `HomePage` passa essa origem para `DataFreshness`.
- `DataFreshness` sinaliza `fallback oficial validado`, escopo e data do snapshot quando a lista veio do snapshot.

### Smoke offline

- `scripts/smoke-browser.mjs` agora exige service worker pronto.
- Verifica que a home offline renderiza conteúdo previsível.
- Também abre o detalhe já visitado em modo offline e exige `h1` renderizado.

## Testes

RED confirmado:

- teste de Workbox falhou por ausência de `maxEntries/cacheableResponse`;
- teste de `DataFreshness` falhou por ausência de sinalização do fallback;
- teste de service `wasLastCandidatesFetchFromSnapshot` falhou por função ausente;
- teste de smoke offline detalhe falhou por verificação ausente.

Validações focadas:

```bash
npm run test -- scripts/__tests__/pwa-workbox.test.mjs src/components/__tests__/DataFreshness.test.tsx src/services/__tests__/candidates.test.ts scripts/__tests__/smoke-browser.test.mjs
```

## Critérios do Guia

- Resposta cached de claims continua sendo array: garantido por ausência de `cacheWillUpdate`/reescrita e por cache HTTP transparente.
- 4xx/5xx não entram no cache: `cacheableResponse.statuses` aceita apenas `0` e `200`.
- Offline abre home e detalhe já visitado: coberto no smoke browser.
- Atualização do SW não mistura dados antigos e bundle novo: mantém `cleanupOutdatedCaches`, `clientsClaim` e `skipWaiting`; não altera shape do payload.
- Service worker é opcional para online principal: app continua usando Supabase online e snapshot versionado como fallback explícito.

## Risco residual

`registerType` segue `autoUpdate`. Hoje não há formulário editorial público em produção; se painel/formulário editorial entrar no frontend, reavaliar prompt de atualização antes de liberar edição longa no browser.
