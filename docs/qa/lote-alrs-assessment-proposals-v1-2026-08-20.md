# QA — propostas preliminares de assessments ALRS

**Data:** 2026-08-20

## Resultado

- 12 versões;
- 13 propostas de assessment;
- direção/voto defensor/severidade/tipo/confiança/rationale preliminares;
- todas `proposal_status=needs_human_review`;
- `review_status=pending_review`;
- `remote_apply=false`;
- nenhuma matriz ou assessment remoto criado.

As propostas são baseadas no objeto/título oficial e reduzem o trabalho repetitivo
do revisor. Antes de aprovação, é obrigatório confirmar o texto integral, o tipo
do evento, a direção e o voto defensor.

## Artefato

```text
data/legislative-import/alrs/impact-assessment-proposal-pack-v1.json
scripts/build-alrs-assessment-proposal-pack.mjs
scripts/__tests__/build-alrs-assessment-proposal-pack.test.mjs
npm run impact:alrs:r4:assessment:proposals
```
