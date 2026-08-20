# QA — reconhecimento oficial bounded Senado/ALRS/Câmara — 2026-08-20 23:31Z

## Objetivo

Manter as quatro lanes contínuas ativas com reconhecimento oficial somente leitura,
sem promover dados enquanto houver deriva de fonte, ausência de identidade oficial
ou falta de eventos.

## Evidência verificada

- **Senado:** 6/6 URLs oficiais responderam HTTP 200; 6/6 prefixos PDF válidos;
  3/6 bytes coincidentes e **0/6 SHA-256 coincidentes** com o manifesto de
  2026-08-19. Gate fail-closed: manifesto, voto, identidade e FK não foram
  atualizados.
- **ALRS:** `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`
  respondeu HTTP 200 com 77.442 bytes e SHA-256
  `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`.
  A resposta teve 0 atributos `data-item`, não contém `Enio Carlos Terra` nem
  `Terra`; os quatro votos residuais permanecem sem ID oficial exato e fonte
  auditável.
- **Câmara:** janela oficial `2026-10-01` a `2026-12-31` respondeu HTTP 200,
  JSON válido, 0 registros; nenhum evento foi inferido.
- **dataset2026:** snapshot público contém 1.003 IDs; 10 CSVs comparáveis,
  0 IDs ausentes em relação ao snapshot. Nenhum refresh ou sincronização foi
  aplicado.
- Artefatos read-only: `.orchestrator/runtime/continuous-tick-20260820T2331Z/`.

## Estado dos dados

Nenhuma escrita factual em snapshot, manifesto, `source_references`, claims,
votos, identidades, FKs, Supabase ou matriz de impacto ocorreu.

## Gates e bloqueios

- `npm run orch:doctor`: FAIL somente porque o shell cron usa Node 22.22.2,
  enquanto o projeto exige Node 24; OpenCode ausente e Ollama sem preflight são
  WARNs opcionais. O reconhecimento foi executado com Python read-only.
- Senado bloqueado por deriva SHA-256.
- ALRS bloqueado por ausência de catálogo/ID oficial exato para Enio Carlos Terra.
- Câmara sem lote oficial elegível na janela consultada.

## Próximo passo

Repetir reconciliação bounded nas próximas janelas oficiais, mantendo todos os
bloqueios fail-closed; após gates locais verdes publicar este checkpoint
 documental e verificar o backup Cloudflare.
