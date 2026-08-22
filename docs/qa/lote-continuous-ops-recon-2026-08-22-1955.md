# Lote continuous-ops — recon oficial e gates — 2026-08-22 19:55Z

## Objetivo
Executar um tick bounded do control plane: conferir o snapshot contra o CSV oficial TSE, manter ALRS/Câmara/Senado em reconciliação read-only/fail-closed, rodar os gates locais e preparar publicação documental sem promover fatos sem fonte exata.

## Entregue e verificado
- Lock bounded adquirido e liberado com `flock -n`.
- ALRS FED-17 residual executado em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata; nenhum voto foi alterado.
- Câmara consultada exclusivamente pela API oficial, em 8 janelas trimestrais 2025–2026, todas `ok`, sem bloqueio, com 700 IDs transitórios. Nenhum ID foi reconciliado ou aplicado.
- Senado permanece fail-closed: `/tmp/senado-nominal-envelope-latest.json` ausente.
- Dataset vivo conferido em `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1.003 IDs no CSV e 1.003 no snapshot, diferença `0/0`; SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais (Node 24.19.0)
- `npm run test -- --passWithNoTests`: **RC 0**, 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**.
- `npm run data:check`: **RC 0**, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: **RC 0**, sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `43cb583-20260822T195458748Z`.
- `git diff --check`: **RC 0**.

## Auditoria de fontes
- Auditoria regular `npm run impact:sources:audit`: **RC 0**, mas mantém gaps reais.
- Auditoria estrita `node scripts/audit-legislative-source-coverage.mjs --strict`: **RC 2**, fail-closed: votos sem fonte ALRS `4/4000`, Câmara `2/552`, Senado `455/455`. Nenhum dado factual foi promovido.

## Bloqueios reais
- O `orch:doctor --smoke` não pôde ser executado neste tick: o gateway bloqueou o comando porque o script tenta reiniciar/parar o gateway de dentro do próprio processo (`SIGTERM` propagates). Isso é bloqueio de infraestrutura do doctor, não evidência de falha dos gates locais.
- Commit documental local criado: `fae2d8d0276657a74e2e856fa64259a497ec09ac` (`docs: registra tick de recon e gates 1955`). `git push origin main` e retry com `env -u GH_TOKEN` falharam por HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); nenhum workflow novo foi acionado.
- Workflows remotos confirmados: backup `334951434`, primário `320564705`, verificador `335560210`. Produção respondeu raiz HTTP 200 e `/release.json` HTTP 200, ainda no release `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3` (`0.2.835`), portanto sem correspondência com o commit local.
- Nenhum deploy, escrita Supabase ou alteração Cloudflare foi feito neste tick.

## Próximo passo
Retentar `git push origin main`; se aceito, validar workflow backup Cloudflare `334951434`, `headSha` e produção. Manter ALRS residual, Senado e gaps de fontes em recuperação read-only; aplicação remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
