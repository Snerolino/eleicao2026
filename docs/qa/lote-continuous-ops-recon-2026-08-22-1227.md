# QA — tick continuous-ops recon — 2026-08-22 12:27 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only (Câmara,
ALRS e Senado), conferir sincronização do snapshot público, validar gates locais
e verificar publicação existente sem promover fatos sem fonte.

## Entregue e verificado
- Câmara oficial read-only: 8/8 janelas trimestrais 2025–2026 `ok`, sem bloqueio;
  700 `vote_ids` transitórios, descartados e não reconciliados/aplicados.
- ALRS FED-17 dry-run: `planned_votes=0`, `planned_event_date_fixes=0`,
  `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio
  Carlos Terra continuam bloqueados por ausência de ID oficial e fonte exata.
- Senado: fail-closed; `/tmp/senado-nominal-envelope-latest.json` ausente.
- Snapshot/dataset: CSV 1.003 linhas e 1.003 IDs; snapshot 1.003 registros e
  1.003 IDs; diferenças CSV→snapshot `0` e snapshot→CSV `0`. SHA do CSV
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`;
  SHA do snapshot `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- Auditoria de fontes read-only: auditor regular RC 0; strict RC 2 por gaps
  reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos
  `4/2/455`. Nenhum dado factual foi promovido.

## Gates locais
- `npm run test`: RC 0 — 401 testes, 98 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: RC 0 — sitemap 1.003 candidatos + 2 estáticas; release local
  `b61ab9c-20260822T122518614Z`.
- `git diff --check`: RC 0.
- `npm run smoke:local`: primeira execução transitória falhou durante o
  carregamento (`cards=0`); repetição validada RC 0 com 1.002 cards, 0 falhas
  HTTP, 0 erros de console online e service worker pronto.

## Publicação e bloqueios
- Produção existente: raiz HTTP 200; `/release.json` HTTP 200, live
  `823e9df5073070207a76d3247974fd9f607ff113`, versão `0.2.806`, snapshot 1.003
  com SHA oficial do CSV. Não corresponde ao HEAD local `b61ab9c`.
- Workflows remotos encontrados: backup Cloudflare `334951434`, primário
  `320564705`, verificador `335560210`.
- Push tentado duas vezes após os gates; ambas falharam com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. O HEAD local `b77ed16` está 2 commits à frente de `origin/main`; nenhum workflow/deploy novo foi acionado.
- Nenhuma escrita factual, migration, Supabase ou Cloudflare foi realizada.

## Próximo passo
Tentar `git push origin main`; se aceito, acompanhar o workflow backup
`334951434`, conferir `headSha` do run e validar novamente HTTP/release em
produção. Manter ALRS/Senado fail-closed e aplicação remota condicionada a
R0/schema/FK/fonte/dry-run/idempotência.
