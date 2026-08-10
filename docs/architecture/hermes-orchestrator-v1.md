# Arquitetura Hermes Multi-CLI v1 — eleicao2026

Data: 2026-08-10
Status: implementação de controle/roteamento; sem mutação de produção

## 1. Objetivo

Transformar Hermes no plano de controle persistente do projeto e usar CLIs
especializados como executores intercambiáveis, reduzindo consumo da conta
ChatGPT Plus sem sacrificar contexto, rastreabilidade ou gates de segurança.

A arquitetura não compartilha uma conversa gigante entre modelos. Compartilha
**estado curto, arquivos canônicos, task packets e handoffs**.

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
de engenharia. Não habilitamos Codex App-Server como runtime global nesta v1,
pois isso transferiria o loop de ferramentas para Codex e reduziria justamente
a superfície de memória/delegação que queremos manter no Hermes.

## 3. Executores

### OpenCode + DeepSeek gratuito

Papel: volume barato e tarefas simples sobre conteúdo público do repositório.

Usar para:

- inventário de arquivos/símbolos;
- revisão simples;
- classificação;
- resumo de logs sanitizados;
- segunda opinião;
- diagnóstico inicial de baixo risco.

Caminho orquestrado:

```bash
bash scripts/orchestrator/run-opencode.sh "<task packet curto>"
```

O wrapper força `agent plan`, modelo gratuito e `OPENCODE_DISABLE_MCP=true`.
`opencode.jsonc` também nega edição, shell, diretórios externos e leitura de
arquivos `.env*` no agent plan.

Nunca enviar a este executor:

- secrets/tokens;
- `.env*`;
- service role;
- documentos brutos;
- PII;
- conteúdo privado fora do workspace sanitizado.

### Gemini CLI

Papel: contexto amplo, mapeamento, comparação e síntese.

Usar para:

- mapear muitos arquivos;
- resumir documentação extensa;
- comparar módulos/contratos;
- preparar plano de investigação;
- leitura ampla antes de uma implementação.

Caminho orquestrado:

```bash
bash scripts/orchestrator/run-gemini.sh "<task packet curto>"
```

O wrapper usa `--approval-mode=plan`, `--output-format json` e a autenticação
local já cacheada. O modelo pode ser escolhido por `GEMINI_AGENT_MODEL`; sem a
variável, o CLI usa seu default atual.

Gemini não é writer nesta v1. O objetivo é aproveitar a cota da assinatura
Google AI Pro em tarefas que custariam contexto do Codex.

### Codex MCP

Papel: engenharia e mutações locais controladas.

Integração Hermes:

```bash
hermes mcp add codex --preset codex
hermes mcp test codex
```

No computador deste projeto o servidor precisa herdar o HOME real usado pela
autenticação Codex. A configuração local deve passar explicitamente:

```yaml
mcp_servers:
  codex:
    command: codex
    args: [mcp-server]
    env:
      HOME: /home/lourenco
      CODEX_HOME: /home/lourenco/.codex
    supports_parallel_tool_calls: false
```

Modelos:

- `gpt-5.6-luna`: padrão para implementação/diagnóstico comum de menor custo;
- `gpt-5.6-terra`: multi-arquivo, incerteza material, Luna insuficiente;
- `gpt-5.6-sol`: arquitetura/segurança/regressão realmente difícil.

Ao mudar de nível, abrir nova thread com handoff compacto. Não carregar uma
thread longa de Luna para Sol apenas por comodidade.

### Codex exec read-only

Fallback caso o MCP esteja temporariamente indisponível:

```bash
printf '%s' "$PROMPT" | bash scripts/orchestrator/run-codex-readonly.sh
```

Usa `--output-schema` versionado e a conta ChatGPT/Codex local.

### Ollama local

Fallback opcional sem dependência de cota externa. Só entra na rota quando
`orch:doctor` confirmar que o daemon/modelo existem e um smoke separado passar.
Não é writer automático.

## 4. Roteamento

A política executável/documental está em `.orchestrator/routing.yaml`.

Resumo:

| Classe | Primário | Fallback |
|---|---|---|
| triagem barata | OpenCode/DeepSeek free | Gemini → Codex Luna → local |
| contexto grande | Gemini | OpenCode free → Codex Luna → local |
| tarefa simples pública | OpenCode free | Gemini → Codex Luna → local |
| mudança de código | Codex MCP Luna | Terra → Sol conforme evidência |
| debug difícil | Codex MCP Terra | Sol |
| mudança crítica | Codex MCP Sol/Terra conforme plano | pausa humana se indisponível |

O fallback de **capacidade** não concede automaticamente fallback de
**autoridade**. Se Codex estiver escrevendo e perder quota, o próximo executor
free pode analisar e produzir handoff, mas não continuar a mutação.

## 5. Barramento de contexto

Arquivos:

```text
.orchestrator/
├── README.md
├── STATE.md
├── routing.yaml
├── schemas/
│   └── executor-result.schema.json
├── templates/
│   ├── TASK_PACKET.md
│   └── HANDOFF.json
└── runtime/               # ignorado pelo Git
```

### STATE.md

Checkpoint curto do projeto. Não substitui Git nem serviço remoto. Hermes deve
revalidar informações voláteis ao iniciar uma sessão de retomada.

### Task packet

Contém apenas:

- objetivo;
- modo;
- paths relevantes;
- evidência confirmada;
- constraints;
- critérios de aceite.

Evitar transcript completo, brainstorming anterior e explicações que o executor
pode obter lendo um arquivo indicado.

### Handoff

Se um executor falhar ou a tarefa trocar de nível, transmitir somente:

- estado;
- resumo;
- achados;
- evidências;
- arquivos alterados;
- testes;
- riscos;
- próxima ação.

## 6. Circuit breaker

Estados recomendados por executor:

- `OK`;
- `RATE_LIMITED`;
- `QUOTA_EXHAUSTED`;
- `TIMEOUT`;
- `AUTH_ERROR`;
- `DOWN`.

Após duas falhas consecutivas na mesma rota, Hermes não repete o mesmo prompt.
Marca o executor indisponível no runtime local e tenta o próximo executor
**elegível para a mesma autoridade**.

## 7. Escrita e worktrees

Regra: um writer por worktree.

Leitores podem revisar em paralelo somente quando não disputarem estado mutável.
Codex MCP fica com `supports_parallel_tool_calls: false` no projeto principal.

Para implementações independentes, criar worktrees separadas e task IDs
separados. O Hermes mantém a relação `task -> worktree -> writer`.

## 8. Credenciais e onde elas vivem

| Ferramenta | Credencial | Local correto | Commit? |
|---|---|---|---|
| Hermes/OpenAI Codex | ChatGPT OAuth | `~/.hermes/auth.json` | nunca |
| Codex CLI/MCP | ChatGPT OAuth | `~/.codex/auth.json` | nunca |
| Gemini CLI | Google OAuth da conta AI Pro | `~/.gemini/` | nunca |
| OpenCode | provider auth | `~/.local/share/opencode/auth.json` | nunca |
| Supabase CLI | login/link local | home + `supabase/.temp` ignorado | nunca secret |
| GitHub CLI | OAuth/token do `gh` | keyring/config local | nunca |
| Cloudflare deploy | `CLOUDFLARE_API_TOKEN` | GitHub Actions Secret | nunca |

A chave OpenAI API criada separadamente pode permanecer como contingência, mas
não é necessária para Codex autenticado via ChatGPT Plus.

## 9. Supabase

Estado remoto é separado do estado local. No checkpoint desta arquitetura:

- projeto remoto está saudável;
- schema de impacto ainda é somente local/versionado;
- nenhuma Edge Function ativa;
- advisors existentes têm débito técnico próprio.

Hermes pode fazer diagnóstico local/read-only. Aplicação remota de migration,
RLS/RPC/Auth/Storage ou branches remotas exige gate humano.

## 10. Cloudflare e GitHub Actions

O projeto já possui uma separação saudável:

```text
merge autorizado em main
        ↓
GitHub Actions quality
        ↓
build com vars públicas Supabase
        ↓
wrangler-action
        ↓
Cloudflare Pages
        ↓
smoke + health
```

A nova arquitetura preserva esse caminho. Hermes não precisa possuir o token de
produção Cloudflare para desenvolver. Quando houver deploy autorizado, a ação
normal é acionar/observar GitHub Actions, não copiar secrets para mais um agente.

## 11. Retomada funcional

Depois que `npm run orch:doctor -- --smoke` estiver verde:

1. Hermes lê `AGENTS.md`, `.orchestrator/STATE.md` e `routing.yaml`.
2. Revalida Git/Supabase/preview relevantes.
3. Cria task packet da Fase 2 da Matriz de Impacto.
4. Gemini pode fazer leitura ampla da Fase 0–1.
5. OpenCode free pode revisar contratos/fixtures e procurar inconsistências simples.
6. Codex MCP implementa o menor chunk autorizado.
7. Ferramentas locais executam testes/build.
8. Hermes atualiza handoff/STATE somente em checkpoint real.

A aplicação remota das migrations de impacto continua um gate separado.
