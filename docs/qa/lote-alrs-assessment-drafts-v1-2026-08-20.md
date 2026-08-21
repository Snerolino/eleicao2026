# QA — drafts de assessments ALRS v1

**Data:** 2026-08-20

## Resultado

- 12 versões ALRS com grupo candidato;
- 70 votos factuais reutilizáveis;
- 13 drafts de assessment;
- fontes oficiais preservadas;
- `impact_direction=null`;
- `defending_vote=null`;
- `severity=null`;
- `structural_type=null`;
- `rationale=null`;
- status: `needs_editorial_decision`;
- nenhuma matriz ou assessment remoto criado.

## Artefato

```text
data/legislative-import/alrs/impact-assessment-draft-pack-v1.json
scripts/build-alrs-assessment-draft-pack.mjs
scripts/__tests__/build-alrs-assessment-draft-pack.test.mjs
npm run impact:alrs:r4:assessment:drafts
```

O pacote economiza o trabalho repetitivo: o revisor decide uma vez por grupo e
versão; depois o score é reutilizado para todos os candidatos votantes.
