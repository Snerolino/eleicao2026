# QA — FED-10: votos nominais ALRS

**Data:** 2026-08-18
**Status:** aplicado e reprocessado de forma idempotente

## Coleta oficial

Fonte: `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`

- 8 IDs do catálogo ALRS consultados
- 7 deputados retornaram dados
- 1 ID não respondeu (`999999`), mantido fora do envelope
- 526 `data-item` processados
- 0 `pending_matches`
- 7 fontes oficiais HTML distintas

## Envelope factual

- 102 proposições
- 491 eventos
- 526 votos nominais
- valores somente `sim` e `nao`
- `candidate_tse_id` presente em todos os votos
- datas normalizadas para ISO 8601
- nenhuma matriz de impacto criada ou alterada

O envelope foi aplicado pelo writer existente `scripts/import-senator-votes.mjs`, que resolve o `candidate_id` remoto por `tse_candidate_id` e usa `findOrCreate`.

## Aplicação remota

Primeira passagem:

```text
Envelope: 102 props, 491 events, 526 votos | APLICAR
Votos processados: 526
```

Reprocessamento idempotente retornou a mesma contagem processada, sem aumento do conjunto ALRS. O remoto ficou com 522 eventos ALRS, incluindo eventos legados já presentes antes desta coleta; os 491 eventos do envelope estão todos presentes.

A consulta confirmou 7 candidatos TSE resolvidos no remoto. Não houve escrita em `impact_matrices` nem chamada de aprovação editorial.

## Limitações e próximo gate

- O HTML bruto não é versionado; permanece local/temporário.
- A fonte ALRS expôs apenas 7 dos 8 IDs catalogados nesta coleta.
- O próximo passo seguro é construir/validar perfis nominais ALRS a partir dos votos factuais, sem transformar voto em score de impacto.
