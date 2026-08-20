# QA — Câmara votos nominais, lote 12

- **Data:** 2026-08-20T11:33:52Z
- **Objetivo:** consultar, em modo somente leitura, os 25 `vote_id` oficiais da Câmara nas posições 276–300 da janela `2026-07-01` a `2026-09-30`.

## Entrega verificada

- IDs derivados exclusivamente da descoberta oficial validada de `300` votações.
- Lote processado: `25` eventos, posições 276–300, em `.orchestrator/runtime/camara-batch-12/ids.json`.
- Coleta oficial: `scripts/collect-camara-votes.mjs`, usando somente `https://dadosabertos.camara.leg.br/api/v2/votacoes/{id}` e `/votos`; nenhuma opção de escrita remota.
- **Verificação independente:** `8/8` checks passaram — 25 IDs, 25 eventos, IDs únicos/exatos, 25 arquivos brutos, JSON válido, URLs oficiais, contagens coerentes e ausência de envelope inconsistente.
- Resultado observado: `2` eventos individualizados, `898` votos brutos e `54` votos RS no envelope dry-run; `23` eventos não individualizados.
- Envelopes factual foram emitidos apenas para os dois eventos cujo endpoint oficial retornou registros individuais; nenhum voto foi aplicado.
- Manifesto: `.orchestrator/runtime/camara-batch-12/collector/manifest.json`.
- SHA-256 do manifesto: `58692c4b8ab25196d37cc4d99ed0e8c9aaf4d737dce272a9fabde95b176b68b2`.
- Nenhuma escrita em Supabase, snapshot público, claims ou dados factuais remotos foi realizada.
- **Publicação:** commit `d50cc007fc002bef5433f6571e5ee74e494a33ff` em `origin/main`; workflow backup `334951434`, run `32364568922`, `completed/success`, `headSha` idêntico.
- **Produção:** raiz HTTP 200; `/release.json` HTTP 200 com SHA completo `d50cc007fc002bef5433f6571e5ee74e494a33ff`, release `d50cc00-20260820T113613373Z` e snapshot `row_count=1003`.
- **Smoke local:** exit 0, `1002` cards, mínimo esperado `1002`, 0 falhas HTTP e 0 erros de console online.

## Estado e bloqueios

- **ALRS:** segue fail-closed nos quatro residuais de Enio Carlos Terra, sem ID oficial exato/fonte válida.
- **Senado:** segue fail-closed por deriva de SHA-256 dos PDFs contra o manifesto versionado.
- Não houve inferência a partir de respostas vazias, matching heurístico, UUID inventado ou fonte fabricada.

## Próximo passo

Lote Câmara 12 encerra a janela bounded de 300 IDs; consolidar auditoria/manifestos Q3 e manter ALRS/Senado em reconhecimento independente até que os gates de identidade, fonte e hash sejam satisfeitos.
