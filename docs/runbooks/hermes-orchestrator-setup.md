# Runbook — configurar Hermes Orchestrator v1 no eleicao2026

Data: 2026-08-10
Escopo: workstation Linux. Não aplica migration remota, não faz deploy e não expõe secrets.

## 0. Entrar na branch preparada

```bash
cd /caminho/do/eleicao2026
PROJECT_ROOT="$(git rev-parse --show-toplevel)"

git fetch origin
git switch chore/hermes-orchestrator-v1 2>/dev/null || \
  git switch --track origin/chore/hermes-orchestrator-v1
git pull --ff-only
git status --short --branch
```

Se houver mudanças locais inesperadas, classifique-as antes de qualquer escrita.

## 1. PATH

```bash
export PATH="$HOME/.local/bin:$PATH"
command -v hermes || true
command -v codex || true
command -v agy || true
command -v opencode || true
```

## 2. Atualizar Hermes

```bash
hermes update --backup
hermes doctor
hermes --version
```

Não rode `hermes doctor --fix` no automático. Primeiro leia o que ele pretende
mudar.

## 3. Criar perfil isolado

```bash
if hermes profile show eleicao2026 >/dev/null 2>&1; then
  echo "perfil eleicao2026 já existe"
else
  hermes profile create eleicao2026 \
    --description "Control plane do VotoPraQuem RS: contexto, roteamento multi-CLI, gates e handoffs."
fi

hermes profile alias eleicao2026 --name h-eleicao2026
hermes -p eleicao2026 config set terminal.backend local
hermes -p eleicao2026 config set terminal.home_mode real
hermes -p eleicao2026 config check

# A skill versionada é parte obrigatória do control plane. Instale-a antes de
# qualquer doctor usado como gate de retomada.
npm run orch:install-skill
```

No backend local, inicie Hermes **a partir da raiz do repositório**. Não dependa
de `terminal.cwd` como mecanismo de localização do projeto.

## 4. Provider do próprio Hermes

```bash
hermes -p eleicao2026 model
```

No menu:

1. escolha **OpenAI Codex**;
2. importe `~/.codex/auth.json` se o Hermes oferecer essa opção, ou conclua o
   OAuth do ChatGPT;
3. escolha um modelo Codex econômico para coordenação, não Sol como default.

Esse caminho não exige `OPENAI_API_KEY`. A autenticação do Hermes fica no auth
store do perfil.

Valide sem mostrar secrets:

```bash
hermes -p eleicao2026 doctor
hermes -p eleicao2026 dump
```

Não use `hermes dump --show-keys` neste fluxo.

## 5. Codex CLI com ChatGPT

```bash
npm install -g @openai/codex@latest
codex --version
codex login status || true
```

Se necessário:

```bash
codex logout 2>/dev/null || true
codex login
```

Escolha **Sign in with ChatGPT**. Não exporte `OPENAI_API_KEY` para essa rota.

Smoke:

```bash
OUT="$(mktemp)"
codex exec \
  -m gpt-5.6-luna \
  --sandbox read-only \
  --ephemeral \
  --color never \
  -o "$OUT" \
  'Responda somente: CODEX_OK' >/dev/null
cat "$OUT"
rm -f "$OUT"
```

## 6. Codex MCP no Hermes

```bash
if hermes -p eleicao2026 mcp list 2>/dev/null | grep -qi 'codex'; then
  echo "Codex MCP já configurado"
else
  hermes -p eleicao2026 mcp add codex --preset codex
fi

hermes -p eleicao2026 mcp list
npm run orch:doctor
```

O preset configura `codex mcp-server` por stdio. O doctor rápido valida registro
e inicialização do servidor. O gate autoritativo é `orch:doctor -- --smoke`, que
faz também uma chamada real Hermes → MCP Codex em read-only e exige evidência
do uso da rota configurada.

Com `terminal.home_mode=real`, Codex, `gh` e demais CLIs locais enxergam suas
credenciais normais do usuário.

## 7. Google Antigravity para Google AI Pro

Para conta individual Google AI Pro/Ultra, use Antigravity CLI como executor
Google desta arquitetura. Gemini CLI permanece rota legacy/API-key/enterprise.

```bash
if command -v agy >/dev/null 2>&1; then
  agy update
else
  curl -fsSL https://antigravity.google/cli/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
fi

agy --version
agy models
```

Primeiro login:

```bash
agy
```

Escolha Google OAuth e conclua a autenticação. Depois saia da TUI.

### Configurar somente a leitura do snapshot

A rota headless validada não concede permissões amplas. Rode uma vez:

```bash
cd "$PROJECT_ROOT"
npm run orch:configure-google
```

O configurador:

- cria/atualiza o snapshot `.orchestrator/runtime/snapshots/antigravity`;
- faz backup de `~/.gemini/antigravity-cli/settings.json`;
- permite `read_file(<snapshot>)`;
- nega `write_file(<snapshot>)`;
- não adiciona `command(*)`, `mcp(*)` ou `write_file(*)` amplo.

O wrapper `orch:google` usa o custom agent versionado
`.agents/agents/eleicao2026-reader/agent.md`, liga explicitamente o snapshot ao
workspace com `--add-dir`, usa `--mode=plan` e `--sandbox`, e bloqueia
subagentes/background collaboration no fluxo headless para exigir resposta final
síncrona.

Nunca use `--dangerously-skip-permissions` nesta arquitetura.

O modelo padrão é `Gemini 3.5 Flash (Low)`. Confirme que aparece em `agy models`;
se o catálogo usar outro nome:

```bash
export ANTIGRAVITY_AGENT_MODEL='NOME EXATO MOSTRADO POR agy models'
```

Teste:

```bash
npm run orch:google -- \
  'Leia AGENTS.md na raiz deste workspace. Não altere nada. Responda somente com o título inicial exato do arquivo.'
```

Resultado esperado: o título inicial real de `AGENTS.md`. Respostas intermediárias
como “lancei o subagente research” não contam como sucesso.

## 8. OpenCode + DeepSeek gratuito

```bash
if command -v opencode >/dev/null 2>&1; then
  opencode upgrade
else
  curl -fsSL https://opencode.ai/install | bash
  export PATH="$HOME/.local/bin:$PATH"
fi

opencode --version
```

Se faltar autenticação:

```bash
opencode
```

Na TUI: `/connect` → **OpenCode Zen** → conclua o login.

Confirme o catálogo:

```bash
opencode models --refresh | grep -F 'opencode/deepseek-v4-flash-free' || true
```

Teste:

```bash
npm run orch:opencode -- \
  'Leia AGENTS.md na raiz do snapshot e devolva o título inicial exato. Não execute ações externas.'
```

O caminho orquestrado usa `agent plan`, sem MCP e sobre snapshot. DeepSeek V4
Flash Free deve receber somente conteúdo público/sanitizado.

## 9. Gemini CLI legacy, opcional

Não use OAuth individual Google AI Pro via Gemini CLI como base desta
arquitetura. `run-gemini.sh` fica apenas para API key/enterprise explícito:

```bash
npm run orch:gemini-legacy -- 'tarefa consultiva'
```

Sem credencial apropriada, deixe essa rota inativa.

## 10. GitHub CLI e Actions

```bash
gh auth status || gh auth login

gh repo view Snerolino/eleicao2026 --json nameWithOwner,defaultBranchRef

gh secret list --repo Snerolino/eleicao2026 | \
  grep -E 'CLOUDFLARE_API_TOKEN|VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY' || true
```

Isso verifica apenas nomes. Não copie `CLOUDFLARE_API_TOKEN` para o Hermes.

## 11. Supabase CLI

Projeto remoto: `hhqxhxcfkoijevxyzfky`.

```bash
npx supabase --version
npx supabase projects list >/dev/null 2>&1 || npx supabase login
npx supabase link --project-ref hhqxhxcfkoijevxyzfky
npx supabase migration list
```

Local:

```bash
npx supabase start
npx supabase db reset
```

Somente visualizar pendências remotas:

```bash
npx supabase db push --dry-run
```

Não execute `npx supabase db push` enquanto o gate humano das migrations de
impacto não for liberado.

## 12. Cloudflare

O fluxo normal não precisa de login Cloudflare local. O token de produção
permanece no GitHub Actions.

```bash
npx wrangler --version
```

Não rode `wrangler pages deploy` nesta configuração.

## 13. Fallback local Ollama, opcional

```bash
if command -v ollama >/dev/null 2>&1; then
  ollama list
else
  echo "Ollama ausente: fallback local ficará desabilitado."
fi
```

O doctor não baixa modelos nem instala Supabase/Wrangler via `npx`; essas CLIs
só são sondadas quando já existem globalmente ou em `node_modules/.bin`. Se
`gpt-oss:20b` já estiver listado:

```bash
npm run orch:local -- \
  'Leia AGENTS.md e responda em duas frases qual é a política de fallback.'
```

Esse caminho usa Codex OSS + Ollama, read-only e snapshot.

## 14. Doctor completo

Sem chamadas de modelo, apenas preflights locais:

```bash
npm run orch:doctor
```

Gate completo com smokes reais:

```bash
npm run orch:doctor -- --smoke
```

O `--smoke` exercita obrigatoriamente Hermes → MCP Codex ponta a ponta em
read-only e exige o marcador `HERMES_CODEX_MCP_OK`. OpenCode e Antigravity são
consultivos/opcionais; quando disponíveis, seus smokes só passam quando
comprovam leitura do `AGENTS.md` pelo título esperado. O fallback `codex exec`
também é testado de forma estruturada.

Arquivos diagnósticos são criados em diretório temporário exclusivo via
`mktemp` e removidos automaticamente ao final. O doctor não usa nomes fixos em
`/tmp`. `WARN` pode significar executor opcional indisponível; `FAIL` estrutural
ou do MCP Codex obrigatório deve ser resolvido antes da retomada.

## 15. Revalidar checkpoint funcional

```bash
npm test
npx tsc --noEmit
npm run build
node scripts/validate-impact-schema.mjs
```

Se necessário:

```bash
npx supabase start
npx supabase db reset
```

## 16. Iniciar Hermes no projeto

```bash
cd "$PROJECT_ROOT"
h-eleicao2026 chat -q "$(cat .orchestrator/BOOTSTRAP_PROMPT.md)"
```

Se o perfil já usa outro alias customizado, use esse alias. Sem alias:

```bash
cd "$PROJECT_ROOT"
hermes -p eleicao2026 chat -q "$(cat .orchestrator/BOOTSTRAP_PROMPT.md)"
```

O primeiro turno revalida o estado e não implementa a Fase 2 ainda.

## 17. Ordem de retomada

1. Antigravity para leitura ampla/contexto grande.
2. OpenCode/DeepSeek free para checks mecânicos baratos do `HEAD`.
3. Codex MCP Luna para primeiro chunk mutável da Fase 2.
4. Terra se Luna ficar incompleto, multi-arquivo ou com testes falhando.
5. Sol somente para arquitetura, regressão difícil ou segurança de alto impacto.
6. Testes/build locais validam o resultado independentemente do modelo escritor.
7. Hermes atualiza `STATE.md` só em checkpoint real.
8. Migration remota continua um gate humano separado.
