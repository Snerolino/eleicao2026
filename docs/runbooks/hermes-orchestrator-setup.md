# Runbook — configurar Hermes Orchestrator v1 no eleicao2026

Data: 2026-08-10
Escopo: workstation Linux do projeto. Não aplica migration remota e não faz deploy.

> Execute os blocos na ordem. Nenhum bloco pede para colar segredo nesta
> documentação. OAuth/login é feito diretamente pela CLI correspondente.

## 0. Entrar na branch preparada

```bash
cd /caminho/do/eleicao2026

git fetch origin
git switch chore/hermes-orchestrator-v1 2>/dev/null || \
  git switch --track origin/chore/hermes-orchestrator-v1

git pull --ff-only

git status --short --branch
```

Esperado: branch `chore/hermes-orchestrator-v1`. Se houver mudanças locais
inesperadas, pare antes de qualquer escrita e classifique-as.

## 1. Garantir PATH local do usuário

Antigravity e várias CLIs instalam binários em `~/.local/bin`.

```bash
export PATH="$HOME/.local/bin:$PATH"

case ":$PATH:" in
  *":$HOME/.local/bin:"*) echo "PATH OK" ;;
  *) echo "PATH ainda não contém ~/.local/bin" ;;
esac
```

Se `~/.local/bin` não persistir entre terminais, adicione manualmente ao seu
shell profile depois de confirmar qual arquivo (`~/.bashrc`, `~/.zshrc`, etc.)
seu ambiente realmente usa.

## 2. Atualizar e verificar Hermes

```bash
hermes update --backup
hermes doctor
hermes --version
```

Não use `hermes doctor --fix` automaticamente neste projeto. Primeiro leia o
que ele quer alterar; correção automática de configuração é uma mutação fora do
escopo do doctor do repositório.

## 3. Criar perfil isolado do projeto

Perfis isolam configuração, memória e sessões do Hermes.

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
```

Não dependa de `terminal.cwd` para o backend local. Inicie o Hermes a partir da
raiz do repositório; versões recentes tiveram comportamento inconsistente com
`terminal.cwd` no backend local.

## 4. Configurar o modelo do próprio Hermes

```bash
hermes -p eleicao2026 model
```

No menu:

1. escolha **OpenAI Codex**;
2. se Hermes oferecer importar a credencial existente do Codex CLI, use essa
   opção; caso contrário conclua o OAuth do ChatGPT no navegador;
3. escolha o modelo Codex mais econômico disponível que seja adequado para
   coordenação/orquestração; não use Sol como default apenas para roteamento.

Esse caminho não usa `OPENAI_API_KEY`. A autenticação do Hermes fica em seu
próprio auth store, separado do Codex CLI. A semântica de consumo da cota do
plano ChatGPT quando Hermes usa diretamente esse provider deve ser tratada como
não documentada até confirmação do fornecedor. O uso do Codex CLI autenticado
pelo ChatGPT é o caminho documentado do plano Plus.

Valide sem mostrar credenciais:

```bash
hermes -p eleicao2026 doctor
hermes -p eleicao2026 dump
```

`hermes dump` mostra presença/ausência de credenciais sem imprimir segredos por
padrão. Não use `--show-keys` neste fluxo.

## 5. Atualizar e autenticar Codex CLI com ChatGPT

```bash
npm install -g @openai/codex@latest
codex --version
codex login status || true
```

Se o status não indicar login válido:

```bash
codex logout 2>/dev/null || true
codex login
```

Escolha **Sign in with ChatGPT** e autentique com a conta que possui ChatGPT
Plus. Não defina `OPENAI_API_KEY` para essa rota.

Validação simples read-only:

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

## 6. Conectar Codex MCP ao perfil Hermes

```bash
if hermes -p eleicao2026 mcp list 2>/dev/null | grep -qi 'codex'; then
  echo "Codex MCP já configurado"
else
  hermes -p eleicao2026 mcp add codex --preset codex
fi

hermes -p eleicao2026 mcp test codex
hermes -p eleicao2026 mcp list
```

O preset oficial equivale a `codex mcp-server` via stdio. Não habilite chamadas
paralelas do Codex no mesmo workspace; o projeto usa um writer por worktree.

Como o backend local do Hermes preserva o `HOME` real, o subprocesso Codex deve
enxergar `~/.codex/auth.json`. Se seu ambiente tiver HOME artificialmente
sobrescrito, exporte antes de iniciar Hermes:

```bash
export HOME="$(getent passwd "$(id -un)" | cut -d: -f6)"
export CODEX_HOME="$HOME/.codex"
```

## 7. Instalar/configurar Google Antigravity CLI para a conta Google AI Pro

Para contas individuais Google AI Pro/Ultra, a rota atual é Antigravity CLI.
Gemini CLI fica apenas como compatibilidade para API key/enterprise.

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

Na primeira autenticação:

```bash
agy
```

Escolha **Google OAuth**, autentique com a conta Google que possui AI Pro,
aceite os termos e encerre a TUI após concluir.

O wrapper do projeto usa por padrão `Gemini 3.5 Flash (Low)`. Confirme primeiro
que esse nome aparece no seu `agy models`. Se o catálogo local tiver outro nome,
defina apenas para a sessão:

```bash
export ANTIGRAVITY_AGENT_MODEL='NOME EXATO MOSTRADO POR agy models'
```

### Trust do snapshot estável

O executor Google nunca recebe a worktree viva. Prepare o snapshot rastreado e,
se o Antigravity solicitar confiança no diretório, confie apenas nesse caminho:

```bash
SNAP="$(bash scripts/orchestrator/prepare-snapshot.sh antigravity)"
printf 'snapshot=%s\n' "$SNAP"
cd "$SNAP"
agy
```

Depois saia e volte à raiz:

```bash
cd "$(git -C "$SNAP" rev-parse --show-toplevel 2>/dev/null || dirname "$(dirname "$(dirname "$SNAP")")")" 2>/dev/null || true
```

Se o comando acima não retornar ao projeto, simplesmente execute `cd` para a
raiz original do `eleicao2026` antes de seguir.

O modo `agy -p` pode executar ações de agente. Por isso o isolamento relevante
não é confiar no prompt; é o snapshot descartável criado por `git archive HEAD`.

## 8. Atualizar/configurar OpenCode + DeepSeek gratuito

```bash
if command -v opencode >/dev/null 2>&1; then
  opencode upgrade
else
  curl -fsSL https://opencode.ai/install | bash
  export PATH="$HOME/.local/bin:$PATH"
fi

opencode --version
```

Se ainda não houver autenticação OpenCode Zen:

```bash
opencode
```

Dentro da TUI execute `/connect`, escolha **OpenCode Zen** e conclua o login.
Não cole a chave em arquivos do repositório.

Atualize o catálogo e confirme o modelo gratuito:

```bash
opencode models --refresh | grep -F 'opencode/deepseek-v4-flash-free' || true
```

Se o modelo não aparecer, o Hermes abrirá circuit breaker dessa rota e usará o
próximo executor. Modelos gratuitos são disponibilidade oportunista, não SLA.

O caminho orquestrado:

```bash
npm run orch:opencode -- \
  'Leia AGENTS.md e informe, sem editar nada, qual é a fonte de verdade número 1.'
```

roda em snapshot Git sanitizado, `agent plan`, sem MCP e sem acesso à worktree.

## 9. Gemini CLI legacy, opcional

Não configure Gemini CLI com OAuth da assinatura individual Google AI Pro para
esta arquitetura. Só mantenha esta rota se você tiver uma API key ou ambiente
enterprise explicitamente destinado a isso.

O wrapper existe por compatibilidade:

```bash
npm run orch:gemini-legacy -- 'tarefa consultiva'
```

Se não houver credencial apropriada, deixe essa rota inativa.

## 10. GitHub CLI e GitHub Actions

```bash
gh auth status || gh auth login

gh repo view Snerolino/eleicao2026 --json nameWithOwner,defaultBranchRef

gh secret list --repo Snerolino/eleicao2026 | \
  grep -E 'CLOUDFLARE_API_TOKEN|VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY' || true
```

Esse comando lista **nomes**, não valores. Não copie `CLOUDFLARE_API_TOKEN` para
o Hermes. O deploy de produção continua pertencendo ao GitHub Actions.

## 11. Supabase CLI e vínculo local

Projeto remoto: `hhqxhxcfkoijevxyzfky`.

```bash
npx supabase --version
npx supabase projects list >/dev/null 2>&1 || npx supabase login
npx supabase link --project-ref hhqxhxcfkoijevxyzfky
npx supabase migration list
```

Para desenvolvimento local:

```bash
npx supabase start
npx supabase db reset
```

Para apenas visualizar o que seria aplicado no remoto, sem aplicar:

```bash
npx supabase db push --dry-run
```

**Não execute `npx supabase db push`** para as migrations da Matriz de Impacto
até o gate humano específico de aplicação remota.

## 12. Cloudflare

Não é necessária credencial Cloudflare local para o fluxo normal. O repositório
já entrega produção pelo GitHub Actions com `CLOUDFLARE_API_TOKEN` armazenado
como secret.

Verifique apenas a ferramenta:

```bash
npx wrangler --version
```

Não rode `wrangler pages deploy` durante esta configuração.

## 13. Fallback local Ollama, opcional

O último fallback não deve depender de quota externa. Se você já usa Ollama:

```bash
if command -v ollama >/dev/null 2>&1; then
  ollama list
else
  echo "Ollama não instalado: fallback local ficará desabilitado."
fi
```

Se `gpt-oss:20b` estiver ausente e você decidir habilitar esse fallback depois,
instale-o explicitamente pelo fluxo normal do Ollama. O doctor não baixa modelo
automaticamente.

Teste, somente se o modelo estiver listado:

```bash
npm run orch:local -- 'Leia AGENTS.md e resuma o papel do Hermes em duas frases.'
```

Esse executor usa Codex em modo OSS + Ollama, read-only e sobre snapshot.

## 14. Doctor da arquitetura

Primeiro sem consumir modelos:

```bash
npm run orch:doctor
```

Depois com smokes reais:

```bash
npm run orch:doctor -- --smoke
```

Saídas de smoke ficam em `/tmp/eleicao2026-*-smoke.*`; não são commitadas.
Warnings de executor opcional podem ser aceitáveis. `FAIL` estrutural deve ser
corrigido antes da retomada funcional.

## 15. Revalidar o checkpoint funcional

```bash
npm test
npx tsc --noEmit
npm run build
node scripts/validate-impact-schema.mjs
```

Se precisar revalidar a camada Postgres local da Fase 1:

```bash
npx supabase start
npx supabase db reset
```

Nenhum desses comandos deve atingir produção quando usados no modo local acima.

## 16. Iniciar Hermes no projeto

Sempre da raiz do repositório:

```bash
cd /caminho/do/eleicao2026
h-eleicao2026 chat -q "$(cat .orchestrator/BOOTSTRAP_PROMPT.md)"
```

Alternativa sem alias:

```bash
hermes -p eleicao2026 chat -q "$(cat .orchestrator/BOOTSTRAP_PROMPT.md)"
```

O primeiro turno deve apenas revalidar estado, executores e gates. A Fase 2 não
começa antes de o control plane confirmar que o checkpoint está coerente.

## 17. Ordem de retomada depois do doctor verde

1. Gemini/Google Antigravity: leitura ampla das Fases 0–1 se contexto grande for necessário.
2. OpenCode/DeepSeek free: checks mecânicos baratos sobre o snapshot público.
3. Codex MCP Luna: primeiro chunk de implementação da Fase 2.
4. Terra somente se Luna ficar incompleto, multi-arquivo ou com testes ainda falhando.
5. Sol somente para arquitetura, regressão difícil ou segurança de alto impacto.
6. Ferramentas locais validam testes/build; o modelo que escreveu não é sua própria banca examinadora.
7. Hermes atualiza `STATE.md` apenas em checkpoint real.
8. Aplicação de migrations remotas continua sendo uma decisão separada e humana.
