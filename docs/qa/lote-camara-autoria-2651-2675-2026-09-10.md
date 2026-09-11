# QA — autoria Câmara 2651–2675 — 2026-09-10

## Objetivo
Processar o próximo lote determinístico de autoria Câmara, validando fontes oficiais e mantendo as lanes causal/red-team fail-closed. Autoria não foi convertida em fato causal, voto, claim, score ou matriz.

## Lock, baseline e seleção
- Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; único writer confirmado.
- Baseline Git: `main` no SHA `60cdff7ee368082eff1f3a2ae23bcf454ef1ad22`; worktree limpa antes da geração.
- Seleção determinística: `offset=2650`, `limit=25`; 25 projetos únicos, 50 ocorrências candidato–projeto e 17 candidatos únicos.
- Nenhum documento cru foi versionado; conteúdo integral não foi lido/analisado (`content_read=false`).

## Fontes oficiais verificadas
- Câmara API: 50/50 endpoints HTTPS oficiais HTTP 200 (proposição e tramitação), 91,201 bytes totais e SHA-256 individual preservado no manifesto.
- Identidade oficial `dados.id`: 25/25 exata, comparada ao ID final do identificador canônico do projeto.
- Texto integral: 25/25 URLs oficiais `www.camara.leg.br`, HTTP 2xx, 5,227,128 bytes totais e SHA-256 individual preservado.
- Tramitação permaneceu independente do texto integral (`event_url != full_text_url`); nenhum evento foi promovido a evento nominal vinculante.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2651-2675-source-manifest.json`.

## Lanes causal/red-team
- Causal: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Red-team: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Reconciliação: 25/25 IDs exatos; 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; `content_read=false`, `remote_apply=false`.
- Bloqueio real: sem validação editorial do texto integral, versão/evento vinculante e voto nominal individual. Autoria/ementa/tramitação não provam posição, efeito causal ou score.

## Artefatos e SHA-256
- `camara-authored-2651-2675-source-manifest.json`: `b3501cd3a020a4c003a1a35bd8b739f7118956d79e39ef01742d988ec89a6b7d`
- `camara-authored-2651-2675-causal.json`: `87d47d10998361f9045e334ad4b3c947db370097335338a4c22d01b5d231bd15`
- `camara-authored-2651-2675-redteam.json`: `9a7dd9d7f93fa90f72c9a28cf5bcce9090650a4f78b068f6b4f948ee57688884`
- `camara-authored-2651-2675-reconciled.json`: `01e07076aeab09d2130e9cfb823280aeab566f6da79f96bb60f075d2ba28eba9`

## Checkpoint e segurança
- `projects_analyzed=2675`, `last_batch=2651-2675`, `next_batch=2676-2700`, `withheld=2675`, `pending_review=0`, `approved=0`, `blocked_items=111`.
- Bloqueio registrado: `authored-2651-2675-source-event-gap`.
- Nenhuma autoria factual pública, claim, voto, assessment, score ou matriz foi criada; `remote_apply=false`.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada; nenhuma escrita Supabase factual/editorial ocorreu.

## Gates locais
- Node `v24.19.0` confirmado para os gates.
- Artefatos validados programaticamente: 25 projetos, 50 endpoints API, 25 textos, 25 IDs exatos, 25 `withheld`, zero `approved`/`pending_review`/`score_eligible`.
- Gates verdes em Node 24.19.0: `npm run test` 499/499 em 120 arquivos; `npx tsc --noEmit` RC 0; `node scripts/validate-impact-schema.mjs` RC 0; `npm run data:check` RC 0 (1003 candidaturas, 988 fotos); `npm run build` RC 0 (245 módulos, sitemap 1003+2); `git diff --check` RC 0.
- O build gerou churn não relacionado nos três artefatos `impact-editorial-*`; todos foram restaurados antes do fechamento.

## Próximo passo
Após os gates verdes, commit/push, CI/backup Cloudflare e validação de produção pelo SHA exato. Encerrar este lote antes de iniciar `2676–2700`.
