# QA — continuous ops recon — 2026-08-23 14:00 UTC

## Objetivo
Executar novo tick bounded do control plane, mantendo recon oficial
read-only, verificando cobertura de fontes e retentando a publicação pendente.

## Entregue e verificado
- ALRS FED-17 residual (`node scripts/repair-alrs-fed17-residual.mjs`):
  dry-run RC 0, `planned_votes=0`, `planned_event_date_fixes=0`,
  `blocked_remaining=4`, `impact_touched=false`.
- Câmara dos Deputados: API oficial consultada em 8 janelas trimestrais de
  `2025-01-01` a `2026-12-31`, todas `status=ok`, sem reconciliação ou escrita.
  O resultado foi somente inventário de `vote_ids`.
- Auditoria de fontes (`npm run impact:sources:audit`) RC 0, read-only:
  versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`;
  votos `4/2/455`.
- Nenhum candidato, identidade, voto, FK, source reference, claim, Supabase
  remoto ou Cloudflare foi alterado.

## Publicação
- Foram feitas 3 tentativas bounded de `env -u GH_TOKEN git push origin main`.
- Resultado: RC 128 em todas; primeira falhou por DNS de `github.com`, duas
  seguintes retornaram HTTP 403: `Permission to Snerolino/eleicao2026.git denied
  to Snerolino`.
- HEAD local: `4d2a17576700be4ef5b3aaccbeba4aa4c4e17424`; `main` local está 4
  commits à frente de `origin/main`. Nenhum workflow novo foi acionado.

## Bloqueios reais
- Transporte Git indisponível por DNS transitório seguido de HTTP 403 de
  permissão. Portanto não é possível validar backup Cloudflare `334951434`,
  `headSha` remoto ou produção para este HEAD.
- Doctor global permanece RC 1 por shell Node 22.22.2, OpenCode ausente e
  smoke MCP Codex sem evidência estruturada; os gates explícitos anteriores
  foram executados com Node 24.19.0.
- ALRS residual e Senado permanecem fail-closed por ausência de identidade/
  fonte exata e envelope nominal com SHA verificável.

## Próximo passo
Retentar transporte `main -> main` no próximo tick. Se aceitar, validar o
workflow backup `334951434`, seu `headSha`, HTTP da raiz de produção e
`/release.json`. Manter aplicação factual condicionada a R0, schema/FK, fonte
oficial, dry-run e segunda execução idempotente.
