# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 11:22 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, validar o snapshot vivo, rodar os gates locais e preparar publicação sem promover fatos sem fonte/identidade exata.

## Entregue e verificado

- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado no tick.
- ALRS FED-17 residual em dry-run:
  - `planned_votes=0`
  - `planned_event_date_fixes=0`
  - `blocked_remaining=4`
  - `impact_touched=false`
- Câmara oficial read-only (`dadosabertos.camara.leg.br/api/v2/votacoes`), 8 janelas trimestrais de 2025–2026, `max-pages=1`:
  - 8/8 páginas observadas `ok`
  - `blocked=null`
  - 700 `vote_ids` transitórios
  - nenhuma reconciliação, escrita ou aplicação remota
- Senado fail-closed: `/tmp/senado-nominal-envelope-latest.json` ausente; nenhum PDF, `legislator_id`, SHA ou voto promovido.
- Auditoria de fontes read-only `npm run impact:sources:audit`: exit 0, mas gaps permanecem:
  - versões: ALRS 1251, Câmara 3, Senado 112 sem fonte
  - eventos: ALRS 1647, Câmara 2, Senado 188 sem fonte
  - votos: ALRS 4, Câmara 2, Senado 455 sem fonte
- Dataset oficial sem mudança:
  - CSV correto `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1003 linhas, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc9`
  - snapshot: 1003 registros
  - diferença de IDs: CSV→snapshot 0; snapshot→CSV 0

## Gates locais
Executados com Node `v24.19.0`:

- `npm run test`: exit 0 — 98 arquivos, 400 testes aprovados.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: exit 0 — sitemap 1003 candidatos + 2 estáticas; `release.json` local `ece3ecf-20260822T112104387Z`.
- `git diff --check`: exit 0.
- `npm run smoke:local`: primeira tentativa falhou durante carregamento (`cards=0`); repetição exit 0 — 1002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto, detalhe canônico `/candidatos/priscila_voigt_severiano_210002533355`.

## Estado e bloqueios

- Doctor do orquestrador: FAIL por shell padrão Node `v22.22.2` apesar de Node `v24.19.0` disponível via nvm; WARNs incluem OpenCode ausente, fallback Ollama sem preflight e rota MCP Codex não exercitada. Os gates do projeto foram executados explicitamente com Node 24.
- Quatro residuais ALRS de Enio Carlos Terra continuam bloqueados por ausência de ID oficial e fonte exata.
- Senado continua bloqueado pela ausência do envelope nominal verificável.
- Auditoria estrita de cobertura legislativa permanece com gaps reais; nenhum fato foi promovido.
- `git status`: worktree limpa após o build; `main` está 77 commits à frente de `origin/main`.
- Push/deploy não executado neste tick; próximo passo automático é tentar `main -> main`, e somente se aceito acompanhar o workflow backup Cloudflare `334951434`, conferir `headSha` e validar produção. Nenhuma migration, escrita Supabase, Cloudflare direto ou DNS foi realizada.

## Próximo passo
Retentar publicação documental autorizada quando a permissão efetiva do GitHub aceitar `main -> main`; manter recon ALRS/Senado fail-closed e recon Câmara read-only. Aplicação factual remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e prova de idempotência.
