# QA — pacote de revisão de matrizes ALRS P0/P1

**Data:** 2026-08-20

## Resultado

- 29 versões candidatas a mérito;
- 172 votos factuais reutilizáveis;
- 12 URLs oficiais únicas verificadas;
- HTTP 200: 12/12;
- gate de fonte verde: 29/29 itens;
- uma entrada de matriz por `proposition_version`;
- assessments: 0 preenchidos automaticamente;
- `remote_apply=false`;
- revisão de evento oficial ainda obrigatória.

## Artefato

```text
data/legislative-import/alrs/impact-matrix-review-pack-p0-p1.json
scripts/build-alrs-impact-matrix-review-pack.mjs
npm run impact:alrs:r4:matrix:pack
```

O pacote está pronto para revisão por versão. Após a revisão, o mesmo assessment
será reutilizado para todos os candidatos que votaram no evento, sem reprocessar
voto individual.
