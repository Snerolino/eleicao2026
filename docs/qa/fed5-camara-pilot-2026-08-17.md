# QA — FED-5: lote factual piloto Câmara

**Data:** 2026-08-17
**Status:** concluído em dry-run; nenhuma escrita remota

## Seleção

O lote usa somente candidatos com entrada `identity_status=matched` e
`match_method=official_name_exact` no catálogo FED-3:

1. Fernanda Melchionna — deputado Câmara `204407`
2. Maria do Rosário — deputado Câmara `74398`
3. Afonso Hamm — deputado Câmara `136811`
4. Osmar Terra — deputado Câmara `73692`

Marcel van Hattem (`156190`) permanece no manifesto como
`regression_fixture_identity_pending`, fora do conjunto de vínculos seguros.
Isso preserva a regressão sem fabricar vínculo TSE.

## Resultado

- candidatos seguros: **4**
- votos factuais no lote: **4**
- proposições: **1**
- versões: **1**
- eventos: **1**
- `import-legislative-dry-run`: passou
- operações remotas executadas: **0**

O evento é nominal e cada voto conserva `deputy_id`, valor normalizado,
data, versão, evento e URL oficial. O pacote não contém `impact`, `alignment`,
`score` ou `defending_vote`.

## Salvaguardas

- candidatos `identity_pending` não entram no envelope seguro;
- Marcel não entra como candidato vinculado;
- nenhum voto simbólico foi convertido;
- nenhum fato foi transformado em avaliação política;
- nenhum `--apply`, SQL remoto, migration ou RPC foi executado;
- o lote deriva do envelope oficial FED-4, sem nova coleta paralela.

## Artefatos

- `scripts/build-camara-fed5-pilot.mjs`
- `scripts/__tests__/camara-fed5-pilot.test.mjs`
- `data/legislative-import/camara/fed5-pilot/2580259-24-pilot.json`
- `data/legislative-import/camara/fed5-pilot/manifest.json`

## Próximo gate

FED-6: preparar matrizes de impacto somente como `pending_review`, com avaliação
editorial, fontes oficiais e `defending_vote` explícito. Nenhuma publicação deve
ser automática a partir deste lote factual.
