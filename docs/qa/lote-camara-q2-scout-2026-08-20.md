# QA — scout Câmara Q2/2026

**Janela:** 2026-04-01 a 2026-06-30
**Modo:** read-only, sem Supabase apply

## Descoberta

- eventos listados: **100**
- detalhes acessíveis: **97**
- detalhes HTTP 404: **3**, registrados como bloqueio de endpoint
- eventos nominais RS: **4**
- votos RS nominais: **106**
- identidades distintas: **29**
- correspondências exatas: **21**
- identidades pendentes: **8**

Critério nominal autoritativo: `/votacoes/{vote_id}/votos` retornando registros
individuais com `deputado_.siglaUf=RS`. Eventos inacessíveis não foram tratados
como ausência de votação.

## Artefatos

- `data/legislative-import/camara/collector-2026-q2/scout-summary-resilient.json`
- `data/legislative-import/camara/collector-2026-q2/nominal-scout-summary.json`
- `data/legislative-import/camara/collector-2026-q2/identity-reconciliation-official.json`

Próximo gate: resolver as 21 FKs `candidates.id` por `tse_candidate_id`, auditar
27 URLs oficiais e gerar envelope dry-run; 8 identidades pendentes e 3 eventos
404 permanecem fora.
