# QA — revisão estrutural pós-checkpoint publicado

**Data:** 2026-08-22

## Correções locais aplicadas

- planner renomeia `reviewed_versions` para `input_versions`;
- fila renomeia `uncovered_merit_versions` para `versions_without_preidentified_groups`;
- disposição editorial explícita: `assess`, `no_direct_population_group`, `taxonomy_gap`, `excluded`;
- somente `assess` exige assessment e entra no apply plan;
- fila substantiva cobre **18/18 versões P1**;
- uma coleta por versão, com `requested_for_groups` para múltiplos grupos;
- fontes de voto preservam URLs e IDs de `source_reference`.

## Segurança Supabase

Migration local preparada:

```text
supabase/migrations/20260822120000_harden_impact_approval_and_legislators_rls.sql
```

Ela ainda **não foi aplicada remotamente**. Inclui:

- caller editor obrigatório em `approve_impact_matrix`;
- helpers internos sem `PUBLIC/anon/authenticated EXECUTE`;
- RLS e política de leitura explícita em `public.legislators`;
- remoção da lógica semântica que usava `generated_by_ai` para representar ausência de grupo.

## Auditoria de dependências

`npm run security:audit` não conseguiu consultar o registry por falha DNS:

```text
registry.npmjs.org → ENOTFOUND
```

Nenhuma vulnerabilidade nova foi afirmada com base nessa execução incompleta.

## Estado remoto

Nenhuma migration ou dado editorial foi aplicado. O score de impacto ALRS continua nulo.
