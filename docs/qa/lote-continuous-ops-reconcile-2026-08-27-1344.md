# QA — ciclo contínuo de reconciliação ALRS — 2026-08-27 13:44 UTC

## Objetivo

Processar a mudança detectada no fingerprint do monitor, reconciliar o catálogo ALRS e a fila nominal, validar a esteira editorial sem aplicar fatos sem fonte e confirmar o estado da publicação.

## O que foi entregue e verificado

- Ciclo autônomo executado duas vezes (primeiro dry-run editorial e depois `--apply`): manifesto oficial ALRS mantido em cache fresco (`2,44 h`); descoberta não repetida.
- Reconciliação de versões: `916` resolvidas e `916` já presentes em matrizes; `51` candidatos de perfil.
- Reconciliação nominal ALRS: `25.616/25.616` linhas resolvidas e presentes; `missing=0`, `conflicts=0`, `ambiguous=0`, `blocked_identity=0`, `blocked_proposition=0`.
- Import factual nominal: `idle_no_missing_safe_rows`; `0` linhas inseridas.
- Materialização autenticada de perfis: `28.839` votos, `28.839` índices e `79` perfis.
- Fontes substantivas: `767` proposições e `959` versões verdes; aquisição ALRS: `24` URLs HTTP 200, `3.456` itens, `0` bloqueios e `0` candidatos substantivos.
- Fila editorial reconstruída sem itens verdes pendentes após a reconciliação: `0` propostas, `0` votos factuais e `0` candidatos; nenhuma disposição editorial foi aplicada neste tick.
- Portal verificado: `published_verified`; raiz e `/release.json` HTTP 200.
- Claims live verificadas: `1.000` publicadas e `0` sem fonte.

## Gates locais

- `npm run test`: verde — `442/442` testes em `107` arquivos.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde — `1.003` candidaturas, `988` fotos oficiais.
- `npm run build`: verde — `237` módulos; sitemap `1.003 + 2` URLs; `release.json` gerado.
- `git diff --check`: verde.

## Estado dos dados

Os artefatos versionados de reconciliação foram atualizados em `data/legislative-import/alrs/`: o catálogo de versões passou a refletir `916` versões resolvidas e o lote editorial está vazio, com `batch_id=alrs-impact-editorial-batch-001-v2` e hash `a14f7edb230b3f501e48020b6c43cd620581d28f340d71b086004206a06c4c91`. Não houve alteração de voto factual, score ou matriz aprovada.

## Bloqueios

A auditoria estrita de fontes continua fail-closed, RC `2`, com gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`. Os quatro votos ALRS sem evidência vinculada permanecem fora de qualquer importação. Não foi fabricada fonte nem aplicada correção residual.

O doctor está RC `0` com `49 OK`, `5 WARN` e `0 FAIL`; os avisos são OpenCode ausente, Gemini apenas legacy, Ollama sem resposta no preflight e rota MCP não exercitada no modo rápido.

## Próximo passo

Retentar commit/push dos artefatos e deste QA. Se o transporte Git aceitar, validar o workflow backup Cloudflare, `headSha` e produção; manter a fila e os quatro votos residuais em modo fail-closed até evidência oficial com URL, hash, bytes e match exatos.
