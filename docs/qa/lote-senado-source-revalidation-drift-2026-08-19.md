# QA — Revalidação Senado: deriva do catálogo oficial

**Data:** 2026-08-19 06:48 UTC  
**Modo:** reconnaissance read-only; fail-closed

## Objetivo

Refazer os seis GETs oficiais do catálogo nominal Senado antes de adaptar o
parser para um envelope factual. Nenhum voto, identidade, FK ou matriz pode ser
aplicado quando bytes/hash divergem do manifesto versionado.

## Evidência coletada

- 6 URLs oficiais consultadas.
- 5/6 responderam HTTP 200; 1/6 (`ano/2026/parlamentar/6341`) falhou com DNS
  transitório (`Name or service not known`) nesta tentativa.
- 0/6 coincidiram simultaneamente em bytes e SHA-256 com
  `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
- Respostas HTTP 200 observadas:
  - 2025/6341: 138358 bytes, `sha256:bb2ea4b3de20d71b7ee256b9dd710895cf25be6efb29e771623ba83c12acda65`
  - 2025/1186: 138556 bytes, `sha256:a6e927720f6a431b89d85c9211eda9173c98d8e124e925cf53d5260672927817`
  - 2025/825: 138151 bytes, `sha256:aea847d73a743d4d75c39b56c10b155e22124b1d6813b89ce46a4f57745293d4`
  - 2026/1186: 97428 bytes, `sha256:54fdcd9e6fd24395867c18d0e2f23e03e7ef976c6e9f57d4a0cb6790319291d4`
  - 2026/825: 97375 bytes, `sha256:f2ec21f8415c726073983b8a26663dcea4b5647a9ec9206527e3bad75ebd8b0f`
- O comando local `node scripts/apply-senado-nominal-sources.mjs` passou em
  dry-run: 6 planejadas, 0 ausentes, 0 inserções e 0 votos tocados. Esse modo
  não refaz consulta remota; portanto não substitui a reconciliação de bytes.

## Resultado e bloqueio

- Catálogo versionado está stale/instável contra as respostas atuais. Não foi
  atualizado automaticamente, pois isso exigiria aceitar novos bytes sem
  preservar e revisar o payload oficial correspondente.
- O envelope factual Senado não foi gerado/aplicado neste tick.
- Nenhum UUID, candidato TSE, legislador, voto, proposição, FK, claim, matriz,
  RPC, RLS, Supabase ou Cloudflare foi alterado.

## Próximo passo bounded

Refazer os seis GETs com retry controlado, salvar os bytes oficiais em artefato
transitório, gerar manifesto novo somente após 6/6 HTTP 200 e revisão de
conteúdo, então executar o parser e o dry-run idempotente usando apenas
`legislator_id`. Se a deriva persistir, manter o item fail-closed e continuar
com outra lane independente.
