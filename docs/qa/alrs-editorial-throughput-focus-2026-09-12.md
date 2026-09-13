# Foco temporário de throughput editorial ALRS — 2026-09-12

## Objetivo

Direcionar o supervisor no-stop temporariamente para a fila de disposições editoriais ALRS, com quatro caixas independentes processando partições determinísticas da fila em paralelo.

## Execução verificada

- Supervisor: `status=completed`, lock exclusivo adquirido pelo wrapper.
- Foco: `alrs-editorial`.
- Workers: `4`, executados em paralelo.
- Fila regenerada: `1.281` versões de entrada; `1.199` pendentes; `48` lotes.
- Worker 0: `300` itens.
- Worker 1: `300` itens.
- Worker 2: `300` itens.
- Worker 3: `299` itens.
- Total distribuído: `1.199` itens, sem duplicação observada.
- Colisões distribuídas: `0` nesta partição de triagem; a fila de colisões continua sujeita ao gate específico.
- Itens aguardando decisão editorial externa: `1.199`.
- `remote_apply=false` em todos os workers; nenhuma escrita Supabase, aprovação, matriz ou score foi executada.

## Implementação

- `scripts/no-stop-supervisor.mjs`: modo `--focus=alrs-editorial`/`NO_STOP_FOCUS`, quatro workers paralelos e exclusão temporária das demais lanes.
- `scripts/run-alrs-editorial-triage-worker.mjs`: partição determinística por índice, arquivos de checkpoint em `.orchestrator/runtime/no-stop/alrs-editorial-workers/` e escrita atômica.
- `scripts/orchestrator/doctor.sh`: inclui o worker no inventário de scripts.
- `package.json`: comando `alrs:editorial:worker`.
- Ponte do cron Hermes: define `NO_STOP_FOCUS=alrs-editorial` e `NO_STOP_WORKERS=4`.

## Gates

- Testes: `120` arquivos, `499/499` testes aprovados.
- TypeScript: aprovado.
- Schema de impacto: aprovado.
- `data:check`: aprovado, `1.003` candidaturas e `988` fotos oficiais.
- Build: aprovado; sitemap com `1.003` candidatos + `2` URLs estáticas.
- `git diff --check`: aprovado.

## Limite editorial

A triagem prepara e distribui os casos; não transforma automaticamente uma sugestão em disposição aprovada. `assess`, `no_direct_population_group`, `taxonomy_gap` e `excluded` continuam exigindo o contrato de revisão editorial, hash/cardinalidade do lote e aprovação autenticada antes de qualquer aplicação remota. O foco permanece ativo temporariamente até ser removido do job Hermes.
