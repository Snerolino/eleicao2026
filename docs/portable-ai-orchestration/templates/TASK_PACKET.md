# TASK PACKET — Portable AI Orchestration

`task_id`: TASK-<id>
`project_root`: <absolute path or repository identifier>
`mode`: read-only | workspace-write | remote-write
`class`: reconnaissance | analysis | implementation | debugging | publication | remote_mutation
`executor`: <IA, CLI, MCP, modelo ou humano>

## Goal

<resultado verificável em uma frase>

## Read first

- <instruções do projeto>
- <checkpoint operacional>
- <contratos/schema relevantes>
- <paths estritamente necessários>

## Allowed scope

### Files

- <paths permitidos para leitura>
- <paths permitidos para escrita, se aplicável>

### Commands

- <comandos permitidos>

### Data

- `public` | `sanitized` | `sensitive` — descreva o que pode ser visto

## Known evidence

- <fato confirmado + path/comando>
- <fato confirmado + path/comando>

## Constraints

- não ampliar escopo;
- não acessar ou imprimir secrets, `.env*`, PII ou documentos crus;
- não fazer commit, push, PR, merge, deploy ou mutação remota, salvo se explicitamente autorizado;
- não inventar dados ausentes;
- se uma dependência faltar, retornar `blocked` em vez de improvisar.

## Acceptance

- <critério observável 1>
- <critério observável 2>
- <teste/gate que deve passar>

## Required return

Retorne um envelope conforme `schemas/executor-result.schema.json`, contendo
status, resumo, evidências, arquivos, testes, riscos, próxima ação e revisão
humana necessária. Não retorne somente “feito”.
