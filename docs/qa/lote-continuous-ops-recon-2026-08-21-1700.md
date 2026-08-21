# Lote continuous-ops — recon bounded e gates locais — 2026-08-21 17:00Z

## Objetivo
Executar um tick bounded do control plane: manter a reconnaissance oficial ativa, verificar a lane local e registrar bloqueios sem promover fatos sem fonte.

## Entregue e verificado
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, intervalo 2025-01-01 a 2026-12-31 dividido em 8 janelas trimestrais; 8/8 páginas iniciais válidas e 700 `vote_ids` descobertos. Nenhuma identidade, FK, evento ou voto foi reconciliado/aplicado.
- ALRS FED-17: `npm run impact:alrs:residual:repair` em dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Senado: envelope transitório `/tmp/senado-nominal-envelope-latest.json` ausente; adaptação não executada e nenhum PDF, `legislator_id`, FK ou voto promovido.
- Dataset vivo: CSV oficial com 1.003 linhas/IDs comparado a `data/public-candidates.json` com 1.003 IDs; diferença dataset→snapshot 0 e snapshot→dataset 0.

## Gates locais
Executados com Node 24.19.0:
- `npm run test`: **0**, 98 arquivos / 400 testes aprovados.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**.
- `npm run data:check`: **0**, 1.003 candidaturas / 988 fotos oficiais.
- `npm run build`: **0**, sitemap com 1.003 candidatos + estáticas; `release.json` gerado para o HEAD `0acf65c`.
- `npm run smoke:local`: **0**, 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: **0**.

## Estado dos dados e bloqueios
- Auditoria estrita `node scripts/audit-legislative-source-coverage.mjs --strict`: exit **2** por gaps reais de fontes; cobertura permanece ALRS/Câmara/Senado `1251/3/112` versões, `1647/2/188` eventos e `4/2/455` votos.
- Os quatro residuais Enio Carlos Terra continuam bloqueados por ausência de ID oficial e fonte exata vinculável. Nenhuma inferência foi feita.
- Senado permanece fail-closed por ausência do envelope transitório e deriva de evidência; não houve escrita remota.
- `npm run orch:doctor -- --smoke`: exit **1** por Node do shell 22.22.2, OpenCode ausente, fallback Ollama sem preflight e rota Codex MCP/exec com `401 invalid_refresh_token`. Os gates foram executados explicitamente no Node 24.19.0.
- Push GitHub continua bloqueado por `HTTP 403 Permission denied` nos ticks anteriores; este lote não altera credenciais nem contorna a proteção.

## Próximo passo
Manter recon oficial bounded (ALRS residual, Senado fail-closed e novos lotes Câmara) e lane local independente. Publicar este checkpoint quando a permissão efetiva de push estiver disponível; aplicação factual remota somente após R0, schema/FK, fonte oficial, dry-run e idempotência.
