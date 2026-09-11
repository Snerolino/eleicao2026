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

## Gates locais — executados
- Node `v24.19.0` confirmado; `npm run orch:doctor` terminou `FAIL=0`, com WARNs apenas para OpenCode ausente, worktree suja e smoke Codex não exercitado.
- `npm run test -- --passWithNoTests`: **499/499 testes**, 120 arquivos, exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: checkpoint OK; fixtures boas aceitas e ruins rejeitadas.
- `npm run data:check`: exit 0; snapshot bruto `1003` candidaturas e `988` fotos oficiais.
- `npm run build`: exit 0; `245` módulos, sitemap `1003 + 2` URLs, PWA gerada.
- `npm run smoke:local`: exit 0; `1002` cards visíveis, 0 falhas HTTP e 0 erros de console online.
- `git diff --check`: exit 0.
- Churn de build/release e alterações preexistentes em arquivos `impact-editorial-*` foram preservados fora do escopo deste lote.

## Próximo passo
Após os gates verdes, commit/push, CI/backup Cloudflare e validação de produção pelo SHA exato. Encerrar este lote antes de iniciar `2676–2700`.
