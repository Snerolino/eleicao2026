# QA — revalidação bounded de fontes nominais do Senado (2026-08-19 07:58 UTC)

## Objetivo
Refazer, em modo read-only, os seis GETs oficiais dos relatórios nominais do Senado e verificar o manifesto versionado antes de qualquer parser factual ou aplicação remota.

## Entregue e verificado
- 6/6 endpoints oficiais responderam HTTP 200; todos iniciaram com assinatura PDF `255044462d312e35`.
- Artefato transitório preservado em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Comparação independente contra `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`:
  - 3/6 coincidiram em bytes;
  - 0/6 coincidiram em SHA-256;
  - bytes observados: 2025/6341=138361, 2025/1186=138555, 2025/825=138151, 2026/6341=97445, 2026/1186=97428, 2026/825=97376.
- `node scripts/apply-senado-nominal-sources.mjs` em dry-run: `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`.
- Nenhum voto, identidade, candidato TSE, FK, source_reference, claim, matriz, RPC, RLS, Supabase ou Cloudflare foi alterado.

## Gates locais
Executados com Node `v24.19.0`:
- `npm run test -- --passWithNoTests`: **79 arquivos / 368 testes verdes**.
- `npx tsc --noEmit`: **verde**.
- `node scripts/validate-impact-schema.mjs`: **verde**.
- `npm run data:check`: **verde — 1003 candidaturas / 988 fotos / 1 fonte TSE**.
- `npm run build`: **verde — sitemap 1003 candidatos + 1005 URLs; release local `8ea7a11-20260819T075829624Z`**.
- `git diff --check`: **verde**.
- Doctor: `OK=48 WARN=5 FAIL=1`; o único FAIL é o shell cron usando Node 22, enquanto os gates foram executados com Node 24.

## Estado e bloqueio
Senado permanece **fail-closed**: o catálogo oficial continua volátil e não há correspondência SHA com o manifesto. Não substituir o manifesto nem aplicar fontes/votos automaticamente. O writer continua restrito a `legislator_id`; não inferir `candidate_id`.

## Publicação verificada
- Worktree limpa antes deste registro; `HEAD=8ea7a11b34fa46c9110c23cef0b14db8103741a8` em `main` e `origin/main`.
- Produção raiz respondeu HTTP 200.
- `/release.json` respondeu HTTP 200 e confirmou SHA `8ea7a11b34fa46c9110c23cef0b14db8103741a8`, versão `0.2.404` e snapshot com 1003 registros.
- Backup Cloudflare `334951434`: run `32228818575` concluiu `success` com `headSha` idêntico; runs posteriores do mesmo SHA ficaram `skipped`.

## Próximo chunk bounded
Preservar/revisar os seis PDFs transitórios e investigar a causa da deriva binária antes de qualquer novo manifesto. Em paralelo, manter o dry-run do envelope por `legislator_id`; não executar `--apply` enquanto R0, schema/FK, fonte estável e idempotência não estiverem novamente comprovados.
