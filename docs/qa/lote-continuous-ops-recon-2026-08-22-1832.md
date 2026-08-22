# QA — lote continuous ops recon — 2026-08-22 18:32Z

## Objetivo
Executar novo tick bounded do control plane: manter recon oficial read-only, conferir o dataset vivo, fechar os gates locais e tentar a publicação documental sem promover fatos sem fonte.

## Reconhecimento oficial e dados
- Lock não bloqueante foi adquirido/liberado em `.orchestrator/runtime/locks/continuous-progress.lock`.
- ALRS FED-17 residual: `node scripts/repair-alrs-fed17-residual.mjs --help` executou o modo padrão dry-run com `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata; nenhuma escrita ocorreu.
- Auditoria regular `npm run impact:sources:audit`: RC 0, com 1.431 versões, 1.902 eventos e 5.007 votos; gaps permanecem ALRS/Câmara/Senado: versões sem fonte `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Auditoria estrita `node scripts/audit-legislative-source-coverage.mjs --strict`: RC 2 pelos gaps reais acima; fail-closed, nenhum fato promovido.
- Câmara e Senado não foram aplicados neste tick; Senado segue sem envelope nominal verificável.
- Dataset vivo conferido contra `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1.003/1.003 IDs, diferenças `0/0`, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais verificados
Executados com Node `v24.19.0`:
- `npm run test -- --passWithNoTests`: RC 0 — 401 testes em 98 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: RC 0 — sitemap 1.003 candidatos + 2 URLs estáticas; `release.json` local `0e1c18f-20260822T183046921Z`.
- `git diff --check`: RC 0; build não deixou alterações rastreadas.
- `npm run smoke:local`: primeira tentativa falhou por preview stale/estado de carregamento; após encerrar o preview antigo, repetição passou: 1.002 cards, mínimo 1.002, 0 falhas HTTP, 0 erros online, service worker pronto.

## Publicação e verificação externa
- `git push origin main`: RC 128, bloqueio real HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Nenhum workflow novo foi acionado.
- Produção verificada independentemente: raiz HTTP 200 e `/release.json` HTTP 200.
- Produção permanece no `release_id=3aae2d0-20260822T180456083Z`, SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, snapshot de 1.003 linhas com SHA oficial esperado. O HEAD local é `0e1c18f...`; não há correspondência verificável porque o push foi rejeitado.

## Bloqueios reais
- `npm run orch:doctor -- --smoke`: RC 1: shell cron usa Node 22.22.2, mas o projeto exige Node 24; gates foram executados com Node 24.19.0.
- Doctor também confirmou OpenCode ausente, rota Codex MCP sem evidência por `401 invalid_refresh_token`, fallback Codex exec sem saída estruturada e Ollama sem preflight. Não houve repetição do executor bloqueado.
- Auditoria estrita continua não-zero por ausência de fontes legislativas, sem autorização/evidência para backfill.

## Estado e próximo passo
Nenhum candidato, claim, fonte, voto, FK, matriz, snapshot ou registro remoto foi alterado. O único avanço possível neste tick é manter a recon oficial read-only, retentar publicação documental em próximo tick e, se o push for aceito, acompanhar o workflow backup Cloudflare `334951434`, comparar `headSha` e revalidar produção. Aplicação factual remota segue condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
