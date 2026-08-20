# QA — Câmara votos nominais, lote 07

- **Data:** 2026-08-20T09:43:05Z
- **Objetivo:** consultar, em modo somente leitura, os 25 `vote_id` oficiais da Câmara nas posições 151–175 da janela `2026-07-01` a `2026-09-30`, preservando respostas brutas e emitindo envelope somente quando o endpoint oficial individualizar votos.

## Entrega verificada

- Descoberta oficial: `300` IDs, sem bloqueio, via `https://dadosabertos.camara.leg.br/api/v2/votacoes`.
- Lote processado: `25` eventos, posições 151–175, IDs preservados em `.orchestrator/runtime/camara-batch-07/ids.json`.
- Coleta oficial: `https://dadosabertos.camara.leg.br/api/v2/votacoes/{id}` e `/votos`.
- Resultado: `25` eventos sem registros individuais; `0` votos brutos; `0` votos RS no envelope dry-run; nenhum envelope factual foi emitido.
- Manifesto do coletor: `.orchestrator/runtime/camara-batch-07/collector/manifest.json`.
- SHA-256 do manifesto: `b1575d51e3f4fcd35f194b0a80300460a9161393d313369e8af20d365dd578eb`.
- Verificação independente: `100` checks passaram — `detail.id` exato, IDs do lote, URLs oficiais, contagens brutas e ausência de fontes/envelopes inconsistentes.
- Nenhuma escrita em Supabase, snapshot público, claims ou dados factuais remotos foi realizada.

## Estado e bloqueios

- **ALRS:** continua fail-closed para os quatro residuais de Enio Carlos Terra; sem ID oficial exato/fonte válida aplicável.
- **Senado:** continua fail-closed enquanto a revalidação dos PDFs mantiver deriva de SHA-256 do manifesto.
- **Doctor:** `FAIL` operacional conhecido porque o shell do cron inicia Node `v22.22.2`, embora os gates anteriores tenham sido executados com Node `v24.19.0`; OpenCode ausente e gateway/Ollama permanecem avisos opcionais. Não foi alterada infraestrutura neste lote.
- Não houve inferência a partir de respostas vazias, matching heurístico, UUID inventado ou fonte fabricada.

## Próximo passo

Executar os gates locais do lote documental e, se verdes, publicar o QA; depois iniciar Câmara lote 08 (posições 176–200), mantendo ALRS e Senado independentes e fail-closed.
