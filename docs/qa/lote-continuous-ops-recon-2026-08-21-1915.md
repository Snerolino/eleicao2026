# QA — lote continuous ops recon — 2026-08-21 19:15 UTC

## Objetivo
Executar tick bounded das quatro lanes: recon oficial read-only, comparação dataset/snapshot, gates locais completos e verificação de produção, sem aplicar fatos sem R0/schema/FK/fonte/dry-run/idempotência.

## Entregue e verificado
- `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado no comando bounded; nenhum loop/sleep.
- ALRS FED-17: `node scripts/repair-alrs-fed17-residual.mjs` falhou fechado com `FED-17 repair: fetch failed`; nenhum voto, identidade, correção de data ou escrita foi realizada. Os quatro residuais Enio Carlos Terra continuam pendentes de ID oficial e fonte exata.
- Câmara: `discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` consultou 8/8 janelas trimestrais da API oficial, todas `status=ok`; IDs foram apenas descobertos, sem reconciliação/aplicação.
- Senado: `adapt-senado-nominal-envelope.mjs` falhou fechado por `ENOENT` em `/tmp/senado-nominal-envelope-latest.json`; nenhum PDF, `legislator_id`, FK ou voto foi promovido.
- Auditoria estrita read-only retornou exit 2 por gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Dataset oficial e snapshot: `1003` linhas/IDs contra `1003` linhas/IDs; somente no dataset `0`, somente no snapshot `0`.
- Gates Node 24.19.0: `npm run test` — 400 testes/98 arquivos verdes; `npx tsc --noEmit` verde; schema verde; `npm run data:check` — 1003 candidaturas/988 fotos; `npm run build` verde com sitemap de 1003 candidatos e `release.json` local; `git diff --check` verde.
- `npm run smoke:local` verde: 1002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- Produção respondeu HTTP 200 no endpoint principal. Uma segunda tentativa do endpoint `release.json` teve falha transitória de resolução DNS; não foi usada como evidência de SHA live.

## Estado dos dados
Nenhuma escrita factual, identidade, FK, voto, claim, source reference, Supabase, Cloudflare ou snapshot ocorreu. O dataset e o snapshot permanecem alinhados.

## Bloqueios reais
- Push GitHub: branch local está 15 commits à frente de `origin/main`; tentativas anteriores continuam documentadas com HTTP 403 (`Permission denied`). Sem push não há deploy deste tick.
- Doctor: shell padrão usa Node 22.22.2 embora o projeto exija Node 24; OpenCode ausente; rota Hermes→Codex falhou em autenticação `401 invalid_refresh_token`; Ollama sem preflight.
- ALRS e Senado permanecem fail-closed por ausência/indisponibilidade de evidência exata.

## Próximo passo
Continuar recon bounded oficial read-only e tentar publicação apenas quando a permissão GitHub efetiva permitir; manter qualquer aplicação remota condicionada a R0, schema/FK, fonte oficial exata, dry-run validado e idempotência.
