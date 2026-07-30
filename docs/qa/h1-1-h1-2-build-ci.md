# H1.1/H1.2 — Build reproduzível e CI/deploy preflight

Base: `h0-contencao-restauracao`
Data: 2026-07-30
Guia: Fase 1 — H1.1/H1.2

## H1.1 — eliminar dependência silenciosa de `../dataset2026`

Implementado:

- Snapshot público canônico versionado: `data/public-candidates.json`.
- Fallback frontend passa a consumir `src/services/publicCandidates.ts`, que importa o snapshot versionado.
- `npm run build` não executa ingestão TSE e não reescreve `src/services/mockData.ts`.
- Removidos o gerador antigo `scripts/generate-mockdata.mjs` e `src/services/mockData.ts`.
- Atualização TSE agora é comando explícito: `npm run data:refresh`.
- Validação canônica: `npm run data:check`.
- Sitemap agora lê o mesmo snapshot público versionado.

Validações do snapshot:

- lista obrigatória e contagem mínima configurável (`PUBLIC_CANDIDATES_MIN_COUNT`, padrão 69);
- unicidade de `id` e `tse_candidate_id`;
- cargos permitidos;
- `claims` sempre lista;
- bloqueio de campos com padrão privado/sensível (`cpf`, `email`, `telefone`, `raw`, `token`, `secret`, etc.).

## H1.2 — variáveis de build e separação CI/deploy

Implementado:

- `scripts/build-env-check.mjs`:
  - permite PR/build fallback sem Supabase;
  - exige `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `build:deploy`;
  - bloqueia `service_role`/segredos no ambiente de build.
- GitHub Actions:
  - workflow roda em `pull_request` e `push main`;
  - job `quality`: `npm ci`, `data:check`, `env:check`, `tsc`, testes e build;
  - job `deploy`: somente `push main`, depende de `quality`, usa `npm run build:deploy` e Wrangler.
- Variáveis públicas configuradas no GitHub:
  - `VITE_SUPABASE_URL`;
  - `VITE_SUPABASE_ANON_KEY`.

## Checks executados

- `npm run data:check` — OK, 69 candidaturas; 29 deputado federal + 40 deputado estadual.
- `npm run env:check` — OK com fallback sem Supabase.
- `npm run env:check -- --require-supabase` — OK com `.env.local` carregado.
- `env -u VITE_SUPABASE_URL -u VITE_SUPABASE_ANON_KEY npm run env:check` — OK, fallback aceito.
- `env -u VITE_SUPABASE_URL -u VITE_SUPABASE_ANON_KEY npm run env:check -- --require-supabase` — falha esperada.
- `SUPABASE_SERVICE_ROLE_KEY=dummy npm run env:check` — falha esperada.
- `npx vitest run scripts/__tests__/public-snapshot.test.mjs` — OK, 3 testes.
- `npm run test -- --passWithNoTests` — OK, 46 testes.
- `npx tsc --noEmit` — OK.
- `npm run build` — OK, 71 URLs no sitemap.
- `npm run build:deploy` com `VITE_SUPABASE_*` — OK.
- Scan `dist` por `service_role`/`SUPABASE_SERVICE_ROLE` — OK, não encontrado.
- Build em cópia limpa sem `../dataset2026` — OK; hash de fonte/dados inalterado; log sem referência ao dataset externo.
- Revisão OpenCode `opencode/deepseek-v4-flash-free` — sem bloqueantes.
- PR #24 atualizado para `0a1d2e5` — Cloudflare Pages preview OK.
- Smoke do preview `https://d6053472.portal-transparencia-rs.pages.dev/` — OK para fallback: 69 cards, 29 federal, 40 estadual, sem erros JS.

## Risco residual

- Preview de PR ainda mostra banner de demonstração e não faz chamadas `rest/v1`, porque a integração de preview do Cloudflare não recebe `VITE_SUPABASE_*`. Após H1.1 isso não publica lista vazia: usa o snapshot público com 69 candidaturas.
- Smoke de navegador pós-deploy completo com Supabase real continua em H1.3/H0.4 expandido e deve rodar contra main/deploy com variáveis configuradas.
