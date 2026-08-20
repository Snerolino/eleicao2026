# QA — Câmara votos nominais, lote 08

- **Data:** 2026-08-20T10:19:32Z
- **Objetivo:** consultar, em modo somente leitura, os 25 `vote_id` oficiais da Câmara nas posições 176–200 da janela `2026-07-01` a `2026-09-30`, preservando respostas brutas e emitindo envelope somente quando o endpoint oficial individualizar votos.

## Entrega verificada

- Descoberta oficial: `300` IDs, sem bloqueio, via `https://dadosabertos.camara.leg.br/api/v2/votacoes`.
- Lote processado: `25` eventos, posições 176–200, IDs preservados em `.orchestrator/runtime/camara-batch-08/ids.json`.
- Coleta oficial: `https://dadosabertos.camara.leg.br/api/v2/votacoes/{id}` e `/votos`.
- Verificação independente: `8/8` checks passaram — 25 IDs, 25 eventos, 25 arquivos brutos, IDs únicos e exatos, URLs oficiais, JSON válido e ausência de envelope inconsistente.
- Resultado factual: `25` eventos sem registros individuais; `0` votos brutos; `0` votos RS no envelope dry-run; nenhum envelope factual foi emitido.
- Manifesto do coletor: `.orchestrator/runtime/camara-batch-08/collector/manifest.json`.
- SHA-256 verificado do manifesto: `05108277eb11022be123a30900ef756153d4377351829ba7636bc3f95d94f373`.
- Nenhuma escrita em Supabase, snapshot público, claims ou dados factuais remotos foi realizada.

## Gates locais

- `npm run test`: exit 0 — `82` arquivos, `372` testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0 — `1003` candidaturas, `988` fotos oficiais.
- `npm run build`: exit 0 — sitemap com `1003` candidatos e `1005` URLs totais; `release.json` gerado.
- `git diff --check`: exit 0.

## Estado e bloqueios

- **ALRS:** continua fail-closed para os quatro residuais de Enio Carlos Terra; sem ID oficial exato/fonte válida aplicável.
- **Senado:** continua fail-closed enquanto a revalidação dos PDFs mantiver deriva de SHA-256 do manifesto.
- **Doctor:** `FAIL` operacional conhecido porque o shell do cron inicia Node `v22.22.2`, embora os gates tenham sido executados com Node `v24.19.0`; OpenCode ausente e gateway/Ollama permanecem avisos opcionais. Nenhuma infraestrutura foi alterada neste lote.
- Não houve inferência a partir de respostas vazias, matching heurístico, UUID inventado ou fonte fabricada.

## Próximo passo

Publicar este checkpoint documental e iniciar Câmara lote 09 (posições 201–225), mantendo ALRS e Senado independentes e fail-closed.
