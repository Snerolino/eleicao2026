# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 16:56 UTC)

## Objetivo

Executar o próximo tick das lanes oficiais em modo somente leitura, sem promover
votos, identidades, FKs, referências ou alterações remotas.

## Evidência verificada

- **Câmara:** API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`,
  janela `2026-10-01`–`2026-12-31`, HTTP 200, uma página válida, zero `vote_id`
  e nenhum bloqueio. Nenhum evento foi inferido.
- **ALRS:** portal oficial HTTP 200, 77.442 bytes, SHA-256
  `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`,
  zero `data-item`, sem `Enio Carlos Terra` e sem o token `Terra`. Os quatro
  residuais permanecem sem ID oficial e fonte exata.
- **Senado:** 6/6 GETs oficiais HTTP 200, 6/6 prefixos PDF válidos, 0/6
  coincidências de bytes e 0/6 coincidências SHA-256 contra
  `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
  A deriva persiste; nenhum manifesto foi alterado e o lote permanece
  fail-closed.
- **Dataset vivo:** o snapshot contém 1.003 IDs TSE. Os CSVs inspecionados têm
  213 IDs em `consulta_cand_2026_RS.csv`, 322 em `lista_candidatos_2026.csv`,
  49 em `bem_candidato_2026_RS.csv` e 69 em
  `rede_social_candidato_2026_RS.csv`; todos os IDs extraídos são subconjuntos
  do snapshot. Os arquivos parciais não foram tratados como fonte de refresh.
- **Auditoria de fontes:** `npm run impact:sources:audit` exit 0; gaps reais:
  ALRS 4 votos sem fonte, Câmara 2 e Senado 455. Não houve aplicação.

## Estado e bloqueios

- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto,
  source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva persistente de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato na
  rota pública consultada; HTTP 200 não foi tratado como prova de ausência.
- Câmara sem lote elegível na janela futura consultada; resposta vazia não foi
  convertida em dado.

## Artefatos

- `.orchestrator/runtime/continuous-tick-2026-08-20T1656Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20T1656Z/alrs.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20T1656Z/senado.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20T1656Z/dataset-diff.json`

## Próximo passo

Manter Senado e ALRS fail-closed e repetir reconhecimento oficial bounded; não
aplicar fatos sem R0/schema/FK/fonte/dry-run/idempotência. Continuar gates
locais e publicação documental independente.
