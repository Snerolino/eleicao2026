# QA — fila ALRS prioritária compacta P0/P1

**Data:** 2026-08-20

Foi criada uma fila compacta para reduzir custo de revisão e evitar enviar as
1281 versões completas a cada agente.

## Resultado

- 112 versões prioritárias;
- 30 P0 com 7 candidatos;
- 82 P1 com 5–6 candidatos;
- 671 votos factuais;
- URLs deduplicadas por item;
- uma matriz por versão;
- grupos/direção/defending_vote continuam vazios;
- nenhuma escrita remota.

## Artefatos

```text
data/legislative-import/alrs/impact-review-priority-p0-p1.json
scripts/build-alrs-priority-review-queue.mjs
scripts/__tests__/build-alrs-priority-review-queue.test.mjs
npm run impact:alrs:r4:priority
```

A fila completa continua preservada. A fila prioritária é apenas uma visão de
trabalho para os scouts e revisores; não altera cobertura factual.
