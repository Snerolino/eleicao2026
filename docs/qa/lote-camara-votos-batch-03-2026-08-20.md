# QA — Câmara: coleta nominal bounded, lote 03

**Data:** 2026-08-20 UTC  
**Modo:** reconhecimento oficial read-only + dry-run; nenhuma escrita remota

## Objetivo

Avançar a lane de reconhecimento da Câmara consultando exclusivamente o endpoint oficial `/votacoes/{id}/votos` para o terceiro lote de 25 IDs da janela 2026-07-01 a 2026-09-30, sem inferir votos individuais a partir de listagens, placares ou respostas vazias.

## Entrega verificada

- Fonte oficial: `https://dadosabertos.camara.leg.br/api/v2`.
- Entrada: `.orchestrator/runtime/camara-discovery-current.json`, descoberta read-only com 300 IDs e páginas HTTP válidas.
- Coletor: `scripts/collect-camara-votes.mjs`, executado com Node `v24.19.0`.
- Lote processado: 25 IDs, posições 51–75 da descoberta.
- Artefatos brutos: 25 arquivos em `.orchestrator/runtime/camara-votes-batch-03/`.
- Manifesto: `e819a83808435223f6fc0e51b74ada80a14951b28c173592c2450db8850d10c7` (SHA-256), URLs `/votacoes/{id}/votos` oficiais em 25/25 eventos.
- Resultado: 25 eventos, 0 respostas individualizadas, 0 votos brutos e 0 votos em envelope.
- O coletor terminou com exit 0 e declarou nenhuma escrita remota realizada.
- Nenhuma identidade, FK, proposição, classificação nominal ou voto foi inventado ou aplicado.

## Publicação e verificação

- A preencher após gates locais e publicação documental.

## Bloqueios e escopo

- Respostas vazias no endpoint `/votos` não foram convertidas em votação simbólica; a classificação permaneceu `outro` e fail-closed.
- ALRS continua bloqueado pelo JWT `issued at future` e sem ID oficial exato para os quatro residuais de Enio Carlos Terra.
- Senado continua fail-closed pela deriva SHA-256 dos seis PDFs frente ao manifesto; nenhum hash foi atualizado.
- A lane `remote_factual_apply` não foi acionada: este lote não produziu envelope nominal, identidade/FK exata, dry-run de escrita ou prova de idempotência.
- `npm run orch:doctor` permanece com FAIL estrutural porque o shell cron resolve Node `v22.22.2`, enquanto o projeto exige Node 24; o tick e seus artefatos foram executados com Node `v24.19.0`.

## Próximo passo

Consultar o lote 04 dos IDs Câmara, bounded e read-only, preservando URLs e artefatos; manter ALRS/Senado em reconciliação fail-closed e a publicação independente da documentação após gates locais verdes.
