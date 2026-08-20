# QA — Câmara votos nominais, lote 11

- **Data:** 2026-08-20T10:55:39Z
- **Objetivo:** consultar, em modo somente leitura, os 25 `vote_id` oficiais da Câmara nas posições 251–275 da janela `2026-07-01` a `2026-09-30`.

## Entrega verificada

- IDs derivados exclusivamente da descoberta oficial validada de `300` votações.
- Lote processado: `25` eventos, posições 251–275, em `.orchestrator/runtime/camara-batch-11/ids.json`.
- Coletor oficial: `scripts/collect-camara-votes.mjs`, sem opção de escrita remota.
- **Verificação independente:** `8/8` checks passaram — 25 IDs, 25 eventos, 25 arquivos brutos, IDs únicos/exatos, URLs oficiais, JSON válido, contagens zeradas e ausência de envelope inconsistente.
- Resultado observado no coletor: `25` eventos sem registros individuais; `0` votos brutos; `0` votos RS; nenhum envelope factual emitido.
- Manifesto: `.orchestrator/runtime/camara-batch-11/collector/manifest.json`.
- SHA-256: `007571c5b4df2fc9936601a71fbdbcc9b17581fc444f86f16c0541f5b97d348e`.
- Nenhuma escrita remota ou alteração factual foi realizada.

## Estado e bloqueios

- ALRS segue fail-closed nos quatro residuais de Enio Carlos Terra, sem ID oficial exato/fonte válida.
- Senado segue fail-closed por deriva de SHA-256 dos PDFs contra o manifesto.
- Nenhuma inferência, matching heurístico, UUID inventado ou fonte fabricada.

## Próximo passo

Concluir gates locais e publicação deste checkpoint; depois iniciar Câmara lote 12 (posições 276–300), mantendo ALRS e Senado independentes e fail-closed.
