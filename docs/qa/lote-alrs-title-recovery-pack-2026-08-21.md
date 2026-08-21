# QA — pacote ALRS de recuperação de títulos

**Data:** 2026-08-21

## Resultado

- itens para recuperação: **110**;
- títulos genéricos: **109**;
- títulos possivelmente truncados: **1**;
- fontes/eventos/candidate links preservados;
- `human_review_required=true`;
- `remote_apply=false`;
- nenhum item liberado para assessment.

## Artefato

```text
data/legislative-import/alrs/title-recovery-pack-v1.json
scripts/build-alrs-title-recovery-pack.mjs
scripts/__tests__/build-alrs-title-recovery-pack.test.mjs
npm run impact:alrs:r4:titles
```

A recuperação deve substituir o título genérico pelo título oficial da versão
votada e confirmar o texto/hash antes de liberar o item para mérito.
