# QA — autoria Câmara 2776–2800 — 2026-09-11

## Objetivo
Processar boundedamente 25 projetos únicos de autoria da Câmara, preservar evidência oficial e manter as lanes causal/red-team fail-closed. Nenhum item foi convertido em fato causal, voto, claim, score ou matriz.

## Controle operacional
- Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; um único writer.
- Seleção efetiva: 25 projetos únicos, 50 ocorrências candidato–projeto e 25 identidades exatas.
- Alteração ALRS preexistente em `data/legislative-import/alrs/impact-resolved-version-catalog-v1.json` preservada; nenhuma migration, RLS, Auth, Storage ou Edge Function foi tocada.

## Fontes oficiais e revalidação
- 25/25 endpoints de proposição da API oficial Câmara HTTP 200.
- 25/25 identidades `dados.id` exatas.
- 25/25 URLs de texto integral oficiais HTTP 200.
- 25/25 URLs de tramitação independentes HTTP 200.
- 75/75 URLs revalidadas sob lock, com bytes e SHA-256 idênticos ao manifesto; nenhum erro.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2776-2800-source-manifest.json`.
- O manifesto mantém `content_read=false`, `remote_apply=false`; lacunas de evento vinculante permanecem bloqueadas (`event_binding_pending=14`).

## Lanes e retenção
- Causal: 25/25 IDs exatos; `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Red-team: 25/25 IDs exatos; `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Reconciliação: 25/25 IDs exatos; `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Razão do bloqueio: autoria/ementa/tramitação não prova posição legislativa, efeito causal ou score; texto integral não foi editorialmente validado e faltam eventos/votos nominais vinculantes.
- Nenhum fato, voto, claim, assessment, score, matriz, projeto público, Supabase ou Cloudflare factual foi escrito.

## Artefatos e SHA-256
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2776-2800-source-manifest.json`: `9a860d8d3a4aae411bb5e2698218ec8e6721e9cbd6391b281c123d7a928b0249`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2776-2800-causal.json`: `b62ae85a2c701bf91df0e0a80bb70cfc18f58a0d6c00ee2197622d072461b87e`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2776-2800-redteam.json`: `15864a91cbe1ca1f981e19f79018e8ae5be4145fe06408ea847d28e289785b06`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2776-2800-reconciled.json`: `f6dfe8e3431e200cca35d1d24226f22b3226d704501812b118b6eaa3ecd93d2a`

## Checkpoint
- `projects_analyzed=2800`, `last_batch=2776-2800`, `next_batch=2801-2825`, `withheld=2800`, `pending_review=0`, `approved=0`.
- Checkpoint durável: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Gates
- Node 24.19.0: executar `npm run test -- --passWithNoTests`, `npx tsc --noEmit`, `node scripts/validate-impact-schema.mjs`, `npm run data:check`, `npm run build` e `git diff --check`; resultados registrados após execução.
- Churn não relacionado deve permanecer fora do commit; a alteração ALRS existente é intencional e foi preservada.

## Publicação
- Commit/push, CI, backup Cloudflare e produção só serão declarados após verificação do SHA exato.
