# TASK PACKET

`task_id`: TASK-___
`mode`: read-only
`executor_class`: cheap_analysis | large_context | code_change | difficult_debug | critical_change

## Goal

Uma frase objetiva descrevendo o resultado esperado.

## Read first

- `AGENTS.md`
- `.orchestrator/STATE.md`
- caminhos estritamente necessários à tarefa

## Known evidence

- fatos já verificados, no máximo alguns bullets

## Constraints

- não ampliar escopo;
- não acessar `.env*`, tokens, service role, raw documents ou PII;
- não fazer commit, push, PR, merge, deploy ou mutação remota;
- em `read-only`, não editar arquivos;
- citar caminhos/linhas ou comandos que sustentem conclusões.

## Acceptance

- critério 1;
- critério 2;
- critério 3.

## Return

Retorne somente o necessário para preencher `.orchestrator/schemas/executor-result.schema.json`.
Se não puder concluir, use `status=blocked` e explique a menor dependência faltante.
