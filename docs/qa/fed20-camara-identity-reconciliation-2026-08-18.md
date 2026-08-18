# QA — FED-20: reconciliação de identidades Câmara Q1/2026

**Data:** 2026-08-18
**Modo:** read-only; sem escrita Supabase

## Resultado

- IDs oficiais distintos na batch: **32**
- correspondências exatas únicas contra `full_name`/`ballot_name`: **24**
- `identity_pending`: **8**
- fuzzy matching: **0**
- duplicidades full/ballot do mesmo TSE deduplicadas

Fonte usada exclusivamente:

`https://dadosabertos.camara.leg.br/api/v2/votacoes/{vote_id}/votos`

A rota individual `/deputados/{id}` não resolveu os IDs históricos, mas a rota de
votos retornou `deputado_.nome` oficial para a mesma votação. O relatório preserva
os endpoints de origem por deputado.

## Artefato

- `data/legislative-import/camara/collector-2026-q1/identity-reconciliation.json`
- `scripts/reconcile-camara-q1-identities.mjs`
- `scripts/__tests__/reconcile-camara-q1-identities.test.mjs`

O catálogo é somente uma proposta de identidade factual. Nenhum voto foi aplicado
com base nele nesta fase; os oito pendentes continuam fora de qualquer envelope.
