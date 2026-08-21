# QA — evidência oficial estruturada do P0 ALRS

**Data:** 2026-08-21

## Resultado

As 7 páginas oficiais ALRS dos cinco itens P0 foram reextraídas e parseadas por
`data-item` estruturado:

- URLs: **7**;
- HTTP 200: **7/7**;
- registros oficiais estruturados: **526**;
- campos preservados: `nomeDeputado`, `dataVotacao`, `tipoProjeto`,
  `numProposicao`, `anoProposicao`, `materia`, `voto` e `resultadoVotacao`;
- SHA-256 e bytes por página registrados.

## Artefato

```text
data/legislative-import/alrs/p0-official-event-evidence.json
scripts/extract-alrs-p0-official-evidence.mjs
npm run impact:alrs:r4:p0:evidence
```

A evidência é factual e read-only. Ela ainda não aprova impacto: o próximo passo
é reconciliar `tipoProjeto/numProposicao/anoProposicao` com cada
`proposition_version` e confirmar mérito/emenda/destaque/procedimento.

Atualização dos scouts: os 30 itens P0 foram classificados oficialmente como
9 mérito, 19 procedimento e 2 emenda; não houve destaque nem item sem
classificação. Procedimentos permanecem fora do score e emendas seguem trilha
própria, sem herdar automaticamente o mérito.
