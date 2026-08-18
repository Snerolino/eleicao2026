# QA — FED-8: idempotência e segunda votação simbólica

**Data:** 2026-08-18
**Status:** idempotência verificada; segunda votação classificada corretamente

## Idempotência FED-7B

Reexecução do writer factual `scripts/apply-camara-fed7-factual.mjs --apply`:

- proposição: **0 criadas** (já existente)
- versão: **0 criadas** (já existente)
- evento: **0 criados** (já existente)
- votos: **0 criados**
- `impactTouched`: **false**

A segunda passagem confirma a idempotência: nenhuma duplicação na carga factual.

## Coleta da votação 2580259-27 (Redação Final)

Coletor oficial `scripts/collect-camara-votes.mjs --vote-id 2580259-27`:

- evento: **Aprovada a Redação Final** (Redação Final assinada pela relatora)
- método API `/votos`: **retorna 0 registros individuais**
- classificação do coletor: **outro / não individualizado**
- envelope factual: **não gerado** — votação simbólica

O coletor preservou o JSON bruto e registrou o evento no manifesto, sem
criar voto individual algum.

## Separatismo de fato e impacto

- voto nominal (`2580259-24`): 4 votos novos + 1 pré-existente = 5 votos
- votação simbólica (`2580259-27`): 0 votos individuais criados
- nenhuma conversão simbólica → nominal
- nenhuma matriz nova criada ou aprovada
- `impact_rows_created=0`, RPC de aprovação não chamado
- matriz `pending_review` do FED-6 permanece sem revisão

## Verificação remota

```text
proposition_id: 0a7d7020-2ed9-41cf-96b6-0f0283ee96c7
version_id: a2481245-0290-49c2-83e2-f5e8f58c03d4
event_id: ed8433cf-0d62-4137-9a02-a64b2bb9ec18
votes: 5
distinct_candidates: 5
impact_matrices: []
```

O quinto voto pertence a Marcel van Hattem, fixture federal anterior à carga
FED-7B.
