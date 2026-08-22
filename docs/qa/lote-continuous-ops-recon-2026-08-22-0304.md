# Lote continuous ops — recon oficial e gates locais — 2026-08-22 03:04 UTC

## Objetivo
Executar um tick bounded do control plane: manter recon oficial ativa, validar a coleção pública contra o mirror `../dataset2026`, rodar gates locais e verificar produção sem promover fatos sem fonte/identidade/FK.

## Entregue e verificado

- Lock não bloqueante `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado com `flock -n`.
- Câmara: `node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 3` consultou 22 páginas oficiais; 22 `ok`, `blocked=null`, 2.100 `vote_ids` descobertos somente em memória. Nenhuma reconciliação ou escrita remota.
- ALRS FED-17 residual: `node scripts/repair-alrs-fed17-residual.mjs` em dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra permanecem bloqueados por ausência de ID oficial/fonte exata.
- Senado permanece fail-closed: não existe envelope nominal verificável com PDFs/`legislator_id`/SHA; nenhum voto ou identidade promovido.
- Dataset candidato: `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` tem 1.003 linhas; `data/public-candidates.json` tem 1.003 registros. SHA observado do CSV: `7c80d8260618ddc18ce62b44f12f7c463032c937f7f6ea5179cf75943f4207ea`. `npm run data:check` confirmou o snapshot público.
- Produção: `https://rs.votopraquem.org` HTTP 200; `/release.json` HTTP 200, 404 bytes. Não foi inferido SHA live a partir do conteúdo sem validação adicional.

## Gates locais (Node 24.19.0)

- `npm run test`: **0**, 98 arquivos / 400 testes aprovados.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**, contratos bons aceitos e fixtures ruins rejeitadas.
- `npm run data:check`: **0**, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: **0**, sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `92d74a3-20260822T030318318Z`.
- `npm run smoke:local`: **0**, 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: **0**; worktree limpa antes deste documento.

## Auditoria de fontes

`node scripts/audit-legislative-source-coverage.mjs --strict` executou somente leitura e saiu **2** por gaps reais:

- versões: ALRS 1.251, Câmara 3, Senado 112 sem fonte;
- eventos: ALRS 1.647, Câmara 2, Senado 188 sem fonte;
- votos: ALRS 4, Câmara 2, Senado 455 sem fonte;
- fila de recuperação de votos: 4 itens.

Não houve promoção, alteração de snapshot, claim, source reference, FK, voto, matriz, Supabase ou Cloudflare.

## Bloqueios reais

- `npm run orch:doctor -- --smoke`: `OK=49 WARN=6 FAIL=2`; FAIL por shell cron Node 22.22.2 (o projeto exige Node 24) e evidência estruturada da rota MCP Codex ausente. O Codex também registrou 401 de token expirado; não houve repetição em loop.
- `git push origin main`: segue bloqueado por permissão efetiva GitHub HTTP 403; HEAD local permanece à frente de `origin/main`. Nenhum workflow/deploy foi acionado.
- Gaps de fontes legislativas e envelopes ALRS/Senado continuam fail-closed; não há autorização/evidência para aplicação factual remota.

## Próximo passo

Repetir recon bounded da Câmara no próximo tick, manter ALRS/Senado fail-closed e retentar a publicação documental somente quando a permissão efetiva de push estiver disponível. Aplicação remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
