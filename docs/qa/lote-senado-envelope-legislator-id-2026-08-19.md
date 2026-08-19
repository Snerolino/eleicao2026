# QA — envelope nominal Senado adaptado

**Data:** 2026-08-19
**Modo:** dry-run local, sem escrita remota

## Resultado

- 48 proposições
- 68 eventos
- 184 votos
- 3 legisladores
- 0 `candidate_tse_id` inferidos
- URLs oficiais resolvidas por `legislator_external_id + ano`
- `legislator_id` lógico preservado para o próximo writer remoto

O adaptador rejeita fonte ausente e não converte legislador em candidato por
aproximação. O Senado permanece fail-closed até o manifesto PDF estabilizar e o
writer remoto idempotente passar dry-run.

Artefatos:

- `scripts/adapt-senado-nominal-envelope.mjs`
- `scripts/__tests__/adapt-senado-nominal-envelope.test.mjs`
- `data/legislative-import/senado/nominal-envelope-dry-run.json`
