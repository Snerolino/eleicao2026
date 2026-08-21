# QA — evidência oficial estruturada P1 ALRS

**Data:** 2026-08-21

## Resultado

- pacote P1: 20 versões/109 votos;
- páginas oficiais consultadas: 7;
- HTTP 200: 7/7;
- `data-item` estruturados: 526;
- campos factuais: deputado, data, tipo, número, ano, matéria, voto e resultado;
- bytes/SHA por página registrados;
- nenhuma matriz/assessment criado.

## Artefato

```text
data/legislative-import/alrs/p1-official-event-evidence.json
scripts/extract-alrs-p1-official-evidence.mjs
npm run impact:alrs:r4:p1:evidence
```

O próximo passo é classificar os 20 P1 por tipo oficial e separar mérito,
procedimento e emenda antes de qualquer avaliação populacional.
