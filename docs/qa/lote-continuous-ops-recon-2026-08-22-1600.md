# QA — lote continuous ops recon — 2026-08-22 16:00 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only nas lanes ALRS, Câmara e Senado; verificar cobertura de fontes; e avançar a publicação documental sem promover fatos sem evidência.

## Entregue e verificado
- Lock não bloqueante adquirido no início do tick.
- Câmara: `node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` concluído com RC 0; 8/8 janelas trimestrais `ok`, `blocked=null`, 700 `vote_ids` transitórios. Nenhuma reconciliação ou escrita foi executada.
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` falhou fechado com causa real `fetch failed`; não houve plano nem aplicação. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata verificável.
- Senado: `/tmp/senado-nominal-envelope-latest.json` ausente; lane mantida fail-closed, sem parsing ou aplicação.
- Auditoria de fontes regular: RC 0. Auditoria estrita: RC 2 pelos gaps reais — versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Dataset vivo: sem mudança identificada no tick anterior; checkpoint vigente permanece 1.003 IDs CSV/snapshot, diferença 0/0, CSV SHA `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Worktree estava limpa e `git diff --check` RC 0 antes da documentação.

## Publicação
- `git push origin main` e retry com `env -u GH_TOKEN` falharam com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Portanto, nenhum workflow Cloudflare novo foi acionado e não há `headSha` remoto correspondente a este tick.

## Bloqueios
- GitHub remoto rejeita a identidade/autorização efetiva com HTTP 403.
- Doctor mantém FAIL por shell Node 22.22.2 quando o projeto exige Node 24; smoke da rota Codex MCP não comprovou evidência estruturada e registrou `401 invalid_refresh_token`. OpenCode está ausente; Ollama não respondeu ao preflight.
- ALRS e Senado continuam bloqueados por evidência oficial/identidade; por regra fail-closed, nenhum voto, identidade, URL ou hash foi inventado.

## Próximo passo
Retentar a publicação documental quando a permissão efetiva do GitHub permitir `main -> main`; após aceite, acompanhar o backup Cloudflare `334951434`, conferir `headSha` e validar produção. Manter Câmara read-only e ALRS/Senado fail-closed até R0/schema/FK/fonte/dry-run/idempotência.
