# QA — requisições de fontes substantivas ALRS

**Data:** 2026-08-21

## Resultado

- 18 requisições de fonte substantiva;
- 18 versões P1;
- 5 versões P0 excluídas por já possuírem fonte substantiva verde;
- fontes factuais preservadas de `source_urls`/`candidate_source_links`, incluindo `official_vote_source_reference_ids`;
- uma coleta por versão; `requested_for_groups` preserva os grupos candidatos quando existirem;
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
