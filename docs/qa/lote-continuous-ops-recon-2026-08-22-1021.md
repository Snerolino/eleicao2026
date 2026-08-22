# Lote continuous ops — recon oficial — 2026-08-22 10:21Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, diff do
`dataset2026`, gates locais e verificação de publicação elegível, sem promover
qualquer fato sem fonte, identidade exata ou idempotência comprovada.

## Entregue e verificado

- Lock não bloqueante adquirido e liberado em
  `.orchestrator/runtime/locks/continuous-progress.lock`.
- Câmara oficial read-only: 8 janelas trimestrais de 2025–2026, todas `ok`,
  `blocked=null`, `max_pages=1`; 700 `vote_ids` transitórios, sem reconciliação
  nem aplicação.
- ALRS FED-17 dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
  Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte
  exata; nenhum voto foi alterado.
- Senado fail-closed: envelope nominal
  `/tmp/senado-nominal-envelope-latest.json` ausente.
- Dataset: CSV oficial
  `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`
  com 1.003 linhas/IDs, SHA-256
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot
  com 1.003 IDs, SHA-256
  `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`; diferença
  de IDs `0/0`.
- Auditoria de fontes read-only: `impact:sources:audit` RC 0; auditoria estrita
  RC 2 por gaps reais — versões ALRS/Câmara/Senado `1251/3/112`, eventos
  `1647/2/188`, votos `4/2/455`.

## Gates locais

- `npm run test`: RC 0 — 400 testes, 98 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: RC 0 — sitemap 1.003 candidatos + 2 estáticas; release local
  `5e97bdc-20260822T102009320Z`.
- `npm run smoke:local`: RC 0 — 1.002 cards, 0 falhas HTTP, 0 erros de console
  online, service worker pronto.
- `git diff --check`: RC 0.

## Bloqueios reais

- `npm run orch:doctor`: `FAIL` porque o shell do cron usa Node 22.22.2 e o
  projeto exige Node 24; OpenCode está ausente, Ollama não respondeu ao
  preflight e a rota MCP Codex não foi exercitada neste tick.
- Auditoria estrita permanece bloqueada por gaps de fontes oficiais; não há
  escrita remota segura neste tick.
- Push/publicação foi tentado após registrar este checkpoint; principal e retry
  com `env -u GH_TOKEN` retornaram HTTP 403: `Permission to
  Snerolino/eleicao2026.git denied to Snerolino`. Nenhum workflow novo foi
  acionado e o commit local não chegou a `origin/main`.
- Produção revalidada separadamente: raiz HTTP 200 e `/release.json` HTTP 200;
  release live `0.2.724`, snapshot oficial 1.003 com SHA
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`, sem
  `commitSha` no payload. Portanto não afirmar equivalência com o HEAD local.

## Próximo passo
Tentar publicar o checkpoint documental em `main`; se aceito, acompanhar o
workflow backup Cloudflare `334951434`, conferir `headSha` do run e validar
`https://rs.votopraquem.org` e `/release.json`. Manter ALRS e Senado fail-closed
e continuar recon oficial sem aplicação factual.
