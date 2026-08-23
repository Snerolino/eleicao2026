# QA — lote continuous ops recon — 2026-08-23 18:23Z

## Objetivo
Revalidar reconciliação oficial read-only, snapshot público, cobertura de fontes e gates locais; manter publicação factual fail-closed.

## Verificado
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run impact:sources:audit`: RC 0, read-only. Gaps reais preservados: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Fila ALRS residual: `4` votos sem evidência vinculada (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`).
- ALRS FED-17 (`node scripts/repair-alrs-fed17-residual.mjs`): RC 0, dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara oficial (`node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1`): RC 0; `8/8` janelas trimestrais HTTP OK, `blocked=null`; IDs apenas inventariados, sem reconciliação ou escrita.
- Gates com Node 24.19.0: `npm run test` RC 0 (`401/401`, `98` arquivos); `npx tsc --noEmit` RC 0; schema RC 0; `npm run build` RC 0 (`226` módulos, sitemap `1003 + 2`); `git diff --check` RC 0.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; live continua `5a8a24013263b684384b17e003f9fd0d57ce92f4`, versão `0.2.950`, snapshot `1003`. O build local gerou release apenas local para o HEAD atual.

## Bloqueios reais
- `env -u GH_TOKEN git push origin main`: RC 128, HTTP 403 — `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Local segue `5` commits à frente de `origin/main`; nenhum workflow novo foi acionado.
- Doctor RC 1: shell padrão Node `22.22.2` embora Node `24.19.0` esteja instalado; OpenCode ausente; smoke MCP não exercitado no modo rápido. Os gates do projeto foram executados explicitamente com Node 24.19.0.
- Auditoria strict de fontes permanece bloqueada por gaps oficiais reais; não foram criados votos, identidades, FKs, source references, claims, matrizes ou assessments.
- Não foi feita escrita em Supabase ou Cloudflare; a fila `/admin` permanece sujeita a revisão humana e não foi alterada por este tick.

## Próximo passo
Retentar transporte Git no próximo tick. Se `main -> main` for aceito, validar o workflow backup `334951434`, `headSha`, raiz e `/release.json`. Manter ALRS residual, Senado e gaps de fontes em fail-closed/read-only até evidência oficial completa, R0/schema/FK, dry-run e idempotência.
