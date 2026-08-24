# QA — continuous ops recon — 2026-08-24 00:22 UTC

## Objetivo
Retomar o control plane em modo read-only: comparar o CSV oficial TSE do
`dataset2026` com o snapshot público, auditar fontes legislativas, reexecutar o
dry-run residual ALRS, verificar gates locais e confirmar o estado publicado.

## Entregue e verificado
- Dataset oficial `candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`:
  `1003` IDs, `553194` bytes, SHA-256
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Snapshot `data/public-candidates.json`: `1003` IDs; diferença contra o CSV:
  `0` somente no dataset e `0` somente no snapshot.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais,
  `1` fonte TSE.
- Gates com Node `v24.19.0`: `npm run test` RC 0 (`404/404`, `98` arquivos),
  TypeScript RC 0, schema RC 0, `data:check` RC 0, build RC 0 (`231` módulos,
  sitemap `1003 + 2`) e `git diff --check` RC 0.
- Smoke local RC 0: `1002` cards, `0` falhas HTTP, `0` erros online,
  service worker pronto. O runner encontrou um preview já ocupando a porta 4173
  e validou contra esse processo existente; não houve falha funcional do smoke.
- Auditoria strict de fontes RC 2, fail-closed por gaps reais: versões sem
  fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos
  `4/2/455`. Fila residual: `alrs_pl134_2023`, `alrs_pl165_2025`,
  `alrs_pl361_2025`, `alrs_pl77_2025`.
- `npm run impact:alrs:residual:repair`: RC 0 dry-run, `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Produção: `/` HTTP 200 e `/release.json` HTTP 200; release publicada ainda
  é `9cc5487-20260823T235158520Z`, SHA live
  `9cc5487d010116d7cc9b50d647f5fedec3cde305`, snapshot `1003`.

## Estado dos dados e segurança
Nenhum candidato, identidade, FK, voto, source reference, claim, assessment,
matriz, disposição editorial, Supabase ou Cloudflare foi alterado. Não houve
promoção automática de fila editorial nem aplicação factual.

## Bloqueios reais
- `git push origin main` continua bloqueado por HTTP 403: `Permission to
  Snerolino/eleicao2026.git denied to Snerolino`. O HEAD local
  `7c149e18f0201633e74e5a0de26d3a9f5cd85751` permanece 1 commit à frente de
  `origin/main` (`9cc5487d...`); nenhum workflow novo foi acionado.
- `npm run impact:sources:audit -- --strict` permanece RC 2 porque as fontes
  oficiais dos gaps ainda não estão vinculadas; não é seguro inventar URLs,
  hashes ou votos.
- `bash scripts/orchestrator/doctor.sh` não pôde ser executado neste gateway
  (o próprio script tenta reiniciar/parar o gateway); o shell cron continua em
  Node 22 por padrão. Os gates do projeto foram executados explicitamente em
  Node 24.19.0.

## Próximo passo
Retentar o transporte Git no próximo tick; se aceito, localizar o workflow
backup `334951434`, confirmar `headSha` e produção. Manter os quatro votos ALRS
fail-closed e continuar a reconciliação read-only de fontes/identidades sem
qualquer escrita remota.
