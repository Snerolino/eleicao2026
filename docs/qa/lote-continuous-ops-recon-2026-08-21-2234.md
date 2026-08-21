# QA — lote continuous ops recon — 2026-08-21 22:34 UTC

## Objetivo
Executar um tick bounded do control plane com recon oficial read-only, lane local independente e gates completos, sem promover fatos sem identidade/fonte exata.

## Reconhecimento oficial
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` em dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara: `npm run impact:camara:discover` operou read-only. 7/8 janelas trimestrais responderam `ok`; a janela 2025-01-01–2025-03-31 falhou fechado com `fetch failed` (`network_error`), sem `vote_ids`, reconciliação ou aplicação.
- Senado: `/tmp/senado-nominal-envelope-latest.json` continua ausente; nenhum PDF, `legislator_id`, FK ou voto foi inferido/promovido.
- Snapshot público: `npm run data:check` verde com 1.003 candidaturas e 988 fotos oficiais. O `release.json` live confirma o mesmo snapshot TSE, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9` e 1.003 registros.

## Gates locais (Node 24.19.0)
- `npm run test -- --passWithNoTests`: verde, 98 arquivos / 400 testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde; fixtures boas aceitas e ruins rejeitadas.
- `npm run data:check`: verde, 1.003 / 988.
- `npm run build`: verde; sitemap com 1.003 candidatos + 2 estáticas e `release.json` local para `5965f98`.
- `npm run smoke:local`: verde; 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: verde.

## Publicação / bloqueios
- Produção respondeu HTTP 200 e `/release.json` respondeu HTTP 200, mas permanece em `e925327276b82481a348d4db3e2339d075dfe9a3`; este tick ainda não foi publicado.
- Workflow backup Cloudflare identificado: `334951434`. Nenhum run novo foi acionado porque não houve push neste tick.
- `git ls-remote` confirma `origin/main=e925327...`; a worktree local está 27 commits à frente. Push efetivo continua sendo a dependência de publicação já registrada.
- `npm run orch:doctor -- --smoke` terminou com FAIL real por shell Node 22.22.2 (o tick usou Node 24.19.0 explicitamente), além de timeout no smoke dos executores; OpenCode ausente e Ollama sem preflight permanecem warnings/bloqueios de infraestrutura.

## Estado dos dados e segurança
Nenhuma escrita em snapshot, claims, source references, identidade, FK, votos, matriz, Supabase, Cloudflare ou DNS ocorreu. Aplicação remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.

## Próximo passo
Continuar recon bounded oficial da Câmara na janela bloqueada, manter ALRS/Senado fail-closed e tentar publicação documental somente quando a credencial efetiva de push permitir validar backup Cloudflare, SHA live e smoke remoto.
