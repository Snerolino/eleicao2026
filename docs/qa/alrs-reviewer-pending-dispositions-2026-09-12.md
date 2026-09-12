# Pacote para revisor ALRS — disposições e colisões pendentes

## Arquivo a enviar

```text
data/legislative-import/alrs/alrs-reviewer-pending-dispositions-v1.json
```

O pacote contém exatamente o estado remoto consultado em 2026-09-12:

- `105` itens pendentes;
- `56` versões P0/P1 sem disposição remota;
- `26` P0 pendentes;
- `30` P1 pendentes;
- `49` versões afetadas por colisões ainda sem disposição.

Itens já aprovados remotamente foram excluídos automaticamente.

## Contrato para P0/P1

Cada item deve receber exatamente uma disposição:

```text
assess
no_direct_population_group
taxonomy_gap
excluded
```

`assess` exige também:

```text
group_slug
impact_direction
defending_vote
severity
structural_type
confidence
rationale com pelo menos 20 caracteres
```

## Contrato para colisões

Cada item deve receber exatamente uma resolução:

```text
resolve_as_distinct_event
resolve_identity_mismatch
excluded
```

A resolução deve citar a evidência oficial de texto/hash/evento. Não usar
similaridade, nome aproximado ou inferência por data/número.

## Regras de publicação

- Não alterar `proposition_version_id` ou `review_key`.
- Não duplicar itens.
- Não aprovar matriz neste pacote.
- Não gerar score ou fan-out neste pacote.
- `remote_apply=false` até o JSON revisado passar validação de batch/hash.
- A aplicação será feita depois via `/admin`/RPC autenticada, com read-back e
  segunda passagem idempotente.

## Próximo gate

Devolver um JSON externo com `batch_id`, `batch_sha256` e decisões exatas por
ID/review key. Após validação, Hermes executará dry-run, apply autorizado,
read-back e prova de idempotência.
