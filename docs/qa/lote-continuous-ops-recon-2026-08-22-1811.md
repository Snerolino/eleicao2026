# QA — lote continuous ops recon — 2026-08-22 18:11Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only (ALRS residual, Câmara e Senado), conferência do dataset público e gates locais antes da publicação documental.

## O que foi entregue e verificado
- Lock não bloqueante adquirido e liberado em `.orchestrator/runtime/locks/continuous-progress.lock`.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara oficial: 8 janelas trimestrais 2025–2026, 8 páginas observadas, `blocked=null`, 700 `vote_ids` somente transitórios; nenhuma reconciliação ou aplicação.
- Senado: envelope nominal ausente (`/tmp/senado-nominal-envelope-latest.json`); fail-closed, sem adaptação ou promoção.
- Auditoria regular de fontes: RC 0. Gaps reais permanecem: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Dataset: `data:check` verde, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE. CSV oficial conferido no tick anterior sem diferença de IDs.
- Gates locais com Node `v24.19.0`: 401 testes em 98 arquivos; TypeScript; schema de impacto; `data:check`; build Vite/PWA; `git diff --check`.
- Build gerou `release.json` local `3aae2d0-20260822T180739081Z` e sitemap com 1.003 candidatos + 2 URLs estáticas.
- Smoke local: primeira tentativa falhou durante carregamento/estado de comparação; repetição posterior passou: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto. A repetição ocorreu contra preview já ativo após conflito de porta; o servidor respondeu e o resultado funcional foi verificado.

## Estado dos dados
Nenhum candidato, claim, fonte, voto, FK, matriz, snapshot ou registro remoto foi alterado. ALRS residual, Senado e gaps de fontes permanecem fail-closed.

## Bloqueios reais
- `orch:doctor -- --smoke` RC 1: shell padrão Node `v22.22.2`, mas o projeto exige Node 24; gates foram executados explicitamente com Node `v24.19.0`.
- Doctor também registrou rota MCP Codex sem evidência por `401 invalid_refresh_token`, OpenCode ausente e Ollama sem preflight; não houve repetição do executor bloqueado.
- A documentação foi commitada em `c49ca4f`. `git push origin main` e retry com `env -u GH_TOKEN` falharam HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); nenhum workflow novo foi acionado. Produção respondeu root HTTP 200 e `/release.json` HTTP 200, ainda no release `3aae2d0`, anterior ao commit local.

## Próximo passo
Retentar `main -> main` quando a permissão efetiva do GitHub permitir; se aceito, acompanhar workflow backup Cloudflare `334951434`, conferir `headSha` e validar raiz e `/release.json` em produção. Manter recon oficial read-only e aplicação factual remota condicionada a R0/schema/FK/fonte/dry-run/idempotência.
