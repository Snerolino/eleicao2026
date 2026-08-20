# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 16:00 UTC)

## Objetivo

Revalidar as três lanes oficiais prioritárias em modo somente leitura, sem
promover votos, identidades, FKs, referências ou alterações remotas.

## Evidência verificada

- **Câmara:** API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`,
  janela `2026-10-01`–`2026-12-31`, HTTP 200, uma página válida, zero
  `vote_id` e nenhum bloqueio. Nenhum evento foi inferido.
- **Senado:** 6/6 GETs oficiais HTTP 200, 6/6 prefixos PDF válidos, 2/6
  coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto
  `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
  A deriva persiste; nenhum manifesto foi alterado e o lote permanece
  fail-closed.
- **ALRS:** portal oficial HTTP 200, 77.442 bytes, SHA-256
  `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`,
  zero `data-item`, sem `Enio Carlos Terra` e sem token `Terra`. Os quatro
  residuais continuam sem ID oficial e fonte exata.
- **Dataset vivo:** `../dataset2026/candidatos/lista_candidatos_2026.csv`
  lido com codificação CP1252 e separador `;`: 322 linhas/IDs únicos, todos
  contidos no snapshot público de 1003; o CSV isolado tem 681 IDs ausentes.
  Nenhum refresh ou sincronização foi aplicado.

## Estado e bloqueios

- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto,
  source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva persistente de SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato
  na rota pública consultada; HTTP 200 não foi tratado como prova de ausência.
- Câmara sem lote elegível na janela futura consultada; resposta vazia não foi
  convertida em dado.

## Artefatos

- `.orchestrator/runtime/continuous-tick-2026-08-20-1600/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20-1600/senado.json`
- `.orchestrator/runtime/continuous-tick-2026-08-20-1600/alrs.json`

## Próximo passo

Repetir a reconciliação bounded sem promover deriva: manter Senado e ALRS
fail-closed e consultar a próxima janela Câmara elegível quando houver eventos.
Continuar os gates locais/documentais independentes.
