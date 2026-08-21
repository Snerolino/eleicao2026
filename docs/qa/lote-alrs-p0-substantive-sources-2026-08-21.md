# QA — fontes substantivas oficiais P0 ALRS

**Data:** 2026-08-21

## Resultado

- 5 versões P0;
- 5/5 páginas oficiais de proposição HTTP 200;
- 5/5 documentos substantivos HTTP 200;
- hashes/bytes registrados;
- `substantive_source_gate=green`: **5/5**;
- assessments ainda `pending_review`;
- nenhuma matriz/assessment remoto criado.

## Fontes

As fontes incluem páginas oficiais `ww4.al.rs.gov.br/proposicao/...` e documentos
oficiais PDF do armazenamento ALRS, separados das páginas de votos.

## Artefatos

```text
data/legislative-import/alrs/p0-substantive-source-manifest.json
data/legislative-import/alrs/p0-substantive-matrix-review-pack-v1.json
scripts/build-alrs-p0-substantive-matrix-pack.mjs
npm run impact:alrs:r4:p0:substantive
npm run impact:alrs:r4:substantive:sources data/legislative-import/alrs/p0-substantive-matrix-review-pack-v1.json
```
