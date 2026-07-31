# H6.1 — Health check e observabilidade

Data: 2026-07-31
Guia: Fase 6 — H6.1

## Objetivo

Detectar produção vazia ou degradada antes do usuário, com release id/correlation id, sem registrar segredos ou payload bruto.

## Implementado

- `scripts/generate-release-metadata.mjs`
  - Gera `dist/release.json` no build.
  - Inclui SHA, short SHA, versão do `package.json`, `built_at`, `release_id` e metadata do snapshot público TSE.
  - Não inclui chaves, tokens, URLs privadas nem payload bruto.
- `scripts/health-check.mjs`
  - Executa probe Playwright da home.
  - Valida HTML, contagem plausível de candidatos, ausência de 4xx/5xx relevantes, claims degradadas, service worker/cache e `release.json`.
  - Emite JSON com `correlation_id`, `release_id`, `components`, `alerts`, `blocks_release`.
  - Redige `Authorization`, `apikey`, tokens, JWTs, `service_role` e `raw_content`.
- `package.json`
  - Build agora publica release metadata: `generate-release-metadata.mjs`.
  - Novo script: `npm run health:preview`.
- `.github/workflows/deploy.yml`
  - Deploy de produção roda `npm run health:preview` após smoke.
- Runbook:
  - `docs/runbooks/h6-1-observabilidade.md`.

## Classificação operacional

- `candidates: fail` bloqueia release.
- `deploy: fail` bloqueia release.
- `claims: warn` alerta sem considerar app totalmente indisponível.
- `rls: fail` em candidates bloqueia release.
- `rls: warn` em claims/relação não crítica gera alerta.
- `cache: warn` alerta PWA/service worker.
- `release: warn` alerta release metadata ausente/inválida.
- `http: fail` em 5xx bloqueia release.

## Validações

- RED:
  - testes falharam antes de criar `generate-release-metadata.mjs` e `health-check.mjs`.
- Focused:
  - `npm run test -- scripts/__tests__/h6-1-health-observability.test.mjs`
- Full gate esperado:
  - `npm run test -- --passWithNoTests`
  - `npx tsc --noEmit`
  - `npm run build`
  - `npm run smoke:local`
  - `npm run health:preview -- --url <preview/prod>`

## Evidência exigida no handoff

- SHA/`release_id` servido em `/release.json`.
- Health JSON com `status`, `blocks_release=false`, `correlation_id` e componentes OK/warn conhecidos.
- Smoke produção sem 4xx/5xx e com 69 cards.

## Risco residual

Sem serviço pago novo de alerta. O alerta é o próprio exit code/JSON no GitHub Actions e runbook; integração externa futura pode reaproveitar o JSON do health check.
