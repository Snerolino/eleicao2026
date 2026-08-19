# QA — catálogo de fontes históricas Câmara

- **Data:** 2026-08-19
- **Objetivo:** revalidar, somente leitura, as 7 `source_references` exigidas pelo envelope histórico Câmara antes de qualquer writer factual.

## Evidência executada

- Consulta remota paginada de `source_references`: **132 linhas** lidas.
- Fontes esperadas pelo manifesto versionado: **7**.
- URLs com UUID remoto exato: **7/7**.
- Hashes remotos coincidentes com `historical-resolved-source-manifest.json`: **7/7**.
- Ausentes: **0**.
- Divergentes: **0**.
- Artefato auditável: `.orchestrator/runtime/camara-historical-scout/catalog-revalidation-2026-08-19.json`.
- O artefato contém os UUIDs remotos, URLs e hashes; nenhum segredo foi registrado.

## Dry-run e contrato

- `npm run impact:dryrun data/legislative-import/camara/historical-contract-envelope.json`: **exit 0**.
- Planejamento: **2 proposições, 6 versões, 6 eventos e 84 votos**.
- Nenhuma escrita Supabase, matriz de impacto, RPC, Cloudflare ou alteração de identidade foi executada.
- `npx vitest run scripts/__tests__/adapt-camara-historical-contract.test.mjs --reporter=dot`: **5/5 testes, exit 0**.

## Estado dos dados e bloqueios

- As 7 fontes possuem UUID remoto e hash exato; o item de catálogo está apto para um writer idempotente.
- As **8 identidades inelegíveis** do envelope permanecem fail-closed e não serão promovidas por heurística.
- Não foi executado `--apply`: o próximo chunk deve implementar/revisar o writer histórico idempotente, validar FKs/constraints remotamente em leitura e provar segunda execução sem alterações antes de qualquer publicação factual.

## Publicação verificada

- Commit: `da8cd69dfdf7830a53575b18999f93a24f8b405c`.
- Backup Cloudflare `334951434`, run `32202957347`: **success**; `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org`: **HTTP 200**.
- `/release.json`: SHA idêntico, versão `0.2.368`, snapshot com **1003 candidaturas**.

## Próximo passo

Preparar o writer histórico em modo dry-run por padrão, com `--apply` explícito, exigindo os 7 UUIDs/hash exatos, as 18 identidades elegíveis e rejeitando as 8 bloqueadas; depois rodar os gates locais completos antes de qualquer aplicação remota.
