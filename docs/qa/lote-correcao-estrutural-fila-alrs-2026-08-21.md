# QA — correções estruturais após revisão editorial ALRS

**Data:** 2026-08-21

## Correções aplicadas

- `review_key` único por `version_key#proposition_version_id`;
- `version_key_collision` explícito;
- colisão detectada em **64 itens** e bloqueada para revisão;
- `human_review_required=true` propagado na fila e derivados;
- `source_gate` renomeado para `factual_source_gate`;
- `candidate_source_links` preservado por candidato/evento/fonte;
- `title_quality` adicionado:
  - `generic`: 109;
  - `possibly_truncated`: 1;
  - `complete_or_unverified`: 1171.

## Estado editorial

- nenhuma matriz aprovada por este lote;
- nenhum assessment criado remotamente;
- `pending_review` preservado;
- scores não calculados para esses itens;
- eventos procedimentais continuam separados.
- gate `npm run impact:alrs:r4:validate` rejeita o pacote de mérito enquanto houver colisão, título incompleto, fonte factual não verde ou revisão humana ausente.

## Reexecução

Todos os pacotes derivados foram regenerados após as correções:

```text
fila completa
→ P0/P1
→ mérito
→ fontes
→ matriz
→ grupos
→ drafts
→ propostas
```

## Próximo gate

Resolver as 64 colisões de `version_key` com o texto oficial da versão e confirmar
os 109 títulos genéricos/1 truncado antes de qualquer aprovação substantiva.
