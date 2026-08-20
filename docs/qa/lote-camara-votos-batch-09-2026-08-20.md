# QA — Câmara votos nominais, lote 09

- **Data:** 2026-08-20T10:20:00Z
- **Objetivo:** consultar, em modo somente leitura, os 25 `vote_id` oficiais da Câmara nas posições 201–225 da janela `2026-07-01` a `2026-09-30`, preservando respostas brutas e emitindo envelope somente quando o endpoint oficial individualizar votos.

## Entrega verificada

- IDs derivados exclusivamente da descoberta oficial já validada de `300` votações da Câmara.
- Lote processado: `25` eventos, posições 201–225, IDs preservados em `.orchestrator/runtime/camara-batch-09/ids.json`.
- Coleta oficial: `https://dadosabertos.camara.leg.br/api/v2/votacoes/{id}` e `/votos`.
- Verificação independente: `8/8` checks passaram — 25 IDs, 25 eventos, 25 arquivos brutos, IDs únicos e exatos, URLs oficiais, JSON válido e ausência de envelope inconsistente.
- Resultado factual: `25` eventos sem registros individuais; `0` votos brutos; `0` votos RS no envelope dry-run; nenhum envelope factual foi emitido.
- Manifesto do coletor: `.orchestrator/runtime/camara-batch-09/collector/manifest.json`.
- SHA-256 verificado do manifesto: `0691ac668bbbe4dda2f92aee3fd9b278cfc5c3bb4bfd85c46f627182ad280d9a`.
- Nenhuma escrita em Supabase, snapshot público, claims ou dados factuais remotos foi realizada.

## Estado e bloqueios

- **ALRS:** continua fail-closed para os quatro residuais de Enio Carlos Terra; sem ID oficial exato/fonte válida aplicável.
- **Senado:** continua fail-closed enquanto a revalidação dos PDFs mantiver deriva de SHA-256 do manifesto.
- Não houve inferência a partir de respostas vazias, matching heurístico, UUID inventado ou fonte fabricada.

## Próximo passo

Continuar Câmara lote 10 (posições 226–250), mantendo ALRS e Senado independentes e fail-closed.
