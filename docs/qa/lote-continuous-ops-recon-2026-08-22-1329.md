# QA — lote continuous-ops recon — 2026-08-22 13:29Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, manter ALRS/Senado fail-closed, validar a lane local e verificar publicação sem promover dados factuais.

## Entregue e verificado
- Lock não bloqueante `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado.
- Câmara oficial: consulta `https://dadosabertos.camara.leg.br/api/v2/votacoes`, janela `2025-01-01`–`2026-12-31`, 8 janelas trimestrais; 7 responderam `ok` e Q1/2025 falhou fechado com `fetch failed`. Por fail-closed, `vote_ids=[]`; nenhuma reconciliação ou aplicação.
- ALRS FED-17 residual: tentativa dry-run falhou fechado com causa real `fetch failed`; `--apply` não foi usado. Os 4 residuais de Enio Carlos Terra continuam sem ID oficial/fonte exata.
- Auditoria regular de fontes: RC 0; gaps atuais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Snapshot público sem mudança: `data:check` RC 0, 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.
- Testes RC 0: 401 testes em 98 arquivos.
- TypeScript RC 0: `npx tsc --noEmit`.
- Schema RC 0: `node scripts/validate-impact-schema.mjs`.
- Build RC 0: sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `189ef01-20260822T132743516Z`.
- Smoke local RC 0: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check` RC 0; build não deixou alterações na worktree.

## Estado dos dados
Nenhum snapshot, claim, source reference, identidade, FK, voto, matriz, Supabase ou Cloudflare foi alterado. Aplicação factual permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.

## Publicação/verificação remota
- Worktree limpa; HEAD local `189ef01c597b36ffc5f3a6b63db54a45ec28825e`, 7 commits à frente de `origin/main`.
- Produção não pôde ser revalidada neste tick: DNS `rs.votopraquem.org` falhou (`curl` HTTP 000, `Could not resolve host`). Nenhum SHA live foi afirmado.
- Push/deploy não foi executado neste tick; não há evidência de novo workflow ou release.

## Bloqueios reais
- Câmara: API bloqueou a janela Q1/2025 por erro de rede; resposta global fail-closed.
- ALRS: endpoint falhou com `fetch failed`; 4 casos continuam bloqueados por identidade/fonte exatas.
- Senado: envelope nominal verificável segue ausente; nenhum dado promovido.
- DNS de produção indisponível no momento da verificação.
- Push GitHub permanece pendente do bloqueio documentado de permissão efetiva HTTP 403; não repetir indefinidamente sem mudança observável.

## Próximo passo
Retentar em próximo tick a recon bounded e push somente se DNS/permissão efetiva mudarem; após push aceito, acompanhar workflow backup `334951434`, conferir `headSha` e validar produção. Manter remote factual apply bloqueado.
