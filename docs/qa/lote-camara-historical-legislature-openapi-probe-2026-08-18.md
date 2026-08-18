# QA — rota histórica estruturada da Câmara

- **Data:** 2026-08-18
- **Objetivo:** localizar e testar, em modo somente leitura, a rota oficial de histórico de exercício parlamentar para os quatro casos Câmara classificados como `position=outro`.

## Evidência verificada

- OpenAPI oficial: `https://dadosabertos.camara.leg.br/api/v2/api-docs`.
- Rota encontrada: `GET /deputados/{id}/historico`.
- Descrição oficial: lista mudanças no exercício parlamentar, incluindo alterações de partido/nome, licença, afastamento e substituição.
- Perfil testado: Câmara `73482`, Henrique Fontana Júnior, PT-RS.
- Probe bem-sucedido: HTTP 200, 7.634 bytes, SHA-256 `e08beccf1b578c5929143268a8d4da814668447c3a55fb1066dad69514d574fb`, 14 itens históricos; foram observadas as legislaturas 51 a 56.
- Rota complementar `GET /deputados/73482/mandatosExternos`: HTTP 200, 534 bytes, SHA-256 `e319923ef9db9e0512532df8fee712a954a41763277d4ad527ed5fd00ff62b7a`, 2 itens de vereador em Porto Alegre/RS (1993–1999).
- `GET /legislaturas/54` e `/55`: HTTP 200, retornando apenas metadados do período. Nova tentativa de `/56` sofreu timeout de resolução DNS.

## Decisão fail-closed

- Nenhum voto, identidade histórica, UUID, FK, `source_reference` ou registro remoto foi criado/alterado.
- Os quatro casos `position=outro` continuam bloqueados. A rota prova que existe histórico estruturado, mas ainda é necessário reconciliar cada evento nominal com cargo/UF, proposição, data, voto e fonte exatos antes de qualquer promoção.
- A falha de revalidação posterior foi classificada como indisponibilidade DNS; não foi interpretada como ausência de dados.

## Artefato

- `data/legislative-import/camara/historical-historical-route-probe.json`

## Próximo passo

Refazer o GET da rota histórica quando a resolução estiver estável, preservar o corpo/hash no manifesto e cruzar somente os intervalos históricos exatos dos quatro casos bloqueados. Não aplicar votos por inferência de perfil ou legislatura.
