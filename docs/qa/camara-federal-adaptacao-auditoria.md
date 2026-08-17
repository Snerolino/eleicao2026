# Auditoria FED-0 — Câmara dos Deputados e candidatos federais RS

**Data:** 2026-08-17
**Task packet de origem:** `../dataset2026/hermes-task-deputados-federais-comparacao-v1.md`
**Planejamento de origem:** `../dataset2026/planejamento_perfil_votacao_dep_fed.md`
**Escopo desta entrega:** auditoria local/read-only e documentação. Nenhuma escrita remota foi feita.

## Resultado executivo

A nova instrução do `dataset2026` é válida e muda o próximo arco do projeto para a
Câmara dos Deputados. Ela não pede simplesmente “importar votos de 434 candidatos”:
primeiro exige separar histórico federal, identidade institucional, casa legislativa,
voto factual e avaliação de impacto.

A implementação atual está **antes de FED-1**, na fase **FED-0 — auditoria/read-only**.
Com a auditoria desta sessão, FED-0 fica **concluída como diagnóstico**: os riscos
foram confirmados, o estado remoto foi reconsultado, as rotas oficiais foram
testadas e o piloto foi delimitado. A execução de FED-1 continua fora desta fase.

## Estado Git verificado

- Branch: `main`.
- HEAD: `b2c7eec` — `docs: preparar handoff do plano de implementacao`.
- Worktree: limpa e alinhada a `origin/main` no início da auditoria.
- Nenhuma alteração remota, migration, deploy, commit adicional ou publicação foi
  executada nesta auditoria.

## Números confirmados

- Snapshot público versionado: **1.003 candidaturas**.
- Candidatos a `deputado_federal`: **434**.
- O número de 434 é o universo eleitoral de 2026; **não é** o número de pessoas
  com histórico federal identificável.
- O primeiro pacote factual da Câmara já versionado é o PLP 230/2025, votação
  `2580259-24`, com Marcel van Hattem como regressão do pipeline.
- Estado remoto reconsultado em leitura: 1.003 candidatos, 1.264 proposições,
  1.264 versões, 1.347 eventos, 3.936 votos, 3.481 itens de índice e 14 perfis.
- Recorte Câmara remoto: **3 eventos, 3 votos, 1 perfil e 1 candidato com voto**.
- Recorte por casa: eventos `camara=3`, `alrs=1.156`, `senado=188`;
  perfis `camara=1`, `alrs=13`, `senado=0`.

## Auditoria do código atual

### Reaproveitável

- `src/domain/impact/` mantém o contrato factual separado da Matriz de Impacto.
- `scripts/import-legislative-dry-run.mjs` e
  `scripts/build-legislative-source-catalog.mjs` suportam dry-run, referências
  oficiais e SQL revisável.
- O pacote `data/legislative-import/camara/plp-230-2025-*` fornece fixture/regressão.
- O modelo factual mantém a cadeia proposição → versão → evento → voto → fonte.
- O fluxo de matriz começa em `pending_review`, sem aprovação automática.

### Bloqueios encontrados para FED-1

1. `scripts/build-vote-profile.mjs` agrega em `profileMap[candidate_id]` e atribui
   `p.house = house`. Um candidato com ALRS e Câmara pode ter uma casa sobrescrita.
2. O mesmo script calcula `profile_score = (sim - nao) / total`. Isso é saldo
   nominal descritivo, não score de impacto e não pode ser apresentado como
   posição política.
3. `src/services/candidates.ts` consulta
   `legislator_vote_profile` por `candidate_id` com `maybeSingle()`. O contrato
   novo exige lista de perfis e seleção por `(candidate_id, house)`.
4. `src/pages/CandidateDossierPage.tsx` mostra texto e URL hardcoded da ALRS.
   A fonte precisa ser metadado da casa (`camara`, `alrs`, etc.).
5. `src/types/election.ts` aceita apenas `voting_profile?: VotingProfile | null`,
   não `voting_profiles[]`.
6. O schema local já possui `house` e unique `(candidate_id, house)`, mas isso
   sozinho não resolve o agregador, o fetch nem a UI.

### Limites de dados ainda não resolvidos

- A lista oficial `GET /api/v2/deputados` retornou **513 registros** em seis páginas
  de até 100 itens.
- Cruzamento conservador por nome civil/nome parlamentar, sem fuzzy matching:
  **23 correspondências exatas RS ↔ candidato TSE** e **411 identidades pendentes**.
  As 23 correspondências têm `siglaUf=RS` e `idLegislatura=57`; são evidência de
  vínculo federal atual, não uma contagem definitiva de todo histórico.
- Não foi atribuído `no_federal_mandate_identified` aos 411 restantes. Eles ficam
  `identity_pending` até conferência individual, mudança de nome ou fonte oficial.
- A rota oficial de histórico `GET /api/v2/deputados/{id}/historico` respondeu
  HTTP 200 para o piloto. A documentação oficial informa cobertura de deputados
  históricos, legislaturas, proposições, votações e votos anuais.
- A página institucional de votações nominais de Sanderson respondeu HTTP 200 e
  expôs registros explícitos com sessão, proposição, voto e presença.
- A tentativa de consulta ampla `GET /api/v2/votacoes` com intervalo de datas
  retornou HTTP 400; o coletor não deve assumir parâmetros até fechar o contrato
  correto. O caminho estável para lote deve ser a API documentada ou os arquivos
  anuais oficiais `votacoesVotos/{formato}/votacoesVotos-{ano}.{formato}`.

## Fases do projeto

### Feitas / fechadas

- **Fases 0–1 da Matriz de Impacto:** contrato, taxonomia, matriz, workflow,
  fontes, testes e regras de revisão humana.
- **Fase 2 da Matriz de Impacto:** importer dry-run, gerador SQL, resolução de FKs,
  migrations/grants documentados, primeiro pacote Câmara e primeira matriz real
  aprovada/publicada.
- **Base pública TSE:** snapshot, rotas por slug, fotos/fontes e filtros de cargo.
- **Fase 3 — parte estrutural:** tabelas `candidate_profiles` e
  `election_results`; importação local/remota de bens e redes como claims
  `pending_review`.
- **ALRS factual — parte de carga:** coleta sequencial, parser, fontes,
  idempotência, votos nominais e perfis materializados; UI inicial de perfil no
  dossiê.

### Inacabadas

- **Fase 3 — curadoria:** revisão/publicação editorial dos claims pendentes;
  resultados eleitorais só depois de outubro de 2026.
- **ALRS-0 a ALRS-5:** classificação dos relatórios como staging, conferência
  canônica, tipagem de eventos, revisão de score, expansão em lotes e matrizes
  `pending_review`.
- **UI-1 a UI-5:** cobertura/fontes/eventos no dossiê, comparação factual,
  impacto por grupos, acessibilidade final e expansão ALRS.
- **FED-0:** auditoria Câmara concluída como diagnóstico; a execução de FED-1 está
  pendente de nova etapa autorizada.

### Planejadas

1. **FED-1:** tornar perfis multi-house (`voting_profiles[]`) e corrigir fetch/UI.
2. **FED-2:** separar definitivamente saldo nominal de alinhamento de impacto.
3. **FED-3:** catálogo auditável Câmara ↔ candidato TSE, sem fuzzy matching.
4. **FED-4:** coletor oficial Câmara em dry-run, cache ignorado, fixture e relatório.
5. **FED-5:** primeiro lote factual de 3–5 candidatos, incluindo Marcel, sem matriz.
6. **FED-6:** matrizes somente `pending_review`, com fontes e revisão humana.
7. **UI-FED-1/2/3/4:** dossiê por casa, votações em comum Câmara×Câmara, impacto
   por grupo, trajetória e cobertura.
8. **FED-QA:** testes de casas combinadas, votos, eventos, períodos, fontes,
   mobile e acessibilidade.

## Resultado FED-0 e piloto recomendado

**Status:** `completed` para auditoria/read-only; sem escrita remota.

Correspondências exatas confirmadas no universo federal 2026: **23**. As outras
411 permanecem `identity_pending`; não foram classificadas como “sem mandato”.

Piloto recomendado para FED-5, ainda não executado:

| Candidato TSE 2026 | Partido | ID Câmara | Motivo |
|---|---:|---:|---|
| Fernanda Melchionna e Silva | PSOL | 204407 | correspondência exata; fonte Câmara já existente |
| Maria do Rosário Nunes | PT | 74398 | correspondência exata; histórico federal amplo |
| Osmar Gasparini Terra | PL | 73692 | correspondência exata; período histórico distinto |
| Alceu Moreira da Silva | MDB | 160559 | correspondência exata; diversidade partidária |
| José Alfonso Ebert Hamm | PP | 136811 | correspondência exata; diversidade partidária |

Marcel van Hattem permanece como **fixture de regressão do pacote PLP 230/2025**,
mas não foi contado no universo de 434 porque a candidatura atual observada no
snapshot está em outro cargo. Não duplicá-lo como candidato federal 2026 sem nova
confirmação eleitoral.

### Fontes oficiais verificadas

- API de deputados: <https://dadosabertos.camara.leg.br/api/v2/deputados>
- API de detalhe: <https://dadosabertos.camara.leg.br/api/v2/deputados/{id}>
- API de histórico: <https://dadosabertos.camara.leg.br/api/v2/deputados/{id}/historico>
- API de votações: <https://dadosabertos.camara.leg.br/api/v2/votacoes>
- API de votos por votação: <https://dadosabertos.camara.leg.br/api/v2/votacoes/{id}/votos>
- Documentação: <https://dadosabertos.camara.leg.br/swagger/api.html>
- Página institucional: <https://www.camara.leg.br/deputados/204416/votacoes-nominais-plenario/2026>

Evidências desta sessão: detalhe de deputado HTTP 200 JSON; histórico HTTP 200
JSON; página de votação HTTP 200 HTML; consulta ampla de votações HTTP 400 por
parâmetros não aceitos. Nenhuma consulta escreveu no projeto ou no Supabase.

## Próximos passos após FED-0

1. Abrir FED-1 somente com testes locais do modelo multi-house.
2. Criar catálogo versionado para as 23 correspondências e manter as 411 como
   pendentes, sem inserir vínculos presumidos.
3. Fechar os parâmetros da coleta anual de votações e testar um ano/ID em dry-run.
4. Revalidar os cinco candidatos do piloto no momento de iniciar FED-5.
5. Manter Marcel apenas como regressão factual até decidir seu papel eleitoral.

## Gate de saída de FED-0

O diagnóstico de FED-0 respondeu:

- 434 no universo TSE; 23 vínculos exatos confirmados; 411 pendentes.
- A API oficial oferece deputados, histórico, proposições, votações e votos; o
  parâmetro exato de consulta ampla por intervalo ainda precisa ser fechado.
- Fallback oficial: páginas institucionais de votação e arquivos anuais, com método
  registrado por lote.
- Drift explicado: schema suporta `(candidate_id, house)`, mas o agregador/fetch/UI
  ainda são single-house.
- Cinco candidatos foram selecionados para o piloto futuro.
- Não há comparação em comum nova publicada; só existe o fixture Câmara de Marcel.
- FED-1 exige testes e permanece fora do escopo desta autorização de FED-0.

## Referências

- `../dataset2026/hermes-task-deputados-federais-comparacao-v1.md`
- `../dataset2026/planejamento_perfil_votacao_dep_fed.md`
- `.orchestrator/STATE.md`
- `scripts/build-vote-profile.mjs`
- `src/services/candidates.ts`
- `src/pages/CandidateDossierPage.tsx`
- `supabase/migrations/20260816090000_legislator_vote_profile_index.sql`
- `data/legislative-import/camara/plp-230-2025-votacao-2580259-24-catalog.json`
