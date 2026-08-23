# QA — lote continuous ops recon — 2026-08-23 06:22Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, validar o snapshot vivo, rodar gates locais e verificar publicação/produção sem inserir fatos sem fonte.

## Entregue e verificado
- Lock não bloqueante `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara Dados Abertos oficial: 8 janelas trimestrais consultadas, todas `status=ok`, `blocked=null`; IDs transitórios apenas, sem reconciliação ou aplicação.
- Auditoria de fontes read-only RC 0: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Os gaps foram preservados, sem fabricar URL, hash, identidade ou voto.
- `npm run data:check`: RC 0, 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run test`: RC 0, 98 arquivos e 401 testes aprovados.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run build`: RC 0, 224 módulos, sitemap com 1003 candidatos + 2 estáticas e `release.json` local `867b8ed-20260823T062149855Z`.
- `npm run smoke:local`: RC 0, 1002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: RC 0; worktree permaneceu limpa.
- Produção `https://rs.votopraquem.org`: HTTP 200.

## Estado dos dados
O snapshot público segue alinhado ao dataset2026 conforme checkpoint operacional anterior: 1003 candidaturas. Nenhuma escrita factual remota ocorreu. Senado continua fail-closed sem envelope nominal com SHA verificável; os quatro casos ALRS de Enio Carlos Terra continuam sem ID oficial e fonte exata.

## Bloqueios reais
- Publicação Git bloqueada: `git push origin main` retornou RC 128 / HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Local `main` está 2 commits à frente de `origin/main`; nenhum deploy novo foi acionado.
- `npm run orch:doctor -- --smoke` permanece RC 1 por shell Node 22.22.2 enquanto o projeto exige Node 24; também reporta Codex token expirado/401 e rota OpenCode ausente. Antigravity passou; isso não bloqueou os gates locais.
- Auditoria de cobertura preserva gaps oficiais; não são motivo para relaxar o fail-closed.

## Próximo passo
Revalidar o transporte Git e retentar `main -> main`; após push aceito, validar workflow backup `334951434`, `headSha`, `/release.json` e smoke de produção. Manter ALRS/Senado/Câmara em reconciliação read-only até R0, schema/FK, fonte exata, dry-run e idempotência verdes.
