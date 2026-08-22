# QA — lote continuous ops recon — 2026-08-22 04:07 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, verificar o snapshot vivo, rodar gates locais e preparar publicação sem promover fatos sem fonte.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao fim de cada operação.
- Câmara: `node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 3`; 22 janelas/páginas observadas, 21 respostas `ok` e a janela `2025-01-01..2025-03-31` bloqueada com `fetch failed`. Por fail-closed, `vote_ids=[]`; nenhum ID foi reconciliado ou aplicado.
- ALRS residual Enio Carlos Terra: dry-run `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`; nenhum fato foi promovido.
- Senado: envelope nominal `/tmp/senado-nominal-envelope-latest.json` ausente; nenhum PDF, `legislator_id`, FK ou voto promovido.
- Auditoria estrita read-only: gaps reais — versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit efetivo `2`.
- Dataset: CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`, 1.003 linhas; snapshot 1.003 registros. Nenhum refresh necessário.
- Gates locais: `npm run test` — 400 testes/98 arquivos, exit 0; `npx tsc --noEmit` exit 0; `node scripts/validate-impact-schema.mjs` exit 0; `npm run data:check` — 1.003 candidaturas/988 fotos/1 fonte TSE, exit 0; `npm run build` exit 0, sitemap 1.003 + 2 e release local `763f095-20260822T040601426Z`; `npm run smoke:local` exit 0 — 1.002 cards, 0 falhas HTTP, 0 erros online de console, service worker pronto; `git diff --check` exit 0.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200. Live segue `e925327276b82481a348d4db3e2339d075dfe9a3`, snapshot remoto 1.003 e SHA de dataset idêntico; build local ainda não publicado.
- Workflow backup confirmado via GitHub API: `334951434 Deploy to Cloudflare Pages (backup)` ativo. Nenhum run novo foi acionado porque o push ainda não foi efetivo.

## Estado dos dados
Nenhuma escrita em `data/public-candidates.json`, claims, source references, Supabase, Cloudflare, identidade, FK, voto ou matriz.

## Bloqueios reais
1. Câmara Q1 bloqueada por `fetch failed`; recon falhou fechado.
2. Quatro residuais ALRS sem ID oficial e fonte exata.
3. Senado sem envelope nominal verificável.
4. Auditoria estrita com gaps de fontes, portanto sem promoção.
5. Publicação depende de `git push` efetivo; HEAD local está à frente de `origin/main`.
6. Doctor cron continua com FAIL porque o shell usa Node 22.22.2 enquanto o projeto exige Node 24; os gates do projeto foram executados e passaram no runtime disponível para os scripts.

## Publicação verificada
- Commit documental `c80c0bb966e3de76eebfc80f2b033b5dc215080d` criado.
- `git push origin main` falhou com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Retry após `gh auth setup-git` falhou com a mesma causa. Nenhum workflow/deploy novo foi acionado.

## Próximo passo
Retentar publicação somente quando a permissão efetiva do remoto mudar; depois verificar o workflow backup, `headSha`, produção e smoke remoto. Manter ALRS/Senado fail-closed e repetir recon bounded da Câmara; aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
