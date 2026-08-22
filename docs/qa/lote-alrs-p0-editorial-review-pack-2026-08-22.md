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
2 assessments com campos substantivos preenchidos
3 rationale ainda pendentes
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
O planner bloqueia os dois `assess` até receber os rationale obrigatórios.
