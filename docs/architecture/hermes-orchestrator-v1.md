# Arquitetura Hermes Multi-CLI v1 — eleicao2026

Data: 2026-08-10
Status: implementada na branch de arquitetura; sem mutação de produção

## 1. Objetivo

Transformar Hermes no plano de controle persistente do projeto e usar CLIs
especializados como executores intercambiáveis, reduzindo consumo de modelos
caros sem sacrificar contexto, rastreabilidade ou gates de segurança.

A arquitetura não compartilha uma conversa gigante entre modelos. Compartilha
**estado curto, arquivos canônicos, task packets, snapshots e handoffs**.

## 2. Decisão principal

Hermes permanece no **runtime padrão** e mantém:

- memória e contexto global;
- classificação da tarefa;
- roteamento por custo/capacidade;
- circuit breaker;
- sessão/handoff;
- gates humanos;
- decisão sobre próximo passo.

Codex é integrado como **MCP stdio** (`codex mcp-server`) e atua como executor
de engenharia. Não habilitamos Codex App-Server como runtime global nesta v1:
o objetivo é preservar o tool loop, memória e delegação do Hermes e usar Codex
como ferramenta especializada.

## 3. Executores

### OpenCode + DeepSeek gratuito

Papel: volume barato e tarefas simples sobre conteúdo público do repositório.

Caminho:

```bash
bash scripts/orchestrator/run-opencode.sh "<task packet curto>"
```

O wrapper:

- cria `.orchestrator/runtime/snapshots/opencode` com `git archive HEAD`;
- executa apenas sobre esse snapshot;
- força `agent plan`;
- usa `opencode/deepseek-v4-flash-free` por padrão;
- desliga MCP;
- `opencode.jsonc` nega edição, shell, ferramentas externas e leitura de `.env*`.

O modelo gratuito não vê a worktree viva, arquivos não rastreados, secrets,
dataset externo ou estado local. Se a tarefa depende de diff não commitado,
use Codex na worktree viva ou crie checkpoint autorizado.

### Google Antigravity CLI

Papel: contexto amplo, mapeamento, comparação e síntese usando a conta Google AI
Pro via Google OAuth.

Preparação local, uma vez por workstation/perfil:

```bash
npm run orch:configure-google
```

Esse configurador faz backup de `~/.gemini/antigravity-cli/settings.json` e
adiciona somente duas regras estreitas para o snapshot sanitizado:

- permite `read_file(<snapshot-antigravity>)`;
- nega `write_file(<snapshot-antigravity>)`.

Não adiciona `command(*)`, `mcp(*)`, `write_file(*)` amplo nem usa
`--dangerously-skip-permissions`.

Execução:

```bash
bash scripts/orchestrator/run-antigravity.sh "<task packet curto>"
```

O wrapper:

- cria `.orchestrator/runtime/snapshots/antigravity` com `git archive HEAD`;
- liga explicitamente esse snapshot ao workspace da sessão com `--add-dir`;
- seleciona o custom agent `eleicao2026-reader`;
- usa `--mode=plan` e `--sandbox`;
- limita o papel do custom agent a leitura;
- usa hook workspace-local para negar subagentes/background collaboration no caminho headless;
- rejeita como erro respostas intermediárias do tipo “lancei um subagente e estou aguardando”.

A rota foi desenhada assim porque `agy -p` precisa devolver uma resposta final
síncrona para o Hermes. A barreira decisiva continua sendo o snapshot rastreado:
o executor não recebe a worktree mutável nem arquivos não commitados.

Modelo padrão inicial: `Gemini 3.5 Flash (Low)`, sempre confirmado localmente
com `agy models`. Alterar por `ANTIGRAVITY_AGENT_MODEL` quando necessário.

### Gemini CLI legacy

`run-gemini.sh` permanece somente por compatibilidade com API key/ambiente
enterprise explicitamente configurado. Não é a rota padrão da assinatura Google
AI Pro individual nesta arquitetura.

### Codex MCP

Papel: engenharia e mutações locais controladas.

```bash
hermes -p eleicao2026 mcp add codex --preset codex
hermes -p eleicao2026 mcp list
npm run orch:doctor
```

O preset inicia `codex mcp-server` por stdio. O CLI atual do Hermes não é
tratado como se tivesse um subcomando `mcp test`; o doctor do repositório faz um
preflight direto do servidor stdio, e o gate ponta a ponta é validado por uma
chamada real Hermes → MCP Codex em modo read-only.

O backend local do Hermes deve preservar o HOME real, permitindo ao subprocesso
usar `~/.codex/auth.json`.

Níveis:

- `gpt-5.6-luna`: padrão para implementação/diagnóstico comum;
- `gpt-5.6-terra`: tarefa multi-arquivo, incerteza material ou Luna insuficiente;
- `gpt-5.6-sol`: arquitetura, segurança ou regressão realmente difícil.

Ao mudar de nível, abrir nova thread com handoff compacto.

### Codex exec read-only

Fallback do MCP:

```bash
printf '%s' "$PROMPT" | bash scripts/orchestrator/run-codex-readonly.sh
```

Usa `--output-schema` versionado, sandbox read-only, sessão efêmera e
autenticação local do Codex.

### Ollama local via Codex OSS

Último fallback sem quota externa, se `ollama` e `gpt-oss:20b` estiverem
presentes:

```bash
bash scripts/orchestrator/run-local-fallback.sh "<tarefa>"
```

Também opera sobre snapshot e nunca herda autoridade de escrita.

## 4. Roteamento

A política declarativa está em `.orchestrator/routing.yaml`.

| Classe | Primário | Fallback |
|---|---|---|
| triagem barata | OpenCode/DeepSeek free | Antigravity → Codex Luna → local |
| contexto grande | Antigravity | OpenCode free → Codex Luna → local |
| tarefa simples pública | OpenCode free | Antigravity → Codex Luna → local |
| mudança de código | Codex MCP Luna | Terra → Sol conforme evidência |
| debug difícil | Codex MCP | Terra/Sol conforme evidência |
| mudança crítica | Codex MCP | pausa humana se writer confiável estiver indisponível |

Fallback de **capacidade** não concede fallback de **autoridade**. Se Codex
estiver escrevendo e perder quota, um executor gratuito pode analisar e criar
handoff, mas não continua a mutação automaticamente.

## 5. Barramento de contexto

```text
.orchestrator/
├── README.md
├── STATE.md
├── routing.yaml
├── BOOTSTRAP_PROMPT.md
├── schemas/
│   └── executor-result.schema.json
├── templates/
│   ├── TASK_PACKET.md
│   └── HANDOFF.json
└── runtime/               # ignorado pelo Git
    └── snapshots/         # cópias descartáveis do HEAD para leitores externos
```

A ordem de autoridade segue `AGENTS.md`: código/Git atuais; regras e contratos
versionados; README/documentação aplicável; contrato curado de dados;
`STATE.md`; task packet/handoff; histórico somente como apoio.

`STATE.md` é checkpoint, não substituto do Git. Task packet contém só objetivo,
modo, paths, evidência e aceite. Handoff contém apenas estado, achados,
evidências, arquivos alterados, testes, riscos e próxima ação.

## 6. Circuit breaker

Estados:

- `OK`;
- `RATE_LIMITED`;
- `QUOTA_EXHAUSTED`;
- `TIMEOUT`;
- `AUTH_ERROR`;
- `DOWN`.

Após duas falhas consecutivas, Hermes não repete o mesmo prompt: abre o circuito
e tenta o próximo executor elegível para a mesma autoridade.

## 7. Escrita e worktrees

Regra: **um writer por worktree**. Codex é o writer técnico preferido. Leitores
externos trabalham em snapshots. Implementações independentes devem usar
worktrees e task IDs separados.

## 8. Credenciais

| Ferramenta | Credencial | Local correto | Commit? |
|---|---|---|---|
| Hermes/OpenAI Codex | ChatGPT OAuth | auth store do perfil Hermes | nunca |
| Codex CLI/MCP | ChatGPT OAuth | `~/.codex/auth.json` | nunca |
| Antigravity | Google OAuth | estado local do `agy` | nunca |
| Gemini legacy | API key/enterprise | ambiente local apropriado | nunca |
| OpenCode | OpenCode Zen/provider auth | `~/.local/share/opencode/auth.json` | nunca |
| Supabase CLI | login/link local | home + `supabase/.temp` ignorado | nunca secret |
| GitHub CLI | OAuth/token do `gh` | keyring/config local | nunca |
| Cloudflare deploy | `CLOUDFLARE_API_TOKEN` | GitHub Actions Secret | nunca |

A chave OpenAI API separada é contingência, não requisito do caminho Codex.

## 9. Supabase

No checkpoint da arquitetura:

- projeto remoto saudável;
- migrations da Matriz de Impacto ainda não aplicadas remotamente;
- nenhuma Edge Function ativa;
- advisors de segurança/performance existentes são dívida técnica separada.

Diagnóstico local/read-only é permitido. Migration remota, RLS/RPC/Auth/Storage
ou mudança de branch remota exige gate humano.

## 10. Cloudflare e GitHub Actions

Fluxo preservado:

```text
merge autorizado em main
        ↓
GitHub Actions quality/build
        ↓
wrangler-action
        ↓
Cloudflare Pages
        ↓
smoke + health
```

Hermes não recebe token Cloudflare de produção só para desenvolver. O secret
continua no GitHub Actions.

## 11. Retomada funcional

Depois de `npm run orch:doctor -- --smoke` verde:

1. Hermes lê `AGENTS.md`, `STATE.md` e `routing.yaml`.
2. Revalida Git, Supabase e preview necessários.
3. Cria task packet da Fase 2 da Matriz de Impacto.
4. Antigravity faz leitura ampla quando contexto grande ajudar.
5. OpenCode free faz checks mecânicos baratos sobre o snapshot.
6. Codex MCP implementa o menor chunk autorizado.
7. Testes/build locais validam o resultado.
8. Hermes atualiza handoff/STATE somente em checkpoint real.

A aplicação remota das migrations de impacto continua um gate separado.

Runbook de instalação/credenciais: `docs/runbooks/hermes-orchestrator-setup.md`.
