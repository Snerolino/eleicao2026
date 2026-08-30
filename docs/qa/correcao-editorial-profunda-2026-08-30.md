# Relatório de Auditoria e Correção Editorial Profunda

**Data:** 2026-08-30  
**Status:** Concluído com Sucesso  
**Metodologia:** Versão 1.1.0 (Taxonomia Canônica de 21 Grupos + Atribuição Concreta por Evento)  
**Política Aplicada:** Fail-Closed estrito  

---

## 1. Resumo Executivo

Em resposta à auditoria profunda das revisões editoriais do projeto **Voto Pra Quem? / Eleições 2026**, foi implementada uma refatoração arquitetural e de dados para sanar as inconsistências identificadas no catálogo de proposições e na atribuição de votos parlamentares.

### Resultados Centrais:
1. **Schema Evoluído para Metodologia v1.1**:
   - Inclusão dos campos de atribuibilidade do voto em nível de evento: `textual_defending_vote`, `event_defending_vote`, `score_eligible`, `vote_attribution_status` e `score_withholding_reason`.
   - Suporte a `defending_vote: null` e alinhamento `nao_avaliavel` quando `score_eligible === false` ou em votações compostas não separáveis.
2. **Quarentena Canônica Aplicada**:
   - **234 matérias isoladas** em [`data/impact-matrices/quarentena-regressao-gabarito-2026-08-30.json`](../../data/impact-matrices/quarentena-regressao-gabarito-2026-08-30.json), sendo:
     - 231 registros ALRS com identidade placeholder (`number: 1, year: 2026`) e/ou taxonomia legada/temática;
     - 3 matérias da Câmara desvinculadas de pontuação direta (`MPV 1313/2025` por dependência de evento/taxonomia, `PL 2630/2020` por ser votação de urgência procedimental, e `PL 2110/2023` por divergência temática com o texto votado).
3. **Gabarito Universal Reconstruído**:
   - **69 proposições ativas e auditadas** em [`data/impact-matrices/gabarito-materias-aprovadas.json`](../../data/impact-matrices/gabarito-materias-aprovadas.json) (62 da ALRS e 7 da Câmara dos Deputados).
4. **Blindagem do Pipeline de Reconciliação**:
   - O script [`scripts/reconcile-all-alrs-and-federal-candidate-profiles.mjs`](../../scripts/reconcile-all-alrs-and-federal-candidate-profiles.mjs) foi reestruturado para nunca injetar dados sintéticos ou placeholders no gabarito e somente calcular pontuações populacionais a partir de matérias com `score_eligible: true`.
5. **Verificação Total**:
   - 115 suítes de testes executadas no Vitest com **485/485 testes passando (100%)**.
   - Build Vite + TypeScript + PWA + Sitemap validado sem erros.
   - Smoke test local via Playwright / preview headless aprovado com 100% de sucesso.

---

## 2. Decisões Editoriais e Arquiteturais Consolidadas

| Proposição | Casa | Grupo Canônico | Sentido Texto | Sentido Evento | Score Eligible | Severidade | Tipo | Decisão / Justificativa |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PLP 230/2025** | Câmara | `estudantes` | `sim` | `null` | `false` | 3 | budgetary | Voto no substitutivo global uniu banda larga em escolas a regras orçamentárias e benefícios a operadoras do FUST. NÃO no evento não autoriza inferir postura anti-estudante. |
| **PEC 6/2019** | Câmara | `trabalhadores_formais`, `servidores_publicos` | `null` | `null` | `false` | 5 | structural | Reforma da previdência (pacote macroconstitucional com regras de transição, idade mínima e alíquotas). Direção mista com score retido. Exige painel externo. |
| **PLP 41/2024** | Câmara | `mulheres`, `criancas_adolescentes_vulnerabilidade` | `sim` | `sim` | `true` | 4 | structural | Sistema nacional de enfrentamento à violência contra meninas e mulheres. Votação substantiva com voto SIM defensor unívoco. |
| **PL 490/2007** | Câmara | `povos_indigenas` | `nao` | `nao` | `true` | 5 | structural | Marco temporal com restrição a demarcações e usufruto exclusivo. Voto defensor da população indígena é NÃO. |
| **PL 3626/2023** | Câmara | `pessoas_com_ludopatia` | `null` | `null` | `false` | 4 | structural | Regulamentação de bets combinou abertura de mercado com salvaguardas protetivas. Pacote composto; score retido. |
| **MPV 1323/2025** | Câmara | `pescadores_artesanais_comunidades_pesqueiras` | `null` | `null` | `false` | 2 | structural | Destaque sobre validação do Seguro-Defeso. Debate sobre representação sindical vs integridade de cadastro; score retido. |
| **PL 4566/2021** | Câmara | `populacao_negra_periferica` | `sim` | `null` | `false` | 3 | structural | Injúria racial equiparada a racismo. Score retido até vinculação precisa do texto/versão exata votada em plenário. |
| **PL 98/2024** | ALRS | `mulheres` | `sim` | `sim` | `true` | 2 | structural | Rede Lilás e apoio psicossocial formalizados. Severidade corrigida de 4 para 2 (marco declaratório). |
| **PL 361/2025** | ALRS | `mulheres` | `sim` | `sim` | `true` | 3 | structural | Reserva mínima de 20% em contratos do RS para mulheres e vítimas de violência doméstica. Severidade corrigida de 4 para 3. |
| **PL 10/2022** | ALRS | `criancas_adolescentes_vulnerabilidade` | `sim` | `sim` | `true` | 4 | structural | Amparo a órfãos da Covid-19 no RS com suporte multidisciplinar. Severidade 4 mantida com gate de painel externo. |
| **PL 424/2024** | ALRS | `criancas_adolescentes_vulnerabilidade` | `sim` | `null` | `false` | 4 | structural | Patrulha especializada de proteção. Score retido até binding de versão final votada. |
| **PL 587/2023** | ALRS | `criancas_adolescentes_vulnerabilidade` | `sim` | `null` | `false` | 4 | structural | Salvaguardas a crianças em situação de risco. Score retido até binding de versão final votada. |
| **PL 347/2025** | ALRS | `servidores_publicos`, `estudantes` | `null` / `sim` | `null` | `false` | 3 | budgetary | Programa de Reconhecimento da Educação Gaúcha com bonificação pecuniária por metas e premiações a estudantes. Avaliação contextual; score retido. |

---

## 3. Arquivos Modificados e Criados

### Schema e Domínio:
- [`schemas/impact-matrix-v1.schema.json`](../../schemas/impact-matrix-v1.schema.json): ampliado com propriedades de evento (`textual_defending_vote`, `event_defending_vote`, `score_eligible`, `vote_attribution_status`, `score_withholding_reason`) e suporte a `defending_vote: null` para matérias não elegíveis a score.
- [`src/domain/impact/contract.ts`](../../src/domain/impact/contract.ts): catálogo expandido para os 21 grupos canônicos da taxonomia v1.1 e validação de defending vote flexibilizada sob fail-closed.
- [`src/domain/impact/alignment.ts`](../../src/domain/impact/alignment.ts): lógica pura de derivação de alinhamento com regra estrita de `nao_avaliavel` quando `score_eligible === false` ou `event_defending_vote === null`.
- [`src/domain/impact/vote-category-score.ts`](../../src/domain/impact/vote-category-score.ts): transporte dos atributos de evento para agregação de fatos por candidato.
- [`src/types/election.ts`](../../src/types/election.ts): interface `CandidateNominalVote` enriquecida com os campos de atribuibilidade.

### Banco de Dados / Migrations:
- [`supabase/migrations/20260830110000_evolve_impact_taxonomy_v1_1_and_event_attribution.sql`](../../supabase/migrations/20260830110000_evolve_impact_taxonomy_v1_1_and_event_attribution.sql): DDL PG14 compatível inserindo os 7 novos grupos, aliases históricos, novas colunas em `impact_assessments` e atualização da trigger `impact_assessment_defending_ok()`.

### Scripts e Gabarito:
- [`data/impact-matrices/gabarito-materias-aprovadas.json`](../../data/impact-matrices/gabarito-materias-aprovadas.json): base canônica purificada com 69 matérias aprovadas.
- [`data/impact-matrices/quarentena-regressao-gabarito-2026-08-30.json`](../../data/impact-matrices/quarentena-regressao-gabarito-2026-08-30.json): 234 matérias isoladas em quarentena.
- [`scripts/reconcile-all-alrs-and-federal-candidate-profiles.mjs`](../../scripts/reconcile-all-alrs-and-federal-candidate-profiles.mjs): corrigido para eliminar criação de placeholders e aplicar regra de score eligibility estrita.
- [`scripts/cross-house-similarity-matcher.mjs`](../../scripts/cross-house-similarity-matcher.mjs): atualizado com os 21 grupos canônicos e palavras-chave correspondentes.
- [`scripts/review-camara-editorial-batch.mjs`](../../scripts/review-camara-editorial-batch.mjs): atualizado para validar contra os 21 grupos.

### Testes e Documentação:
- [`scripts/__tests__/correcao-editorial-profunda-2026-08-30.test.mjs`](../../scripts/__tests__/correcao-editorial-profunda-2026-08-30.test.mjs): 17 novos testes cobrindo todas as regras de regressão, quarentena e decisões específicas.
- [`docs/context-export/SCHEMA.md`](../../docs/context-export/SCHEMA.md) e [`docs/context-export/GABARITO-MATERIAS.md`](../../docs/context-export/GABARITO-MATERIAS.md): contratos de integração multiagente atualizados.

---

## 4. Conclusão

Todas as etapas do plano de correção editorial e arquitetural profunda foram integralmente executadas, preservando rastreabilidade, integridade matemática, contratos de schema e a política fail-closed.
