# H2.1 — Unificar identidade pública da candidatura

Base: `h0-contencao-restauracao`
Data: 2026-07-30
Guia: Fase 2 — H2.1

## Observação de produção

Produção atual `https://portal-transparencia-rs.pages.dev/` ainda está na versão anterior: o smoke automatizado falhou esperando `article` na home, confirmando que produção/main segue sem os candidatos do PR. Não foi feito merge/deploy de produção sem autorização explícita.

## Implementado

- Incorporado arquivo local de instrução para agentes:
  - `AGENTS.md` com regras do projeto, dados, segurança e gates.
  - `opencode.jsonc` versionado sem segredos, apontando para `opencode/deepseek-v4-flash-free` e carregando `AGENTS.md` + `README.md`.
- Snapshot público `data/public-candidates.json` agora contém:
  - `slug` público canônico;
  - `tse_candidate_id` obrigatório;
  - 69 slugs únicos;
  - 69 `SQ_CANDIDATO` únicos.
- `scripts/refresh-public-snapshot.mjs` gera slugs no formato:
  - `nome_normalizado_<SQ_CANDIDATO>`.
- `scripts/public-candidate-snapshot.mjs` valida:
  - slug presente, único e com formato `^[a-z0-9_]+$`;
  - `tse_candidate_id` presente, numérico e único.
- `scripts/generate-sitemap.mjs` publica URLs por slug, não UUID derivado.
- Rotas migradas para `/candidatos/:slug`.
- Links de cards e comparação usam `candidatePublicPath(candidate)`.
- Dossiê mantém compatibilidade temporária:
  - aceita slug;
  - aceita `tse_candidate_id`;
  - aceita UUID legado;
  - redireciona identificador legado para o slug canônico quando a candidatura é encontrada.
- Serviço de candidatos inclui `slug`, `tse_candidate_id` e campos oficiais nos selects/mapa.
- Lookup Supabase evita `or()` inválido em coluna UUID: só consulta `id.eq` quando o identificador tem formato UUID.
- Tipos Supabase atualizados para campos de candidatos já usados no schema.
- Migration local preparada:
  - `supabase/migrations/20260730093916_h2_1_corrigir_slug_candidatos.sql`
  - backfill de slug por `tse_candidate_id`;
  - `UNIQUE`, `NOT NULL`, `CHECK`;
  - helper SQL `candidate_public_slug`;
  - upsert preserva slug em updates para não quebrar URLs por alteração futura de nome.

## Validações

- RED observado antes da implementação:
  - snapshot sem `slug` falhou;
  - `mapCandidate` não preservava slug/TSE.
- `npm run data:refresh` — OK, 69 candidaturas.
- `npm run test -- --passWithNoTests` — OK, 12 arquivos, 73 testes.
- `npx tsc --noEmit` — OK.
- `npm run build` — OK, sitemap 71 URLs com slugs.
- `npm run smoke:local` — OK:
  - cards: 69;
  - busca `ADEMAR`: 1;
  - detalhe: `ADA CRISTINA MUNARETTO`;
  - HTTP failures online: 0;
  - console errors online: 0.
- OpenCode `opencode/deepseek-v4-flash-free` fez revisão final e retornou `SEM_BLOQUEANTES`.

## Pendência controlada

- A migration H2.1 **não foi aplicada remotamente** nesta etapa porque altera schema remoto. Aplicar via Supabase CLI somente com autorização explícita.
- Produção continua antiga até merge/deploy de `main` autorizado.
