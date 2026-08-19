# QA — verificação de release do catálogo Senado

**Data:** 2026-08-19 UTC  
**Status:** produção propagada e verificada

## Objetivo

Confirmar a propagação do commit que registrou o catálogo/reconciliação nominal do Senado, sem confundir o run anterior com o release efetivamente servido em produção.

## Evidência GitHub/Cloudflare

- `HEAD` local e `origin/main`: `a42567c0a661f19785dfd941273f4638db498d3d`.
- Workflow backup `334951434`, run `32217488055`: `status=completed`, `conclusion=success`, `headSha=46c94ffd146a825629eba31d194ee9e6e1797f6c`.
- Workflow backup `334951434`, run `32217515668`: `status=completed`, `conclusion=success`, `headSha=a42567c0a661f19785dfd941273f4638db498d3d`.
- Runs `32217522901` e `32217695574` para o mesmo SHA terminaram `skipped`; não foram usados como prova de deploy.

## Produção

- `https://rs.votopraquem.org`: HTTP 200.
- `https://rs.votopraquem.org/release.json`: HTTP 200.
- `release.json.sha`: `a42567c0a661f19785dfd941273f4638db498d3d`.
- `release_id`: `a42567c-20260819T045709073Z`.
- `version`: `0.2.388`.
- `snapshot.row_count`: `1003`.

A correspondência entre `release.json.sha`, `origin/main` e o SHA atual confirma a propagação do release.

## Integridade e escopo

Nenhum dado legislativo foi aplicado neste tick. O catálogo Senado continua fail-closed: as seis `source_references` remotas permanecem ausentes, conforme QA anterior; não houve criação de UUID, FK, voto, proposição, evento, matriz, claim ou alteração remota.

## Próximo passo

Preparar, em dry-run, o catálogo idempotente das seis fontes oficiais do Senado; antes de qualquer `--apply`, refazer GETs, validar HTTP/bytes/SHA-256, confirmar schema/FK e provar idempotência.
