# QA — fila substantiva ALRS

**Data:** 2026-08-21

## Resultado

Fila gerada excluindo procedimentos e emendas:

- versões substantivas: **462**;
- votos factuais: **1398**;
- mérito confirmado oficialmente: **5**;
- mérito candidato aguardando confirmação: **457**;
- procedimentos/emendas: fora do score;
- colisões/títulos inválidos: fora do pacote;
- `pending_review` preservado;
- `remote_apply=false`.

## Artefato

```text
data/legislative-import/alrs/substantive-review-queue-v1.json
scripts/build-alrs-substantive-review-queue.mjs
scripts/__tests__/build-alrs-substantive-review-queue.test.mjs
npm run impact:alrs:r4:substantive
```

Esta é a fila correta para revisão de impacto. A fila completa continua sendo
usada para fatos legislativos e cobertura, mas não para score substantivo.
