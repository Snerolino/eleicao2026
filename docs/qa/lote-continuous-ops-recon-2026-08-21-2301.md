# QA — lote continuous ops recon — 2026-08-21 23:01 UTC

## Objetivo
Executar tick bounded do control plane com recon oficial read-only, lane local independente e gates completos, sem promover fatos sem identidade/fonte exata.

## Reconhecimento oficial
- ALRS FED-17 residual: `repair-alrs-fed17-residual.mjs` em dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`; os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara: API oficial em 8 janelas trimestrais, 22 páginas observadas, `blocked=null` e 2.100 `vote_ids` descobertos read-only. Nenhuma reconciliação ou aplicação foi feita.
- Senado: `/tmp/senado-nominal-envelope-latest.json` ausente; nenhum PDF, `legislator_id`, FK ou voto foi inferido/promovido.
- Dataset vivo versus snapshot: 1.003 IDs em cada lado, diferença 0/0. SHA-256 do CSV oficial: `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Auditoria estrita de fontes manteve gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; nenhuma promoção foi feita.
- Tentativa de refresh do snapshot foi rejeitada fail-closed por 1 remoção e 1.990 perdas de metadados de foto; nenhum arquivo de dados foi alterado.

## Gates locais (Node 24.19.0)
- `npm run test -- --passWithNoTests`: verde, 98 arquivos / 400 testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde; fixtures boas aceitas e ruins rejeitadas.
- `npm run data:check`: verde, 1.003 candidaturas / 988 fotos oficiais.
- `npm run build`: verde; sitemap com 1.003 candidatos + 2 estáticas; `release.json` local para `43f6f69`.
- `npm run smoke:local`: verde; 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: verde; worktree limpa antes deste documento.

## Publicação / bloqueios
- Produção não pôde ser revalidada neste tick: DNS falhou com `Could not resolve host`, HTTP `000`. O último SHA live conhecido permanece `e925327276b82481a348d4db3e2339d075dfe9a3` apenas como checkpoint anterior, não como confirmação atual.
- `origin/main` permanece em `e925327...`; a worktree local está 28 commits à frente. A publicação continua bloqueada por push efetivo GitHub HTTP 403 já evidenciado nos ticks anteriores.
- `npm run orch:doctor -- --smoke`: FAIL real por shell Node 22.22.2 e falta de evidência MCP Codex; OpenCode ausente e Ollama sem preflight são bloqueios/warnings de infraestrutura. Os gates foram executados explicitamente com Node 24.19.0.

## Estado dos dados e segurança
Nenhuma escrita em snapshot, claims, source references, identidade, FK, votos, matriz, Supabase, Cloudflare ou DNS ocorreu. Aplicação remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.

## Próximo passo
Continuar recon bounded oficial da Câmara e manter ALRS/Senado fail-closed; tentar publicação documental somente quando push efetivo e DNS permitirem validar backup Cloudflare, SHA live e smoke remoto.
