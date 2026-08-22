# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 22:49Z

## Objetivo
Executar um tick bounded do control plane: manter recon oficial read-only ativa, conferir o snapshot contra o mirror `dataset2026`, rodar os gates locais e verificar se há caminho seguro de publicação.

## Entregue e verificado
- Câmara oficial: `scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 2` consultou 14 páginas; 13 `ok` e 1 bloqueada por `network_error`/`fetch failed` em 2025-01-01–2025-03-31. Por fail-closed, `vote_ids=0`; nenhum ID foi reconciliado ou aplicado.
- ALRS FED-17 residual: `scripts/repair-alrs-fed17-residual.mjs` falhou fechado com causa real `fetch failed`; os 4 casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: envelope nominal `/tmp/senado-nominal-envelope-latest.json` ausente; adaptação não executada e nenhum dado inferido.
- Dataset: CSV oficial com 553.194 bytes; snapshot `data/public-candidates.json` SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`. `data:check` confirmou 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE. Nenhum refresh factual foi necessário.
- Auditoria de fontes read-only (`npm run impact:sources:audit`): ALRS sem fonte 1.251 versões/1.647 eventos/4 votos; Câmara 3/2/2; Senado 112/188/455. Auditoria regular terminou RC 0; gaps permanecem explícitos.

## Gates locais
- Node usado nos gates: `v24.19.0`.
- `npm run test`: RC 0 — 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos.
- `npm run build`: RC 0 — Vite transformou 224 módulos; sitemap/release gerados.
- `git diff --check`: RC 0.
- `npm run smoke:local`: primeira tentativa falhou transitoriamente esperando `table`; repetição verificada RC 0 — 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Publicação e bloqueios
- Worktree iniciou limpa em `006bb9c`; segue limpa após os gates e está 18 commits à frente de `origin/main`.
- `npm run orch:doctor -- --smoke`: RC 1 por Node do shell em `v22.22.2` enquanto o projeto exige Node 24 e por ausência de evidência estruturada da rota MCP Codex; OpenCode ausente e fallback Codex com token expirado. Os gates foram executados explicitamente com Node 24.19.0.
- `git push origin main` foi tentado após os gates e falhou com RC 128 por `Could not resolve host: github.com`; portanto não houve novo workflow. Worktree ficou limpa no commit local `d271312` e 19 commits à frente de `origin/main`.
- Workflows remotos backup `334951434`, primário `320564705` e verificador `335560210` estão ativos. Produção `/release.json` respondeu HTTP 200, mas permanece em `0.2.835` sem `commitSha`, `headSha`, `snapshotSha` ou `builtAt`; a raiz expirou por timeout DNS (`HTTP 000`). Não há correspondência verificável com o HEAD local.
- Nenhum candidato, voto, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado.

## Próximo passo
Retentar `git push origin main` no próximo tick; se aceito, validar o workflow backup Cloudflare `334951434`, `headSha` do run concluído e `https://rs.votopraquem.org`/`release.json`. Manter ALRS, Senado e aplicação factual remota fail-closed até R0, schema/FK, fonte oficial exata, dry-run e idempotência.
