# QA — Batch 001 V2 incremental e apply autenticado

**Data:** 2026-08-24

## Correções bounded

- `canonical_editorial_key` adicionada como `house:type:number:year:text_hash`.
- versões resolvidas por disposição/matriz remota são excluídas;
- aliases conhecidos de PL 98/2024, PL 125/2021, PL 10/2022, PL 100/2025 e duplicações internas são excluídos;
- slots humanos usam somente `source_gate=green`;
- itens sem fonte verde foram separados para aquisição automática;
- métricas diferenciam ocorrências, candidatos únicos e perfis novos;
- decisões são validadas por `batch_id`, `batch_sha256` e `review_key`.

## Batch regenerado após canonicalização

```text
batch_id=alrs-impact-editorial-batch-001-v2
batch_sha256=0dc53bc94b568b9d0fdc90260e70aec1cf3438f970077af6f6ccc178dbd466a7
proposals=2
candidate_occurrences=14
unique_candidates=7
new_profiles_impacted=0
factual_votes=19
```

A palavra `transversalidade` não aciona mais `assess`; a matéria foi classificada
como `taxonomy_gap` por recomendação conservadora.

A aquisição automática permanece separada:

```text
1173 itens
```

Idempotência: segunda execução produziu diff zero.

## Apply autenticado aceita JSON de decisão externa e valida o lote antes de aplicar:

```text
batch_id
batch_sha256
review_key
```

Somente `approved` chama `record_impact_editorial_disposition()` via sessão
Supabase Auth/RLS. `needs_changes` permanece exceção. `assess` encerra somente
a disposição e segue para assessment; não cria matriz incompleta.
