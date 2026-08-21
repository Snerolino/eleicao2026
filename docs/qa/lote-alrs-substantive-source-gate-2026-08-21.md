# QA — gate de fontes substantivas ALRS

**Data:** 2026-08-21

## Resultado

O novo gate rejeitou o pacote de 25 versões porque todos possuem apenas páginas
oficiais de votos, não fontes substantivas do texto/efeito da proposição:

```text
ok=false
25/25 substantive_source_missing
25/25 substantive_gate_blocked
```

Isso é esperado e impede que página de votação seja confundida com fundamento de
impacto.

## Artefatos

```text
scripts/validate-alrs-substantive-sources.mjs
scripts/__tests__/validate-alrs-substantive-sources.test.mjs
npm run impact:alrs:r4:substantive:sources
```

O gate só será liberado quando cada assessment possuir fonte substantiva adequada,
além da fonte factual do voto.
