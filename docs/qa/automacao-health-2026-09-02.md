# QA — saúde da automação — 2026-09-02

## Objetivo

Eliminar o timeout falso do ciclo editorial federal e impedir que um modelo OpenCode indisponível consuma indefinidamente o tick do free pool.

## Correções verificadas

- `scripts/__tests__/camara-autonomous-editorial-cycle.test.mjs`: timeout explícito de 120 s para o teste que executa subprocessos editoriais.
- `scripts/moa-run.mjs`: timeout por modelo configurável por `MOA_MODEL_TIMEOUT_MS`, preservando 900 s como fallback quando não configurado.
- `scripts/orchestrator/run-free-pool.sh`: timeout por modelo padrão de 60 s (`ORCH_MODEL_TIMEOUT_MS`), separado do timeout total do pool.
- Node padrão do shell alinhado a `v24.19.0`; o gateway Hermes já usava efetivamente essa mesma versão.

## Evidências

- `npm run orch:doctor -- --smoke`: `OK=53`, `WARN=3`, `FAIL=0`.
- `npm run test`: `117` arquivos e `491` testes aprovados.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: `1003` candidaturas, `988` fotos oficiais; exit 0.
- `npm run build`: `244` módulos transformados; exit 0.
- `npm run smoke:local`: `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto.
- `git diff --check`: exit 0.
- Monitor: `authored_analyzed_projects=1600`, próximo lote `1601-1625`, fingerprint `d85d591e3c2be17a48c6159fdfd5bdfc4cfc91be9369d5634ab45448c984c2d4`.
- Gateway Hermes: ativo; Node efetivo `v24.19.0`; Codex MCP e fallback exec comprovados.
- Cron `eleicao2026-continuous-progress`: habilitado, a cada 15 minutos, último status `ok`.

## Bloqueio externo

OpenCode 1.18.26 está instalado e autenticado, mas o provedor retornou `Unexpected server error` no smoke. O free pool não inventa resultado: após o limite por modelo, segue a cadeia e pode ser substituído pela rota Codex/Antigravity já comprovada pelo doctor.

Nenhum dado editorial novo, voto, score, matriz, Supabase ou Cloudflare foi escrito por esta correção.
