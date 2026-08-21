# QA — lote continuous ops recon — 2026-08-21 18:19 UTC

## Objetivo
Executar um tick bounded das quatro lanes: recon oficial read-only (ALRS FED-17 residual, Câmara e Senado), comparação do dataset vivo com o snapshot, verificação da publicação existente e preparação do próximo gate local, sem aplicar fatos remotamente sem R0/schema/FK/fonte/dry-run/idempotência.

## Entregue e verificado
- Lock bounded adquirido com `flock -n` e liberado no mesmo comando; nenhum loop/sleep.
- ALRS FED-17: `node scripts/repair-alrs-fed17-residual.mjs` em dry-run falhou fechado com `JWT issued at future`; não houve voto, correção de data ou escrita.
- Câmara: `node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` consultou 8/8 janelas oficiais trimestrais, todas `status=ok`; IDs foram apenas descobertos e não reconciliados/aplicados.
- Senado: `node scripts/adapt-senado-nominal-envelope.mjs` falhou fechado por `ENOENT` em `/tmp/senado-nominal-envelope-latest.json`; nenhum PDF, `legislator_id`, FK ou voto foi promovido.
- Auditoria read-only estrita: `npm run impact:sources:audit` equivalente via `node scripts/audit-legislative-source-coverage.mjs --strict` retornou exit 2 por gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Dataset: CSV oficial completo e snapshot têm `1003` IDs cada; somente no dataset `0`, somente no snapshot `0`.
- Produção: `https://rs.votopraquem.org` respondeu HTTP 200. `/release.json?cb=f975f80` respondeu HTTP 200 e confirmou live `sha=e925327276b82481a348d4db3e2339d075dfe9a3`, snapshot `row_count=1003`; o commit local deste tick ainda não está publicado.

## Estado dos dados
Nenhuma escrita factual, identidade, FK, voto, claim, source reference, Supabase, Cloudflare ou snapshot ocorreu. Os quatro residuais Enio Carlos Terra permanecem bloqueados porque o manifesto oficial registra ausência no catálogo ALRS; Senado permanece sem envelope nominal verificável.

## Gates / bloqueios
- `npm run orch:doctor`: exit 1; bloqueio real do shell Node 22.22.2 onde o projeto exige Node 24. WARNs: OpenCode ausente, Ollama sem preflight e rota Hermes→Codex MCP não exercitada.
- Gates Node 24.19.0 verdes: `npm run test` (400 testes/98 arquivos), `npx tsc --noEmit`, `node scripts/validate-impact-schema.mjs`, `npm run data:check` (1003 candidaturas/988 fotos), `npm run build` (sitemap 1003 candidatos; `release.json` para `f975f80`), `npm run smoke:local` (1002 cards/0 HTTP/console errors/service worker) e `git diff --check`.
- Push GitHub segue bloqueado por HTTP 403 (`Permission denied`) apesar de `gh` autenticado; `origin/main` permanece em `e925327`, enquanto a branch local contém commits documentais pendentes.

## Próximo passo
Criar commit documental após os gates verdes e tentar publicação/push; se o 403 persistir, manter o bloqueio explícito e continuar a recon oficial read-only no próximo tick. Aplicação remota só após R0, schema/FK, fonte oficial exata, dry-run validado e prova de idempotência.
