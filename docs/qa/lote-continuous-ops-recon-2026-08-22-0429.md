# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 04:29Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only da Câmara, tentativa fail-closed do reparo residual ALRS, comparação do dataset vivo com o snapshot e gates locais completos. Nenhuma escrita factual/remota foi autorizada neste tick além da documentação local.

## Entregue e verificado
- Lock não bloqueante `.orchestrator/runtime/locks/continuous-progress.lock` usado com `flock -n` e liberado ao fim de cada comando.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2`, 25 páginas observadas em janelas trimestrais de 2025–2026, todas `status=ok`, sem `blocked`; `vote_ids` descobertos somente em memória, sem reconciliação ou aplicação.
- ALRS FED-17: dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Dataset: `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; 1.003 IDs no CSV e 1.003 no snapshot, diferença 0/0.
- Auditoria estrita de fontes: gaps reais mantidos — versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit 2, sem promoção.

## Gates locais
- `npm run test`: OK — 400 testes em 98 arquivos.
- `npx tsc --noEmit`: OK.
- `node scripts/validate-impact-schema.mjs`: OK — fixtures boas aceitas e ruins rejeitadas.
- `npm run data:check`: OK — 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: OK — sitemap 1.003 candidatos + 2 estáticas; `release.json` local `128e473-20260822T042748198Z`.
- `npm run smoke:local`: OK — 1.002 cards, 0 falhas HTTP, 0 erros online, service worker pronto.
- `git diff --check`: OK.

## Bloqueios reais
- `npm run orch:doctor -- --smoke`: FAIL por shell Node 22.22.2 quando o projeto exige Node 24 e por rota MCP Codex não comprovada; Codex reportou `401 invalid_refresh_token`. OpenCode ausente e Ollama sem preflight são WARNs.
- Senado permanece fail-closed por ausência de `/tmp/senado-nominal-envelope-latest.json`; nenhum PDF, legislator_id, FK ou voto promovido.
- Auditoria estrita continua não verde por fontes ausentes; não suprimir.
- Publicação remota depende de push efetivo. O HEAD local está à frente de `origin/main`; nenhum dado remoto foi alterado neste tick.

## Próximo passo
Retentar publicação documental após validar a permissão GitHub efetiva; se o push ocorrer, disparar/verificar o workflow backup Cloudflare `334951434`, validar HTTP de produção e `headSha`. Manter Câmara em recon bounded, ALRS/Senado fail-closed e aplicação remota condicionada a R0/schema/FK/fonte/dry-run/idempotência.
