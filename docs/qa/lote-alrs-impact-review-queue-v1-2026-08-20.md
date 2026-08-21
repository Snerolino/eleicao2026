# QA — fila ALRS de impacto por versão v1

**Data:** 2026-08-20
**Modo:** read-only; sem criação/aprovação de matriz

## Resultado

Fila gerada de forma event-first:

- **1281** versões ALRS sem matriz;
- **4000** votos factuais referenciados;
- **30** versões P0 com 7 candidatos;
- **82** versões P1 com 5 ou 6 candidatos;
- fontes oficiais ALRS preservadas por item;
- uma unidade de trabalho por `proposition_version`;
- matriz será reutilizada para todos os votantes da versão;
- triagem técnica preliminar: 479 `merit_candidate`, 218 `procedural_candidate` e 584 `needs_official_classification`;
- grupos, direção e `defending_vote` permanecem vazios até revisão.

## Ganho operacional

As 112 versões P0/P1 são o primeiro lote de maior alavancagem. Uma revisão de
cada versão pode desbloquear simultaneamente até 7 perfis, sem reanalisar votos
individuais.

## Contrato

```text
packet_type: alrs_impact_review_queue
methodology_version: 1.0.0
remote_apply: false
editorial_disposition: pending_review
event_type: needs_official_classification
```

## Artefatos

- `scripts/build-alrs-impact-review-queue.mjs`;
- `scripts/__tests__/build-alrs-impact-review-queue.test.mjs`;
- `data/legislative-import/alrs/impact-review-queue-v1.json`;
- comando `npm run impact:alrs:r4:queue`.

A triagem por título não é aprovação: a próxima etapa é confirmar nas fontes
oficiais mérito, emenda, destaque ou procedimento. Eventos procedimentais não
herdam impacto do projeto.
