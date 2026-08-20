# QA — Câmara: coleta nominal bounded, lote 02

**Data:** 2026-08-20 UTC  
**Modo:** reconhecimento oficial read-only + dry-run; nenhuma escrita remota

## Objetivo

Avançar a lane de reconhecimento da Câmara consultando exclusivamente o endpoint
oficial `/votacoes/{id}/votos` para o segundo lote de 25 IDs da janela
2026-07-01 a 2026-09-30, sem inferir votos individuais a partir de listagens,
placares ou respostas vazias.

## Entrega verificada

- Fonte oficial: `https://dadosabertos.camara.leg.br/api/v2`.
- Entrada: `.orchestrator/runtime/camara-discovery-current.json`, descoberta
  read-only com 300 IDs e páginas HTTP válidas.
- Coletor: `scripts/collect-camara-votes.mjs`, executado com Node `v24.19.0`.
- Lote processado: 25 IDs, posições 26–50 da descoberta.
- Artefatos brutos: 25 arquivos em
  `.orchestrator/runtime/camara-votes-batch-02/`.
- Manifesto: `71bc47526435c86e3663488ba65d9a5ff31de6ad9ae23acb3870ecdd8500ae22`
  (SHA-256), URLs `/votacoes/{id}/votos` oficiais em 25/25 eventos.
- Resultado: 25 eventos, 0 respostas individualizadas, 0 votos brutos e 0
  votos em envelope.
- O coletor terminou com exit 0 e declarou nenhuma escrita remota realizada.
- Nenhuma identidade, FK, proposição, classificação nominal ou voto foi
  inventado ou aplicado.

## Publicação e verificação

- Commit documental: `76563260bf6ab991892a2ef08e7e78d6ac7ea999`, publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32339810400`: `completed/success`, `headSha` completo idêntico.
- Produção `https://rs.votopraquem.org/`: raiz HTTP 200 e `/release.json` HTTP 200.
- `release.json` confirmou release `7656326-20260820T062951391Z`, versão `0.2.510` e snapshot com `row_count=1003`; `commit_sha` nulo no payload, validado pelo `headSha` do run e pelo prefixo do release.
- Worktree final limpa e `HEAD` igual a `origin/main`.

## Bloqueios e escopo

- Resposta vazia no endpoint `/votos` não foi convertida em votação simbólica;
  a classificação permaneceu `outro` e fail-closed.
- ALRS continua bloqueado pelo JWT `issued at future` e sem ID oficial exato
  para os quatro residuais de Enio Carlos Terra.
- Senado continua fail-closed pela deriva SHA-256 dos seis PDFs frente ao
  manifesto; nenhum hash foi atualizado.
- A lane `remote_factual_apply` não foi acionada: este lote não produziu
  envelope nominal, identidade/FK exata, dry-run de escrita ou prova de
  idempotência.
- `npm run orch:doctor` permanece com FAIL estrutural porque o shell cron
  resolve Node `v22.22.2`, enquanto o projeto exige Node 24; o tick e seus
  artefatos foram executados com Node `v24.19.0`.

## Próximo passo

Consultar o lote 03 dos IDs Câmara, bounded e read-only, preservando URLs e
artefatos; manter ALRS/Senado em reconciliação fail-closed e a publicação
independente da documentação após gates locais verdes.
