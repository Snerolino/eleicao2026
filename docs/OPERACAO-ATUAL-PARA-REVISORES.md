# Operação atual para revisores — eleicao2026

**Projeto:** Portal Transparência Eleitoral RS
**Repositório:** `Snerolino/eleicao2026`
**Produção:** <https://rs.votopraquem.org>
**Control plane:** Hermes
**Última atualização deste documento:** 2026-08-20

> Este documento descreve o modo operacional vigente para revisão no GitHub.
> Ele não substitui código, migrations, `AGENTS.md`, schemas ou contratos
> executáveis. Quando houver conflito, o código e os contratos atuais vencem.

---

## 1. Ordem de autoridade

O revisor deve usar esta ordem:

1. código e Git atuais da `main`;
2. `AGENTS.md`;
3. migrations e schemas versionados;
4. `README.md` e documentação aplicável;
5. `docs/context-export/`;
6. este documento;
7. `.orchestrator/STATE.md`, sempre revalidando dados voláteis;
8. documentos históricos e conversas, somente como contexto.

Documentos de bootstrap importados de `dataset2026` estão em:

```text
docs/orquestracao/
```

Eles orientam o workflow, mas não podem substituir o estado real da aplicação.

---

## 2. Estado funcional atual

### Portal

- snapshot público: **1003 candidaturas**;
- cards visíveis: **1002**;
- fotos oficiais rastreáveis: **988**;
- produção: HTTP 200;
- PWA/offline: validado;
- sitemap e release gerados pelo build.

### Matriz de impacto v1

- R0: concluído;
- R1: operacionalmente concluído, com 4 residuais ALRS;
- R2: Câmara Q1/Q2/Q3 factual aplicada nos lotes elegíveis;
- R3: perfis nominais materializados por `(candidate_id, house)`;
- R4: fila Q2/Q3 revisada, sem `pending_review` restante;
- R5: comparação e score por categoria publicados no recorte atual.

### Regra de apresentação

A UI separa:

1. fatos de votação: `sim`, `não`, `abstenção`, `ausente`, `obstrução`;
2. impacto populacional: assessment com grupo, direção, fonte e revisão;
3. score derivado por candidato, casa e grupo.

`nominal_balance` não é avaliação pública e não deve ser apresentado ao eleitor
como nota ou posição política.

Sem assessment compatível, a UI exibe:

```text
Há votos factuais nesta casa, mas ainda não há avaliações populacionais aprovadas para gerar score por categoria.
```

Nunca exibir zero artificial para ausência de cobertura.

---

## 3. Score por categoria

A metodologia é `1.0.0`.

```text
score = Σ(peso × sinal) / Σ(peso elegível)
```

Pesos:

```text
structural = severity × 1.5
budgetary  = severity × 1.0
symbolic   = severity × 0.5
```

Sinais:

```text
a_favor              +1
contra               -1
neutro_declarado      0
omissao_estrategica  -0.5
omissao_coordenada     0
sem_dado              excluído
nao_avaliavel         excluído
```

`confidence` não pondera o score na v1.

A cadeia obrigatória é:

```text
voto factual
→ proposition_version
→ impact_matrix
→ assessment aprovado/contestado
→ fonte
→ alinhamento
→ score por grupo
```

A matriz pertence à versão efetivamente votada, não à proposição genérica.

---

## 4. Orquestração Hermes

Hermes é o único control plane. Ele decide:

- task packets;
- executor;
- autoridade;
- retries;
- circuit breaker;
- gates;
- handoffs;
- próximo chunk.

Políticas atuais:

```yaml
single_writer_per_worktree: true
continuous_progress: true
idle_between_gates: false
prompt_wait_policy: never_wait_between_gates
scouts_are_read_only: true
remote_mutation_requires_human: true
publish_after_green_gates: true
blocker_scope: affected_item_only
```

Lock do writer:

```text
.orchestrator/runtime/locks/continuous-progress.lock
```

Scouts podem pesquisar fontes públicas e entregar manifestos/handoffs, mas não
podem editar, commitar, fazer push, escrever Supabase ou fazer deploy.

---

## 5. Heartbeat

Job atual:

```text
nome: eleicao2026-continuous-progress
schedule: every 15m
status: enabled
repeat: forever
deliver: local
lock: .orchestrator/runtime/locks/continuous-progress.lock
```

O heartbeat deve:

- executar tarefas bounded;
- preservar um writer único;
- manter ALRS/Senado em reconhecimento read-only;
- avançar lanes locais independentes;
- documentar checkpoints;
- não aplicar fatos sem gates;
- não aguardar prompt entre chunks elegíveis.

Comando para conferir:

```bash
hermes cron list
```

---

## 6. Executores e CLIs

### OpenCode individual

```text
wrapper: scripts/orchestrator/run-opencode.sh
modelo: opencode/deepseek-v4-flash-free
autoridade: read-only
```

Uso: triagem, inventário, revisão simples e segunda opinião.

### Free pool OpenCode

```text
wrapper: scripts/orchestrator/run-free-pool.sh
```

Ordem padrão:

```text
opencode/deepseek-v4-flash-free
opencode/nemotron-3-ultra-free
opencode/laguna-s-2.1-free
opencode/ling-3.0-tiny-free
opencode/mimo-v2.5-free
```

Uso: análise barata, reconhecimento público, resumo e fallback consultivo.

### Google Antigravity / AGY

```text
wrapper: scripts/orchestrator/run-antigravity.sh
modelo configurado: google-gemini-1.5-pro via AGY
modo: read-only sandboxed
snapshot: git archive HEAD
```

Uso: contexto amplo, mapeamento de repositório, síntese documental e pesquisa
consultiva. O AGY não recebe secrets, PII, documentos brutos ou arquivos `.env`.

### Codex MCP

```text
transport: MCP stdio
comando: codex mcp-server
```

Escada de modelos:

```text
Luna  → gpt-5.6-luna   → primeira implementação/revisão
Terra → gpt-5.6-terra  → multi-arquivo/incerteza/testes persistentes
Sol   → gpt-5.6-sol    → arquitetura crítica/regressão difícil
```

Uso: implementação, debugging, testes, refatoração e revisão técnica final.

### Fallbacks

```text
Codex exec: gpt-5.6-luna, read-only
Ollama: gpt-oss:20b, somente se o doctor confirmar disponibilidade
Gemini legacy: somente com configuração enterprise/API explícita
```

Após duas falhas consecutivas do mesmo executor, abrir circuit breaker e trocar
de rota. Fallback consultivo nunca herda autoridade de escrita.

---

## 7. Task packet e handoff

Cada tarefa deve conter:

- `task_id`;
- objetivo;
- modo (`read_only` ou `workspace_write` autorizado);
- autoridade;
- branch/HEAD;
- paths;
- evidências;
- restrições;
- aceite;
- timeout;
- resultado verificável.

Não combinar no mesmo packet:

- pesquisa factual e publicação;
- coleta legislativa e dossiê judicial;
- construção de matriz e aprovação editorial;
- código e deploy;
- leitura consultiva e escrita remota.

Templates importados:

```text
docs/orquestracao/02-CONTRATOS-TASK-PACKET-HANDOFF.md
.orchestrator/templates/TASK_PACKET.md
.orchestrator/templates/HANDOFF.json
.orchestrator/schemas/executor-result.schema.json
```

---

## 8. Três trilhas que o revisor não deve misturar

### Trilha A — identidade/histórico

Resolve candidato, `SQ_CANDIDATO`, mandatos, casas e IDs oficiais.

### Trilha B — fato legislativo

Resolve proposição, versão, evento, voto, ausência e fonte.

`legislative_votes` nunca recebe score, impacto ou recomendação.

### Trilha C — impacto

Classifica a versão votada por grupo populacional, direção, severidade,
confidence, rationale e `defending_vote`.

Uma matriz é criada uma vez por versão/metodologia e reutilizada entre todos os
votantes do evento.

---

## 9. Precedência de fontes

Regra atual:

```text
fonte oficial primária
  > dataset2026 sem comprovação oficial
  > fonte desconhecida
```

Conflitos são resolvidos pelo CLI:

```bash
npm run data:source:precedence -- records.json --key=external_id --output=resolved.json
```

Exceção: mirror `dataset2026` com `official_url` e hash oficial TSE continua
sendo tratado como evidência oficial TSE.

A decisão fica auditada em:

```text
discarded
conflicting_fields
reason=official_source_wins
```

---

## 10. Gates de escrita remota

Aplicação factual exige todos os gates:

```text
R0 identity
+ schema/FK
+ fonte oficial
+ dry-run
+ idempotência
```

A aplicação de fatos legislativos é separada da criação/aprovação de impacto.

É proibido contornar:

- identidade ambígua;
- hash divergente;
- fonte ausente;
- FK não confirmada;
- schema incompatível;
- `pending_review`;
- revisão externa obrigatória.

Sem fonte ou identidade, o item fica `fail-closed`; o restante do projeto pode
continuar.

---

## 11. Situação dos bloqueios

### ALRS

- 3996/4000 votos com fonte;
- 4 residuais Enio Carlos Terra;
- ID oficial ALRS ainda não localizado;
- não criar vínculo por aproximação.

### Senado

- endpoints HTTP 200;
- PDFs válidos;
- deriva persistente de bytes/SHA contra manifesto;
- não substituir manifesto automaticamente;
- votos novos continuam bloqueados.

### Câmara Q1 residual

- identidades pendentes continuam em reconciliação oficial;
- não aplicar por nome aproximado ou fuzzy matching.

Esses bloqueios são por item/lane e não impedem a UI, R4/R5 já publicados ou
novos scouts independentes.

---

## 12. Gates locais e publicação

Executar com Node `>=24 <25`:

```bash
npm run test
npx tsc --noEmit
node scripts/validate-impact-schema.mjs
npm run data:check
npm run build
git diff --check
npm run smoke:local
```

Smoke de produção:

```bash
npm run smoke:preview -- --url https://rs.votopraquem.org/
npm run health:preview -- --url https://rs.votopraquem.org/
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' https://rs.votopraquem.org
```

Publicação normal:

```text
git commit → git push origin main
→ workflow backup 334951434
→ CI/deploy success
→ headSha == commit live
→ produção HTTP 200
→ smoke/health
```

O workflow confiável de Cloudflare é:

```text
Deploy to Cloudflare Pages (backup)
ID: 334951434
```

---

## 13. Como revisar sem causar desserviço

O revisor deve:

1. conferir o código e o contrato antes de sugerir alteração;
2. distinguir fato, impacto e score;
3. citar URL oficial e `source_reference`;
4. confirmar a casa legislativa;
5. confirmar a versão efetivamente votada;
6. identificar se o evento é mérito ou procedimento;
7. não herdar impacto de mérito para urgência/retirada de pauta;
8. manter `unclear`/`null` quando a taxonomia não sustentar uma classificação;
9. não transformar ausência em voto contrário ou score zero;
10. devolver task packet/handoff com evidência e arquivos;
11. não editar a worktree quando estiver em modo consultivo;
12. não afirmar que um executor publicou algo sem verificar SHA, CI e produção.

Checklist mínimo de uma revisão:

```text
[ ] fonte oficial primária
[ ] chave natural confirmada
[ ] casa e legislatura confirmadas
[ ] proposição/versão/evento distinguidos
[ ] identidade exata
[ ] fonte/hash registrados
[ ] status editorial explícito
[ ] impacto separado do voto
[ ] score recalculável
[ ] ausência de dado não convertida em zero
[ ] testes/gates executados
```

---

## 14. Comandos de revalidação rápida

```bash
git status --short --branch
git rev-parse HEAD
hermes cron list
npm run data:check
curl -sS https://rs.votopraquem.org/release.json
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' https://rs.votopraquem.org
```

Para qualquer revisão, a saída deve separar:

```text
estado_confirmado
divergencias
lacunas
risco
arquivos alterados
testes
próxima ação segura
```

**Não usar números históricos dos documentos importados como estado atual sem
revalidar os comandos acima.**
