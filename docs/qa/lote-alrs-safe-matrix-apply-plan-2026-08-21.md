# QA — plano seguro de aplicação de matrizes ALRS

**Data:** 2026-08-21

## Writer local

Foi criado um planejador fail-closed para impedir qualquer aplicação prematura:

```bash
npm run impact:alrs:r4:matrix:plan
```

O comando só gera plano executável quando todos os itens têm:

- pacote `approved`;
- `public_approval=true`;
- `version_key_collision=false`;
- `factual_source_gate=green`;
- `human_review_required=true`;
- `editorial_status=approved`;
- assessments preenchidos.

## Verificação atual

O pacote ALRS atual foi corretamente rejeitado:

```text
ok=false
errors=64
planned_versions=29
remote_apply=false
```

Os erros correspondem às colisões ainda não resolvidas. Nenhuma matriz foi
aplicada ou publicada.

## Artefatos

```text
scripts/plan-alrs-matrix-apply.mjs
scripts/__tests__/plan-alrs-matrix-apply.test.mjs
data/legislative-import/alrs/impact-matrix-apply-plan.json
npm run impact:alrs:r4:matrix:plan
```
