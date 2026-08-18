# QA — scout de rota histórica oficial Câmara

- Data/hora: 2026-08-18 17:54 UTC
- Objetivo: avançar a reconciliação dos quatro registros históricos `position=outro` sem inferir cargo, identidade ou voto.

## O que foi verificado

- O índice oficial de votações nominais da 56ª Legislatura foi consultado por fallback web e confirmou a rota determinística dos DBFs:
  - PEC 6/2019: `CD190242.dbf` e `CD190244.dbf` em 07/08/2019;
  - PL 3723/2019: `CD190396.dbf`–`CD190400.dbf` em 05/11/2019.
- URLs completas e evidência foram registradas em `data/legislative-import/camara/historical-official-route-scout.json`.
- A API oficial confirmou a proposição `2209381` como PL 3723/2019 e a rota de tramitação da PEC `2192459` expôs registros plenários de 07/08/2019.
- A resposta de tramitação/API não foi tratada como prova nominal individual; o vínculo factual continua dependente do DBF/evento/data exatos.

## Estado dos dados e segurança

- `remote_apply=false`.
- Nenhum voto, candidato, identidade histórica, UUID, FK, `source_reference`, matriz ou RPC foi criado/alterado.
- Os quatro casos de Henrique Fontana permanecem `fail-closed`.
- Nenhuma fonte sem URL oficial foi fabricada.

## Bloqueios reais

- O shell cron falhou ao resolver `dadosabertos.camara.leg.br` (`socket.gaierror: [Errno -2] Name or service not known`).
- `web_extract` conseguiu consultar páginas oficiais como fallback, mas não entregou hash/bytes dos DBFs neste chunk; portanto não há plano aplicável nem escrita remota.

## Próximo passo bounded

Refazer os seis GETs oficiais dos DBFs quando o DNS direto estiver disponível, conferir HTTP, bytes e SHA-256 contra o catálogo versionado e só então reconciliar registros nominais com proposição, data, parlamentar/UF e voto exatos. Manter ambiguidades e ausência de ligação em fila fail-closed.
