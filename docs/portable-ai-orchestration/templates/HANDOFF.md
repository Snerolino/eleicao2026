# HANDOFF — Portable AI Orchestration

`task_id`: TASK-<id>
`status`: ok | blocked | error
`generated_at`: <ISO-8601>
`executor`: <nome/modelo/ferramenta>
`authority`: read-only | workspace-write | remote-write

## Summary

<resultado curto e factual>

## Findings

- <descoberta verificável>

## Evidence

- `<path:line>` — <o que foi observado>
- `<comando>` — <saída resumida real>

## Files changed

- `<path>` — <mudança ou “nenhum”>

## Tests and gates

- `<comando>` — `pass` | `fail` | `not_run`; <resultado>

## Risks and blockers

- <risco, dependência ou “nenhum”>

## Recommended action

<próximo passo mínimo e seguro>

## Human review required

`true` | `false` — <motivo, se true>

## Rules

- Não registrar secrets, tokens, PII ou payloads crus.
- Não declarar publicação, deploy ou escrita remota sem leitura de confirmação.
- Se a saída do executor não puder ser verificada, use `blocked` ou `error`.
- O handoff é um checkpoint, não uma autorização implícita para a próxima ação.
