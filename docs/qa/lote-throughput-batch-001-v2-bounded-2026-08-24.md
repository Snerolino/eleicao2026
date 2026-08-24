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

## Batch regenerado

```text
batch_id=alrs-impact-editorial-batch-001-v2
batch_sha256=51bd632f15040ca90351f65fe1b9ddc7fe36511a125147f9189885e11d3540c0
proposals=3
candidate_occurrences=21
unique_candidates=7
new_profiles_impacted=0
factual_votes=26
```

Idempotência:

```text
a segunda execução produziu diff zero
```

Lane paralela:

```text
impact-source-acquisition-queue-v1.json
1173 itens sem fonte verde ocupando slots do reviewer
```

## Apply autenticado

O `/admin` agora aceita JSON de decisão externa e valida o lote antes de aplicar:

```text
batch_id
batch_sha256
review_key
```

Somente `approved` chama `record_impact_editorial_disposition()` via sessão
Supabase Auth/RLS. `needs_changes` permanece exceção. `assess` encerra somente
a disposição e segue para assessment; não cria matriz incompleta.
