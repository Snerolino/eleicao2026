# QA — lote continuous ops editorial batch 003 — 2026-08-27

## Objetivo
Retomar o ciclo bounded após mudança de fingerprint, reconciliar fontes e fatos nominais ALRS, validar o lote editorial com classifier e reviewer independentes, aplicar somente decisões com hash exato/RPC autenticada e reconstruir o próximo lote.

## Entregue e verificado
- Manifesto de descoberta ALRS permaneceu fresco (`2,2h`); nova descoberta oficial foi corretamente adiada.
- Reconciliação de versões: `782` versões resolvidas e `782` já presentes em matrizes; `51` candidatos de perfil.
- Reconciliação nominal ALRS: `25.616` linhas de origem, `25.616` correspondências exatas e já presentes; `missing=0`, conflitos `0`, ambíguos `0`, bloqueios de identidade/proposição `0`.
- Import factual nominal: `idle_no_missing_safe_rows`; nenhuma linha factual nova foi inserida.
- Fontes substantivas: cache fresco com `767` proposições e `959` versões verdes.
- Materialização de perfis: `28.839` votos, `28.839` índices e `79` perfis.
- Lote editorial: `25` proposições, `50` ocorrências/votos factuais, `4` candidatos únicos antes da aplicação; classifier/reviewer produziram `25/25` decisões aprovadas, `0` needs_changes, `0` erros e `0` itens exigindo revisão externa.
- Aplicação remota: `25/25` chamadas autenticadas a `record_impact_editorial_disposition`, todas `status=applied`, `0` erros. Nenhum voto factual, score ou matriz aprovada foi alterado.
- Reconciliação pós-apply: `782` versões resolvidas e presentes; próximo lote reconstruído com `25` proposições, `50` ocorrências/votos e `6` candidatos únicos, permanecendo `pending_review`.
- Portal: `published_verified`; `https://rs.votopraquem.org/` e `/release.json` responderam HTTP `200`.

## Estado dos dados
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: `1003` IDs e `553194` bytes; SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Snapshot público: `1003` candidaturas, `988` fotos oficiais; diferença contra o CSV canônico: `0/0`.
- O snapshot e os catálogos derivados foram regenerados sem dados crus ou credenciais.

## Gates locais
- Testes: `438/438` em `106` arquivos, verde.
- TypeScript: verde (`npx tsc --noEmit`).
- Schema de impacto: verde.
- `npm run data:check`: verde, `1003` candidaturas e `988` fotos.
- `npm run build`: verde, `237` módulos e sitemap com `1003 + 2` URLs; apenas aviso conhecido de chunk >500 kB.
- `git diff --check`: verde.

## Bloqueios
- Nenhum bloqueio no lote atual.
- Permanecem gaps históricos de cobertura de fontes strict ALRS/Câmara/Senado conforme auditoria anterior; este ciclo não inventou nem aplicou fatos para esses gaps.
- O transporte Git e o deploy backup ainda precisam ser confirmados após o commit deste checkpoint.

## Próximo passo
Commit/push dos artefatos versionados e, se o transporte aceitar, validar o workflow backup Cloudflare por `headSha`, HTTP de produção e `/release.json`. No próximo tick, manter reconciliação read-only e aplicar somente o lote novo após validação independente com hash exato.
