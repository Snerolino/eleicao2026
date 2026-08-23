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

## Verificação independente

- `npm run impact:alrs:r4:editorial:approve`: RC 0; `23` versões, `12` assess, `14` assessment rows, `5` na fila externa.
- `npm run impact:alrs:r4:matrix:pending`: RC 0; `12` matrizes, `14` assessment rows, `5` com revisão externa.
- Reexecução dos dois builders: hashes dos três artefatos permaneceram idênticos (idempotência comprovada).
- `npm run test`: RC 0; `401` testes em `98` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: RC 0; `224` módulos, sitemap `1003 + 2`, `release.json` local `556420f-20260823T064034169Z`.
- `npm run smoke:local`: RC 0; `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto.
- Diff read-only contra `../dataset2026`: CSV/snapshot `1003/1003`, diferença `0/0`, CSV SHA `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Auditoria de fontes RC 0 preserva gaps reais: versões sem fonte `1251/3/112`, eventos `1647/2/188`, votos `4/2/455` para ALRS/Câmara/Senado.
- ALRS FED-17 residual dry-run RC 0: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
