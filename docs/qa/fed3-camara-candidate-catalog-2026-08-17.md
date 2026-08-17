# QA — FED-3: catálogo Câmara ↔ candidato TSE

**Data:** 2026-08-17
**Status:** concluída para o catálogo de identidade; históricos não presentes na lista atual permanecem pendentes

## Fonte e política

- Fonte: API oficial Dados Abertos da Câmara.
- Endpoint: `https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1000`
- Retorno consultado: **513 deputados oficiais**.
- Política: nome oficial normalizado comparado somente contra `ballot_name`/`full_name`
  único do snapshot; sem similaridade, distância ou fuzzy matching.
- O resultado é versionado em `data/legislative-import/camara/candidate-catalog.json`.

## Resultado

- Universo público de deputado federal: **434**.
- Correspondências determinísticas Câmara ↔ TSE: **22**.
- `identity_pending`: **412**.
- Correspondências publicadas: todas com UF `RS`, `confidence=1` e
  `match_method=official_name_exact`.
- Duplicidade de `tse_candidate_id`: **0**.
- Duplicidade de `camara_deputado_id` entre correspondências: **0**.

Os 412 pendentes não foram classificados como “sem mandato federal identificado”.
A lista consultada é o recorte institucional atual; ex-deputados, suplentes com
exercício histórico e mudanças de nome exigem consulta histórica individual antes
de qualquer vínculo.

## Salvaguardas

- Pendências têm `camara_deputado_id=null`, `match_method=none` e
  `identity_status=identity_pending`.
- Nenhum UUID remoto foi fabricado.
- Nenhum vínculo ambíguo foi publicado.
- Nenhum voto ou perfil foi criado a partir de uma pendência.
- Nenhuma escrita Supabase, migration, RLS/RPC ou classificação política foi feita.

## Artefatos

- `scripts/build-camara-candidate-catalog.mjs`
- `data/legislative-import/camara/candidate-catalog.json`
- `scripts/__tests__/camara-candidate-catalog.test.mjs`

## Próximo gate

FED-4: coletor oficial da Câmara, começando pelo piloto validado e somente para
identidades com vínculo determinístico. O coletor deve separar eventos nominais
de simbólicos e manter o bruto antes da normalização.
