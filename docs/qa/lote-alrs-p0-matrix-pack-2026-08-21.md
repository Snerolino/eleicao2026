# QA — pacote editorial P0 ALRS

**Data:** 2026-08-21

## Resultado

- 5 versões P0 sem colisão;
- 40 votos factuais;
- até 7 candidatos por versão;
- fontes factuais verificadas;
- `review_batch=P0-first-editorial-review`;
- `human_review_required=true`;
- `editorial_status=pending_review`;
- nenhuma matriz aprovada;
- nenhuma escrita remota.
- revalidação oficial: **5/5** `official_version_confirmed=true`;

## Objetivo

Reduzir o primeiro ciclo editorial às versões com maior alavancagem. Uma matriz
por versão será reutilizada para todos os candidatos votantes daquele evento.

## Artefato

```text
data/legislative-import/alrs/impact-matrix-review-pack-p0-only.json
scripts/build-alrs-p0-matrix-pack.mjs
scripts/__tests__/build-alrs-p0-matrix-pack.test.mjs
npm run impact:alrs:r4:p0
```
