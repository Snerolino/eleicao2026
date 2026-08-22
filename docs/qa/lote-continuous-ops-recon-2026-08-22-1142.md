# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 11:42 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, verificar o estado do dataset e fechar os gates locais antes da publicação documental.

## Entregue e verificado
- Lock `flock -n` testado e liberado sem manter processo em espera.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2`, 8/8 janelas trimestrais 2025–2026 `status=ok`, `blocked=null`, reconciliação não executada.
- Auditoria de cobertura read-only (`npm run impact:sources:audit`) exit 0; gaps permanecem: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Auditoria estrita (`--strict`) exit 2 pelos gaps reais; nenhum dado foi promovido.
- Senado fail-closed: `/tmp/senado-nominal-envelope-latest.json` ausente; nenhum PDF, `legislator_id`, FK ou voto promovido.
- Snapshot público validado: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE; nenhum refresh ou alteração factual.

## Gates locais
Todos executados com Node `v24.19.0` e exit 0:
- `npm run test`: 401 testes em 98 arquivos.
- `npx tsc --noEmit`: 0.
- `node scripts/validate-impact-schema.mjs`: checkpoint OK.
- `npm run data:check`: 1.003 candidaturas / 988 fotos.
- `npm run build`: Vite/PWA OK, sitemap 1.003 candidatos + 2 estáticas, `release.json` `d884f84-20260822T114135484Z`.
- `git diff --check`: 0.
- `npm run smoke:local`: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Publicação
Commit documental criado (`docs: registra tick de recon oficial`). `git push origin main` e retry com `env -u GH_TOKEN` falharam com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); nenhum workflow novo foi acionado. A produção existente foi apenas revalidada: raiz HTTP 200 e `/release.json` HTTP 200.

## Bloqueios reais
- Push GitHub tem histórico imediato de HTTP 403 por permissão efetiva; não mascarar como sucesso.
- Doctor permanece com FAIL porque o shell padrão usa Node 22.22.2, embora os gates acima tenham sido executados explicitamente com Node 24.19.0.
- OpenCode não instalado; rota Codex MCP não foi exercitada neste tick.
- ALRS residual e Senado continuam sem evidência oficial/identidade suficiente; aplicação remota permanece proibida.

## Próximo passo
Tentar `git push origin main`; se aceito, acompanhar workflow backup Cloudflare `334951434`, conferir `headSha` do run e validar `https://rs.votopraquem.org` e `/release.json`. Manter recon e aplicação factual fail-closed.
