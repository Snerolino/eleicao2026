# QA — dry-run factual histórico Câmara (2026-08-19)

## Objetivo

Confirmar a publicação do writer idempotente de fontes históricas e reexecutar,
sem escrita remota, o envelope factual histórico Câmara.

## Evidência verificada

- Worktree limpa; `HEAD` local e `origin/main`: `5cac9a8a3cca5906f1178f55c575c84b99102d9b`.
- Workflow backup Cloudflare `334951434`, run `32205537792`: `completed/success`,
  `headSha` idêntico ao `HEAD`; run `32205704978` posterior foi `skipped`.
- Produção `https://rs.votopraquem.org/release.json`: HTTP 200, SHA
  `5cac9a8a3cca5906f1178f55c575c84b99102d9b`, versão `0.2.371`, snapshot com
  `1003` candidaturas.
- `npm run impact:camara:historical:envelope:build` com Node `v24.19.0`:
  `2` proposições, `6` eventos, `84` votos, `18` identidades elegíveis.
- `npm run impact:camara:sources:audit`: `7` URLs, todas HTTP 200; manifesto
  regenerado com bytes/SHA-256.
- `npm run impact:dryrun data/legislative-import/camara/historical-contract-envelope.json`:
  exit 0; plano `2/6/6/84` para proposições/versões/eventos/votos; nenhuma
  escrita realizada.
- Oito identidades inelegíveis permanecem fail-closed; nenhum voto, FK, UUID,
  matriz ou alteração remota foi aplicado.

## Bloqueios

- A execução continua deliberadamente em dry-run. Aplicação factual depende de
  revalidar identidade/schema/FK remotos e resolver as 7 referências por UUID e
  hash exatos no catálogo remoto. Não houve tentativa de contornar esses gates.

## Próximo passo

Auditar o catálogo remoto e as FKs por `tse_candidate_id`; só então preparar a
aplicação idempotente das 7 referências e do envelope elegível, mantendo os 8
casos bloqueados fora do plano.

## Publicação deste checkpoint

- Commit documental: `1c8fc0bcfef5fa2633143640844659c5fddabbff` publicado em
  `origin/main`.
- Backup Cloudflare `334951434`, run `32206014628`, concluiu `success` com
  `headSha` idêntico ao commit.
- Produção confirmada após o run: `https://rs.votopraquem.org/release.json` respondeu
  HTTP 200 com SHA `1c8fc0bcfef5fa2633143640844659c5fddabbff`, versão `0.2.0` e
  snapshot de `1003` candidaturas.
