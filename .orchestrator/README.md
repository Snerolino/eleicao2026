# Orchestrator Context Bus — eleicao2026

Esta pasta é o barramento de contexto persistente entre Hermes e executores CLI.
Ela existe para que uma troca de modelo, timeout, rate limit ou reboot não exija
reconstruir o projeto a partir de uma conversa longa.

## Autoridade

A ordem canônica é a mesma de `AGENTS.md`:

1. código e Git atuais;
2. `AGENTS.md` e contratos/schemas versionados;
3. `README.md` e documentação aplicável;
4. `docs/context-export/` para o contrato curado de dados;
5. `.orchestrator/STATE.md` como checkpoint operacional, sempre revalidando fatos voláteis;
6. task packet/handoff atual;
7. histórico de conversas, somente como apoio.

O Hermes é o único dono do contexto global e do roteamento. Executores recebem
apenas o contexto necessário para a tarefa atual.

## Arquivos

- `STATE.md`: checkpoint operacional curto. Somente Hermes deve atualizá-lo durante a orquestração normal.
- `routing.yaml`: política declarativa de seleção, fallback, custo e autoridade.
- `schemas/executor-result.schema.json`: contrato de retorno dos executores.
- `templates/TASK_PACKET.md`: pacote curto enviado a um executor.
- `templates/HANDOFF.json`: handoff compacto entre executores.
- `runtime/`: estado transitório local, ignorado pelo Git.

## Regra de contexto

Não encaminhar conversas inteiras para outro modelo. Para uma delegação, enviar:

- objetivo;
- modo (`read-only` ou `workspace-write` quando autorizado);
- arquivos/paths relevantes;
- constraints;
- evidência já confirmada;
- critério de aceite;
- resultado/handoff anterior, se necessário.

Se a tarefa continuar no mesmo executor e sessão, reutilizar a sessão. Se mudar
de executor/modelo, gerar handoff compacto e abrir sessão nova.

## Segurança

- Nenhum segredo entra nesta pasta.
- Modelos gratuitos recebem somente conteúdo de repositório público/sanitizado.
- `.env*`, service role, raw documents, tokens e credenciais são proibidos em prompts de modelos gratuitos.
- Somente um executor por vez pode escrever em uma mesma worktree.
- Supabase remoto, Cloudflare produção, secrets, migrations remotas, commit/push/PR/merge e deploy obedecem aos gates humanos de `AGENTS.md`.

## Persistência

`STATE.md` deve ser atualizado em checkpoints relevantes, não a cada tool call.
Logs de execução e circuit breaker vivem em `.orchestrator/runtime/` para não
sujar o Git. Handoffs importantes podem ser promovidos a `docs/handoff/`.
