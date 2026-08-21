# QA — tick contínuo: recon oficial e gates locais (2026-08-21 06:27 UTC)

## Objetivo

Executar novo tick bounded das lanes oficiais ALRS/Senado/Câmara, comparar o mirror vivo `../dataset2026` ao snapshot público e manter qualquer aplicação factual fail-closed.

## Entregue e verificado

- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido/liberado com `flock -n`.
- ALRS: `npm run impact:alrs:r4:sources` — **7/7 HTTP 200**, **7/7 válidas**, **0 falhas**. O manifesto `data/legislative-import/alrs/impact-merit-source-manifest.json` foi atualizado somente no timestamp; URLs, bytes e SHA observados foram preservados.
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` — dry-run bloqueado por `JWT issued at future`; **0 votos, 0 datas e 0 aplicações**.
- Senado: seis GETs oficiais refeitos contra o manifesto de 2026-08-19 — **6/6 HTTP 200**, **6/6 PDFs válidos**, **3/6 bytes coincidentes**, **0/6 SHA-256 coincidentes**. Deriva permanece; nenhum manifesto factual ou voto foi promovido.
- Câmara: `npm run impact:camara:discover -- --start 2026-10-01 --end 2026-12-31 --max-pages 1` — resposta oficial válida, **0 vote_ids**, nenhuma inferência.
- Dataset vivo: CSV oficial completo em `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` — **1003 linhas/IDs**, snapshot **1003 linhas/IDs**, **0 somente no dataset**, **0 somente no snapshot**; encoding CP1252; SHA observado `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`. Nenhum refresh foi aplicado.

## Gates locais

Executados com Node `v24.19.0`:

- `npm run test`: **97 arquivos, 398 testes, exit 0**.
- `npx tsc --noEmit`: **exit 0**.
- `node scripts/validate-impact-schema.mjs`: **exit 0**.
- `npm run data:check`: **exit 0**, **1003 candidaturas / 988 fotos**.
- `npm run build`: **exit 0**, sitemap **1003 candidatos + 2 estáticas**, release local `d22d431-20260821T062644287Z`.
- `git diff --check`: **exit 0**.
- `npm run smoke:local`: **exit 0**, **1002 cards**, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Estado e bloqueios

Nenhuma escrita factual em Supabase, identidade, FK, voto, matriz, claim ou source reference ocorreu. O item ALRS FED-17 permanece bloqueado pelo relógio/JWT do ambiente (`JWT issued at future`). Senado permanece fail-closed pela deriva de SHA; Câmara não possui lote novo. O doctor do shell continua com FAIL porque usa Node `v22.22.2`; os gates do projeto foram executados com Node `v24.19.0`. O smoke do doctor também não comprovou Codex MCP por token expirado (`401 invalid_refresh_token`); isso não bloqueou as lanes read-only nem a verificação local.

## Próximo passo

Manter recon bounded oficial e lane local independente. Revalidar FED-17 somente após corrigir o relógio/JWT; não aplicar Senado, Câmara ou ALRS remotamente sem R0, schema/FK, fonte exata, dry-run e idempotência.
