# QA — lote continuous ops recon — 2026-08-23 00:56 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, validar o snapshot/dataset, rodar gates locais e verificar publicação/produção sem promover fatos sem fonte.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado sem loop/sleep.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos de Enio Carlos Terra continuam bloqueados sem ID oficial e fonte exata.
- Câmara oficial read-only: 8 janelas trimestrais consultadas com `--max-pages 1`; 7 `ok` e 1 bloqueada por `network_error`/`fetch failed` na janela `2025-01-01`–`2025-03-31`. Por fail-closed, `vote_ids=0`; nenhum voto foi reconciliado ou aplicado.
- Senado permaneceu fail-closed, sem envelope nominal verificável.
- Dataset TSE conferido explicitamente: CSV `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` com 1.003 linhas e SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot `data/public-candidates.json` com 1.003 registros e SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`. O sincronizador remoto permaneceu dry-run: banco 1.000, criar 3, atualizar 1.000, nenhuma escrita.
- Auditoria estrita de fontes permaneceu read-only e falhou pelo gap real: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Gates locais com Node 24: 401 testes/98 arquivos, TypeScript, schema, `data:check` com 1.003 candidaturas/988 fotos/1 fonte TSE, build com 224 módulos, sitemap 1.003 + 2, `git diff --check` e smoke com 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- Produção revalidada independentemente: raiz HTTP 200 e `/release.json` HTTP 200; live segue `3aae2d0` / SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, versão `0.2.835`, snapshot 1.003.

## Estado e bloqueios
- Worktree estava limpa; build não deixou alterações rastreadas.
- `git push origin main` falhou RC 128 com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Nenhum workflow novo, deploy ou alteração remota foi executado.
- `orch:doctor --smoke` continua RC 1 no shell padrão por Node 22.22.2 incompatível com requisito Node 24, Codex MCP com token expirado/401, OpenCode ausente e smoke estruturado Codex sem evidência. Os gates do projeto foram executados com Node 24. O problema de permissão GitHub permanece bloqueio de publicação.

## Segurança/fonte
Nenhum candidato, voto, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado. Nenhum dado sem fonte foi promovido.

## Próximo passo
Retentar `git push origin main` somente quando a permissão efetiva do GitHub for corrigida; após `main -> main`, validar o workflow backup `334951434`, `headSha`, raiz e `/release.json` em produção. Manter ALRS/Senado fail-closed e continuar recon Câmara em janela bloqueada quando a rede permitir. Aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
