# QA — rota histórica estruturada de legislatura Câmara

- **Data:** 2026-08-18
- **Objetivo:** investigar, em modo read-only e fail-closed, se a API oficial Dados Abertos da Câmara fornece uma rota estruturada que prove o cargo/período histórico dos quatro registros nominais atribuídos a Henrique Fontana.
- **Fonte oficial consultada:** `https://dadosabertos.camara.leg.br/api/v2/`

## Evidência verificada

1. `GET /deputados/73482` respondeu HTTP 200, 927 bytes, SHA-256 `4cd0dfc2d3f6234919c088baf22316f02b0ac63cb6b976a95b786202e9c4f654`. O payload identifica `HENRIQUE FONTANA JÚNIOR`, `PT`, `RS`, perfil 73482 e último status na legislatura 56, com data `2023-01-31`.
2. `GET /legislaturas?itens=100` respondeu HTTP 200, 7414 bytes, SHA-256 `25d2d7bdefb7463d465987bd3b54b7d1a218e0f2bfe0d15602094dc335bd0f1f`; a coleção retornou 57 legislaturas e confirma as janelas 54 (`2011-02-01`–`2015-01-31`) e 55 (`2015-02-01`–`2019-01-31`).
3. `GET /deputados/73482/legislaturas` respondeu HTTP 405 (`Method Not Allowed`): não é uma rota GET disponível.
4. `GET /deputados?idLegislatura=54&siglaUf=RS&itens=100` e a variante para legislatura 55 responderam HTTP 504, 24 bytes, mesmo corpo/hash `89f2d4e6c7a6c41c13c2e7a75e526aa60b9d5274fe28b2d82801c6beb6beb879`; isso é falha de disponibilidade/consulta do endpoint, não evidência de ausência histórica.

Manifestos brutos e hashes do probe ficam somente em `.orchestrator/runtime/camara-historical-scout/` e não são fonte pública versionada.

## Resultado fail-closed

A API oficial consultada confirma a identidade Câmara/RS atual do perfil e fornece o catálogo de janelas legislativas, mas não entregou neste chunk uma relação estruturada `deputado_id → legislatura histórica → cargo/período`. Os quatro casos `position=outro` permanecem bloqueados. Nenhum voto, UUID, FK, URL inventada, source reference ou escrita remota foi criada.

O HTTP 504 foi classificado como bloqueio de disponibilidade da consulta agregada; não foi convertido em `not_found`.

## Estado e próximo passo

- **Status:** `FED25_CAMARA_HISTORICAL_REMOTE_IDENTITY_LOOKUP_BLOCKED_ROLE`
- **Próximo chunk:** consultar a documentação OpenAPI oficial e rotas de histórico/mandatos eventualmente expostas por links de operação, além de testar consultas agregadas com paginação menor; manter os quatro casos fail-closed até prova nominal exata.
- **Gate remoto:** nenhum.
