# QA — saldo metodológico por categoria na comparação

**Data:** 2026-08-20

## Entregue

- `src/domain/impact/vote-category-score.ts`
  - deriva alinhamento com `deriveAlignment`;
  - aplica peso v1 por `severity` e `structural_type`;
  - exclui `sem_dado`/`nao_avaliavel` do denominador;
  - retorna `null` sem peso elegível;
  - não pondera `confidence`.
- `src/services/voteCategoryComparison.ts`
  - consulta assessments aprovados/contestados com fonte;
  - monta fatos por candidato/casa/grupo.
- `ComparePage`
  - exibe saldo por categoria no formato `+0,62`/`-0,08`;
  - exibe `não avaliado` em vez de zero artificial.

## Gates

- focais: **9/9 testes**;
- suíte completa: **83 arquivos / 374 testes**;
- TypeScript: passou;
- build: passou;
- fatos nominais permanecem separados do score.
