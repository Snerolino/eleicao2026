# QA — FED-17 residual resolvido parcialmente

**Data:** 2026-08-19
**Modo:** evidência oficial, correção factual idempotente

## Aplicado

- 11 votos ALRS receberam `source_reference_id` exato.
- 2 eventos tiveram `occurred_at` corrigido para as datas oficiais ALRS:
  - `alrs_pl165_2025`: 2026-03-10
  - `alrs_pl361_2025`: 2026-04-07
- Primeira execução: 11 votos e 2 datas corrigidos.
- Segunda execução: 0 votos e 0 datas alterados.

## Residual

Restam **4 votos**, um por evento, todos do candidato `210002534312` (Enio Carlos
Terra), cuja identidade/ID oficial ALRS não foi localizada. Nenhum fuzzy matching
foi usado.

## Auditoria

- ALRS com fonte: **3996/4000**
- ALRS sem fonte: **4**
- fila residual: PL134/2023, PL165/2025, PL361/2025 e PL77/2025 — Enio
- `impact:sources:audit --strict`: continua código 2 somente por esses 4 gaps
- impacto editorial/RPC/matriz: zero alterações
