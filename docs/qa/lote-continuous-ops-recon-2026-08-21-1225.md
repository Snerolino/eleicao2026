# Lote continuous-ops — recon oficial e gates locais — 2026-08-21 12:25 UTC

## Objetivo
Executar um tick bounded do control plane, mantendo recon oficial read-only, lane local independente e publicação somente após gates verdes.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n`.
- ALRS FED-17 dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: API oficial `dadosabertos.camara.leg.br`, quatro janelas de até três meses em 2026, todas `status=ok`; IDs oficiais retornados; nenhuma reconciliação ou aplicação.
- Senado: adaptação fail-closed; `/tmp/senado-nominal-envelope-latest.json` ausente. Nenhum dado inferido ou aplicado.
- Auditoria estrita de fontes (read-only): 1.397 proposições; versões sem fonte ALRS 1.251, Câmara 3, Senado 112; eventos sem fonte ALRS 1.647, Câmara 2, Senado 188; votos sem fonte ALRS 4, Câmara 2, Senado 455. Exit 2 por gaps reais.
- Snapshot não mudou: `git diff` sem alterações em snapshot/manifesto e worktree iniciou limpa.

## Gates locais (Node 24.19.0)
- `npm run test`: 97 arquivos / 398 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: 1.003 candidaturas / 988 fotos, aprovado.
- `npm run build`: aprovado; sitemap com 1.003 candidatos + estáticas = 1.005 URLs; `release.json` gerado.
- `git diff --check`: aprovado.
- `npm run smoke:local`: aprovado; 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Bloqueios reais
- Quatro votos residuais ALRS Enio/Terra continuam sem identidade/fonte exata; dry-run permaneceu sem escrita.
- Senado bloqueado pela ausência do envelope transitório e pela deriva de evidência já registrada; fail-closed.
- Gaps substantivos de fontes permanecem; auditoria estrita saiu com exit 2.
- `npm run orch:doctor -- --smoke` segue FAIL apenas na infraestrutura: shell em Node 22.22.2 embora o projeto exija Node 24; smoke Codex MCP falhou por `401 invalid_refresh_token`; OpenCode ausente e Ollama sem preflight são WARNs opcionais.

## Publicação
Após os gates verdes, publicar commit documental via `origin/main`, disparar o workflow backup Cloudflare `334951434` se necessário, validar `headSha`, HTTP 200, `/release.json` e smoke remoto.

## Próximo passo
Nova recon bounded oficial e lane local independente. Aplicação factual remota somente após R0, schema/FK, fonte oficial exata, dry-run e idempotência.
