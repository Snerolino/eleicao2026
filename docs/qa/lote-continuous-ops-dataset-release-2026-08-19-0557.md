# QA — continuous ops: reconciliação dataset e release

- **Data:** 2026-08-19 05:57 UTC
- **Objetivo:** executar um tick bounded do control plane, reconciliar o CSV oficial local com o snapshot público, validar gates locais e confirmar a publicação atual.

## Entregue e verificado

- Lock não bloqueante adquirido e liberado em `.orchestrator/runtime/locks/continuous-progress.lock`.
- Worktree limpa; `HEAD` e `origin/main`: `867c011258899f119a3c94b320a5b67e6840b2a0`.
- Doctor smoke: `OK=51 WARN=5 FAIL=1`; o único FAIL é o shell usando Node `v22.22.2`, embora o projeto exija Node 24. Os gates foram executados com Node `v24.19.0`.
- Reconciliação read-only correta contra `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1003 linhas/IDs oficiais, 1003 candidaturas no snapshot, 0 somente no dataset e 0 somente no snapshot.
- Gates locais verdes: 78 arquivos / 366 testes; TypeScript; `validate-impact-schema`; `data:check` com 1003 candidaturas e 988 fotos; build Vite/PWA; `git diff --check`.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; release confirma SHA `867c011258899f119a3c94b320a5b67e6840b2a0` e versão `0.2.392`.
- Nenhum dado factual, identidade, FK, source reference, Supabase, matriz, claim ou migration foi alterado.

## Bloqueios

- O workflow backup Cloudflare `334951434` possui runs `skipped` para este SHA; o disparo manual neste tick falhou com `error connecting to api.github.com`. Portanto não há run `success` deste SHA para declarar.
- Apesar disso, a produção já serve o SHA exato, comprovado independentemente por `/release.json`. Não atribuir essa propagação a um run específico.
- Doctor FAIL de Node 22 permanece na infraestrutura do shell cron; não bloqueou os gates porque Node 24.19.0 estava disponível.

## Próximo passo

- No próximo tick, revalidar a API GitHub e obter um run concluído do backup `334951434` com `headSha=867c011258899f119a3c94b320a5b67e6840b2a0`, sem repetir o disparo enquanto a API estiver indisponível.
- Manter Senado e demais aplicações factuais fail-closed até passarem R0, schema/FK, fonte oficial, dry-run e idempotência.
