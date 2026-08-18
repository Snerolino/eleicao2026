# QA — recuperação de fontes ALRS (2026-08-18)

## Objetivo

Executar uma trilha read-only para recuperar evidência oficial dos eventos ALRS
sem inventar vínculo, URL, hash, identidade ou voto, e validar o motivo pelo
qual o backfill permanece sem plano aplicável.

## Evidência oficial verificada

As cinco páginas oficiais do Portal da Transparência ALRS foram refeitas por
`curl` direto, com HTTP, bytes, SHA-256 e contagem de `data-item` coincidentes
com o manifesto versionado em
`data/legislative-import/alrs-fed17/recovery-manifest.json`:

| solicitante | HTTP | bytes | data-item | SHA-256 |
|---:|---:|---:|---:|---|
| 93 | 200 | 589283 | 109 | `4f41ddb84d7139397aadeab10d379d0e55950fd0514d6e8e2bc5dba65b309014` |
| 2122 | 200 | 540317 | 99 | `97492fb28e6d85e94f379128037535d99191664dcb518fa484aac915749cd9bc` |
| 2153 | 200 | 534734 | 97 | `268f0655e02118fa60b63f4616c10525aa66d4f5aa04a57e9b58afd62f80ce76` |
| 2136 | 200 | 541531 | 99 | `69833351d77c5617073e6981571b212c71d20999099306ce3d797e4d60a5d5ae` |
| 2162 | 200 | 495335 | 89 | `c12c6f762fabed296f48f7e9044b2f5ea42ec290dd6af46117721d6bc6eafaf1` |

A extração gerenciada `web_extract` sofreu timeout 504 nas mesmas cinco URLs;
o fallback direto ao portal oficial funcionou. Nenhuma saída do scraper gerou
dado entregável.

## Resultado do backfill

`npm run impact:alrs:sources:backfill` passou em dry-run:

- `eligible_events=2` (`alrs_pl134_2023`, `alrs_pl77_2025`);
- `planned_votes=0`;
- `planned_sources=0`;
- `existing_sources=0`;
- `blocked_events=3`;
- `blocked_identity=1`;
- nenhuma escrita remota e nenhum `--apply`.

A evidência HTML está íntegra, mas o escritor não encontrou correspondência
exata aplicável entre evento remoto, proposição, data-calendário, candidato e
valor do voto. O fail-closed foi preservado; não houve tentativa heurística.

## Auditoria relacionada

- `npm run impact:sources:audit`: exit 0, read-only.
- `node scripts/audit-legislative-source-coverage.mjs --strict`: exit 2 por
  lacunas reais.
- Cobertura atual: ALRS 3985/4000 votos com fonte; Câmara 195/197; Senado
  0/455.
- `npm run data:check`: passou com 1003 candidaturas e 988 fotos oficiais.
- Worktree permaneceu limpa.

## Bloqueios

- Três eventos ALRS continuam bloqueados por divergência/ambiguidade conforme o
  manifesto FED-17.
- Uma identidade ALRS (`210002534312`, Enio Carlos Terra) não está no catálogo
  oficial usado pelo escritor.
- Firecrawl/web_extract não é rota confiável para estas páginas neste tick
  (504); o fallback direto via `curl` deve ser usado para nova coleta.
- Os dois endpoints Câmara testados (`2192459`, `2209381`) retornaram HTTP 404;
  continuam sem prova oficial de votos nominais e não foram alterados.

## Próximo passo

Manter a recuperação local/read-only: comparar os `data-item` das páginas já
validadas com os eventos remotos e produzir um plano somente se todos os campos
exatos coincidirem. Para Câmara, localizar a rota histórica oficial correta
antes de qualquer backfill. Só executar `--apply` depois de nova validação de
identidade remota, FK, proposição, data, valor, hash e idempotência.
