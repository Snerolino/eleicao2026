# Índice visual de fases e passos — Matriz de Impacto Populacional

**Projeto:** Portal Transparência Eleitoral RS
**Data do checkpoint:** 21 de agosto de 2026
**Unidade editorial:** uma matriz por versão de proposição legislativa
**Fonte de verdade:** Git atual, contratos versionados, fontes oficiais e gates locais

---

## 1. Visão geral do processo

```text
R0 Contrato e segurança
   ↓
R1 Fontes oficiais e identidade
   ↓
R2 Fatos legislativos nominais
   ↓
R3 Perfis e comparação factual
   ↓
R4 Matriz editorial por versão
   ↓
R5 Aplicação segura e publicação
   ↓
Operação contínua, auditoria e expansão
```

### Estado resumido

```text
IMPLEMENTADO                         PENDENTE
──────────────────────────────────   ──────────────────────────────────
R0 contrato/schema                   revisão humana dos assessments
R1 identidade/fontes                 fontes substantivas dos 18 P1
R2 fatos ALRS/Câmara/Senado           renovação/preservação dos PDFs P0
R3 perfis/comparação                  plano com zero erros
release técnica                      aplicação remota autorizada
produção HTTP 200                    score editorial público
```

---

## 2. Linha do tempo desde o início

### Fase 0 — Fundação, contrato e segurança

**Objetivo:** definir os contratos de dados, separação de responsabilidades e proteção contra escrita indevida.

Passos concluídos:

- schema e contratos de impacto versionados;
- unidade de trabalho definida como `proposition_version`;
- separação entre fato nominal, fonte factual e impacto editorial;
- `pending_review`, `human_review_required` e `remote_apply=false` incorporados;
- writer fail-closed criado;
- aplicação remota separada em gates;
- nenhuma credencial ou segredo incluído em artefatos públicos.

**Saída:** infraestrutura segura para coletar e revisar sem publicar impacto automaticamente.

**Status:** ✅ concluída.

---

### Fase 1 — Fontes oficiais, identidade e reconciliação

**Objetivo:** provar a identidade de proposições, versões, eventos, candidatos e fontes.

Passos concluídos:

- fontes oficiais ALRS de votação identificadas;
- URLs, HTTP, bytes e SHA registrados nos envelopes factuais;
- `source_reference_id` preservado nos votos;
- identidades P0/P1 vinculadas por tipo, número, ano, matéria e evento;
- matching P1 fechado: 19 identidades únicas, 1 múltipla, 0 sem correspondência;
- 6 colisões confirmadas como proposições distintas;
- 12 grupos de colisão permanecem bloqueados;
- 110 títulos genéricos/truncados permanecem bloqueados;
- 4 votos residuais FED-17/Enio permanecem sem ID oficial exato.

**Regra:** sem fuzzy matching, UUID inventado ou vínculo aproximado.

**Status:** 🟡 operacional, com resíduos fail-closed.

---

### Fase 2 — Fatos legislativos nominais

**Objetivo:** materializar somente o fato verificável de votação.

Passos concluídos:

- ALRS: aproximadamente 4.000 votos auditados;
- ALRS: 3.996 votos com fonte oficial no último fechamento;
- Câmara: lotes Q1/Q2/Q3 coletados e auditados;
- Senado: envelope histórico preservado, sem nova aplicação quando SHA divergiu;
- votos individuais separados de placares simbólicos;
- procedimentos, preferência e emendas não tratados como mérito;
- fonte factual e fonte substantiva separadas.

**Estado atual do recorte ALRS P0/P1:**

```text
30 P0 classificados:
9 mérito
19 procedimento
2 emenda

20 P1 classificados:
18 mérito
1 procedimento/emenda
1 múltiplo bloqueado
```

**Status:** ✅ fatos principais operacionais; resíduos externos continuam bloqueados.

---

### Fase 3 — Perfis nominais e comparação factual

**Objetivo:** permitir comparação descritiva sem transformar voto factual em julgamento político.

Passos concluídos:

- perfis por candidato e casa legislativa;
- votos nominais separados por `sim`, `nao`, ausência e demais estados;
- `nominal_balance` tratado como estatística, não avaliação;
- comparação categorial sem score político, alinhamento ou recomendação;
- fallback explícito quando a cobertura de assessments é insuficiente;
- UI de comparação e metodologia atualizadas;
- produção validada.

**Status:** ✅ concluída no escopo implementado.

---

### Fase 4 — Fila substantiva e priorização editorial

**Objetivo:** selecionar o que pode entrar na matriz, sem ainda aprovar impacto.

Passos concluídos:

- fila completa: 1.281 versões no snapshot analisado;
- fila substantiva: 462 versões / 1.398 votos;
- P0/P1 priorizados por identidade, mérito e cobertura;
- procedimentos e emendas retirados da trilha de score;
- pacote de mérito confirmado fechado:

```text
23 versões
139 votos
5 P0
18 P1
```

- 8 versões possuem grupos candidatos;
- 9 drafts de assessment foram gerados;
- 15 versões ainda exigem decisão explícita de aplicabilidade a grupos.

**Correção importante:** os valores automáticos de propostas foram removidos. O proposal pack agora é somente formulário de revisão humana.

**Status:** ✅ fila consolidada; revisão editorial pendente.

---

### Fase 5 — Fontes substantivas

**Objetivo:** provar o conteúdo e o efeito da proposição, além de provar a votação.

#### P0

Concluído para cinco versões:

```text
5/5 páginas oficiais de proposição HTTP 200
5/5 PDFs/Documentos NoPaper HTTP 200
bytes e SHA registrados
substantive_source_gate=green
```

P0 cobertos:

- PEC 302/2025;
- PL 98/2024;
- PL 432/2023;
- PL 125/2021;
- PL 172/2026.

**Ressalva:** URLs assinadas expiraram; antes de persistência final, é necessário renovar a URL ou preservar cópia content-addressed com o mesmo SHA.

#### P1

Ainda pendentes seis versões únicas, em sete pares versão–grupo:

- PL 10/2022;
- PL 137/2023 — grupo `mulheres`;
- PL 137/2023 — grupo `populacao_negra_periferica`;
- PL 66/2024;
- PL 328/2024;
- PL 424/2024;
- PL 361/2025.

O pacote de pedidos correto é:

```text
data/legislative-import/alrs/substantive-source-request-pack-v1.json
7 requisições
6 versões
```

As fontes factuais dos votos já existem e agora são preservadas corretamente via:

```text
source_urls
candidate_source_links
official_vote_source_reference_ids
```

**Status:** 🟡 P0 verde com ressalva; P1 pendente.

---

### Fase 6 — Assessments editoriais

**Objetivo:** decidir, por versão e grupo, se há impacto populacional justificável.

Cada assessment precisa conter:

```text
group_slug
impact_direction
defending_vote
severity
structural_type
confidence
rationale
fonte substantiva
revisão humana
```

Estado atual:

```text
9 drafts de assessment
9 propostas-formulário
valores decisórios automáticos: removidos
assessments aprovados ALRS: 0
```

**Regra:** grupo sem aplicabilidade também precisa de decisão explícita e justificada; ausência de grupo não pode ser convertida em score zero.

**Status:** ⏳ aguardando revisão humana.

---

### Fase 7 — Apply plan e aplicação remota segura

**Objetivo:** aplicar somente matrizes completas, aprovadas e auditáveis.

O plano atual está ancorado no pacote corrente de 23 versões e registra:

```text
ok=false
planned_versions=23
plan_entries=0
remote_apply=false
```

Bloqueios atuais:

- gates globais de aprovação;
- 18 P1 sem fonte substantiva;
- 23 `editorial_status` não aprovados;
- 23 assessments vazios.

**Nenhuma escrita editorial remota foi feita.**

Gates necessários para liberar:

1. fonte substantiva durável;
2. assessment completo;
3. revisão humana registrada;
4. `editorial_status=approved`;
5. `public_approval=true`;
6. plano corrente com hash do pacote;
7. zero erros;
8. dry-run idempotente;
9. autorização separada para escrita Supabase;
10. SELECT/REST pós-escrita comprovando o resultado.

**Status:** 🔴 bloqueada corretamente.

---

### Fase 8 — Publicação editorial e score

**Objetivo:** tornar pública somente a matriz aprovada e seus scores derivados.

Ainda não executado para ALRS:

- criação de assessments aprovados;
- criação de matrizes aprovadas;
- RPC/publicação editorial;
- score populacional público ALRS;
- ranking ou recomendação baseada nessa matriz.

A release técnica do site é independente e está saudável:

```text
produção: HTTP 200
snapshot público: 1.003 candidaturas
últimos gates locais: 98 arquivos / 400 testes
```

**Status:** ⏳ aguardando Fases 6 e 7.

---

## 3. Próximos passos até o final

### Próximo lote imediato — P1 substantivo

1. Consultar as seis páginas canônicas:

```text
https://ww4.al.rs.gov.br/proposicao/PL/10/2022
https://ww4.al.rs.gov.br/proposicao/PL/137/2023
https://ww4.al.rs.gov.br/proposicao/PL/66/2024
https://ww4.al.rs.gov.br/proposicao/PL/328/2024
https://ww4.al.rs.gov.br/proposicao/PL/424/2024
https://ww4.al.rs.gov.br/proposicao/PL/361/2025
```

2. Extrair página oficial, texto integral, parecer/substitutivo, tramitação e PDF NoPaper.
3. Renovar ou preservar os PDFs com bytes/SHA verificável.
4. Criar `p1-substantive-source-manifest.json`.
5. Gerar pacote P1 com `substantive_source_gate` por versão.
6. Remover da fila qualquer P1 que passe o gate.
7. Manter os sete pares versão–grupo separados.

### Revisão humana P0

8. Apresentar os cinco P0 em formulário nulo.
9. Decidir aplicabilidade de grupo para todos os cinco:
   - PL 98/2024;
   - PL 125/2021;
   - PEC 302/2025;
   - PL 432/2023;
   - PL 172/2026.
10. Preencher apenas após revisão: direção, voto defensor, severidade, tipo, confiança e rationale.
11. Registrar fonte substantiva específica em cada assessment.
12. Manter `pending_review` até a confirmação editorial.

### Revisão humana P1

13. Repetir o mesmo fluxo para os 18 P1.
14. Revisar primeiro os seis P1 com pedidos de fonte.
15. Triar os 12 P1 restantes, inclusive os sem grupo candidato.
16. Registrar decisão explícita de aplicabilidade mesmo quando o resultado for “sem grupo”.

### Reconciliações paralelas

17. Resolver a durabilidade dos cinco PDFs P0.
18. Reconciliar as contagens de colisão 64/65.
19. Resolver os 110 títulos inadequados antes da reentrada na fila.
20. Manter PL 361/2025 bloqueado até título completo e texto oficial.
21. Repetir FED-17 somente com relógio/JWT estável; não aplicar os quatro residuais sem fonte exata.
22. Manter Senado bloqueado enquanto 0/6 SHA coincidirem.
23. Reconciliar IDs Câmara descobertos antes de qualquer FK/voto.

### Apply local

24. Escolher um pacote explícito: P0, P0/P1 ou 23 confirmados.
25. Gerar hash do pacote e do plano.
26. Executar validador factual e substantivo.
27. Executar `impact:dryrun`.
28. Executar `impact:sql` sem credenciais no artefato.
29. Verificar que não há `null` em fonte obrigatória.
30. Exigir `plan=[]` enquanto qualquer gate estiver vermelho.

### Aplicação Supabase autorizada

31. Aplicar primeiro apenas `source_references`, se houver fontes novas e duráveis.
32. Reconsultar os UUIDs reais retornados pelo Supabase.
33. Aplicar fatos legislativos em gate separado, se houver dados novos.
34. Criar matrizes apenas como `pending_review` quando o contrato permitir.
35. Publicar somente após RPC/gate humano separado.
36. Reexecutar o writer para provar idempotência: segunda execução com zero inserts/updates.
37. Validar por SELECT/REST os registros aplicados.

### Publicação final

38. Recalcular perfis e comparação categorial.
39. Verificar que assessments não aprovados não entram no score.
40. Verificar fallback de cobertura insuficiente.
41. Atualizar metodologia e QA.
42. Rodar testes, TypeScript, data-check, build e smoke.
43. Commit/push autorizado.
44. CI/deploy.
45. Smoke HTTP 200 e `release.json`.
46. Registrar snapshot, pacote, hash, plano, CI e produção.

---

## 4. Critério objetivo de conclusão

A Matriz de Impacto Populacional ALRS estará concluída quando:

```text
[ ] 23/23 versões com decisão editorial de aplicabilidade
[ ] 23/23 com título e identidade oficiais completos
[ ] 23/23 com fonte substantiva durável ou bloqueio explicitamente documentado
[ ] 0 valores preenchidos por palavra-chave/template
[ ] 0 colisões aplicáveis sem resolução
[ ] 0 assessments aprovados sem fonte
[ ] assessments completos e revisados
[ ] matrizes aprovadas por versão
[ ] plano corrente com hash exato
[ ] apply plan ok=true e errors=0
[ ] aplicação idempotente verificada
[ ] perfis recalculados
[ ] score público somente para cobertura aprovada
[ ] comparação com fallback correto
[ ] CI verde
[ ] deploy verde
[ ] produção HTTP 200
[ ] documentação e STATE atualizados
```

Até todos os itens acima serem verdadeiros, o estado correto é:

```text
release técnica: publicada e saudável
matriz editorial ALRS: não publicada
score ALRS: bloqueado
remote_apply: false
public_approval: false
```

---

## 5. Referências operacionais principais

- `data/legislative-import/alrs/confirmed-merit-review-pack-v1.json`
- `data/legislative-import/alrs/p0-substantive-matrix-review-pack-v1.json`
- `data/legislative-import/alrs/p0-substantive-source-manifest.json`
- `data/legislative-import/alrs/substantive-source-request-pack-v1.json`
- `data/legislative-import/alrs/impact-matrix-apply-plan.json`
- `scripts/build-confirmed-alrs-merit-review-pack.mjs`
- `scripts/build-alrs-substantive-source-request-pack.mjs`
- `scripts/validate-alrs-substantive-sources.mjs`
- `scripts/plan-alrs-matrix-apply.mjs`
- `docs/qa/lote-alrs-current-package-regeneration-2026-08-21.md`
- `docs/qa/lote-alrs-substantive-source-requests-2026-08-21.md`
- `docs/qa/lote-alrs-p0-substantive-sources-2026-08-21.md`
- `.orchestrator/STATE.md`
