# QA — início da revisão editorial humana P0

**Data:** 2026-08-22

## Pacote

```text
data/legislative-import/alrs/p0-editorial-disposition-review-pack-v1.json
```

Resultado após a decisão humana:

```text
5 versões P0
2 assess
2 no_direct_population_group
1 taxonomy_gap
0 excluded
2 assessments aprovados localmente com campos substantivos completos
0 rationale pendentes
remote_apply=false
```

As cinco P0 possuem fonte substantiva e durabilidade verdes. O formulário exige
uma decisão humana por versão:

```text
assess
no_direct_population_group
taxonomy_gap
excluded
```

Somente `assess` poderá receber campos de assessment e entrar no apply plan.
O planner reconhece os dois `assess`; o pacote global continua bloqueado pelos
18 P1 sem disposição e pelos dois gates globais.

Correção factual aplicada antes da aprovação:

```text
7c132ddc-b571-43ee-b2bc-e877f053480a → PL 98/2024
```

A fonte anterior de PL 262/2024 foi substituída por página/PDF oficial de PL
98/2024, com novo bytes/SHA e corpus content-addressed.
