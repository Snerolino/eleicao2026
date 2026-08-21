# QA — tick contínuo: recon oficial e gates locais (2026-08-21 06:03 UTC)

## Objetivo

Executar um tick bounded das quatro lanes: revalidar fontes oficiais ALRS/Senado/Câmara, reconciliar o mirror `../dataset2026` com o snapshot público, manter aplicações factuais fail-closed e verificar a release local.

## Entregue e verificado

- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao fim do tick.
- ALRS: `npm run impact:alrs:r4:sources` — **7/7 HTTP 200**, **7/7 válidas**, **0 falhas**. O manifesto versionado mudou somente em `generated_at`.
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` — **bloqueado** antes do plano por `JWT issued at future`; **0 votos/datas aplicados**.
- Senado: seis GETs oficiais refeitos pelo revalidador read-only — **6/6 HTTP 200**, **6/6 prefixos PDF válidos**, **3/6 bytes coincidentes**, **0/6 SHA-256 coincidentes**. Deriva persiste; nenhum manifesto factual ou voto foi promovido.
- Câmara: API oficial `2026-10-01`–`2026-12-31` — resposta válida e **0 vote_ids**; nenhuma inferência.
- Mirror candidato completo `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: **1003 linhas/IDs**, **0 somente no dataset**, **0 somente no snapshot**; SHA observado `443eac3d55cbf90ccde2faeb5ad737a52701fde18ddd2d635f89dd06e39cfc10d` (não usado como autorização de escrita). O CSV segmentado de 213 linhas foi identificado e não tratado como equivalente.

## Gates locais

Executados com Node `v24.19.0`:

- `npm run test`: **97 arquivos, 398 testes, exit 0**.
- `npx tsc --noEmit`: **exit 0**.
- `node scripts/validate-impact-schema.mjs`: **exit 0**.
- `npm run data:check`: **exit 0**, **1003 candidaturas / 988 fotos**.
- `npm run build`: **exit 0**, sitemap **1003 candidatos + 2 estáticas**, release local `78cae7a-20260821T060224554Z`.
- `git diff --check`: **exit 0**.
- `npm run smoke:local`: **exit 0**, **1002 cards**, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Estado e bloqueios

Nenhuma escrita factual em Supabase, identidade, FK, voto, matriz, claim ou source reference ocorreu. O item ALRS FED-17 permanece bloqueado pela causa real `JWT issued at future`; Senado permanece fail-closed por deriva SHA-256; Câmara não possui lote novo na janela consultada. O doctor do shell continua com FAIL de infraestrutura porque usa Node `v22.22.2`, embora os gates do projeto tenham sido executados com Node `v24.19.0`.

## Publicação verificada

- Commit `f5e53a216ca58f0d15fbbf3c9ee75e3e3ba1944d` publicado em `origin/main`.
- Workflow backup `334951434`, run `32452916299`: `completed/success`, `headSha` idêntico ao commit.
- Produção raiz `https://rs.votopraquem.org`: **HTTP 200**.
- `release.json`: release `f5e53a2-20260821T060430121Z`, SHA completo idêntico e `snapshot.row_count=1003`.

## Próximo passo

Repetir recon bounded oficial e manter a lane local independente. Corrigir o relógio/JWT do ambiente antes de tentar novo dry-run FED-17; não aplicar Senado/Câmara/ALRS remotamente sem R0, schema/FK, fonte exata, dry-run e idempotência.
