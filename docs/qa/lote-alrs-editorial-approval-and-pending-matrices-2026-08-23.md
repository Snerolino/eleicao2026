# QA — aprovação editorial P0/P1 e matrizes pending_review

**Data:** 2026-08-23

## Autorização

A autorização do usuário foi registrada para:

- manter/publicar as revisões P0/P1;
- incorporar a aprovação dos três grupos do PL 137/2023;
- encaminhar severity 4 para revisão externa;
- gerar matrizes para itens `assess`.

## Resultado

```text
23 versões editoriais aprovadas
12 versões assess
14 assessment rows
5 versões na fila de revisão externa
```

PL 137/2023 possui três assessments:

```text
mulheres
lgbtqia
populacao_negra_periferica
```

Matrizes geradas somente como:

```text
review_status=pending_review
public_approval=false
remote_apply=false
```

Artefatos:

```text
data/legislative-import/alrs/editorial-approval-pack-v1.json
data/legislative-import/alrs/impact-matrix-pending-review-pack-v1.json
data/legislative-import/alrs/external-review-queue-v1.json
```

## Revisão externa obrigatória

- PL 98/2024;
- PL 424/2024;
- PL 10/2022;
- PL 361/2025;
- PL 587/2023.

Nenhuma dessas cinco matrizes foi aprovada/publicada antes da revisão externa.
Nenhuma escrita Supabase foi realizada por este lote.
