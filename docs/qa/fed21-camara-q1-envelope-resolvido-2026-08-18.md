# QA — FED-21: envelope Câmara Q1 com identidades resolvidas

**Data:** 2026-08-18
**Modo:** dry-run factual, catálogo de fontes e aplicação factual idempotente

## Objetivo

Consolidar os 10 eventos nominais do lote Câmara Q1/2026 usando somente as 24
correspondências `matched_exact` do FED-20, resolver as FKs `candidates.id` por
`tse_candidate_id` no banco remoto vinculado e manter os 8 deputados pendentes
fora do envelope.

## Evidência verificada

- Identidade FED-20: 32 deputados distintos; 24 `matched_exact`; 8
  `identity_pending`; fuzzy matching 0.
- Gate remoto R0 já confirmado para o projeto `hhqxhxcfkoijevxyzfky`.
- Consulta read-only `information_schema`/`candidates` via `supabase db query
  --linked` retornou 24/24 candidatos com UUID remoto.
- Fonte factual preservada nos envelopes: API oficial Câmara
  `https://dadosabertos.camara.leg.br/api/v2/votacoes/{vote_id}/votos`.

## Artefatos

- `scripts/build-camara-q1-resolved-envelope.mjs`
- `scripts/__tests__/build-camara-q1-resolved-envelope.test.mjs`
- `data/legislative-import/camara/collector-2026-q1/resolved-envelope.json`
- `data/legislative-import/camara/collector-2026-q1/resolved-catalog.json`
- `scripts/audit-camara-envelope-sources.mjs`
- `scripts/apply-camara-q1-sources.mjs`
- `scripts/apply-camara-q1-resolved.mjs`
- `data/legislative-import/camara/collector-2026-q1/resolved-source-manifest.json`

## Resultado validado

- 7 proposições únicas
- 10 versões
- 10 eventos
- 190 votos factuais
- 24 FKs lógicas Câmara → `candidates.id`
- 8 identidades pendentes preservadas fora do envelope
- validação `npm run impact:dryrun .../resolved-envelope.json`: **exit 0**
- auditoria de fontes: **27 URLs oficiais HTTP 200**, com bytes e SHA-256
- cobertura remota anterior: **3** `source_references` Câmara; as demais fontes
  ainda não foram aplicadas
- catálogo de fontes aplicado: **27** referências, 0 votos tocados
- lote factual aplicado: **7** proposições, **10** versões, **10** eventos e
  **190** votos, todos com fonte e FK remota
- reaplicação final: **0** inserções, **0** updates, **0** votos tocados

Não foi executado RPC, aprovação de matriz ou qualquer impacto editorial. Os 8
deputados sem identidade continuam fora do envelope.
