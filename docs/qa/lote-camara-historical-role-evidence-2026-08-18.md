# QA — Câmara: identidade histórica Henrique Fontana

- Data: 2026-08-18
- Objetivo: pesquisar fonte oficial para os 4 registros nominais em que a identidade remota coincide por `tse_candidate_id`, mas o cadastro atual classifica `position=outro`.

## Evidência verificada

- Busca oficial localizou o perfil Câmara `https://www.camara.leg.br/deputados/73482`, cujo resultado identifica `HENRIQUE FONTANA JÚNIOR` e `PT - RS`; a variante anual `?ano=2014` também foi localizada.
- GETs diretos ao portal oficial foram executados sequencialmente e registrados em `.orchestrator/runtime/camara-historical-scout/henrique-fontana-official-profile-probe.json`, com HTTP, bytes e SHA-256.
- A API aberta atual `GET https://dadosabertos.camara.leg.br/api/v2/deputados?nome=Henrique%20Fontana...` respondeu HTTP 200, porém sem registros (`data=[]`); isso não é tratado como ausência histórica.

## Decisão fail-closed

A página oficial confirma o nome e a UF partidária/histórica, mas este chunk não produziu uma prova versionada suficiente para alterar a classificação remota `position=outro` nem para aplicar votos. Nenhuma identidade, FK, voto, fonte remota, matriz ou RPC foi escrita.

## Bloqueio

`FED25_CAMARA_HISTORICAL_REMOTE_IDENTITY_LOOKUP_BLOCKED_ROLE`: falta uma evidência oficial estruturada que ligue o parlamentar ao cargo histórico exigido pelo contrato remoto exatamente no contexto de cada evento. O item permanece bloqueado; não foi usado matching heurístico.

## Próximo passo

Pesquisar no portal oficial uma rota histórica estruturada (legislatura/mandato ou endpoint do perfil) que forneça cargo e período compatíveis; só então revalidar o envelope nominal.
