# QA — pacote ALRS de mérito P0/P1

**Data:** 2026-08-20

## Resultado

A fila prioritária foi filtrada pela triagem técnica para separar candidatos a
mérito dos candidatos procedimentais/ambíguos.

- versões candidatas a mérito: **29**;
- votos factuais: **172**;
- P0: **5**;
- P1: **24**;
- grupos/direção/defending_vote: vazios;
- revisão oficial do evento: obrigatória;
- escrita remota: desabilitada.

Os demais 83 itens P0/P1 não foram descartados do histórico: permanecem na fila
prioritária original para confirmação oficial.

## Artefatos

```text
data/legislative-import/alrs/impact-merit-review-pack-p0-p1.json
scripts/build-alrs-merit-review-pack.mjs
scripts/__tests__/build-alrs-merit-review-pack.test.mjs
npm run impact:alrs:r4:merit
```

Depois da confirmação oficial, cada versão de mérito poderá receber uma matriz
única, reutilizada para todos os votantes.
