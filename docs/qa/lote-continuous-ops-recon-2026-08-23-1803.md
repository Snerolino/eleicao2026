# QA — lote continuous ops recon — 2026-08-23 18:03Z

## Objetivo
Revalidar o estado oficial do snapshot, a cobertura de fontes legislativas, a descoberta read-only da Câmara e os gates locais antes de qualquer publicação factual.

## Verificado
- `npm run orch:doctor`: RC 1; 48 OK, 5 WARN, 1 FAIL. Falhas/bloqueios conhecidos: shell Node 22.22.2 apesar de Node 24.19.0 instalado; OpenCode ausente; smoke MCP não exercitado no modo rápido.
- Dataset/snapshot: `npm run data:check` RC 0; 1003 candidaturas, 988 fotos oficiais e 1 fonte TSE.
- Auditoria de fontes (`npm run impact:sources:audit`): RC 0, read-only. Gaps preservados: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Fila residual ALRS: 4 votos sem evidência vinculada (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`).
- ALRS FED-17: `node scripts/repair-alrs-fed17-residual.mjs --help` executou o dry-run padrão, RC 0: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara oficial: `node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1`, RC 0; 8/8 janelas trimestrais HTTP OK, IDs somente inventariados, sem reconciliação ou escrita.
- Gates Node 24.19.0: `npm run test` 401/401 em 98 arquivos; `npx tsc --noEmit` RC 0; schema RC 0; `npm run data:check` RC 0; `npm run build` RC 0, 226 módulos e sitemap 1003 candidatos + 2 estáticas; `git diff --check` RC 0.
- Produção: raiz HTTP 200; `/release.json` HTTP 200, live `5a8a24013263b684384b17e003f9fd0d57ce92f4`, release `5a8a240-20260823T164257627Z`, snapshot 1003.

## Bloqueios reais
- `git push origin main`: três tentativas falharam; primeira HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`), duas seguintes por DNS (`Could not resolve host: github.com`). Local está 4 commits à frente de `origin/main`; nenhum workflow novo foi acionado.
- Auditoria strict de fontes permanece bloqueada por gaps oficiais reais; nenhum voto sem evidência foi criado ou publicado.
- Nenhuma escrita em Supabase, Cloudflare, identidades, FKs, source references, claims, matrizes ou assessments.

## Próximo passo
Retentar transporte Git no próximo tick. Se `main -> main` for aceito, validar o workflow backup `334951434`, `headSha`, raiz e `/release.json`. Manter ALRS residual e fontes legislativas em fail-closed/read-only até evidência oficial completa, R0/schema/FK, dry-run e idempotência.
