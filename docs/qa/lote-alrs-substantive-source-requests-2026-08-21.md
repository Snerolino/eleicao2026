# QA — requisições de fontes substantivas ALRS

**Data:** 2026-08-21

## Resultado

- 7 requisições de fonte substantiva;
- 6 versões P1;
- 5 versões P0 excluídas por já possuírem fonte substantiva verde;
- grupos/assessments vinculados preservados;
- fontes factuais de voto separadas;
- requisitos por item:
  - texto integral da versão;
  - parecer ou substitutivo;
  - resultado oficial/tramitação;
- `source_request_status=pending_substantive_source`;
- `human_review_required=true`;
- `remote_apply=false`.

## Artefato

```text
data/legislative-import/alrs/substantive-source-request-pack-v1.json
scripts/build-alrs-substantive-source-request-pack.mjs
npm run impact:alrs:r4:substantive:requests
```
