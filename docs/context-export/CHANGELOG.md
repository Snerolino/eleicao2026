# Changelog do contexto exportado

## 2026-08-10

- Fase 0 Matriz de Impacto Populacional v1: contrato/metodologia/governança/JSON Schema definidos em branch feat/matriz-impacto-populacional-v1.
- Fase 1: testes (42) + `src/domain/impact/` (contract, alignment, score, review-gates).
- Migrations 2026081009xxxx aplicadas: núcleo legislativo, vocabulário, matriz, revisão e RLS/RPC — schema expandido (ver SCHEMA.md).
- Nenhuma alteração remota; tudo local/na branch.

## 2026-08-04

- Criada a superficie curada `docs/context-export`.
- Exportados os requisitos do Agente Dossies v2 e do build do coletor.
- Documentado o schema atual de `candidates`, `raw_documents`,
  `source_references`, `claims` e workflow editorial.
- Registradas incompatibilidades importantes: `pending_review` e o status real,
  `claims.source_document_id` aponta para `source_references`, e
  `confidence_score` continua obrigatorio.
- Nenhuma credencial ou dado de producao foi incluido.
