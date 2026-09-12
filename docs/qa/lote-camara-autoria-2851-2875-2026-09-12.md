# Lote Câmara 2851–2875 e supervisor no-stop — 2026-09-12

## Objetivo

Implementar retomada durável das lanes e processar o próximo lote de autoria da Câmara sem promover fatos editoriais sem evento vinculante e voto nominal.

## Robustez entregue

- `scripts/orchestrator/no-stop-supervisor.sh` adquire lock exclusivo e encerra sem mutar quando outro writer está ativo.
- `scripts/no-stop-supervisor.mjs` mantém estado atômico em `.orchestrator/runtime/no-stop/state.json`, retoma a lane interrompida, usa até três tentativas por lane e registra `running`, `retrying`, `interrupted`, `blocked` e `completed`.
- O job Hermes `c4278be3a8a5` foi convertido para `no-stop-supervisor.py`, `no_agent=true`, `every 5m`, `repeat=forever`, com `workdir` da worktree. Não foi criado supervisor duplicado.
- A aplicação factual e a matriz/score continuam explicitamente bloqueadas por seus gates próprios; nenhuma escrita remota ocorreu.

## Lote processado

- Intervalo: `2851–2875`.
- Projetos únicos: `25`.
- Ocorrências candidato–projeto: `50`.
- Identidades exatas: `25/25`.
- API oficial de proposições HTTP 200: `25/25`.
- Texto integral oficial HTTP 200: `25/25`.
- Tramitação oficial HTTP 200: `25/25`.
- Evento independente vinculante: `0`; `25` permaneceram bloqueados.
- Causal: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Red-team: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- Reconciliado: `25 withheld`, `0 pending_review`, `0 approved`, `0 score_eligible`.
- `content_read=false`; `remote_apply=false`.

Artefatos:

- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2851-2875-source-manifest.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2851-2875-causal.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2851-2875-redteam.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2851-2875-reconciled.json`

Checkpoint atualizado atomicamente:

- `projects_analyzed=2875`
- `last_batch=2851-2875`
- `next_batch=2876-2900`
- `withheld=2875`

## Gates

- `npm run test -- --passWithNoTests`: `499/499` testes em `120` arquivos.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: snapshot válido, `1003` candidaturas e `988` fotos oficiais.
- `npm run build`: verde; `246` módulos, sitemap com `1003` candidatos + `2` URLs estáticas.
- `git diff --check`: verde.

## Bloqueios

A autoria, ementa e tramitação não provam posição legislativa, efeito causal ou score. A ausência de evento independente e voto nominal mantém o lote em `withheld`. Nenhuma aprovação, fan-out, score ou aplicação factual foi executada.
