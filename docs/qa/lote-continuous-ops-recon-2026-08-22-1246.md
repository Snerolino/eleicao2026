# QA — tick continuous-ops recon — 2026-08-22 12:46 UTC

## Objetivo
Executar tick bounded com recon oficial read-only, conferência do dataset vivo,
gates locais completos e publicação automática apenas se a permissão GitHub
permitir; manter fail-closed qualquer fato sem fonte oficial.

## Entregue e verificado
- ALRS FED-17 residual em dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
  Os quatro casos Enio Carlos Terra permanecem bloqueados por ausência de ID
  oficial e fonte exata.
- Auditoria regular de fontes: RC 0. Auditoria estrita mantém gaps reais:
  versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos
  `4/2/455`; nenhum dado factual foi promovido.
- Senado permanece fail-closed pela ausência de
  `/tmp/senado-nominal-envelope-latest.json`.
- Dataset vivo: CSV oficial com 1.003 IDs, 553.194 bytes, SHA
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`;
  snapshot com 1.003 IDs, SHA
  `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`;
  diferença de IDs `0/0`.

## Gates locais
- `npm run test -- --passWithNoTests`: RC 0 — 401 testes, 98 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: RC 0 — sitemap com 1.003 candidatos + 2 estáticas;
  `release.json` local `c67efb1-20260822T124538276Z`.
- `git diff --check`: RC 0.
- `npm run smoke:local`: RC 0 — 1.002 cards, 0 falhas HTTP, 0 erros de
  console online, service worker pronto.

## Publicação e bloqueios
- Worktree iniciou limpa e permanece somente com esta documentação e a entrada
  correspondente no `STATE.md`; HEAD local `c67efb1` está 3 commits à frente de
  `origin/main`.
- Push/deploy não foram repetidos neste tick porque a permissão efetiva já
  falhou no tick anterior com HTTP 403 (`Permission to Snerolino/eleicao2026.git
  denied to Snerolino`). Nenhum workflow novo foi acionado; não afirmar release
  remoto para este HEAD.
- Nenhuma escrita factual, migration, Supabase ou Cloudflare ocorreu.

## Próximo passo
Retentar `git push origin main` em próximo tick; se aceitar, acompanhar backup
Cloudflare `334951434`, validar `headSha` e confirmar `/release.json` e smoke em
produção. Manter ALRS, Senado e demais aplicações remotas condicionados a
R0/schema/FK/fonte/dry-run/idempotência.
