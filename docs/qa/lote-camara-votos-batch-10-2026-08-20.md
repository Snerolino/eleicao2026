# QA — Câmara votos nominais, lote 10

- **Data:** 2026-08-20T10:22:00Z
- **Objetivo:** consultar, em modo somente leitura, os 25 `vote_id` oficiais da Câmara nas posições 226–250 da janela `2026-07-01` a `2026-09-30`.

## Entrega verificada

- IDs derivados exclusivamente da descoberta oficial validada de `300` votações.
- Lote processado: `25` eventos, posições 226–250, em `.orchestrator/runtime/camara-batch-10/ids.json`.
- Verificação independente: `8/8` checks passaram — 25 IDs, 25 eventos, 25 arquivos brutos, IDs únicos/exatos, URLs oficiais, JSON válido e ausência de envelope inconsistente.
- Resultado factual: `25` eventos sem registros individuais; `0` votos brutos; `0` votos RS; nenhum envelope factual emitido.
- Manifesto: `.orchestrator/runtime/camara-batch-10/collector/manifest.json`.
- SHA-256: `1a7d0f0d0c47fdd2aaf96c8cc34a5c3e19db2865c46b3e9fb1bb18cf3d43fbd7`.
- Nenhuma escrita remota ou alteração factual foi realizada.

## Estado e bloqueios

- ALRS segue fail-closed nos quatro residuais de Enio Carlos Terra, sem ID oficial exato/fonte válida.
- Senado segue fail-closed por deriva de SHA-256 dos PDFs contra o manifesto.
- Nenhuma inferência, matching heurístico, UUID inventado ou fonte fabricada.

## Próximo passo

Continuar Câmara lote 11 (posições 251–275), mantendo ALRS e Senado independentes e fail-closed.
