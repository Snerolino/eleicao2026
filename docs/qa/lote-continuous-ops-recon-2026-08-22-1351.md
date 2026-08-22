# QA — lote continuous-ops recon — 2026-08-22 13:51Z

## Objetivo
Executar tick bounded do control plane: recon oficial read-only, validar dataset e gates locais, verificar publicação e manter aplicação factual fail-closed.

## Entregue e verificado
- Lock não bloqueante `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado.
- Node usado nos gates: v24.19.0.
- Câmara oficial read-only: 8 janelas trimestrais 2025–2026; Q1/2025 bloqueada com `fetch failed`. Por fail-closed, `vote_ids=[]`; nenhuma reconciliação/aplicação.
- ALRS FED-17 residual: dry-run falhou fechado com causa real `fetch failed`; `--apply` não foi usado. Os 4 residuais seguem sem ID oficial/fonte exata.
- Senado: `/tmp/senado-nominal-envelope-latest.json` ausente; nenhum envelope adaptado ou dado promovido.
- Auditoria regular de fontes RC 0. Gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Dataset oficial contra snapshot: CSV `1003`, snapshot `1003`, diferenças `0/0`; CSV SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Testes RC 0: 401 testes em 98 arquivos.
- TypeScript RC 0: `npx tsc --noEmit`.
- Schema RC 0: `node scripts/validate-impact-schema.mjs`.
- `data:check` RC 0: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Build RC 0: sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `8b65029-20260822T134929193Z`.
- Smoke local RC 0: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check` RC 0.

## Estado dos dados
Nenhum snapshot, claim, source reference, identidade, FK, voto, matriz, Supabase ou Cloudflare foi alterado. Aplicação factual permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.

## Publicação/verificação remota
- Worktree estava limpa antes desta documentação; HEAD local `8b65029756d4bfa10b9075dc1740def802aa5678`, 9 commits à frente de `origin/main`.
- `/release.json` respondeu HTTP 200 e continua apontando para live `823e9df5073070207a76d3247974fd9f607ff113`, versão `0.2.806`, snapshot 1.003 com o SHA oficial acima.
- A raiz `https://rs.votopraquem.org` não foi revalidada neste tick: DNS expirou por timeout (`curl` HTTP 000). Nenhum SHA live novo foi afirmado.
- Commit documental `faf8546` criado após os gates; `git push origin main` foi tentado e falhou novamente com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). Nenhum workflow/deploy novo foi acionado.

## Bloqueios reais
- Câmara: API oficial bloqueou Q1/2025 por erro de rede; resposta global fail-closed.
- ALRS: endpoint falhou com `fetch failed`; 4 casos continuam bloqueados por identidade/fonte exatas.
- Senado: envelope nominal verificável ausente.
- DNS da raiz de produção indisponível por timeout neste tick.
- Push GitHub ainda pendente de permissão efetiva; não repetir indefinidamente sem mudança observável.

## Próximo passo
No próximo tick, repetir recon bounded e tentar push somente se a permissão efetiva mudar; se aceito, acompanhar backup Cloudflare `334951434`, conferir `headSha` e validar produção. Manter remote factual apply bloqueado.
