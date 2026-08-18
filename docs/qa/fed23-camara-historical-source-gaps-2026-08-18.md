# QA — FED-23: lacunas históricas de fontes Câmara

**Data:** 2026-08-18
**Modo:** reconciliação read-only

## Resultado

Os dois votos Câmara sem `source_reference_id` são históricos:

- `camara_pec6_2019_2turno` — PEC 6/2019, 07/08/2019
- `camara_pl3723_2019` — PL 3723/2019, 22/10/2019

A API oficial confirmou as proposições:

- PEC 6/2019 → ID Câmara `2192459`
- PL 3723/2019 → ID Câmara `2209381`

Foram consultados os endpoints oficiais de proposições e votações em janelas
trimestrais correspondentes. Nenhuma votação oficial retornada vinculou esses IDs
nas janelas consultadas. Não foi possível obter URL/hash de evento ou voto
correspondente.

## Gate

- 2 votos permanecem sem fonte;
- nenhum vínculo foi inventado;
- nenhuma escrita remota foi executada;
- o próximo scout deve pesquisar Diário da Câmara/endpoint histórico específico,
  sem usar o nome externo como prova suficiente.
