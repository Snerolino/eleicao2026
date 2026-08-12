# Handoff — Clientes Supabase adaptados ao Vite/SPA (Fase 2, task Supabase)

Data: 2026-08-12
Status: `done_local` — arquivos criados, testados, build ok

## Contexto
O usuário adicionou tokens em `.env.local`, alterou `page.tsx` e instalou skills
do Supabase, pedindo os 3 arquivos sugeridos pelo quickstart:
`utils/supabase/{server,client,middleware}.ts`.

## Decisão arquitetural (importante)
O projeto é **VITE/REACT SPA**, NÃO Next.js. Os arquivos sugeridos usam
`next/headers` e `next/server` — APIs inexistentes aqui. Criá-los literalmente
quebraria o build. Por isso foram **adaptados** para o stack real:

- `src/lib/supabase/client.ts`  → browser client (`@supabase/ssr` +
  `import.meta.env.VITE_SUPABASE_*`), equivalente ao `utils/supabase/client.ts`.
- `src/lib/supabase/server.ts`  → Node client para scripts
  (`process.env.VITE_SUPABASE_*`, padrão do repo; anon only).
- `src/lib/supabase/middleware.ts` → helper de refresh de sessão no cliente
  (`onAuthStateChange`/`getSession`), substituindo o middleware de `next/server`.

Não foram criados em `utils/supabase/` para evitar confusão com o padrão Next
e porque o repo já usa `src/lib/supabase.ts` (browser anon).

## Variáveis
O repo usa `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (ver `.env.example`),
NÃO `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
Os novos arquivos respeitam o padrão `VITE_*` do projeto.

## Arquivos
- `src/lib/supabase/client.ts` (novo)
- `src/lib/supabase/server.ts` (novo)
- `src/lib/supabase/middleware.ts` (novo)
- `scripts/__tests__/supabase-clients.test.mjs` (novo, 3 testes)
- `supabase/bundles/fase1-impacto-20260810090000-20260810090400.sql` (novo, do gate remoto)
- `docs/handoff/2026-08-12-fase2-migrations-remote-exec.md` (novo)

## Verificação
- tsc --noEmit: OK
- npm run test: 935 passed (186 arquivos)
- npm run build: OK (data:check + tsc -b + vite + sitemap + release)
- git diff --check: OK
- Arquivos proibidos (candidates.ts, AdminPage.tsx): INTACTOS

## Notas
- `src/lib/supabase.ts` (original) permanece; os novos módulos são complementares.
- `server.ts` usa apenas anon key; service_role fica em scripts dedicados.
- Nenhuma migration foi aplicada; .env.local não foi lido pelo agente (bloqueio).
