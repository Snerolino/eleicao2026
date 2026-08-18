# QA — Câmara histórica nominal em dry-run (2026-08-18)

## Objetivo
Refazer o GET das seis páginas nominais oficiais da Câmara catalogadas no FED-25 e extrair somente registros nominais do RS para revisão de identidade, sem escrita remota.

## Evidência verificada
- 6/6 URLs oficiais `www.camara.gov.br/internet/votacao/mostraVotacao.asp` responderam HTTP 200.
- Bytes e SHA-256 coincidiram integralmente com `data/legislative-import/camara/historical-nominal-vote-source-catalog.json`:
  - PEC 6/2019: `9002`, `9003`.
  - PL 3723/2019: `9224`, `9225`, `9226`, `9227`.
- Parser HTML extraiu apenas linhas com parlamentar, UF `RS` e voto nominal reconhecido.
- Resultado: **142 registros RS**, **32 nomes distintos**, em `data/legislative-import/camara/historical-nominal-vote-dry-run.json`.
- Cada registro preserva nome oficial, UF, voto, data oficial da votação, `numvot` e URL-fonte completa.

## Segurança / fail-closed
- `candidate_tse_id`: 0 no envelope.
- Nenhuma reconciliação heurística de identidade foi feita.
- Nenhum UUID, FK, `source_reference`, voto remoto, matriz ou RPC foi criado.
- `remote_apply=false`; `impact_matrix=not_created`.
- O envelope permanece dry-run até reconciliar cada nome por correspondência oficial exata com candidato e proposição/data.

## Estado dos dados
- Catálogo de fonte validado por HTTP, bytes e SHA-256.
- Registros nominais históricos do RS preparados para a próxima etapa de reconciliação.
- O DBF histórico continua apenas evidência auxiliar; não foi usado para inventar vínculo individual.

## Bloqueios
- Identidade Câmara histórica ainda pendente: nomes oficiais precisam ser reconciliados exatamente contra `full_name`/`ballot_name` e `tse_candidate_id` remoto.
- Sem essa reconciliação, nenhum registro pode ser aplicado.

## Reconciliação local subsequente
- Comparação somente contra `data/public-candidates.json`, sem consulta ou escrita remota.
- 142 registros classificados por correspondência exata normalizada em `full_name`/`ballot_name`: **92 matched_exact**, **10 ambiguous**, **40 not_found**.
- Artefato: `data/legislative-import/camara/historical-nominal-local-reconciliation.json`.
- A classificação local é triagem, não prova de FK: nenhum `tse_candidate_id` foi promovido ao envelope aplicável; ambiguidades e ausências permanecem fail-closed.

## Próximo passo
Repetir o lookup read-only no Supabase remoto pelo `tse_candidate_id` apenas para os 92 nomes exatos, conferir cargo/UF e proposição/data/evento, e manter os 50 restantes fora de qualquer aplicação. Antes do writer, refazer os seis GETs e validar novamente HTTP, hash e bytes.
