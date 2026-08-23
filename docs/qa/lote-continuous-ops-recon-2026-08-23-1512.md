# QA — tick continuous ops: recon oficial e transporte

- **Data/hora:** 2026-08-23 15:12 UTC
- **Objetivo:** executar o chunk bounded do control plane, manter recon oficial read-only e retentar a publicação do `main` sem aplicar fatos sem evidência.

## Entregue e verificado

- Lock não bloqueante usado em `.orchestrator/runtime/locks/continuous-progress.lock`; cada comando terminou e liberou o lock.
- Bootstrap revalidado: branch `main`, HEAD local `5d1af56ec4a819ffa0323f4c64870e4386e18777`, worktree limpa antes deste registro, local à frente de `origin/main`.
- `npm run orch:doctor -- --smoke`: RC 1 por Node 22 no shell, OpenCode ausente e smoke MCP Codex sem evidência estruturada. Antigravity/leitura do `AGENTS.md`, autenticação GitHub e demais checks disponíveis permaneceram OK.
- `npm run data:check`: RC 0; 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run impact:alrs:residual:repair -- --dry-run`: RC 0; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro Enio Carlos Terra continuam sem ID oficial e fonte exata.
- `npm run impact:sources:audit`: RC 0, read-only; gaps preservados: versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Recon Câmara oficial read-only (`discover-camara-vote-ids.mjs`, 8 janelas trimestrais, `--max-pages 1`): 7 janelas OK e a janela `2025-01-01`–`2025-03-31` bloqueada por `fetch failed`; saída fail-closed com `vote_ids=[]` e RC 2. Nenhum ID foi reconciliado ou aplicado.
- `git push origin main` foi tentado 3 vezes: HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`), DNS intermitente (`Could not resolve host: github.com`) e HTTP 403. Nenhum workflow novo foi disparado.

## Estado de dados e segurança

Nenhum candidato, identidade, voto, FK, `source_reference`, claim, Supabase remoto, Cloudflare ou segredo foi alterado. Senado permanece fail-closed enquanto a derivação de SHA/`legislator_id` não for comprovada. O primeiro trimestre da Câmara permanece em circuito aberto de reconciliação de rede; não tratar as 7 janelas OK como cobertura completa.

## Próximo passo

Retentar transporte `main -> main` no próximo tick. Se aceitar, validar workflow backup `334951434`, `headSha`, raiz de produção e `/release.json`. Manter ALRS/Senado/Câmara na trilha read-only; qualquer aplicação remota continua condicionada a R0, schema/FK, fonte oficial exata, dry-run e idempotência.
