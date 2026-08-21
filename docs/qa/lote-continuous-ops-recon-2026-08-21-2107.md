# Lote continuous ops — recon oficial e gates locais — 2026-08-21 21:07 UTC

## Objetivo
Executar um tick bounded das quatro lanes: recon oficial read-only, verificação local, publicação condicionada e registro dos bloqueios sem aplicar fatos remotamente.

## Entregue e verificado
- Lock não bloqueante `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro votos residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata; nada foi inferido.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2`, 2025-01-01 a 2026-12-31 dividido em janelas trimestrais, `max_pages=3`; páginas observadas válidas, `blocked=null`, IDs somente em memória/read-only. Nenhuma reconciliação ou aplicação.
- Senado: `/tmp/senado-nominal-envelope-latest.json` ausente; adaptação não executada e o fluxo permaneceu fail-closed. Nenhum `legislator_id`, FK ou voto promovido.
- Snapshot público: `npm run data:check` confirmou 1.003 candidaturas e 988 fotos oficiais.
- Auditoria de fontes read-only: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos; gaps reais mantidos: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; auditoria não é gate verde enquanto houver gaps.

## Gates locais
- `npm run test -- --passWithNoTests`: PASS — 98 arquivos, 400 testes.
- `npx tsc --noEmit`: PASS.
- `node scripts/validate-impact-schema.mjs`: PASS.
- `npm run data:check`: PASS — 1.003/988.
- `npm run build`: PASS — sitemap com 1.003 candidatos/1.005 URLs; release local `d1b4072-20260821T210659753Z`.
- `npm run smoke:local`: PASS — 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: PASS.

## Publicação
- Worktree limpa no início, HEAD local `d1b40726df3916b0d21de0794a770a6eb156a803`, `main` 23 commits à frente de `origin/main`.
- Produção respondeu HTTP 200, mas `/release.json` ainda reporta release anterior `e925327-20260821T145742462Z`; portanto este tick não está publicado.
- Não houve push/deploy novo: a permissão efetiva de GitHub continua bloqueando `git push origin main` com HTTP 403, apesar de `gh` autenticado. Não houve escrita Supabase, Cloudflare ou factual remota.

## Bloqueios reais
1. Push GitHub HTTP 403; sem push não há workflow backup Cloudflare nem promoção do commit local.
2. Shell do doctor usa Node 22.22.2; gates foram executados explicitamente com Node 24.19.0.
3. Codex MCP/exec não comprovado pelo doctor por token expirado/`401 invalid_refresh_token`; OpenCode ausente e Ollama sem preflight.
4. Envelope nominal do Senado ausente.
5. Gaps de fontes legislativas e quatro residuais ALRS sem evidência exata.

## Próximo passo
Continuar recon oficial bounded e lane local independente; tentar publicação somente após resolver a credencial efetiva de push. Aplicação factual remota permanece condicionada a R0, schema/FK, fonte oficial exata, dry-run e prova de idempotência.
