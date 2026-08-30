# Propagação Auditável de Matérias Legislativas — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Implementar uma trilha verificável que mostre, por matéria, votos factuais, candidatos alcançados, candidatos efetivamente atualizados e scores propagados, sem confundir fato nominal com avaliação de impacto.

**Architecture:** Reutilizar a matriz canônica indexada por `proposition_version`, os eventos/votos factuais e os perfis públicos já materializados. Criar uma camada derivada de relatório/fan-out com chaves determinísticas `(proposition_version, candidate_id, group)` e saída auditável, sem duplicar matrizes por casa legislativa. A propagação continuará sendo local/dry-run por padrão; qualquer escrita remota seguirá os gates de identidade, FK, fonte, idempotência e revisão existentes.

**Tech Stack:** Vite + React + TypeScript, Node.js ESM scripts, Vitest, JSON versionado em `data/`, Supabase somente pelos fluxos autenticados já existentes.

---

## Baseline confirmado

- Snapshot público: `1003` candidatos.
- Candidatos com perfil legislativo/materialização pública: `86`.
- Votos nos perfis públicos: `111.201`, sendo `43.762` ALRS e `67.439` Câmara.
- Gabarito: `302` proposições aprovadas e `305` assessments.
- Fila R4 Câmara: `13` versões/eventos, `12` proposições únicas e `196` votos factuais referenciados.
- Matéria substantiva R4: PLP 41/2024, grupo `mulheres`, `defending_vote=sim`.
- Propagação observável no snapshot: score `mulheres` presente para `39` candidatos federais/senadores.
- Monitor editorial: `4.000` votos factuais e `1.261` itens pendentes; esses números não devem ser apresentados como total histórico sem o rótulo da camada correspondente.

## Critérios de aceite

1. Um relatório local informa separadamente:
   - votos factuais coletados/materializados;
   - versões/eventos e proposições únicas analisados;
   - candidatos com fatos nominais;
   - candidatos alcançados por uma matéria;
   - candidatos cujo score realmente mudou;
   - assessments aprovados e itens pendentes/bloqueados.
2. Uma matéria pode ser reexecutada sem duplicar fan-out nem alterar votos factuais.
3. PLP 41/2024 reproduz o baseline de `39` candidatos federais/senadores com score de `mulheres`, ou explica qualquer divergência com evidência.
4. O relatório distingue `candidate_id` de `legislator_id` e não inventa UUID/FK/source reference.
5. Testes unitários e de contrato cobrem zero votos, duplicatas, conflito factual, matéria procedimental e matéria substantiva.
6. `npm run test`, `npx tsc --noEmit`, `node scripts/validate-impact-schema.mjs`, `npm run data:check`, `npm run build` e `git diff --check` passam.

---

### Task 1: Inventariar contratos e pontos de fan-out

**Objective:** Mapear as estruturas existentes antes de criar uma nova saída.

**Files:**
- Read: `src/domain/impact/legislative-importer.ts`
- Read: `src/services/voteCategoryComparison.ts`
- Read: `src/services/candidates.ts`
- Read: `src/types/election.ts`
- Read: `data/impact-matrices/gabarito-materias-aprovadas.json`
- Read: `data/public-candidates.json`
- Test: `src/domain/impact/__tests__/` e `src/services/__tests__/`

**Steps:**
1. Identificar o tipo exato de proposição, versão, evento, voto, assessment e score.
2. Documentar onde o código calcula `evaluated_propositions`, `favorable_votes` e `unfavorable_votes`.
3. Confirmar se a fonte usada é `data/public-candidates.json`, Supabase ou mesclagem dos dois.
4. Registrar no handoff quais símbolos serão reutilizados e quais não devem ser duplicados.

**Verification:** Nenhum arquivo de produção alterado; inventário contém paths e símbolos concretos.

---

### Task 2: Criar contrato de métricas de propagação

**Objective:** Definir um schema pequeno e fail-closed para métricas por matéria.

**Files:**
- Create: `src/domain/impact/propagationMetrics.ts`
- Test: `src/domain/impact/__tests__/propagationMetrics.test.ts`
- Possibly modify: `src/types/election.ts` somente se um tipo público existente puder ser reutilizado sem duplicação

**Steps:**
1. Criar tipos para `PropagationMatterMetric`, `PropagationCandidateMetric` e resumo agregado.
2. Exigir `proposition_version_id` ou `version_key`, fonte/estado da matéria e status editorial explícito.
3. Separar `factual_vote_count`, `candidate_occurrence_count`, `unique_candidate_count` e `updated_candidate_count`.
4. Representar `blocked_count`, `pending_review_count` e motivo de não pontuação.
5. Rejeitar métricas com IDs vazios, score sem assessment aprovado ou fonte ausente.

**TDD:** Escrever testes para contrato válido, matéria procedimental, matéria sem fonte e duplicata determinística; executar o teste direcionado esperando falha antes da implementação.

---

### Task 3: Implementar agregador determinístico de fan-out

**Objective:** Calcular o alcance e a atualização efetiva de uma matéria sem escrever no banco.

**Files:**
- Create: `src/domain/impact/computePropagationMetrics.ts`
- Test: `src/domain/impact/__tests__/computePropagationMetrics.test.ts`
- Reuse/read: `src/domain/impact/legislative-importer.ts`, `src/services/voteCategoryComparison.ts`

**Steps:**
1. Indexar votos pela versão/evento e por candidato estável.
2. Deduplicar ocorrências pela chave canônica definida pelo domínio, sem fuzzy matching.
3. Separar candidatos alcançados de candidatos com voto resolvido e de candidatos com score atualizado.
4. Aplicar apenas assessments aprovados e com `defending_vote` explícito.
5. Excluir `procedural_only`, `no_direct_population_group`, `taxonomy_gap`, `sem_dado` e `nao_avaliavel` do score, preservando-os no relatório.
6. Garantir que a mesma entrada reexecutada produza o mesmo JSON e nenhuma contagem duplicada.

**TDD:** Cobrir PLP 41 como matéria substantiva, evento procedimental, conflito factual e candidato sem identidade resolvida.

**Verification:** O teste de PLP 41 deve reproduzir o alcance esperado sem executar Supabase ou Cloudflare.

---

### Task 4: Criar CLI de relatório local

**Objective:** Expor os números solicitados em JSON e Markdown auditáveis.

**Files:**
- Create: `scripts/report-propagation-metrics.mjs`
- Test: `scripts/__tests__/report-propagation-metrics.test.mjs`
- Modify only if necessary: `package.json`

**Steps:**
1. Aceitar `--matter <version_key|proposition_id>` e `--all`.
2. Aceitar fontes explicitamente por argumento; não ler `.env` nem segredos.
3. Emitir campos separados para total histórico, lote editorial e propagação da matéria.
4. Emitir `source_urls`, hashes/identificadores disponíveis e status `approved|pending_review|blocked`.
5. Retornar código diferente de zero para fonte/contrato inválido, sem transformar ausência de dados em zero válido.
6. Gerar saída determinística adequada para o monitor de mudança.

**Verification:**
```bash
node scripts/report-propagation-metrics.mjs --matter event-2606313-36 --json
node scripts/report-propagation-metrics.mjs --all --json
```
Esperado para PLP 41: uma matéria substantiva, grupo `mulheres`, `defending_vote=sim` e alcance compatível com o snapshot atual.

---

### Task 5: Integrar o relatório ao QA e ao checkpoint

**Objective:** Tornar a situação operacional legível sem misturar números de camadas diferentes.

**Files:**
- Create: `docs/qa/lote-propagacao-metricas-YYYY-MM-DD.md`
- Modify: `.orchestrator/STATE.md`
- Possibly modify: `scripts/continuous-progress-monitor.mjs` somente para incluir um resumo estável e barato

**Steps:**
1. Registrar baseline: `111.201` votos públicos, `86` candidatos com perfil, `302` matérias aprovadas, `305` assessments e fila R4 `13/12/196`.
2. Registrar PLP 41 separadamente: uma matéria substantiva e `39` candidatos federais/senadores com score de `mulheres` no snapshot.
3. Informar claramente que `4.000` é a fila editorial monitorada, não o total histórico.
4. Registrar gaps de fontes e bloqueios sem promover itens fail-closed.
5. Atualizar o próximo chunk no STATE sem declarar publicação remota não verificada.

**Verification:** QA deve permitir reproduzir cada número por comando ou arquivo de origem.

---

### Task 6: Executar gates locais e revisão de consistência

**Objective:** Validar o relatório e impedir regressões no frontend/dados.

**Files:**
- All files changed by Tasks 2–5

**Steps:**
1. Executar testes direcionados.
2. Executar a suíte completa.
3. Executar typecheck, schema, `data:check`, build e `git diff --check`.
4. Reexecutar o CLI duas vezes e comparar hashes/saídas.
5. Conferir que nenhum arquivo `.env*`, bruto, PII, token ou UUID inventado foi criado.
6. Revisar `git status --short` e confirmar somente arquivos intencionais.

**Commands:**
```bash
npm run test
npx tsc --noEmit
node scripts/validate-impact-schema.mjs
npm run data:check
npm run build
git diff --check
git status --short
```

**Expected:** Todos os gates retornam código `0`; qualquer divergência de contagem é investigada, não mascarada.

---

## Riscos, trade-offs e questões abertas

- O snapshot público e a materialização remota podem estar em momentos diferentes; o relatório deve exibir a camada e a data de cada número.
- “Candidato atualizado” precisa significar mudança efetiva de score, não apenas presença em uma matéria ou ocorrência de voto.
- A categoria `mulheres` já aparece para `83` candidatos no snapshot geral, mas apenas `39` entre federais/senadores; o relatório deve manter esses universos separados.
- A fila R4 possui `13` versões e `12` proposições únicas; não somar os dois como se fossem matérias distintas.
- Aplicação remota, RPC editorial, migration, commit/push e deploy não fazem parte deste plano local sem os gates e autorização correspondentes.
- Se o baseline de PLP 41 não puder ser reproduzido pelo novo agregador, interromper a publicação do relatório e abrir reconciliação read-only com evidência, sem ajustar números manualmente.
