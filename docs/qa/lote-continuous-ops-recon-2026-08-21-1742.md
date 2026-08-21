# Lote continuous-ops — recon bounded e gates locais — 2026-08-21 17:42Z

## Objetivo
Executar mais um tick bounded mantendo as quatro lanes: reconhecimento oficial read-only, lane local, publicação verificável e aplicação factual remota fail-closed.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido de forma não bloqueante e liberado ao fim do tick.
- ALRS FED-17: dry-run com `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: API oficial `dadosabertos.camara.leg.br/api/v2/votacoes`, 8 janelas trimestrais 2025–2026, 8/8 páginas iniciais `status=ok`; IDs descobertos em modo read-only, sem reconciliação ou aplicação.
- Senado: adaptação falhou fechado por `ENOENT` — `/tmp/senado-nominal-envelope-latest.json` ausente; nenhum PDF, `legislator_id`, FK ou voto promovido.
- Dataset vivo vs snapshot: comparação corrigida para CSV oficial delimitado por `;`; `1.003` IDs em cada lado, diferença `0/0`.
- Auditoria estrita de fontes: ALRS/Câmara/Senado sem fonte em versões `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit 2 por gaps reais, sem supressão.

## Gates locais
Executados com Node 24.19.0; comando completo terminou exit 0:
- `npm run test`.
- `npx tsc --noEmit`.
- `node scripts/validate-impact-schema.mjs`.
- `npm run data:check`.
- `npm run build`: sitemap com 1.003 candidatos + estáticas; `release.json` gerado para `ff2c221`.
- `npm run smoke:local`: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`.

## Publicação e bloqueios
- Commit documental `9731678` criado após os gates; `main` está 12 commits à frente de `origin/main`.
- `git push origin main` e `env -u GH_TOKEN git push origin main` falharam com HTTP 403 (`Permission denied`); não houve deploy deste tick.
- Produção respondeu HTTP 200, mas `/release.json?cb=9731678` ainda aponta para o commit live anterior `e925327`; os workflows recentes não têm run para `9731678`.
- Doctor padrão continua exit 1 por shell Node 22.22.2; OpenCode ausente, Ollama sem preflight e smoke Codex MCP/exec com `401 invalid_refresh_token` são bloqueios de infraestrutura, não dados.
- Quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata; Senado sem envelope verificável; gaps de fontes permanecem.
- Nenhuma escrita factual, identidade, FK, voto, claim, source reference, Supabase ou Cloudflare ocorreu.

## Próximo passo
Manter recon oficial bounded e lane local independente. Republicar os 11 commits documentais assim que a permissão efetiva de push deixar de retornar HTTP 403. Aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
