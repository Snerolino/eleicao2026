# Resolução do Fail-Closed das Disposições ALRS Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Transformar toda versão ALRS ainda pendente em uma disposição editorial válida, auditável e registrada por uma sessão Supabase autenticada, sem permitir que recomendações automáticas publiquem impacto, matriz ou score.

**Architecture:** Manter os “caixas” paralelos somente na camada read-only de preparação/recomendação, com partições disjuntas de 25 `proposition_version`; consolidar os resultados por um contrato canônico único; e realizar cada lote por uma RPC transacional autenticada, com validação integral, read-back e idempotência. Disposições terminais encerram apenas a triagem; `assess` abre uma segunda fila para assessment completo, matriz `pending_review` e aprovação final via `approve_impact_matrix`.

**Tech Stack:** Node.js 24 ESM, React 19 + TypeScript, Vitest, Supabase Auth/PostgREST/PostgreSQL RPC/RLS, Vite, JSON canônico com SHA-256.

---

## 1. Contexto atual e premissas

- `main` está limpa e alinhada no SHA `532d1b2caedc6fa4a1e97642a898c19873a4bb19` no momento deste plano.
- O monitor registra `1.261` versões com `editorial_disposition=pending_review` em `data/legislative-import/alrs/impact-review-queue-v1.json`.
- `data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json` contém `1.199` versões não colidentes em `48` lotes de até 25. A diferença para `1.261` precisa ser reconciliada explicitamente; não deve ser assumida como resolvida.
- Os quatro workers atuais em `scripts/run-alrs-editorial-triage-worker.mjs` apenas particionam a fila e deixam `recommended_disposition=null`; eles não resolvem a disposição.
- `src/pages/AdminPage.tsx` já autentica por Supabase Auth, confirma `editor_roles`, registra disposições por RPC e aprova matrizes por `approve_impact_matrix`, mas a aplicação em lote está limitada a três pacotes importados estaticamente e possui validação duplicada no frontend.
- `scripts/apply-validated-editorial-batch.mjs` valida hash/IDs, mas deve passar a reutilizar o contrato editorial completo e `scripts/lib/editor-session.mjs`.
- `scripts/apply-alrs-editorial-matrices.mjs` usa `service_role`; ele não pode fazer parte do caminho final. A preparação/publicação de impacto deve migrar para Auth/RPC ou ser desativada explicitamente.
- Nenhuma recomendação automatizada equivale a aprovação humana. O agente pode preparar `recommended_disposition`, evidência, rationale sugerida e confiança; o ato válido precisa registrar o usuário autenticado.
- Migrations, RPCs e operações remotas só serão aplicadas depois do gate humano específico de schema/remote mutation.

## 2. Resultado esperado e invariantes

Ao final do arco:

1. Cada uma das `1.261` versões originais estará em exatamente um estado:
   - disposição autenticada `approved`;
   - exceção autenticada `needs_changes`;
   - bloqueio explícito de identidade/colisão/fonte, com motivo e próximo gate.
2. Nenhum ID aparecerá em mais de um worker ou lote ativo.
3. Cada lote terá `batch_id`, `batch_sha256`, conjunto exato de IDs e `review_key` congelados.
4. A RPC de lote será atômica: ou todas as disposições do lote são aceitas, ou nenhuma é escrita.
5. Toda linha remota preservará `reviewer_id`, lote/hash e rationale; conflito com uma decisão anterior divergente falhará fechado.
6. `no_direct_population_group`, `taxonomy_gap` e `excluded` não criarão matriz nem score.
7. `assess` criará apenas uma pendência de assessment; matriz só nascerá com todos os campos e fontes completos, inicialmente em `pending_review`.
8. `approve_impact_matrix` continuará sendo a única passagem para matriz aprovada, incluindo revisão externa quando `severity >= 4` ou `confidence < 0.60`.
9. `legislative_votes` continuará factual e sem campos de impacto.
10. O caminho de produção não utilizará `service_role` no frontend nem para contornar Auth/RLS.

---

### Task 1: Congelar e reconciliar o universo editorial

**Objective:** Explicar programaticamente a diferença `1.261 → 1.199` e gerar um baseline único antes de produzir novas decisões.

**Files:**
- Modify: `scripts/build-alrs-exclusive-editorial-lane.mjs:7-75`
- Modify: `scripts/reconcile-impact-resolved-versions.mjs`
- Create: `scripts/audit-alrs-editorial-universe.mjs`
- Create: `scripts/__tests__/audit-alrs-editorial-universe.test.mjs`
- Create/Update generated: `data/legislative-import/alrs/alrs-editorial-universe-audit-v1.json`

**Step 1: Write the failing test**

Criar fixture com versões pendentes normais, colidentes, já resolvidas remotamente, com matriz existente, alias canônico resolvido e fonte insuficiente. Exigir conjuntos disjuntos e a equação:

```js
expect(audit.input_pending).toBe(
  audit.ready_for_disposition
  + audit.blocked_collision
  + audit.blocked_source
  + audit.already_resolved
  + audit.other_blocked
);
expect(audit.duplicate_version_ids).toEqual([]);
expect(audit.unclassified_version_ids).toEqual([]);
```

**Step 2: Run test to verify failure**

Run: `npm run test -- scripts/__tests__/audit-alrs-editorial-universe.test.mjs`

Expected: FAIL — auditor ainda não existe.

**Step 3: Implement the minimal auditor**

O auditor deve consumir a fila local, o catálogo remoto reconciliado, o catálogo de matrizes e o audit de colisões. Deve emitir arrays de IDs, contagens, SHA-256 dos inputs e `remote_apply=false`, sem consultar/alterar o remoto por conta própria.

**Step 4: Make the exclusive builder consume the audit**

Selecionar somente `ready_for_disposition`; manter colisões em lane separada e proibir que itens excluídos reapareçam por alias/título.

**Step 5: Verify deterministic output**

Run twice:

```bash
node scripts/audit-alrs-editorial-universe.mjs --output=/tmp/audit-1.json
node scripts/audit-alrs-editorial-universe.mjs --output=/tmp/audit-2.json
cmp /tmp/audit-1.json /tmp/audit-2.json
```

Expected: `cmp` exit 0, somas fechadas, `unclassified=0`.

**Step 6: Commit when execution is authorized**

```bash
git add scripts/audit-alrs-editorial-universe.mjs scripts/build-alrs-exclusive-editorial-lane.mjs scripts/reconcile-impact-resolved-versions.mjs scripts/__tests__/audit-alrs-editorial-universe.test.mjs data/legislative-import/alrs/alrs-editorial-universe-audit-v1.json
git commit -m "feat: reconcilia universo editorial ALRS"
```

---

### Task 2: Extrair um contrato canônico único para lote e decisão

**Objective:** Eliminar divergência entre builder, reviewer, validador, CLI e `/admin`.

**Files:**
- Create: `scripts/lib/editorial-batch-contract.mjs`
- Create: `scripts/__tests__/editorial-batch-contract.test.mjs`
- Modify: `scripts/validate-editorial-batch-decisions.mjs:17-53`
- Modify: `scripts/review-editorial-batch.mjs:11-146`
- Modify: `scripts/apply-validated-editorial-batch.mjs:28-63`

**Step 1: Write failing contract tests**

Cobrir:

- hash canônico correto;
- `batch_id`/hash divergentes;
- cardinalidade exata;
- IDs desconhecidos, faltantes e duplicados;
- `review_key` divergente;
- disposição fora das quatro permitidas;
- rationale menor que 20 caracteres;
- `approved` sem disposição explícita;
- `needs_changes` sem notas;
- `assess` sem matrix/assessment completo;
- `source_gate != green` quando `assess`;
- procedimento tentando virar `assess`;
- grupo fora dos 14 canônicos;
- `positive|negative` sem `defending_vote=sim|nao`;
- severidade/confiança que exigem revisão externa.

**Step 2: Run test to verify failure**

Run: `npm run test -- scripts/__tests__/editorial-batch-contract.test.mjs`

Expected: FAIL — módulo não existe.

**Step 3: Implement pure functions**

Exportar funções sem I/O:

```js
export function canonicalBatchHash(batch) { /* SHA-256 de {batch_id,items} */ }
export function validateBatch(batch) { /* errors + normalized */ }
export function validateDecisionEnvelope(batch, envelope) { /* all-or-none */ }
export function requiresExternalReview(decision) { /* severity/confidence */ }
```

O contrato não deve preencher defaults editoriais nem aceitar decisão herdada de `recommended_disposition`.

**Step 4: Replace duplicated validation**

Os três scripts devem chamar o mesmo contrato. O relatório de erro deve conter `proposition_version_id`, código estável e campo afetado.

**Step 5: Run focused tests**

```bash
npm run test -- scripts/__tests__/editorial-batch-contract.test.mjs scripts/__tests__/editorial-reviewer.test.mjs scripts/__tests__/apply-validated-editorial-batch.test.mjs
```

Expected: todos PASS.

**Step 6: Commit when authorized**

```bash
git add scripts/lib/editorial-batch-contract.mjs scripts/validate-editorial-batch-decisions.mjs scripts/review-editorial-batch.mjs scripts/apply-validated-editorial-batch.mjs scripts/__tests__
git commit -m "refactor: unifica contrato de revisão editorial"
```

---

### Task 3: Congelar lotes canônicos de 25 casos

**Objective:** Produzir lotes reproduzíveis, completos e apropriados para processamento paralelo.

**Files:**
- Modify: `scripts/build-alrs-exclusive-editorial-lane.mjs:35-75`
- Create: `scripts/build-alrs-editorial-batches.mjs`
- Create: `scripts/__tests__/build-alrs-editorial-batches.test.mjs`
- Create generated directory: `data/legislative-import/alrs/editorial-batches/`
- Create generated: `data/legislative-import/alrs/editorial-batches/manifest-v1.json`

**Step 1: Write failing tests**

Exigir:

```js
expect(allIds.size).toBe(manifest.totals.ready_for_disposition);
expect(totalOccurrences).toBe(allIds.size);
expect(manifest.batches.every((b) => b.items <= 25)).toBe(true);
expect(manifest.remote_apply).toBe(false);
expect(manifest.public_approval).toBe(false);
```

Também executar o builder duas vezes e comparar bytes.

**Step 2: Run test to verify failure**

Run: `npm run test -- scripts/__tests__/build-alrs-editorial-batches.test.mjs`

Expected: FAIL — builder/manifest ausentes.

**Step 3: Implement stable batch generation**

Ordenar por `P0 → P1 → P2 → P3`, depois cobertura e `review_key`. Cada lote deve incluir fontes factual/substantiva separadas, source gates, título, evento, cobertura, recomendações apenas como pistas e campos editoriais vazios.

**Step 4: Compute stable identity**

```text
batch_id = alrs-editorial-<priority>-<ordinal>-<short input SHA>
batch_sha256 = sha256(JSON.stringify({batch_id,items}))
```

Não incluir timestamps no material hasheado.

**Step 5: Verify all files against manifest**

Run: `node scripts/build-alrs-editorial-batches.mjs --verify`

Expected: `missing=0`, `duplicates=0`, `hash_mismatch=0`, `remote_apply=false`.

**Step 6: Commit when authorized**

```bash
git add scripts/build-alrs-editorial-batches.mjs scripts/__tests__/build-alrs-editorial-batches.test.mjs data/legislative-import/alrs/editorial-batches
git commit -m "feat: congela lotes editoriais ALRS"
```

---

### Task 4: Transformar os quatro workers em caixas de recomendação auditável

**Objective:** Fazer cada worker analisar lotes inteiros disjuntos, sem aprovar nem escrever remotamente.

**Files:**
- Modify: `scripts/run-alrs-editorial-triage-worker.mjs:15-37`
- Modify: `scripts/no-stop-supervisor.mjs:32-114`
- Create: `scripts/__tests__/alrs-editorial-triage-workers.test.mjs`
- Runtime only: `.orchestrator/runtime/no-stop/alrs-editorial-workers/`

**Step 1: Write failing partition tests**

Os workers devem receber lotes inteiros por `batch_index % workers`, não itens soltos; a união precisa equivaler ao manifest e as interseções precisam ser vazias.

**Step 2: Run test to verify failure**

Run: `npm run test -- scripts/__tests__/alrs-editorial-triage-workers.test.mjs`

Expected: FAIL — implementação atual distribui itens por índice e não gera envelopes por lote.

**Step 3: Implement worker output**

Cada worker gera, por lote:

- evidência resumida e links oficiais;
- `recommended_disposition`;
- `recommended_rationale`;
- `recommendation_confidence`;
- `recommendation_basis`;
- `decision=null`;
- `human_review_required=true`;
- `remote_apply=false`;
- `public_approval=false`.

Keyword/título isolado nunca pode recomendar `assess` como conclusão forte; fonte substantiva deve ser lida/citada para isso.

**Step 4: Add resumable per-batch checkpoints**

Salvar atomicamente `pending`, `running`, `recommended`, `blocked_source`, `blocked_identity`; retomar o primeiro lote não concluído. Não usar o Git como checkpoint efêmero.

**Step 5: Verify four workers**

Run:

```bash
NO_STOP_FOCUS=alrs-editorial NO_STOP_WORKERS=4 npm run orch:no-stop
node scripts/build-alrs-editorial-batches.mjs --verify-workers=4
```

Expected: quatro outputs, união exata, zero sobreposição e nenhuma decisão aprovada.

**Step 6: Commit when authorized**

```bash
git add scripts/run-alrs-editorial-triage-worker.mjs scripts/no-stop-supervisor.mjs scripts/__tests__/alrs-editorial-triage-workers.test.mjs
git commit -m "feat: paraleliza recomendações editoriais ALRS"
```

---

### Task 5: Criar consolidador de recomendações e pacote de revisão humana

**Objective:** Converter saídas dos workers em um pacote único verificável, sem transformar recomendação em aprovação.

**Files:**
- Create: `scripts/consolidate-alrs-editorial-recommendations.mjs`
- Create: `scripts/__tests__/consolidate-alrs-editorial-recommendations.test.mjs`
- Create generated: `data/legislative-import/alrs/editorial-batches/recommendation-manifest-v1.json`

**Step 1: Write failing tests**

Rejeitar worker com source SHA divergente, batch duplicado, item faltante, ID desconhecido, `decision` preenchida, ou `remote_apply=true`.

**Step 2: Run test to verify failure**

Run: `npm run test -- scripts/__tests__/consolidate-alrs-editorial-recommendations.test.mjs`

Expected: FAIL — consolidador ausente.

**Step 3: Implement consolidation**

Emitir um envelope por lote com recomendações não vinculantes e campos humanos vazios:

```json
{
  "decision": null,
  "disposition": null,
  "rationale": null,
  "reviewer_type": null,
  "human_approval_recorded": false
}
```

**Step 4: Verify aggregate cardinality**

Run: `node scripts/consolidate-alrs-editorial-recommendations.mjs --verify`

Expected: exatamente todos os lotes ready; nenhum caso colidente/source-blocked misturado.

**Step 5: Commit when authorized**

```bash
git add scripts/consolidate-alrs-editorial-recommendations.mjs scripts/__tests__/consolidate-alrs-editorial-recommendations.test.mjs data/legislative-import/alrs/editorial-batches/recommendation-manifest-v1.json
git commit -m "feat: consolida recomendações editoriais ALRS"
```

---

### Task 6: Tornar `/admin` escalável para todos os lotes

**Objective:** Substituir imports hardcoded por um catálogo navegável de lotes e validar decisões com a mesma semântica do backend.

**Files:**
- Create: `src/domain/impact/editorialBatch.ts`
- Create: `src/components/admin/AlrsEditorialBatchReview.tsx`
- Create: `src/components/admin/__tests__/AlrsEditorialBatchReview.test.tsx`
- Modify: `src/pages/AdminPage.tsx:62-83,106-112,410-518,692-777`
- Modify: `src/pages/__tests__/AdminPage.test.tsx`
- Import generated: `data/legislative-import/alrs/editorial-batches/manifest-v1.json`

**Step 1: Write failing UI tests**

Cobrir login obrigatório, ausência de link público, lista de lotes, filtros por prioridade/estado, fontes visíveis, disposição obrigatória, rationale mínimo, confirmação explícita para `assess`, rejeição de hash/ID duplicado e remoção do item após read-back remoto.

**Step 2: Run test to verify failure**

```bash
npm run test -- src/components/admin/__tests__/AlrsEditorialBatchReview.test.tsx src/pages/__tests__/AdminPage.test.tsx
```

Expected: FAIL — componente/fluxo não existem.

**Step 3: Implement pure browser validation**

`src/domain/impact/editorialBatch.ts` deve validar o envelope sem inferir valores. No browser, recomputar SHA-256 com `crypto.subtle.digest` sobre o JSON canônico e rejeitar duplicatas/faltantes.

**Step 4: Implement batch navigation**

Mostrar:

- progresso total e por prioridade;
- lote atual, IDs e hash;
- evidência factual e substantiva em blocos distintos;
- recomendação claramente rotulada “não aprovada”;
- formulário humano para disposição/rationale;
- bloqueios e exceções separados;
- botão de aplicação apenas com envelope integralmente válido.

**Step 5: Keep remote state authoritative**

Após login e após cada apply, recarregar `impact_editorial_dispositions`; decisões remotas aprovadas devem sair da fila e `needs_changes` deve permanecer visível como exceção.

**Step 6: Run UI tests**

Expected: testes focados PASS; `/admin` continua acessível apenas por URL direta e Auth.

**Step 7: Commit when authorized**

```bash
git add src/domain/impact/editorialBatch.ts src/components/admin src/pages/AdminPage.tsx src/pages/__tests__/AdminPage.test.tsx
git commit -m "feat: escala revisão ALRS no painel admin"
```

---

### Task 7: Criar RPC transacional de lote com proveniência

**Objective:** Garantir aplicação autenticada all-or-none e impedir overwrite silencioso de decisão divergente.

**Files:**
- Create: `supabase/migrations/20260913193000_harden_alrs_editorial_batch_apply.sql`
- Create: `scripts/__tests__/alrs-editorial-batch-rpc-security.test.mjs`
- Update when schema changes: `docs/context-export/SCHEMA.md`
- Update when schema changes: `docs/context-export/CHANGELOG.md`

**Step 1: Write failing migration-security test**

Exigir no SQL:

- `auth.uid()`;
- `has_editor_role(auth.uid())`;
- `security definer` + `set search_path`;
- revoke de `PUBLIC`/`anon`;
- grant apenas para `authenticated`;
- rejeição de array vazio, IDs repetidos, disposição inválida, rationale curto e batch SHA inválido;
- transação única;
- conflito quando existe decisão aprovada com `review_key`/conteúdo divergente;
- retorno de `inserted`, `already_present`, `conflicts` e linhas afetadas.

**Step 2: Run test to verify failure**

Run: `npm run test -- scripts/__tests__/alrs-editorial-batch-rpc-security.test.mjs`

Expected: FAIL — migration ausente.

**Step 3: Author migration**

Adicionar colunas de proveniência nullable para legado (`batch_id`, `batch_sha256`) e criar `record_impact_editorial_batch(p_batch_id text, p_batch_sha256 text, p_items jsonb)`. A função deve validar todas as linhas antes de inserir qualquer uma e usar `reviewer_id=auth.uid()`.

**Step 4: Preserve old RPC for manual single-item review**

Endurecer `record_impact_editorial_disposition` para não sobrescrever uma decisão aprovada divergente sem um fluxo explícito de revisão. Não quebrar as decisões legadas já existentes.

**Step 5: Update curated schema docs**

Documentar assinatura, Auth, grants, RLS, proveniência e semântica idempotente.

**Step 6: Run static security tests**

Expected: PASS; nenhuma key/token/service-role em migration ou docs.

**Step 7: Human gate before remote apply**

Antes de `supabase db push`, executar `supabase migration list` e apresentar o diff da migration. A aplicação remota requer autorização explícita separada.

**Step 8: Commit when authorized**

```bash
git add supabase/migrations/20260913193000_harden_alrs_editorial_batch_apply.sql scripts/__tests__/alrs-editorial-batch-rpc-security.test.mjs docs/context-export/SCHEMA.md docs/context-export/CHANGELOG.md
git commit -m "feat: aplica disposições ALRS em transação autenticada"
```

---

### Task 8: Substituir o writer CLI por Auth/RPC reutilizável

**Objective:** Fazer dry-run e apply utilizarem o mesmo contrato, sessão renovável e RPC transacional.

**Files:**
- Modify: `scripts/apply-validated-editorial-batch.mjs:15-158`
- Reuse: `scripts/lib/editor-session.mjs`
- Modify: `scripts/__tests__/apply-validated-editorial-batch.test.mjs`
- Modify: `package.json`

**Step 1: Write failing tests**

Adicionar testes para:

- dry-run sem credenciais;
- apply sem sessão → `EDITOR_REAUTH_REQUIRED`;
- papel não editor → `EDITOR_ROLE_REQUIRED`;
- refresh persiste sessão com modo `0600`;
- apenas uma chamada da RPC por lote;
- falha RPC → `remote_apply=false` no resultado final e nenhuma alegação de sucesso;
- read-back exato de ID/key/disposição/rationale/lote/hash;
- segunda execução com `new_writes=0`.

**Step 2: Run to verify failure**

Run: `npm run test -- scripts/__tests__/apply-validated-editorial-batch.test.mjs scripts/__tests__/editor-session.test.mjs`

Expected: pelo menos os novos casos FAIL.

**Step 3: Implement authenticated path**

Remover autenticação duplicada e chamar `ensureEditorSession()`. Proibir `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_SECRET_KEY` neste writer. Aplicar somente via `record_impact_editorial_batch`.

**Step 4: Add commands**

```json
{
  "impact:editorial:validate": "node scripts/validate-editorial-batch-decisions.mjs",
  "impact:editorial:apply": "node scripts/apply-validated-editorial-batch.mjs"
}
```

**Step 5: Verify dry-run and mocked idempotency**

Expected: PASS, sem segredo nos artefatos e sem escrita no dry-run.

**Step 6: Commit when authorized**

```bash
git add scripts/apply-validated-editorial-batch.mjs scripts/__tests__/apply-validated-editorial-batch.test.mjs package.json
git commit -m "fix: exige Auth no apply editorial ALRS"
```

---

### Task 9: Integrar o `/admin` à RPC transacional

**Objective:** Evitar `Promise.all` de RPCs individuais e estados parcialmente aplicados.

**Files:**
- Modify: `src/pages/AdminPage.tsx:434-514`
- Modify: `src/components/admin/AlrsEditorialBatchReview.tsx`
- Modify: `src/pages/__tests__/AdminPage.test.tsx`
- Modify: `src/components/admin/__tests__/AlrsEditorialBatchReview.test.tsx`

**Step 1: Write failing tests**

Exigir uma chamada a `record_impact_editorial_batch`, nenhuma chamada por item, mensagem de sucesso somente após read-back exato e retenção integral do lote em caso de erro.

**Step 2: Run test to verify failure**

Expected: FAIL — implementação atual chama RPC por item.

**Step 3: Implement one-RPC apply**

Construir payload somente com valores explicitamente confirmados pelo usuário. Não usar `recommended_disposition` como fallback de apply.

**Step 4: Verify post-apply reload**

Após resposta, consultar as linhas por IDs em chunks conservadores, comparar todos os campos e recarregar a fila remota. Só então mostrar “lote aplicado”.

**Step 5: Run focused tests**

Expected: PASS, inclusive erro/timeout/read-back divergente.

**Step 6: Commit when authorized**

```bash
git add src/pages/AdminPage.tsx src/components/admin/AlrsEditorialBatchReview.tsx src/pages/__tests__/AdminPage.test.tsx src/components/admin/__tests__/AlrsEditorialBatchReview.test.tsx
git commit -m "fix: torna apply editorial atômico no admin"
```

---

### Task 10: Separar disposições terminais da fila `assess`

**Objective:** Encerrar corretamente casos terminais e abrir uma fila independente somente para matérias que realmente exigem assessment.

**Files:**
- Create: `scripts/build-alrs-assessment-queue-from-dispositions.mjs`
- Create: `scripts/__tests__/build-alrs-assessment-queue-from-dispositions.test.mjs`
- Modify: `scripts/build-alrs-assessment-auto-review-pack.mjs`
- Generated: `data/legislative-import/alrs/alrs-assessment-pending-v1.json`

**Step 1: Write failing tests**

Exigir que somente `disposition=assess AND status=approved` entre na fila; disposições terminais geram zero matriz; `needs_changes` não entra; fonte substantiva ausente mantém o item bloqueado.

**Step 2: Run test to verify failure**

Expected: FAIL — builder novo ausente.

**Step 3: Implement builder**

Cada item deve carregar source reference real, campos de assessment vazios e `human_review_required=true`. Não preencher direção, voto defensor, severidade, tipo estrutural, confiança ou rationale automaticamente.

**Step 4: Verify counts**

```bash
node scripts/build-alrs-assessment-queue-from-dispositions.mjs --remote-catalog=/tmp/dispositions.json
```

Expected: `terminal_dispositions + assess_pending + exceptions = authenticated_dispositions`.

**Step 5: Commit when authorized**

```bash
git add scripts/build-alrs-assessment-queue-from-dispositions.mjs scripts/build-alrs-assessment-auto-review-pack.mjs scripts/__tests__/build-alrs-assessment-queue-from-dispositions.test.mjs data/legislative-import/alrs/alrs-assessment-pending-v1.json
git commit -m "feat: deriva fila de assessment de disposições aprovadas"
```

---

### Task 11: Remover o service-role do caminho de matriz

**Objective:** Criar matrizes `pending_review` apenas por Auth/RPC e bloquear o writer legado.

**Files:**
- Replace/deprecate: `scripts/apply-alrs-editorial-matrices.mjs:1-17`
- Create: `supabase/migrations/20260913194000_create_authenticated_pending_impact_matrix_rpc.sql`
- Create: `scripts/prepare-alrs-impact-matrices-auth.mjs`
- Create: `scripts/__tests__/authenticated-pending-impact-matrix.test.mjs`
- Update: `docs/context-export/SCHEMA.md`
- Update: `docs/context-export/CHANGELOG.md`

**Step 1: Write failing tests**

Exigir que o writer rejeite service-role, aceite somente sessão editor/admin, valide disposição `assess` aprovada, campos completos, source refs reais, grupos canônicos e revisão externa quando aplicável.

**Step 2: Run to verify failure**

Expected: FAIL — caminho atual carrega `SUPABASE_SERVICE_ROLE_KEY`.

**Step 3: Create authenticated RPC**

A RPC deve criar/reutilizar idempotentemente matriz e assessments em `pending_review`, vincular fontes e nunca aprovar a matriz.

**Step 4: Convert legacy script into a hard fail or remove it from package scripts**

Mensagem esperada: “writer legado desativado; use Auth/RPC”. Não deixar fallback silencioso para service-role.

**Step 5: Verify planner first**

Run:

```bash
node scripts/plan-alrs-matrix-apply.mjs data/legislative-import/alrs/alrs-assessment-pending-v1.json --output=/tmp/matrix-plan.json
```

Expected: plano vazio enquanto houver assessment incompleto; nenhuma escrita remota.

**Step 6: Human gate before applying migration/remote writes**

Migration e criação de matrizes remotas requerem autorizações separadas.

**Step 7: Commit when authorized**

```bash
git add scripts/apply-alrs-editorial-matrices.mjs scripts/prepare-alrs-impact-matrices-auth.mjs supabase/migrations/20260913194000_create_authenticated_pending_impact_matrix_rpc.sql scripts/__tests__/authenticated-pending-impact-matrix.test.mjs docs/context-export
git commit -m "fix: remove service role do fluxo de matriz ALRS"
```

---

### Task 12: Validar aprovação final de matriz e fan-out

**Objective:** Publicar impacto somente após revisão interna/externa completa e recalcular perfis de forma idempotente.

**Files:**
- Modify if needed: `src/pages/AdminPage.tsx:338-407,618-690`
- Test: `src/pages/__tests__/AdminPage.test.tsx`
- Test: `scripts/__tests__/impact-approval-security.test.mjs` (create)
- Reuse: `supabase/migrations/20260822120000_harden_impact_approval_and_legislators_rls.sql`
- Reuse: `scripts/build-vote-profile-fast.mjs`

**Step 1: Write failing approval tests**

Cobrir matriz sem revisão interna, severity alta sem painel externo, confiança baixa sem painel externo, contestação bloqueante e usuário sem editor role.

**Step 2: Verify current SQL contract**

Run static tests against `approve_impact_matrix`; se o remoto divergir, parar no gate de migration, não contornar no frontend.

**Step 3: Verify `/admin` behavior**

Aprovação deve continuar chamando somente `approve_impact_matrix`; falha deve manter a matriz na fila e mostrar a causa sem alegar publicação.

**Step 4: After an authorized successful approval, read back**

Confirmar matriz `approved`, reviews exigidas, assessments/source links e fan-out somente para votos daquela `proposition_version`.

**Step 5: Prove profile idempotency**

Executar recálculo duas vezes e exigir zero delta na segunda. Reportar candidatos únicos, votos vinculados e perfis alterados separadamente.

**Step 6: Commit when authorized**

```bash
git add src/pages/AdminPage.tsx src/pages/__tests__/AdminPage.test.tsx scripts/__tests__/impact-approval-security.test.mjs
git commit -m "test: fecha gates de aprovação de impacto ALRS"
```

---

### Task 13: Integrar o supervisor sem violar o gate humano

**Objective:** Manter os quatro caixas produtivos e pausar corretamente na fronteira de aprovação.

**Files:**
- Modify: `scripts/no-stop-supervisor.mjs`
- Modify: `/home/lourenco/.hermes/profiles/eleicao2026/scripts/no-stop-supervisor.py` (perfil local, não versionado)
- Modify: `scripts/continuous-progress-monitor.mjs`
- Create: `scripts/__tests__/alrs-editorial-supervisor.test.mjs`

**Step 1: Write failing supervisor tests**

Exigir estados por lote: `queued`, `recommending`, `awaiting_authenticated_review`, `applied_disposition`, `awaiting_assessment`, `blocked`; nenhum retry automático de `awaiting_authenticated_review` como se fosse falha.

**Step 2: Run to verify failure**

Expected: FAIL — monitor atual não mede disposições aplicadas/pendentes por lote.

**Step 3: Implement progression**

O cron deve:

1. reconciliar remoto read-only;
2. regenerar fila;
3. executar quatro workers read-only;
4. consolidar recomendações;
5. expor lotes no `/admin`;
6. aguardar Auth sem tentar service-role;
7. retirar do backlog os itens confirmados por read-back;
8. avançar imediatamente para o próximo lote independente.

**Step 4: Extend monitor fingerprint and metrics**

Adicionar:

- `editorial_input_pending`;
- `ready_for_disposition`;
- `blocked_collision`;
- `blocked_source`;
- `authenticated_approved`;
- `authenticated_needs_changes`;
- `assess_pending`;
- `matrices_pending_review`;
- `matrices_approved`;
- `unclassified`.

**Step 5: Verify cron configuration**

`cronjob(action='list')` deve mostrar exatamente um supervisor, `every 5m`, `repeat=forever`, `no_agent=true`, workdir correto e lock exclusivo.

**Step 6: Commit when authorized**

```bash
git add scripts/no-stop-supervisor.mjs scripts/continuous-progress-monitor.mjs scripts/__tests__/alrs-editorial-supervisor.test.mjs
git commit -m "feat: acompanha disposições ALRS no supervisor"
```

---

### Task 14: Fazer rollout em ondas pequenas e reversíveis

**Objective:** Validar o caminho completo antes de aplicar centenas de decisões.

**Files:**
- Create per wave: `docs/qa/lote-alrs-disposicoes-<intervalo>-<YYYY-MM-DD>.md`
- Runtime reports: `/tmp/alrs-editorial-apply-*.json`

**Step 1: Wave 0 — dry-run de um lote**

Selecionar um lote P0/P1 de até 25, preencher decisões humanas no `/admin` ou envelope revisado, validar hash/IDs e executar dry-run. Esperado: zero erro, `remote_apply=false`.

**Step 2: Gate de migration/Auth**

Com autorização explícita, aplicar migrations, reautenticar em TTY com `npm run auth:editor:bootstrap` e confirmar papel `editor|admin`. Nunca registrar senha/token em logs.

**Step 3: Wave 1 — 5 disposições terminais**

Aplicar lote piloto contendo somente disposições terminais; read-back 5/5; segunda execução 0 writes; nenhuma matriz criada.

**Step 4: Wave 2 — 1 caso `assess` completo**

Registrar disposição `assess`, preencher assessment humano, criar matriz `pending_review`, aprovar via RPC apenas após reviews necessárias, fan-out e recálculo idempotente.

**Step 5: Wave 3 — lote completo de 25**

Aplicar uma transação integral. Se qualquer linha falhar, confirmar 0 novas linhas para o lote.

**Step 6: Scale to four concurrent read-only lanes**

Manter somente um writer autenticado por lote/worktree; os quatro workers continuam preparando lotes independentes. No banco, batches distintos podem ser aplicados concorrentemente apenas depois da prova transacional/idempotente e com limite bounded (máximo 4).

**Step 7: Continue until queue closure**

Após cada wave, reconciliar os números contra o baseline de `1.261`; nenhuma contagem pode desaparecer sem estado final explícito.

---

### Task 15: Executar gates locais, release e produção

**Objective:** Provar que a implementação e a publicação não regrediram o portal nem os contratos de dados.

**Files:**
- Create: `docs/qa/alrs-editorial-fail-closed-resolution-<YYYY-MM-DD>.md`
- Update checkpoint if real transition: `.orchestrator/STATE.md`

**Step 1: Run full local gates**

```bash
npm run test
npx tsc --noEmit
node scripts/validate-impact-schema.mjs
npm run data:check
npm run build
git diff --check
npm run smoke:local
```

Expected baseline: todos exit 0; candidatura/foto reportadas explicitamente; sem segredo nos artefatos.

**Step 2: Verify focused editorial invariants**

```bash
node scripts/audit-alrs-editorial-universe.mjs --strict
node scripts/build-alrs-editorial-batches.mjs --verify
node scripts/consolidate-alrs-editorial-recommendations.mjs --verify
```

Expected: `duplicates=0`, `missing=0`, `unclassified=0`, hashes exatos.

**Step 3: Review repository diff**

Confirmar que não entraram `.env*`, sessão Auth, HTML/PDF bruto, tokens, PII ou runtime files.

**Step 4: Commit/push only under the active authorization**

Usar commits Conventional Commits em português. Se a autorização do arco não cobrir push/deploy, parar após gates locais e pedir o gate específico.

**Step 5: Verify CI/deploy**

Confirmar GitHub run pelo `headSha`; usar o workflow backup Cloudflare se necessário.

**Step 6: Verify production**

```bash
curl -sS -o /dev/null -w 'root HTTP %{http_code}\n' https://rs.votopraquem.org/
curl -sS -o /dev/null -w 'admin HTTP %{http_code}\n' https://rs.votopraquem.org/admin
curl -sS https://rs.votopraquem.org/release.json
npm run smoke:preview -- --url https://rs.votopraquem.org/
```

Expected: HTTP 200, release SHA exato, smoke sem falhas HTTP/console.

**Step 7: Produce final evidence report**

Relatar separadamente:

- universo inicial;
- disposições autenticadas por tipo;
- exceções;
- bloqueios por causa;
- `assess` aguardando assessment;
- matrizes `pending_review` e aprovadas;
- votos cruzados;
- perfis alterados;
- zero writes na segunda execução.

---

## 3. Ordem operacional recomendada

1. Tasks 1–5: fila, contrato, batches e quatro caixas read-only.
2. Task 6: `/admin` escalável.
3. Tasks 7–9: migration/RPC e apply autenticado — parar no gate humano antes de mutação remota.
4. Tasks 10–12: separar assessment, remover service-role e fechar aprovação de matriz.
5. Task 13: integrar ao supervisor.
6. Task 14: rollout 5 → 1 assess → 25 → escala.
7. Task 15: gates, release e relatório.

## 4. Estratégia de agentes

- Um subagente por task, sempre read-only para inspeção/review quando a worktree viva tiver writer.
- Para cada task de código: implementação por um writer, revisão de conformidade por agente independente e revisão de qualidade após a conformidade.
- Quatro workers podem preparar recomendações simultaneamente porque escrevem somente em runtime separado; nenhum deles recebe autoridade de aprovação.
- Apenas o `/admin` ou CLI com Supabase Auth/editor role aplica disposições.
- Apenas `approve_impact_matrix` aprova impacto público.

## 5. Riscos e mitigação

- **Sobrescrita concorrente:** eliminar com RPC transacional, conflito explícito e proveniência de lote/hash.
- **Duplicatas entre workers:** partição por batch e auditor de união/interseção.
- **Hash estável mas sem contexto correto:** incluir SHA dos inputs e `review_key`; rejeitar qualquer drift.
- **Recomendação tratada como decisão:** campos de decisão permanecem `null` até ação humana autenticada.
- **Apply parcial:** uma RPC por lote, validação integral antes de writes.
- **Sessão expirada:** `ensureEditorSession` renova/persiste 0600 ou retorna `EDITOR_REAUTH_REQUIRED`.
- **Service-role contornando RLS:** remover writer legado do caminho e adicionar teste proibitivo.
- **Matriz vazia para disposição terminal:** builder de assessment aceita somente `assess` aprovado.
- **Score prematuro:** fan-out apenas após matriz aprovada e sources/reviews completos.
- **Colisões de versão/evento:** lane própria; nunca resolver por título, número/data ou fuzzy matching.
- **Fila local divergente do remoto:** reconciliação read-only antes de cada rebuild e após cada apply.
- **Grande volume no frontend:** carregar um lote de 25 por vez, não renderizar 1.199 cartões simultaneamente.
- **Mudança de schema sem contrato curado:** migration e `docs/context-export/` no mesmo commit.

## 6. Questões abertas que exigem decisão no gate de execução

1. Quem fará a aprovação humana em escala: apenas `admin@votopraquem.org` ou novos usuários `editor` também serão provisionados?
2. O usuário quer autorizar uma nova RPC/migration transacional ou prefere manter aplicação item a item, aceitando menor throughput e risco maior de parcialidade?
3. Para `taxonomy_gap`, o encerramento em v1 é terminal ou deve abrir automaticamente uma fila de evolução de taxonomia sem afetar score atual?
4. A primeira wave remota deve conter somente disposições terminais ou incluir um caso `assess` para validar o caminho completo até matriz?
5. Os casos de colisão serão trabalhados neste mesmo arco após as 1.199 versões não colidentes ou permanecerão em lane separada até nova fonte oficial?

## 7. Critério final de conclusão

O fail-closed estará resolvido — e não apenas contornado — quando o auditor fechar a equação dos `1.261` casos, toda versão resolvível possuir uma disposição explícita registrada por usuário `editor/admin`, todos os bloqueios restantes tiverem causa verificável, todos os `assess` seguirem para assessments completos e matrizes `pending_review`, e nenhuma informação de impacto estiver pública antes da aprovação final via RPC com read-back e prova de idempotência.
