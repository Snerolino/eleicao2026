# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 14:13Z

## Objetivo
Executar um tick bounded do control plane com quatro lanes: recon oficial read-only, verificação local, publicação verificável e aplicação factual somente se todos os gates existissem.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado via `flock -n` em `.orchestrator/runtime/locks/continuous-progress.lock`.
- ALRS FED-17 residual executado em dry-run/read-only: `fetch failed`; nenhum voto foi planejado ou aplicado. Os quatro casos residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara consultada em oito janelas trimestrais oficiais 2025–2026. Q1/2025 bloqueou por `network_error`/`fetch failed`; as demais responderam `ok`. Por fail-closed, `vote_ids=[]`, sem reconciliação ou aplicação.
- Auditoria de fontes read-only concluída: 1.431 versões, 1.902 eventos e 5.007 votos. Gaps preservados: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Dry-run legislativo não executado sem envelope (`Uso: ... <envelope.json>`); nenhuma escrita factual foi tentada.
- Dataset público validado: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE; sem refresh necessário neste tick.

## Gates locais
- `npm run test`: RC 0 — 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run build`: RC 0 — sitemap 1.003 candidatos + 2 estáticas; `release.json` local `ec5ece9-20260822T141235170Z`.
- `git diff --check`: RC 0.
- `npm run smoke:local`: RC 0 — 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Estado remoto/publicação
- Produção `/release.json`: HTTP 200, live `823e9df5073070207a76d3247974fd9f607ff113`, versão `0.2.806`, snapshot 1.003 com SHA TSE `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc9`; raiz expirou por timeout de resolução DNS neste tick (`HTTP 000`). O live não corresponde verificavelmente ao HEAD local `ec5ece9`.
- Worktree limpa antes da documentação; HEAD local está 10 commits à frente de `origin/main`.
- Workflows remotos descobertos: backup `334951434`, primário `320564705`, verificador `335560210`. Push não foi repetido neste tick após os bloqueios persistentes de permissão registrados no checkpoint; nenhum deploy/workflow novo foi acionado.

## Bloqueios reais
- ALRS: portal oficial indisponível para o fetch (`fetch failed`), sem evidência para os quatro residuais.
- Câmara: Q1/2025 indisponível por erro de rede; fail-closed.
- Senado: permanece sem envelope nominal/PDF, `legislator_id` e SHA verificáveis; nenhum dado promovido.
- Doctor: shell Node `v22.22.2` incompatível com requisito Node 24; smoke da rota MCP Codex falhou por `401 invalid_refresh_token`; OpenCode ausente. Essas rotas não bloquearam os gates locais.
- Publicação GitHub permanece bloqueada por HTTP 403 documentado nos ticks anteriores; Cloudflare não foi acionado sem push aceito.

## Próximo passo
Retentar `git push origin main` no próximo tick; se aceito, acompanhar o workflow backup `334951434`, comparar `headSha` com o commit publicado e validar produção. Manter ALRS, Câmara Q1 e Senado read-only/fail-closed e não executar `remote_factual_apply` sem R0, schema/FK, fonte oficial, dry-run e idempotência.
