# QA — continuous ops recon — 2026-08-23 03:18 UTC

## Objetivo
Executar o tick bounded do control plane: manter reconhecimento oficial read-only ativo,
revalidar os bloqueios factuais e tentar a publicação do HEAD local sem fabricar dados.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n`.
- Estado Git revalidado: branch `main`, HEAD local `53b273b46ed81bfd4851184fe30ce80601c6d848`, worktree limpa no início, `39` commits à frente de `origin/main`.
- Dataset público revalidado: `data/public-candidates.json` com `1.003` registros, `761786` bytes, SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`; `../dataset2026` contém `22` CSVs.
- Auditoria de fontes read-only RC 0: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Gaps foram preservados; nenhum fato foi promovido.
- ALRS FED-17 residual em dry-run RC 0: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara oficial em `dadosabertos.camara.leg.br/api/v2` consultada read-only em 8 janelas trimestrais, todas `status=ok`, `blocked=null`; IDs apenas inventariados, sem reconciliação ou escrita.
- Produção revalidada: `https://rs.votopraquem.org` HTTP 200 e `/release.json` HTTP 200. Live continua no release `3aae2d0` / versão `0.2.835`, sem correspondência com o HEAD local.

## Publicação
- `gh api repos/Snerolino/eleicao2026` confirma `permissions.push=true` e `admin=true` para o usuário `Snerolino`.
- `git push origin main` foi tentado com o helper padrão, token explícito via `gh auth token` e helper inline; todos retornaram HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- SSH alternativo também foi testado e falhou com `Permission denied (publickey)`.
- Causa real permanece divergência entre a identidade/permissão reportada pela API do GitHub e a credencial efetiva aceita pelo transporte Git HTTPS; não houve bypass nem mutação remota.

## Estado dos dados e bloqueios
- Nenhuma alteração factual, Supabase, migration, RLS, Cloudflare ou workflow remoto foi executada.
- Senado segue fail-closed sem envelope nominal com SHA verificável.
- Publicação bloqueada por autenticação/permissão efetiva do transporte Git. O deploy não pode ser validado para este HEAD enquanto o push não chegar ao remoto.
- Doctor permanece degradado por Node padrão 22 (projeto exige Node 24), Codex com refresh token inválido/401 e OpenCode ausente; isso não impediu os scouts read-only nem a verificação local anterior.

## Próximo passo
Retentar `main -> main` somente após correção/revalidação da credencial de transporte Git; se aceitar,
disparar/verificar o workflow backup `334951434`, comparar `headSha` com o commit publicado e revalidar
`rs.votopraquem.org`/`release.json`. Manter ALRS, Senado e gaps de fontes fail-closed até evidência oficial,
ID exato, manifesto/hash, dry-run e idempotência.
