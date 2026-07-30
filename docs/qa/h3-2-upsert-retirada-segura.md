# H3.2 — Upsert idempotente e retirada segura

Data: 2026-07-30
Guia: Fase 3 — H3.2

## Objetivo

Corrigir a semântica de upsert TSE para que cada candidatura seja classificada de forma explícita e auditável, evitando retirada automática quando a fonte oficial estiver parcial.

## Implementado

- Criado `scripts/tse-upsert-semantics.mjs` com classificação reutilizável:
  - `inserted`
  - `updated`
  - `unchanged`
  - `withdrawn_candidate`
  - `needs_review`
- Criado teste `scripts/__tests__/tse-upsert-semantics.test.mjs` cobrindo:
  - comparação explícita dos campos relevantes;
  - dataset parcial gerando `needs_review`;
  - retirada somente com `coverage.complete=true`.
- Criado teste `scripts/__tests__/h3-2-upsert-migration.test.mjs` para proteger a migration SQL.
- Atualizado `scripts/tse-ingest-pipeline.mjs` para:
  - usar a semântica compartilhada do diff;
  - buscar explicitamente campos relevantes no Supabase;
  - declarar `--coverage-complete` somente quando houver cobertura completa confirmada;
  - logar contagens por ação;
  - fazer retry em chamadas REST Supabase para DNS/rede intermitente.
- Criada e aplicada remotamente a migration:
  - `supabase/migrations/20260730133000_h3_2_upsert_idempotente_retirada_segura.sql`

## Campos comparados explicitamente

- `full_name`
- `ballot_name`
- `party`
- `ballot_number`
- `position`
- `state`
- `registration_status`
- `federation`
- `coalition`

Não há comparação ampla `candidates.* is distinct from excluded.*`.

## Política de retirada

- Padrão: `coverage_complete=false`.
- Candidato ausente em dataset parcial: `needs_review`.
- Candidato ausente em dataset completo declarado: `withdrawn_candidate`.
- Sem `--coverage-complete`, o pipeline não retira candidaturas automaticamente.

## Validações executadas

```bash
npm run test -- scripts/__tests__/tse-upsert-semantics.test.mjs scripts/__tests__/h3-2-upsert-migration.test.mjs scripts/__tests__/tse-ingest-contract.test.mjs
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
npm run smoke:local
node scripts/tse-ingest-pipeline.mjs --uf=RS --dry-run
printf 'Y\n' | npx supabase db push --include-all
npx supabase db query --linked "select acao, count(*) from public.upsert_candidates_from_staging('RS', true, false) group by acao order by acao;"
npx supabase db query --linked "select acao, count(*) from public.upsert_candidates_from_staging('RS', false, false) group by acao order by acao;"
```

Resultados remotos após migration/import idempotente:

- dry-run RPC: `unchanged=69`.
- import real 1: `unchanged=69`.
- import real 2: `unchanged=69`.
- candidatos RS: `total=69`, `withdrawn=0`, `distinct_tse=69`.

## Observações

- O dataset RS atual é completo para os arquivos oficiais locais usados no MVP, mas o pipeline continua conservador: sem declaração explícita de cobertura completa, ausência vira `needs_review`.
- `#NE`/nulo de situação TSE é tratado como `registration_requested`, mantendo idempotência com o snapshot público e DB atual.
