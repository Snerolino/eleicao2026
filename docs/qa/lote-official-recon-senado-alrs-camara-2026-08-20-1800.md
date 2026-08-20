# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 18:16 UTC)

## Objetivo

Executar o próximo tick das lanes oficiais em modo somente leitura, validar a
fonte viva `../dataset2026` e manter o fluxo fail-closed sem promover votos,
identidades, FKs, referências ou alterações remotas.

## Evidência verificada

- **Senado:** 6/6 GETs oficiais HTTP 200 e 6/6 prefixos PDF válidos. Apenas
  2/6 bytes coincidiram com o manifesto de 2026-08-19; 0/6 SHA-256 coincidiram.
  A deriva persiste e o lote continua bloqueado; nenhum manifesto foi alterado.
- **ALRS:** rota oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`
  respondeu HTTP 200, 77.442 bytes, SHA-256
  `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`,
  zero ocorrências de `data-item`, sem `Enio Carlos Terra` e sem token
  `Terra`. Os quatro residuais permanecem sem ID oficial exato e fonte
  auditável.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31` respondeu HTTP
  200 com JSON válido e zero registros. Nenhum evento foi inferido.
- **Dataset vivo:** snapshot público contém 1.003 IDs. Os seis CSVs de
  candidatos analisados são subconjuntos completos do snapshot: 213, 69, 49,
  69, 322 e 1.003 IDs; zero IDs ausentes. Nenhum refresh ou sincronização foi
  aplicado.
- **Auditoria de fontes:** `npm run impact:sources:audit` exit 0. Gaps atuais:
  ALRS 4 votos, Câmara 2 votos e Senado 455 votos sem fonte.

## Estado e bloqueios

- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto,
  source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva persistente de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato;
  HTTP 200 não foi tratado como prova de ausência.
- Câmara sem lote elegível na janela futura consultada; resposta vazia não foi
  convertida em dado.
- O doctor do cron permanece com FAIL de infraestrutura porque o shell usa
  Node 22.22.2 enquanto o projeto exige Node 24; a reconciliação foi executada
  com Node 24.19.0. WARNs opcionais: OpenCode ausente, Ollama sem preflight e
  gateway Hermes com Node divergente.

## Artefatos read-only

- `.orchestrator/runtime/continuous-tick-20260820T1800Z/senado.json`
- `.orchestrator/runtime/continuous-tick-20260820T1800Z/alrs.json`
- `.orchestrator/runtime/continuous-tick-20260820T1800Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-20260820T1800Z/dataset-diff.json`

## Próximo passo

Manter Senado e ALRS fail-closed, repetir revalidação bounded e consultar a
próxima janela oficial da Câmara. Não aplicar fatos sem R0/schema/FK/fonte,
dry-run e prova de idempotência; manter a lane local/documental independente.
