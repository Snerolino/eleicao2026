# QA — scout Câmara Q3/2026 completo

**Janela:** 2026-07-01 a 2026-09-30
**Modo:** reconhecimento oficial read-only

## Resultado

- eventos descobertos: **1000**
- endpoints `/votos` acessíveis: **992**
- bloqueados: **8** (`429`/`404`), registrados sem interpretar como ausência
- eventos nominais RS: **9**
- votos RS nominais: **174**
- nenhum voto aplicado

A nominalidade foi confirmada somente por registros individuais em
`/api/v2/votacoes/{vote_id}/votos`. O campo `tipoVotacao` ausente não foi usado
como critério negativo.

Artefato:

- `data/legislative-import/camara/collector-2026-q3/scout-summary-full.json`

Próximo gate: coletar os 9 eventos nominais, reconciliar identidades exatas,
resolver FKs remotas e auditar fontes antes de qualquer aplicação.
