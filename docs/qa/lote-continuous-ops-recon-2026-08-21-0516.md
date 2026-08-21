# QA — Tick contínuo: recon bounded e gate fail-closed — 2026-08-21 05:16Z

## Objetivo
Repetir recon oficial bounded nas lanes ALRS, Câmara e Senado, regenerar o pacote local de pedidos substantivos e verificar que nenhum dado factual sem fonte seja promovido.

## Entregue e verificado

- ALRS: `7/7` URLs oficiais HTTP 200, `7/7` válidas, `0` falhas; manifesto `impact-merit-source-manifest.json` atualizado apenas no timestamp.
- Pacote de pedidos substantivos ALRS: `9` pedidos para `8` versões.
- Gate substantivo ALRS: `25` itens verificados, `0` fontes substantivas exatas; falha fechada RC `2`; nenhuma escrita factual.
- Reparo residual ALRS FED17 em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: API oficial read-only HTTP válido, janela `2026-10-01` a `2026-12-31`, `vote_ids=[]`, sem lote novo e sem bloqueio de rede.
- Senado: dry-run de fontes nominais com `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`; nenhuma aplicação.
- Auditoria de cobertura read-only: ALRS sem fonte `1251/1282` versões, `1647/1678` eventos e `4/4000` votos; Câmara `3/37`, `2/36`, `2/552`; Senado `112/112`, `188/188`, `455/455`.
- Dataset vivo: `npm run data:check` passou com `1003` candidaturas e `988` fotos oficiais.

## Gates locais

Executados com Node `v24.19.0` após o doctor do shell cron detectar Node 22.22.2. Reconhecimento e gates não escreveram Supabase, Cloudflare, snapshot, identidade, FK, voto, matriz, claim ou source reference.

- `npm run test`
- `npx tsc --noEmit`
- `node scripts/validate-impact-schema.mjs`
- `npm run data:check`
- `npm run build`
- `git diff --check`
- `npm run smoke:local`: primeira tentativa expirou no `page.goto` (45s), sem diagnóstico de aplicação; repetição imediata passou com `1002` cards, `0` falhas HTTP, `0` erros de console online e service worker pronto.

## Bloqueios reais

- Quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata.
- As 25 versões ALRS continuam sem fonte substantiva fora da rota de votos.
- Senado continua fail-closed enquanto o manifesto de PDFs divergir em bytes/SHA.
- Câmara não apresentou lote oficial novo.
- Doctor: único FAIL operacional é o shell Node 22; OpenCode ausente e Ollama sem preflight são warnings opcionais. A rota Codex MCP não foi usada para mutação.

## Publicação verificada

- Commit `2588c28cd214ededc3b7e6c0104e1cbcd7434aba` publicado em `origin/main`.
- Workflow backup `334951434`, run `32450168296`, concluiu `success` com `headSha` idêntico.
- Produção respondeu HTTP 200; `/release.json` confirmou SHA idêntico, release `2588c28-20260821T052045516Z` e snapshot `row_count=1003`.

## Próximo passo

Manter recon bounded e lane local independente; aplicação remota somente após R0, schema/FK, fonte oficial exata, dry-run e idempotência.
