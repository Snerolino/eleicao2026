# Persistência de Score/Alinhamento — Desenho v1 (Fase 2, Task 5)

Data: 2026-08-12
Status: `design_only` — nenhum SQL de migration, RPC ou grant foi criado ou aplicado.
Gate: revisão humana obrigatória antes de qualquer implementação remota.

## Princípio

`alignment` e `score` são **derivados, recalculáveis e nunca fatos primários**.
As funções puras já existem e são a única fonte de cálculo:

- `src/domain/impact/alignment.ts` — `deriveAlignment(vote, assessment)`;
- `src/domain/impact/score.ts` — `computeScore(inputs, methodologyVersion)`.

A persistência futura deve guardar **resultados** (snapshots), não interpretações
manuais. Mudança de `methodology_version`, de assessments aprovados ou de votos
factuais implica recálculo, nunca edição manual do resultado.

## Escopo desta task

Este documento **fecha o desenho** (contrato de dados, chaves, RLS, RPC de
re cálculo e gates). Não cria migration, não altera schema e não toca no remoto.

## Entidade conceitual: `impact_score_snapshots` (rascunho, não migration)

```sql
-- RASCUNHO CONCEITUAL — NÃO é migration. Requer revisão humana e autorização
-- antes de virar SQL aplicável.
create table impact_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  legislator_key text not null,          -- deputy_id externo (sem PII)
  group_slug text not null references beneficiary_groups(slug),
  methodology_version text not null
    check (methodology_version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  score numeric check (score is null or score between -1 and 1),
  evaluated_propositions integer not null check (evaluated_propositions >= 0),
  eligible_weight numeric not null check (eligible_weight >= 0),
  excluded_no_data integer not null default 0 check (excluded_no_data >= 0),
  contested_assessments integer not null default 0 check (contested_assessments >= 0),
  average_confidence numeric
    check (average_confidence is null or average_confidence between 0 and 1),
  computed_at timestamptz not null default now(),
  unique (legislator_key, group_slug, methodology_version)
);
```

Campos espelham exatamente `ScoreResult` de `src/domain/impact/score.ts`:

| Campo SQL | Campo `ScoreResult` | Nota |
|---|---|---|
| `score` | `score` | `null` = indisponível (sem peso elegível), nunca 0 |
| `evaluated_propositions` | `evaluated_propositions` | total de proposições consideradas |
| `eligible_weight` | `eligible_weight` | denominador efetivo |
| `excluded_no_data` | `excluded_no_data` | `sem_dado` + `nao_avaliavel` |
| `contested_assessments` | `contested_assessments` | assessments contestados incluídos |
| `average_confidence` | `average_confidence` | robustez média, sem ponderar score |

`legislator_key` é a referência lógica externa do parlamentar (ex.: `deputy-rs-001`),
não UUID local e não dados pessoais. O vínculo `legislator_id`/`candidate_id` do
`legislative_votes` continua sendo resolvido fora deste desenho.

## Identidade e versionamento

- Chave idempotente: `(legislator_key, group_slug, methodology_version)`.
- `methodology_version` obrigatória: resultados de metodologias diferentes
  **coexistem** (não sobrescrevem).
- Recalcular não apaga histórico: usa `upsert` na chave acima; auditoria de
  mudança fica em tabela de eventos futura, fora deste escopo.

## RLS proposta (rascunho conceitual)

- Leitura pública: somente resultados cujos assessments/versões estejam
  `approved` ou `contested` (mesma regra das `impact_matrices`).
- Escrita: somente `service_role` via RPC de recálculo; nenhum caminho anon,
  editor direto ou script de coleta.

## RPC conceitual: `recompute_impact_scores(p_legislator_key, p_group_slug, p_methodology_version)`

1. Coleta votos factuais do legislador ligados a versões votadas.
2. Para cada versão, obtém a matriz `approved|contested` vigente da metodologia.
3. Deriva alinhamentos via `deriveAlignment` (regras v1 espelhadas em SQL ou
   chamada à lib, conforme decisão de implementação futura).
4. Calcula `computeScore` e grava via upsert na chave idempotente.
5. Nunca altera `legislative_votes`, `impact_matrices` nem `impact_assessments`.

A implementação da RPC **não é parte deste arco**: permanece gate humano.

## Invariantes de contrato (cobertas por teste)

1. `score` é `null` quando não há peso elegível — nunca `0` por ausência de dado.
2. `contested_assessments` soma, não exclui (metodologia v1).
3. `confidence` não pondera o score; `average_confidence` é reportado à parte.
4. A mesma entrada (votos + matriz) produz o mesmo snapshot (determinismo).
5. O snapshot nunca contém `impact`, `alignment` bruto por voto, `ideology`,
   `recommendation`, `group` fora do slug controlado, nem dados pessoais.
6. `methodology_version` inválida ou ausente rejeita o snapshot.

## Gates

- Migration, grants, RLS remoto e RPC `recompute_impact_scores` exigem
  autorização humana específica — não foram executados.
- `docs/context-export/SCHEMA.md` só deve ser atualizado quando o schema real
  mudar; este documento é o desenho prévio.
