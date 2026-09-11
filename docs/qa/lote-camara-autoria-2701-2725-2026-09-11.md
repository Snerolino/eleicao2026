# QA — autoria Câmara 2701–2725 — 2026-09-11

## Objetivo
Processar boundedamente 25 projetos únicos de autoria da Câmara, revalidar fontes oficiais com bytes/SHA-256 e manter causal/red-team fail-closed. Nenhuma autoria foi convertida em fato causal, voto, claim, score ou matriz.

## Lock, baseline e seleção
- Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; único writer confirmado; baseline `main` limpo no início.
- Seleção determinística: `offset=2700`, `limit=25`; 25 projetos únicos, 50 ocorrências candidato–projeto e 19 candidatos únicos.
- Nenhum documento cru foi versionado; conteúdo integral não foi lido/analisado (`content_read=false`).

## Fontes oficiais verificadas
- Câmara API: 50/50 endpoints oficiais HTTPS HTTP 200, bytes e SHA-256 preservados individualmente no manifesto.
- Identidade oficial `dados.id`: 25/25 exata, conferida contra o ID final de cada endpoint canônico.
- Texto integral: 25/25 URLs oficiais `www.camara.leg.br`, HTTP 200, bytes e SHA-256 preservados individualmente.
- Tramitação: 25/25 URLs independentes catalogadas; nenhum evento foi promovido a evento nominal vinculante.
- Totais de bytes registrados: 91148 bytes nos 50 endpoints API + 4763031 bytes nos 25 textos integrais.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2701-2725-source-manifest.json`.

## Lanes causal/red-team
- Causal: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Red-team: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Reconciliação: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Bloqueio real: sem validação editorial do texto integral, versão/evento vinculante e voto nominal individual. Autoria/ementa/tramitação não provam posição, efeito causal ou score.

## Artefatos e SHA-256
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2701-2725-source-manifest.json`: `d3b8cae26d33296d56ffbcc1d19dda56fe1b2517abd0ea0ddc5d50f8e1c5dbc0`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2701-2725-causal.json`: `411de569121e520839576f24515e3634448469f04fcf1a8ac845657fc12ff8ef`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2701-2725-redteam.json`: `ed7ec9649fc4802825af13af4b65acf4414d9ab432585c5b2448709ebaf143a4`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2701-2725-reconciled.json`: `d7c555d5648a9fe5c7619d838cf4fe28ded198c0bdf9061ca862b2555495398d`

## Checkpoint e segurança
- `projects_analyzed=2725`, `last_batch=2701-2725`, `next_batch=2726-2750`, `withheld=2725`, `pending_review=0`, `approved=0`, `blocked_items=113`.
- Bloqueio registrado: `authored-2701-2725-source-event-gap`.
- Nenhuma autoria factual pública, claim, voto, assessment, score ou matriz foi criada; `remote_apply=false`.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada; nenhuma escrita Supabase factual/editorial ocorreu.

## Gates locais
- Node `v24.19.0` em `/home/lourenco/.nvm/versions/node/v24.19.0/bin/node`.
- `npm run test -- --passWithNoTests`: 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: passou.
- `node scripts/validate-impact-schema.mjs`: passou.
- `npm run data:check`: passou, 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: passou, 245 módulos; sitemap 1003 candidatos + 2 estáticas.
- `git diff --check`: passou após restaurar churn não relacionado de `impact-editorial-*`.
- O build regenerou apenas artefatos ignorados; migrations/RLS/Auth/Storage/Edge Functions não foram tocadas.

## Fechamento de publicação
- Próxima etapa autorizada pelo arco contínuo: commit/push, CI/backup Cloudflare e confirmação de produção com SHA exato.

## Próximo passo
Próximo chunk calculado: autoria Câmara `2726–2750`; iniciar somente após fechar este lote.
