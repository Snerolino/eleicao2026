# QA — FED-25 lookup remoto de identidades Câmara

Data: 2026-08-18 15:10 UTC  
Modo: somente leitura; nenhum voto, FK, fonte, matriz ou RPC foi escrito.

## Objetivo

Conferir no Supabase remoto, por `tse_candidate_id`, os 92 registros locais
`matched_exact` da reconciliação nominal histórica Câmara. A consulta foi feita
em lote conservador de 20 IDs e comparou UF/cargo remoto antes de qualquer
preparação de envelope aplicável.

## Evidência verificada

- Projeto remoto: ref `hhqxhxcfkoijevxyzfky`, conferido antes da consulta.
- Migrations locais/remotas alinhadas até `20260816100000`.
- Fonte local de entrada: `data/legislative-import/camara/historical-nominal-local-reconciliation.json`.
- Registros locais `matched_exact`: 92.
- `tse_candidate_id` únicos consultados: 20.
- Linhas remotas retornadas: 20.
- IDs TSE ausentes remotamente: 0.
- Resultado versionado: `data/legislative-import/camara/historical-nominal-remote-identity-lookup.json`.

## Bloqueios fail-closed

- 4 registros são mantidos fora de qualquer envelope aplicável porque a linha
  remota tem `position=outro`, embora UF RS e nome estejam conferidos:
  Henrique Fontana (4 ocorrências entre as votações 9002/9003). Cargo histórico
  de deputado não foi inferido a partir do nome.
- Os 10 casos `ambiguous` e 40 `not_found` do artefato local continuam fora do
  lote; não houve matching heurístico.
- Nenhum `candidate.id` remoto foi promovido para escrita factual neste tick.

## Próximo passo

Resolver somente a classificação histórica/cargo dos 4 registros com evidência
oficial adicional, ou manter o bloqueio; depois revalidar proposição, data,
identidade e fonte. Os 50 casos ambíguos/ausentes permanecem na fila de
reconciliação independente.
