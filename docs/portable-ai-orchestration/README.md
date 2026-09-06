# Portable AI Orchestration Kit

Kit neutro para transportar o protocolo de automação deste projeto para:

- outra IA ou executor de código;
- outro perfil Hermes;
- outro repositório/projeto;
- uma operação local, CI ou scheduler durável.

O kit não contém credenciais, tokens, PII, documentos crus ou regras específicas
de domínio. Ele define contratos e invariantes; o projeto hospedeiro fornece as
regras de negócio, ferramentas, comandos e permissões.

## Conteúdo

- `SKILL.md`: habilidade portátil para o agente coordenador.
- `templates/TASK_PACKET.md`: contrato compacto de entrada para qualquer executor.
- `templates/HANDOFF.md`: contrato de saída/checkpoint entre agentes e sessões.
- `templates/routing.yaml`: exemplo neutro de roteamento por capacidade.
- `schemas/executor-result.schema.json`: envelope JSON validável para resultados.

## Instalação em outro projeto

1. Copie esta pasta para `docs/portable-ai-orchestration/` ou para a pasta de
   skills do agente.
2. Copie `SKILL.md` para o local de skills reconhecido pela IA, se aplicável.
3. Crie no projeto hospedeiro os arquivos abaixo, adaptando os nomes:

   - `AGENTS.md` ou equivalente;
   - `STATE.md` operacional curto;
   - `routing.yaml` baseado no template;
   - um lock exclusivo da worktree;
   - comandos reais de teste, build e validação.

4. Preencha o template de tarefa antes de delegar.
5. Exija o envelope de resultado ao executor.
6. Valide localmente o resultado; retorno de IA nunca é evidência por si só.

## Instalação em outro perfil Hermes

O arquivo `SKILL.md` pode ser copiado para:

```text
$HERMES_HOME/skills/<categoria>/portable-ai-orchestration/SKILL.md
```

Use `$HERMES_HOME`, não um caminho hardcoded. Em um perfil Hermes, reinicie a
sessão ou recarregue o índice de skills depois da cópia. A configuração do
perfil, credenciais e cron devem ser criados separadamente no ambiente destino.

## Adaptação por executor

O protocolo não exige um fornecedor específico. Um executor pode ser Hermes,
Codex, Claude, OpenCode, Gemini, agente local ou uma IA chamada por API. O
coordenador deve preservar estes campos:

- autoridade concedida (`read-only`, `workspace-write` ou `remote-write`);
- escopo de arquivos e comandos;
- dados permitidos;
- critério de aceite;
- evidência verificável;
- status `ok`, `blocked` ou `error`.

## O que é específico do projeto original

Não copie automaticamente para outro projeto:

- nomes de tabelas, migrations, RPCs ou domínios editoriais;
- números e checkpoints do projeto original;
- URLs, releases, modelos, perfis ou paths locais;
- autorização para deploy, Git, banco ou secrets;
- a política de publicação contínua sem revisar o risco do novo projeto.

## Fluxo mínimo

```text
classificar -> preparar task packet -> escolher executor
-> executar no menor escopo -> validar arquivos/testes
-> registrar handoff -> escolher próximo chunk ou bloquear somente o item
```

Uma configuração declarada não prova que a automação está ativa. Verifique o
scheduler, o lock, os processos, os gates e os artefatos reais.
