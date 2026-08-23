# QA — continuous ops recon 2026-08-23 08:52 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, validar o lote local de aprovação de matrizes e verificar a publicação do HEAD atual sem promover fatos sem fonte.

## Entregue e verificado
- O commit `7a401fe21f8dba1ff8ffaefd7f6f22c2eff827e5` (`feat: adicionar aprovacao de matrizes no admin`) está em `main` e em `origin/main`; worktree limpa antes deste registro.
- Recon Câmara oficial read-only: 8/8 janelas trimestrais 2025–2026 com `status=ok`, `blocked=null`; IDs foram apenas inventariados, sem reconciliação ou aplicação.
- ALRS FED-17 residual: `node scripts/repair-alrs-fed17-residual.mjs --dry-run` falhou fechado com `fetch failed`; os 4 casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria de fontes regular RC 0: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Nenhum fato foi promovido.
- Dataset vivo versus snapshot, por `SQ_CANDIDATO`: `1003/1003`, diferença `0/0`; SHA do CSV oficial `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais (Node 24.19.0)
- `npm run test`: RC 0 — 98 arquivos, 401 testes.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: RC 0 — 224 módulos, sitemap 1003 candidatos + 2 estáticas, `release.json` local `7a401fe-20260823T085152713Z`.
- `git diff --check`: RC 0.
- `npm run smoke:local`: RC 0 — 1002 cards, 0 falhas HTTP, 0 erros online, service worker pronto.

## Publicação e bloqueios
- GitHub remoto já reflete exatamente o HEAD (`main == origin/main`); não foi necessário novo commit/push neste tick.
- `/release.json` de produção respondeu HTTP 200 e reportou SHA `7a401fe21f8dba1ff8ffaefd7f6f22c2eff827e5`, versão `0.2.901`, snapshot 1003 e o mesmo SHA oficial do CSV.
- A checagem da raiz `https://rs.votopraquem.org` teve falha transitória de DNS (`curl: Could not resolve host`, HTTP 000); repetir em próximo tick. A verificação de `/release.json` foi bem-sucedida.
- `gh run list` falhou por indisponibilidade de `api.github.com`; não há evidência deste tick sobre o estado do workflow backup/headSha além da confirmação independente do `release.json`.
- Doctor permanece degradado: shell padrão Node 22.22.2 incompatível com requisito Node 24, OpenCode ausente e smoke MCP Codex sem evidência estruturada; gates do projeto foram executados explicitamente com Node 24.19.0.
- Nenhuma escrita factual em Supabase, migration, RLS, source reference, claim ou Cloudflare foi executada. Aplicação remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.

## Próximo passo
Retentar a raiz de produção e a consulta do workflow backup `334951434` quando DNS/API responder; manter ALRS/Senado fail-closed e continuar recon oficial Câmara sem aplicar IDs transitórios.
