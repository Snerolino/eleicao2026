# QA — lote continuous ops: recon oficial e gates locais

- Data/hora: 2026-08-22T00:07Z
- Objetivo: executar um tick bounded do control plane, manter recon oficial read-only e validar a lane local sem promover dados sem fonte.

## Reconhecimento oficial

- Câmara: `npm run impact:camara:discover` executado em modo read-only, 8 janelas trimestrais 2025–2026. A janela `2025-01-01`–`2025-03-31` falhou fechado com `fetch failed`; as demais responderam `ok`. Resultado agregado: `vote_ids=0` nesta execução, `blocked=network_error`; nenhum voto, identidade, FK ou evento foi reconciliado/aplicado.
- ALRS FED-17: `npm run impact:alrs:residual:repair` em dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: `npm run impact:senado:envelope:adapt` falhou fechado por ausência de `/tmp/senado-nominal-envelope-latest.json` (`ENOENT`). Nenhum PDF, `legislator_id`, FK ou voto foi inferido.
- Auditoria de fontes: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos; gaps reais permanecem: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`. Sem promoção.
- Snapshot: `npm run data:check` verde com 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.

## Gates locais verificados

- `npm run test`: verde — 98 arquivos, 400 testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde — 1.003 candidaturas / 988 fotos.
- `npm run build`: verde — Vite produziu build, sitemap com 1.003 candidatos + 2 estáticas e `release.json` local para HEAD `7e0a0b8f631c...`.
- `npm run smoke:local`: primeira tentativa transitória falhou aguardando `table`; repetição verde com 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: verde.
- Worktree: limpa após os gates antes desta documentação.

## Infraestrutura e bloqueios reais

- `npm run orch:doctor -- --smoke`: `OK=49 WARN=6 FAIL=2`. Falhas: shell cron usa Node `v22.22.2` embora o projeto exija Node 24; rota MCP Codex não comprovada e fallback Codex falhou por token expirado (`401 invalid_refresh_token`). Warnings: OpenCode ausente e Ollama sem preflight; Antigravity foi comprovado.
- A execução dos gates do projeto foi feita explicitamente com Node `v24.19.0`.
- Não houve escrita factual, Supabase, Cloudflare, snapshot, identidade, FK, voto, claim ou matriz neste lote.

## Publicação

- Commit local criado: `67903566e8036c6531fab79674427b864c277040` (`docs: registra tick contínuo de recon oficial`).
- `git push origin main` falhou com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. O commit está apenas local, 32 commits à frente de `origin/main`; nenhum workflow/deploy foi acionado.
- Produção raiz respondeu HTTP 200; `/release.json` respondeu HTTP 403 nesta verificação, portanto não foi possível validar SHA live nem release. O deploy primário Wrangler não foi tentado.

## Próximo passo

- Repetir a recon bounded da janela Câmara bloqueada quando a API voltar, mantendo fail-closed.
- Continuar ALRS/Senado sem aplicação até existir ID oficial, fonte exata, envelope verificável, R0/schema/FK, dry-run e prova de idempotência.
- Manter a lane local/publicação independente dos bloqueios factuais.
