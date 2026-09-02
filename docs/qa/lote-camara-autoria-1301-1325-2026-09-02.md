# QA — Autoria Câmara 1301–1325 — 2026-09-02

## Objetivo
Processar o microbatch de 25 projetos únicos de autoria da Câmara, mantendo a cadeia oficial e o fail-closed.

## Entregue e verificado
- Seleção read-only: 25 projetos, 100 ocorrências candidato–projeto e 19 candidatos únicos.
- Lane causal Antigravity: retornou 25 objetos e todos `withheld`/`score_eligible=false`, mas os IDs não coincidem exatamente com os 25 IDs selecionados. Saída rejeitada na camada de contrato/cardinalidade; não foi reconciliada.
- Nenhum projeto foi aplicado ao snapshot público, `authored_projects`, Supabase, claims, votos, scores ou matrizes.
- Próximo lote 1326–1350 foi preparado read-only: 25 projetos, 100 ocorrências e 15 candidatos únicos.

## Bloqueios reais
- Lane causal: cardinalidade numérica 25, porém conjunto/ordem de IDs divergente do pacote selecionado; saída não confiável para este lote e descartada.
- Lane red-team free pool: `exit 69`, mensagem efetiva `opencode não disponível; free pool indisponível`.
- Fallback red-team Codex MCP/Luna: falhou por sessão não autenticada — `Your access token could not be refreshed because you have since logged out or signed in to another account.`
- Sem duas análises independentes reconciliáveis, o lote permanece bloqueado; nenhuma saída causal isolada foi promovida.

## Estado dos dados
Checkpoint `authored-analysis-progress-v1.json`: `projects_analyzed=1325`, `approved=0`, `pending_review=0`, `withheld=1325`, lote `1301-1325=blocked`, próximo `1326-1350`.

## Próximo passo
Retomar o lote 1326–1350 com duas lanes read-only e validação estrita de IDs quando um executor independente estiver disponível; manter autoria factual separada de análise causal e não publicar itens withheld.


## Gates locais
- `npm run test`: falhou por timeout de 5s em `scripts/__tests__/camara-autonomous-editorial-cycle.test.mjs`; 116 arquivos passaram, 1 falhou, 490/491 testes passaram. A saída registrou UUID inválido de fixture e o teste executa o ciclo editorial fora do escopo deste lote.
- `npx tsc --noEmit`: OK.
- `node scripts/validate-impact-schema.mjs`: OK.
- `npm run data:check`: OK — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: OK — 244 módulos, sitemap 1003 + 2, release local `6ee20da-20260902T124307620Z`.
- `git diff --check`: OK.
- `npm run smoke:local`: OK — 1002 cards, 0 falhas HTTP, 0 erros online, service worker pronto.
- Produção existente: raiz e `/release.json` HTTP 200; nenhum deploy novo foi acionado.

## Publicação
Não houve commit/push/deploy: o gate completo não ficou verde e a worktree já continha três artefatos editoriais Câmara modificados fora deste escopo.
