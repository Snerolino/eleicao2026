# QA — Coleta factual nominal Câmara e ALRS — 2026-08-30

## Objetivo

Coletar votos nominais oficiais para candidatos do RS, associando somente pessoa, valor do voto, evento e matéria/versão quando a API fornecer vínculo explícito. Conteúdo de mérito, anexos, vistas e emendas não foi analisado.

## Câmara — resultado verificado

- Fonte: arquivos oficiais anuais da Câmara, 2019–2026.
- Linhas de arquivo processadas: `1.270.822`.
- Votos nominais explícitos preservados: `65.790`.
- Eventos distintos: `3.714`.
- Eventos com proposição oficial retornada: `3.699`.
- Eventos sem proposição retornada: `15`.
- Votos associados a matéria resolvida: `65.716`.
- Votos únicos no envelope após deduplicação por `(candidato, evento, valor)`: `65.657`.
- Duplicatas benignas removidas: `59`; nenhuma duplicata cruzou proposições diferentes.
- Votos em eventos sem matéria resolvida: `74`.
- Candidatos com vínculo exato e voto encontrado: `35`.
- IDs de parlamentares mapeados no catálogo: `41`.
- Valores de voto desconhecidos descartados: `104`.
- Índice factual por matéria/evento: `/tmp/camara-enriched-matters-factual.json`.
- SHA-256 do índice: `eab875591de53d5755efc97dbba7162bbea3d5ccbdc08ed450038ee4f7e4e641`.

## ALRS — resultado verificado

- 55 parlamentares oficiais consultados.
- 440 páginas oficiais, todas HTTP 200.
- 48.020 registros nominais.
- 43.762 linhas reconciliadas com candidato e versão.
- 43.761 já presentes.
- 0 faltantes seguros.
- 1 conflito factual isolado; não sobrescrito.
- Índice factual separado: `/tmp/alrs-matters-factual-index.json`.
- 1.303 matérias distintas no índice local.

## Política aplicada

- Valores aceitos: `sim`, `nao`, `abstencao`, `ausente`, `obstrucao`.
- Nenhum voto foi inferido a partir de ausência, descrição ou placar.
- Nenhuma matéria recebeu score ou interpretação editorial.
- Eventos sem proposição oficial permanecem pendentes; não foram vinculados por título aproximado.

## Publicação e verificação remota

- Migration/RPC aplicada: `20260830130000_import_camara_nominal_votes_rpc.sql`.
- RPC: `public.import_camara_nominal_votes(jsonb)`, execução autenticada verificada (`authenticated_execute=true`).
- Fontes oficiais: `3.714/3.714` eventos hashados, `55.234.748` bytes, `0` bloqueios; `1.135/1.135` proposições hashadas, `2.451.508` bytes, `0` bloqueios.
- Lote factual enviado: `65.657` linhas; `63.061` inserções; `2.265` já presentes; `331` conflitos preservados sem sobrescrita.
- Read-back remoto: `65.412` votos, `3.707` eventos, `3.736` versões, `1.160` proposições e `35` candidatos Câmara.
- Materialização Auth: `109.959` índices totais e `86` perfis totais; Câmara: `65.412` índices e `35` perfis.
- `331/331` divergências pertencem ao TSE `210002547857` (LUCIANO LORENZINI ZUCCO). Investigação oficial confirmou colisão crítica de identidade: o mesmo TSE foi associado aos IDs Câmara `220552` (Zucco, compatível) e `220551` (Franciane Bayer, incompatível). Em todos os 331 eventos, o valor esperado coincide com `220552` e o remoto com `220551`; classificação `blocked_identity_collision`. Nenhuma sobrescrita ou recalculo automático.
- Dois registros legados Câmara permanecem sem fonte/evento exato (`camara_pec6_2019_2turno`, `camara_pl3723_2019`); as proposições foram identificadas como `2192459` e `2209381`, mas o evento/voto nominal correspondente não foi confirmado.
- Nenhuma matéria foi lida editorialmente; anexos, vistas e emendas foram ignorados. Nenhum score, matriz ou assessment foi criado/alterado.
- O lote cobre 35 candidatos com voto nominal oficial; os demais candidatos não recebem zero artificial.

## Próximo chunk

Reconciliar os `331` conflitos factuais por chave exata, recuperar fontes dos 2 registros legados sem inventar evidência e continuar a coleta incremental das casas/anos restantes. Manter análise editorial separada por matéria e sem bloquear fatos independentes.
