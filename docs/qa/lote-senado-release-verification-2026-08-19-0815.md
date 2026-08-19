# QA — verificação de publicação do tick Senado (2026-08-19 08:15 UTC)

## Commit e CI
- Commit documental de verificação publicado: `97435fbc865a9993576c6d43679158a5ed5328b6`.
- Workflow backup `Deploy to Cloudflare Pages (backup)`, ID `334951434`.
- Run `32232671812`: `completed`, `success`, `headSha` idêntico ao commit.

## Produção
- `https://rs.votopraquem.org`: HTTP 200.
- `https://rs.votopraquem.org/release.json`: HTTP 200.
- `release.json.sha`: `97435fbc865a9993576c6d43679158a5ed5328b6` (confere).
- Versão publicada: `0.2.409`.
- Snapshot publicado: 1003 candidaturas.

## Segurança e escopo
A publicação contém somente a documentação do reconhecimento oficial read-only. Nenhum voto, identidade, FK, `source_reference`, matriz, claim, migration, RLS/RPC/Auth/Storage ou segredo foi alterado.
