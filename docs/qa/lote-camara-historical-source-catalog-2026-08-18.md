# QA — Catálogo oficial de fontes nominais históricas da Câmara

- Data: 2026-08-18
- Fase: FED-25
- Modo: read-only; nenhum voto, identidade, FK, source reference ou escrita remota foi criado.

## Objetivo

Reconsultar as fichas oficiais da Câmara para as duas lacunas históricas e
versionar as URLs nominais individuais apontadas pelos `ideVotacao` oficiais,
com bytes e SHA-256 obtidos no mesmo tick.

## Evidência verificada

- PEC 6/2019: ficha oficial HTTP 200, 635.605 bytes; ID Câmara `2192459`.
  A ficha aponta `ideVotacao=9002` e `ideVotacao=9003`.
- PL 3723/2019: ficha oficial HTTP 200, 152.563 bytes; ID Câmara `2209381`.
  A ficha aponta `ideVotacao=9224`, `9225`, `9226` e `9227`.
- As seis páginas nominais `https://www.camara.gov.br/internet/votacao/mostraVotacao.asp?ideVotacao=...` responderam HTTP 200. Bytes e hashes estão em
  `data/legislative-import/camara/historical-nominal-vote-source-catalog.json`.
- O arquivo também preserva a data de coleta e declara explicitamente as
  lacunas de reconciliação.

## Decisão fail-closed

O catálogo prova fontes oficiais nominais e os IDs das proposições, mas não
atribui automaticamente `NUMVOT` a cada código DBF nem resolve identidades TSE.
Nenhum voto foi importado, nenhum candidato foi vinculado por nome e nenhuma
fonte remota foi escrita. O catálogo é preparação auditável para o próximo
parser, não publicação factual.

## Próximo passo

Baixar novamente cada página nominal usando o catálogo, validar HTTP/bytes/hash
e extrair apenas registros com identidade oficial inequívoca e correspondência
exata de proposição/data. Gerar envelope dry-run; manter pendências e
ambiguidades fora do writer.

## Gates do tick

- Node usado nos comandos: `v24.19.0`.
- Worktree limpa antes da alteração; lock bounded adquirido e liberado.
- Nenhum segredo, documento bruto ou PII foi versionado.
