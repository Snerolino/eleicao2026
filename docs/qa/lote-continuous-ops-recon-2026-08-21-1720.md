# Lote continuous-ops — recon bounded e gates locais — 2026-08-21 17:20Z

## Objetivo
Executar novo tick bounded do control plane mantendo reconhecimento oficial, lane local e publicação fail-closed.

## Entregue e verificado
- ALRS FED-17: `node scripts/repair-alrs-fed17-residual.mjs` em dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, 8 janelas trimestrais de 2025–2026, 8/8 páginas iniciais `status=ok`, 700 `vote_ids`; nenhum evento, identidade, FK ou voto aplicado.
- Senado: `adapt-senado-nominal-envelope.mjs` falhou fechado com `ENOENT` porque `/tmp/senado-nominal-envelope-latest.json` não existe; nenhum PDF, `legislator_id`, FK ou voto promovido.
- Dataset vivo: CSV oficial e snapshot comparados: 1.003 IDs em cada lado, diferença 0/0.
- Evidências read-only preservadas em `.orchestrator/runtime/continuous-tick-20260821T172033Z/`.

## Gates locais
Executados com Node 24.19.0; todos exit 0:
- `npm run test`: 98 arquivos / 400 testes aprovados.
- `npx tsc --noEmit`.
- `node scripts/validate-impact-schema.mjs`.
- `npm run data:check`: 1.003 candidaturas / 988 fotos oficiais.
- `npm run build`: sitemap 1.003 candidatos + estáticas; `release.json` gerado.
- `npm run smoke:local`: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`.

## Estado dos dados e bloqueios
- Auditoria estrita de fontes: versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit 2 por gaps reais. Não suprimido.
- Quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata vinculável; nenhuma inferência feita.
- Senado permanece bloqueado por envelope transitório ausente e deriva de evidência.
- Doctor continua exit 1 no shell padrão por Node 22.22.2; OpenCode ausente, fallback Ollama sem preflight e Codex MCP/exec com `401 invalid_refresh_token`.

## Próximo passo
Manter ALRS/Senado/Câmara em recon bounded read-only e lane local independente. Publicar os commits documentais quando a permissão efetiva de push deixar de retornar HTTP 403. Aplicação factual remota somente após R0, schema/FK, fonte oficial, dry-run e idempotência.
