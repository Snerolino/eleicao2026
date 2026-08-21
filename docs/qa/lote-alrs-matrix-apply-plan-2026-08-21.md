# QA — plano local de aplicação da matriz ALRS (fail-closed)

**Data:** 2026-08-21

## Resultado

- `npm run impact:alrs:r4:apply:plan` terminou com bloqueio esperado (`exit 2`).
- 29 versões avaliadas; 64 erros de gate.
- `remote_apply=false` e `plan=[]`; nenhuma mutação remota ocorreu.
- Bloqueios principais: pacote não aprovado, aprovação pública ausente, 29 itens sem assessment/editorial aprovado e colisões nas posições 7, 14, 16 e 22.

## Artefatos

- `scripts/plan-alrs-matrix-apply.mjs`
- `scripts/__tests__/plan-alrs-matrix-apply.test.mjs` — 2 testes verdes
- `data/legislative-import/alrs/impact-matrix-apply-plan.json`

## Próximo passo

Resolver títulos/fontes/colisões e obter revisão/aprovação exigidas antes de
qualquer plano aplicável. Não executar escrita factual enquanto os gates R0,
schema/FK, fonte oficial, dry-run e idempotência não estiverem verdes.
