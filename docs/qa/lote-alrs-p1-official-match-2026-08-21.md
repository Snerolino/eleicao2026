# QA — matching oficial P1 ALRS

**Data:** 2026-08-21

## Resultado

- itens P1: **20**;
- `matched_official_identity`: **19**;
- múltiplos candidatos oficiais: **1**;
- sem correspondência: **0**;
- fonte: `data-item` oficial ALRS;
- escrita remota: nenhuma.

Múltiplos registros da mesma matéria por parlamentar não são tratados como
ambiguidade; a chave estruturada tipo/número/ano foi usada para deduplicar a
identidade da proposição. O único item ainda múltiplo permanece `human_review_required`.

## Artefato

```text
data/legislative-import/alrs/p1-official-match-report.json
scripts/match-alrs-p1-official-evidence.mjs
npm run impact:alrs:r4:p1:match
```
