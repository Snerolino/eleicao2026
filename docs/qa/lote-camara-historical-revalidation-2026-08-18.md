# QA — revalidação da rota histórica estruturada da Câmara

- **Data:** 2026-08-18
- **Objetivo:** refazer, em modo somente leitura, a evidência oficial da rota histórica para os casos Câmara classificados como `position=outro`, sem promover identidades nem votos.

## Evidência verificada

- Doctor com Node `v24.19.0`: `OK=53`, `WARN=4`, `FAIL=0`.
- `GET https://dadosabertos.camara.leg.br/api/v2/deputados/73482/historico`: HTTP 200, 7.634 bytes, SHA-256 `e08beccf1b578c5929143268a8d4da814668447c3a55fb1066dad69514d574fb`, 14 itens.
- O corpo revalidado mantém as chaves de histórico `idLegislatura`, `dataHora`, `descricaoStatus`, `situacao`, `siglaUf`, `siglaPartido` e `condicaoEleitoral`.
- `GET https://dadosabertos.camara.leg.br/api/v2/legislaturas/56`: HTTP 200, 226 bytes, SHA-256 `e2df6500daab1e958f992cb609b669f0dc7c8ce024c05099242b99549722b1a6`.
- `GET https://dadosabertos.camara.leg.br/api/v2/deputados/73482`: HTTP 200, 927 bytes, SHA-256 `4cd0dfc2d3f6234919c088baf22316f02b0ac63cb6b976a95b786202e9c4f654`.
- Artefato transitório da coleta: `.orchestrator/runtime/camara-historical-scout/revalidation-2026-08-18.json`.

## Decisão fail-closed

- A revalidação confirma a disponibilidade da rota e repete exatamente o hash do probe anterior; não é evidência nova de vínculo nominal de voto.
- Nenhum voto, identidade histórica, UUID, FK, `source_reference` ou registro remoto foi criado ou alterado.
- Os quatro casos `position=outro` permanecem bloqueados. Não se promove cargo por legislatura ou por perfil individual sem cruzamento exato com proposição, data, voto e fonte oficial.

## Estado dos dados

- Snapshot público e banco remoto não foram modificados neste lote.
- A evidência permanece somente em escopo de reconciliação read-only; dados sem fonte/identidade exata não entram no envelope factual.

## Bloqueios

- `FED25_CAMARA_HISTORICAL_REMOTE_IDENTITY_LOOKUP_BLOCKED_ROLE`: a rota histórica prova mudanças no exercício parlamentar, mas não resolve, sozinha, o vínculo factual dos votos pendentes.

## Próximo passo

Pesquisar, em fonte oficial Câmara, a ligação exata entre cada evento nominal pendente, proposição, data, parlamentar/UF e voto. Manter dry-run e fail-closed até todos os campos serem comprovados.
