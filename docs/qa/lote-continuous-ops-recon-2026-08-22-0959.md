# QA — lote continuous ops recon — 2026-08-22 09:59 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only da Câmara, revalidação ALRS residual, auditoria de fontes, comparação dataset/snapshot e gates locais antes de qualquer publicação.

## Entregue e verificado
- Câmara oficial: 8/8 janelas trimestrais `2025-01-01` a `2026-12-31`, `max_pages=1`, HTTP/status `ok`; `vote_ids` foram mantidos somente na saída transitória, sem reconciliação ou aplicação.
- ALRS FED-17 residual: dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria estrita de fontes: exit 2 por gaps reais; versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Dataset vivo: CSV oficial `consulta_cand_2026_RS.csv` com SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot com 1.003 IDs e SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`; nenhuma diferença aplicada.

## Gates locais
- `npm run test`: **400 testes / 98 arquivos**, exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: **1.003 candidaturas / 988 fotos / 1 fonte TSE**, exit 0.
- `npm run build`: exit 0; sitemap **1.003 candidatos + 2 estáticas = 1.005 URLs**; release local `d3095fd-20260822T095821707Z`.
- `npm run smoke:local`: exit 0; **1.002 cards**, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: exit 0; worktree sem alterações antes da documentação deste tick.

## Estado dos dados
Nenhum candidato, voto, proposição, evento, identidade, FK, source reference, claim, Supabase ou Cloudflare foi alterado. A descoberta da Câmara e o ALRS residual permanecem read-only/fail-closed.

## Bloqueios reais
- Quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata; não foram inferidos.
- Senado permanece fail-closed por envelope nominal verificável ausente/deriva de SHA/bytes.
- Auditoria estrita ainda encontra gaps substantivos de fontes.
- `npm run orch:doctor -- --smoke`: `OK=49 WARN=6 FAIL=2`; FAIL por shell Node `v22.22.2` quando o projeto exige Node 24 e ausência de evidência da rota MCP Codex, com 401 `invalid_refresh_token`. OpenCode ausente; Ollama sem preflight.
- Publicação continua bloqueada até permissão efetiva do GitHub: estado anterior registrou HTTP 403 no push para `Snerolino/eleicao2026`.

## Próximo passo
Retentar publicação documental em novo tick quando GitHub aceitar `main -> main`; se aceitar, acompanhar workflow backup Cloudflare `334951434`, validar `headSha` e confirmar produção. Manter ALRS/Senado e aplicação factual remota condicionados a R0, schema/FK, fonte oficial, dry-run e idempotência.
