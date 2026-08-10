# Handoff — Estado atual para análise externa da nova arquitetura de agentes

Data: 2026-08-10
Branch: `feat/matriz-impacto-populacional-v1`
Objetivo: descrever o estado real do repositório, o que foi validado e o que
falta, para implementação/documentação externa de uma nova arquitetura (Codex).

---

## 1. Estado do repositório

- Produção: `rs.votopraquem.org` verde (main), 792 candidaturas com fotos TSE.
- Branch atual: `feat/matriz-impacto-populacional-v1` (4 commits à frente do main).

```
9b5af66 feat: fase 1 da matriz de impacto populacional v1 — testes, dominio e migrations locais
3137c15 fix(data): restaurar 792 fotos oficiais TSE 2026 no snapshot (refetch apos refresh)
49960cb data: atualizar snapshot publico (792 candidaturas) a partir do dataset TSE local
d51508c feat: fase 0 da matriz de impacto populacional v1 — contrato, metodologia, governanca e schemas executaveis
```

- Preview Cloudflare Pages da branch:
  `https://feat-matriz-impacto-populaci.portal-transparencia-rs.pages.dev`
  (smoke: 0 falhas HTTP, 792 candidatos, health OK; SW offline OK).

---

## 2. Fase 0 — contrato da Matriz de Impacto Populacional v1 (concluída)

Checkpoint exigido pelo usuário: **"conseguir validar um impact_matrix bom e
rejeitar um ruim"** — VERDE.

Arquivos versionados:

| Arquivo | Conteúdo |
|---|---|
| `docs/metodologia-impacto-populacional-v1.md` | Metodologia 1.0: 14 grupos, enums, pesos ×1.5/×1.0/×0.5, sinais, fórmula, rubrica 1–5, confidence, decisões A–D |
| `docs/governanca-impacto-populacional.md` | Fluxo editorial, revisão interna/externa, contestação, RLS |
| `docs/contrato-json-votoemquem.md` | Contrato JSON (extensão aditiva do contrato do raspador) |
| `schemas/impact-matrix-v1.schema.json` | Draft 2020-12, condicionais `defending_vote`, strict |
| `schemas/legislative-votes-v1.schema.json` | `absence_type` condicionado por `value` |
| `scripts/validate-impact-schema.mjs` | Validador de checkpoint (Ajv2020 + formatos custom) |
| `fixtures/impact-matrices/`, `fixtures/legislative-votes/` | 4 casos: 2 bons (aceitos), 2 ruins (rejeitados) |

Execução: Gemini CLI testado (lento, travou como agente de edição) → OpenCode
`openai/gpt-5.5` high executou (com `HOME=/home/lourenco`; sem isso o auth OAuth
não era encontrado) → MOA não necessário.

---

## 3. Fase 1 — domínio, testes e migrations locais (concluída)

- 4 suites de teste (42 casos): `scripts/__tests__/impact-{contract,alignment,score,review-gates}.test.mjs`
- Dominio: `src/domain/impact/` — `contract.ts` (validador), `alignment.ts`
  (`deriveAlignment`), `score.ts` (`computeScore`, sem ponderação por confidence
  na v1), `review-gates.ts` (`canApproveImpactMatrix`).
- 5 migrations locais (`supabase/migrations/2026081009xxxx`), **aplicadas apenas
  localmente** via `supabase db reset` (0 erros) — nenhuma alteração remota:
  1. `create_legislative_core.sql` — `legislative_propositions`,
     `proposition_versions`, `voting_events`, `legislative_votes` (somente fato).
  2. `create_impact_taxonomy.sql` — `beneficiary_groups` (14 slugs v1) +
     `beneficiary_group_aliases`.
  3. `create_impact_matrix.sql` — `impact_matrices`, `impact_assessments`
     (trigger `impact_assessment_defending_ok`), `impact_assessment_sources`.
  4. `create_impact_review_workflow.sql` — `impact_reviews`, `impact_contestations`.
  5. `create_impact_rls_and_approval.sql` — RLS (público lê só
     `approved|contested`), RPC `approve_impact_matrix(uuid)`,
     helpers `impact_matrix_has_{internal,external}_approval`,
     `impact_matrix_has_blocking_contestation`.
- RPC validada ponta a ponta no Postgres local:
  - sem revisão interna → falha `revisão interna aprovada obrigatória`;
  - severity 4 sem painel externo → falha `severity >= 4 exige revisão externa`;
  - assessment sem fontes → falha `confidence fora da faixa ou sem fontes`;
  - com revisão interna + painel → aprova com `approved_at` preenchido.
- `src/types/supabase.ts` regenerado (1628 linhas; 48 refs às novas tabelas).
- `docs/context-export/SCHEMA.md` e `CHANGELOG.md` atualizados (contrato MCP).

Gates verdes: `npm run test` 222/222 · `npx tsc --noEmit` limpo · `npm run build` OK.

---

## 4. Integração Codex CLI validada (2026-08-10)

### Ambiente

- `codex-cli 0.147.0` (≥ 0.144.0, requisito para GPT-5.6).
- **Auth: `auth_mode: chatgpt`** — credencial da conta Plus (sign in with
  ChatGPT), **sem** `OPENAI_API_KEY`. Uso entra nos limites de Codex do plano,
  não em API key.
- Config do projeto em `/home/lourenco/.codex/config.toml`:
  `model = "gpt-5.6-sol"`, `model_reasoning_effort = "high"`.

### Comandos validados (todos com `CODEX_HOME=/home/lourenco/.codex HOME=/home/lourenco`)

```bash
# Simples — resposta final no stdout
codex exec -m gpt-5.6-luna --sandbox read-only "prompt"

# Robusto — stdout puro = resposta final (sem TUI/intermediários)
OUT=$(mktemp)
codex exec -m gpt-5.6-luna --sandbox read-only --ephemeral --color never \
  -o "$OUT" "prompt" >/dev/null
cat "$OUT"; rm -f "$OUT"

# Prompt via stdin (prompts grandes, sem problemas de aspas)
printf '%s' "$PROMPT" | codex exec -m gpt-5.6-luna --sandbox read-only \
  --ephemeral --color never -o "$OUT" - >/dev/null

# Saída estruturada validada por JSON Schema
codex exec -m gpt-5.6-luna --sandbox read-only --ephemeral --color never \
  --output-schema /tmp/codex-result.schema.json -o "$OUT" "tarefa" >/dev/null
```

### Níveis de modelo (sugestão do guia externo)

| Nível | Modelo | Uso |
|---|---|---|
| barato/rápido | `gpt-5.6-luna` | tarefas repetitivas, triagem, análises curtas |
| médio | `gpt-5.6-terra` | implementação/revisão normal |
| difícil | `gpt-5.6-sol` | arquitetura, problemas difíceis |

### Testes reais executados

1. `codex exec -m gpt-5.6-luna "Responda somente: OK..."` → `OK. Sou o GPT-5.4`
   (stderr confirmou `model: gpt-5.6-luna`; saída curta truncada).
2. `--output-schema` + stdin `-` → JSON estruturado válido, **identificou 2 bugs
   reais do projeto** (cardinalidade mínima em `src/services/candidates.ts` e
   aprovação não atômica em `src/pages/AdminPage.tsx`). Exit 0.
3. Erros `mcp.cloudflare.com AuthRequired` no stderr são cosméticos (plugin MCP
   do CLI sem OAuth), não afetam resultado.
4. `codex mcp-server` disponível (servidor MCP via stdio) — alternativa para
   integração profunda com o orquestrador.

### Esquema JSON sugerido para orquestração

Ver `/tmp/codex-result.schema.json` durante a sessão; o contrato recomendado:

```json
{
  "type": "object",
  "properties": {
    "status": { "type": "string", "enum": ["ok", "blocked", "error"] },
    "summary": { "type": "string" },
    "findings": { "type": "array", "items": { "type": "string" } },
    "recommended_action": { "type": "string" },
    "human_review_required": { "type": "boolean" }
  },
  "required": ["status", "summary", "findings", "recommended_action", "human_review_required"],
  "additionalProperties": false
}
```

---

## 5. Orquestração de agentes CLI (estado atual no sandbox Hermes)

| CLI | Home real necessário | Auth | Papel validado |
|---|---|---|---|
| OpenCode 1.18.15 | `HOME=/home/lourenco` (+`OPENCODE_DISABLE_MCP=true`) | OAuth ChatGPT (`~/.local/share/opencode/auth.json`) | **execução** (Fase 0/1) — `openai/gpt-5.5` high |
| Codex 0.147.0 | `CODEX_HOME=/home/lourenco/.codex` | `auth_mode: chatgpt` (Plus) | **consulta/análise estruturada** — `gpt-5.6-luna/sol` |
| Gemini CLI | `HOME=/home/lourenco` (`--skip-trust`) | `~/.gemini/` | consultivo; **lento** (usuário autoriza esperar) |
| MOA | — | — | fallback quando os acima falham |

Regras: CLIs de IA no sandbox Hermes **não veem** envs/auth de outro shell
(exceto com HOME real); nunca commit/deploy remoto sem autorização humana.

---

## 6. O que falta para a nova arquitetura (Codex como orquestrador)

Estes pontos estão **abertos e deliberadamente não implementados** para a
análise externa decidir:

1. **Wrapper `codex-agent`** (`~/.local/bin/codex-agent`) com modalidade
   prompt-arg e stdin, `CODEX_AGENT_MODEL`, `CODEX_AGENT_WORKDIR` — sugerido
   pelo guia externo, não criado ainda.
2. **Schema JSON de orquestração versionado** (hoje só em `/tmp`).
3. **Fase 2** da matriz: importador dry-run de proposições/votos +
   persistência de score por parlamentar (função pura pronta em
   `src/domain/impact/score.ts`; sem tabela/RPC de persistência ainda).
4. Aplicar migrations 2026081009xxxx **remotamente** (exige autorização;
   hoje 100% local).
5. Decisão `codex exec` (subprocesso) vs `codex mcp-server` (MCP stdio) como
   superfície de integração.

---

## 7. Para analisar as modificações

- Leia: `docs/metodologia-impacto-populacional-v1.md`,
  `docs/governanca-impacto-populacional.md`, `docs/contrato-json-votoemquem.md`,
  `docs/context-export/SCHEMA.md` (seção "Tabelas de impacto"),
  `schemas/*.schema.json`, `src/domain/impact/*`, `scripts/__tests__/impact-*.test.mjs`,
  `supabase/migrations/2026081009*.sql`.
- Valide localmente: `npm test`, `npx tsc --noEmit`, `npm run build`,
  `node scripts/validate-impact-schema.mjs` (checkpoint 4/4).
- Migrations locais requerem `npx supabase start` + `npx supabase db reset`
  para reproduzir o Postgres local (stack foi encerrado após a validação;
  dados preservados no volume docker).