---
document_type: "implementation_proposal"
title: "Proposta de orquestração — votações de deputados federais e comparação legislativa"
project: "eleicao2026"
status: "active_continuous_orchestration"
version: "2.0.0"
updated_at: "2026-08-18"
scope: "Câmara dos Deputados, ALRS, Supabase e portal público"
---

# Proposta de Orquestração — Votações Federais e Comparação Legislativa

## 1. Objetivo

Consolidar e orientar a implementação do pipeline factual e da comparação
legislativa para candidatos a deputado federal pelo Rio Grande do Sul em 2026,
reaproveitando o núcleo já implementado para ALRS sem misturar casas, fatos,
avaliações editoriais ou pontuações.

Esta proposta é destinada ao orquestrador Hermes. Ela descreve o estado atual,
as decisões que prevalecem, o tratamento seguro dos dados no Supabase remoto,
os próximos gates e os critérios para avançar até a interface pública.

## 2. Fontes e precedência cronológica

### 2.1 Documentos consolidados

Os três documentos de origem foram incorporados nesta ordem:

1. `../dataset2026/proposta-votacao-e-comparacao.md` — proposta conceitual mais antiga, sem frontmatter de data.
2. `../dataset2026/planejamento_perfil_votacao_dep_fed.md` — planejamento operacional que introduz o pacote federal e a sequência FED-0 a FED-6.
3. `../dataset2026/hermes-task-deputados-federais-comparacao-v1.md` — task packet com `created_at: 2026-08-17T07:01:00-03:00`, gates, fontes, testes e regras de execução.

### 2.2 Regra de resolução de conflitos

A cronologia dos documentos é usada para resolver conflitos entre eles, mas não
substitui a fonte de verdade do projeto. A precedência efetiva é:

1. código e Git atuais da worktree;
2. `AGENTS.md`, schemas e migrations versionadas;
3. schema e estado remoto confirmados no projeto correto;
4. `docs/qa/`, handoffs e `STATE.md` mais recentes;
5. este documento unificado;
6. task packet de 17/08/2026;
7. planejamento federal;
8. proposta conceitual original.

Assim, ideias conceituais antigas permanecem como intenção metodológica somente
quando não contradizem o contrato atual. O estado atual do código e os gates
FED-0 a FED-16 prevalecem sobre qualquer checkpoint anterior dos documentos.

### 2.3 Fluxo contínuo sem espera entre gates

O Hermes opera em modo `CONTINUOUS_PROGRESS`: não encerra uma resposta apenas
porque um gate terminou e não espera novo prompt para iniciar o próximo chunk.
Depois de cada gate, o control plane registra o resultado, escolhe o próximo
gate elegível, inicia implementação local ou coleta read-only, executa os gates
dependentes e publica/verifica quando o writer estiver autorizado.

Quando um bloqueio real impedir a escrita — identidade remota, fonte ausente,
quota, timeout ou executor indisponível — o Hermes não fica ocioso: abre o
circuit breaker, mantém o writer parado para aquele item e usa rotas CLI
read-only em paralelo para pesquisar portais oficiais, comparar manifests,
preparar fixtures, testes, SQL dry-run e handoff.

Os scouts não são writers: recebem somente snapshot público/sanitizado e URLs
oficiais; não acessam secrets, não editam a worktree, não fazem commit/push e
não alteram Supabase/Cloudflare. Retornam dados, URL, parâmetros, timestamp,
hash e status para o Hermes consolidar.

Assim, a regra de fluxo único permanece: um Hermes control plane e um writer;
paralelismo é permitido apenas na busca read-only de dados públicos.

### 2.4 Invariante de continuidade

Um gate concluído nunca é um estado terminal. O control plane deve executar,
na mesma retomada, o ciclo:

```text
observar -> classificar -> escolher próximo chunk -> implementar/coletar
  -> validar -> documentar -> publicar/verificar -> escolher próximo chunk
```

É proibido encerrar uma execução com `awaiting_user_prompt` entre gates, fases,
lotes ou após CI verde. Se o próximo writer estiver bloqueado, o estado terminal
daquele item é `blocked_item`, acompanhado de pelo menos uma trilha ativa
`read_only_recon`, `local_implementation`, `test/documentation` ou
`release_verification`. O prompt do usuário é entrada complementar, nunca uma
dependência de progresso.

Quando autorização global do arco estiver vigente, commit, push e deploy seguem
automaticamente após gates verdes. Migrations, RLS, RPC, Auth, Storage, secrets
e qualquer escrita remota continuam exigindo identidade correta, schema/FK,
idempotência, segurança e o gate técnico específico; autorização não permite
contornar esses critérios.

### 2.5 Supervisor durável

Como uma sessão TUI/CLI pode terminar depois de uma resposta, a continuidade
não pode depender da vida do processo atual. O perfil mantém um job durável
`eleicao2026-continuous-progress` (`c4278be3a8a5`) recorrente a cada 15 minutos,
com `workdir` na worktree real e as skills de operação contínua, orquestração e
verificação local. Cada tick relê `STATE.md`, disputa lock exclusivo, retoma o
próximo chunk e registra o checkpoint. O job é local-only por desenho: executa
autonomamente, mas não promete mensagem de volta à TUI.

Se o tick anterior morrer, o próximo retoma do Git/STATE; se houver writer
ativo, o lock impede concorrência. O scheduler é mecanismo de continuidade, não
autorização para ignorar gates ou inventar evidências.

### 2.6 Lanes simultâneas sem quebrar fluxo único

O reconhecimento oficial permanece sempre ativo, mas não monopoliza o tick. O
control plane mantém quatro lanes coordenadas:

1. `official_reconnaissance`: scouts read-only pesquisam Senado, Câmara, ALRS e
   fontes históricas, retornando manifesto, hash e handoff;
2. `local_implementation`: o único writer implementa parsers, contratos,
   adaptadores, UI, testes e documentação usando os manifests disponíveis;
3. `publication_verification`: após gates verdes, executa commit, push, CI,
   backup Cloudflare, smoke HTTP e conferência de SHA;
4. `remote_factual_apply`: só inicia quando R0, FK, fonte oficial, dry-run e
   idempotência estiverem verdes.

Um bloqueio na lane de reconhecimento mantém sua fila fail-closed, mas inicia
outra lane elegível na mesma retomada. Paralelismo de scouts não cria múltiplos
writers: a worktree continua com um único writer e as escritas remotas continuam
separadas por gate.

## 3. Estado real da implementação

### 3.1 Repositório e execução

- Projeto: `/home/lourenco/Projetos/eleicao2026`.
- Branch atual: `main`.
- HEAD observado: `0531154` — reconciliação de identidades Câmara Q1/2026.
- Worktree observada limpa e sincronizada com `origin/main`.
- Node exigido pelo projeto: `>=24 <25`; Node 24.19.0 foi usado nos gates remotos documentados.
- Produção e Supabase remoto devem continuar sendo distinguidos da worktree local.

### 3.2 Câmara dos Deputados

- Snapshot público: 434 candidaturas a deputado federal pelo RS.
- Catálogo institucional inicial: 22 correspondências exatas no fechamento de FED-3.
- FED-19/FED-20: batch Q1/2026 com 100 eventos descobertos, 10 nominais, 268
  votos RS e 24 de 32 deputados reconciliados por nome oficial exato; 8 seguem
  `identity_pending`.
- FED-4: coletor oficial em dry-run, com preservação do bruto local.
- FED-5: piloto factual com Fernanda Melchionna, Maria do Rosário, Afonso Hamm
  e Osmar Terra; Marcel van Hattem permanece fixture de regressão sem vínculo
  TSE novo.
- FED-6: matriz do PLP 230/2025/SBT-1 em `pending_review`, sem score publicado.
- FED-7A/FED-7B: quatro candidatos e quatro fontes resolvidos por chaves
  verificáveis; carga factual aplicada de modo idempotente.
- FED-8: reaplicação criou zero linhas; evento simbólico gerou zero votos
  individuais.
- FED-9: Câmara concluída para o evento piloto; API do Senado bloqueada por
  autenticação e não deve ser contornada por scraping especulativo.
- Estado factual remoto documentado: cinco votos no evento nominal, incluindo o
  fixture Marcel; zero linhas de impacto criadas e nenhum RPC de aprovação chamado.

### 3.3 ALRS e multi-house

- FED-10/FED-11: envelope nominal ALRS aplicado e perfis materializados por
  `(candidate_id, house)`.
- FED-12/FED-13: perfis carregados na coleção pública e smoke de produção verde.
- FED-14: nenhum candidato com duas casas foi inventado; 18 perfis em 18
  candidatos no recorte auditado.
- FED-15/FED-16/FED-17: auditoria iniciou com 25 votos ALRS sem vínculo; 10
  receberam fontes oficiais verificadas e idempotentes. Restam 15, mantidos
  fail-closed por divergência de data, ambiguidade ou identidade ausente.
- As lacunas de fonte e o bloqueio do Senado impedem declarar cobertura
  legislativa completa.

### 3.4 Código já presente

- `legislative_votes` é factual e não deve conter impacto, grupo, alinhamento,
  score ou ideologia.
- `deriveAlignment()` exige avaliação com `defending_vote` e diferencia voto,
  abstenção, ausência justificada, omissão estratégica e obstrução coordenada.
- `computeScore()` calcula score por grupo a partir de alinhamento e pesos da
  metodologia; saldo nominal não é score de impacto.
- `legislator_vote_profile` usa chave única `(candidate_id, house)`.
- A UI já exibe perfis nominais separados por casa.
- O perfil legado `profile_score` ainda existe como compatibilidade de leitura e
  deve ser tratado como `nominal_balance`, não como impacto.

## 4. Modelo de dados e tratamento semântico

### 4.1 Cadeia factual obrigatória

Toda carga deve preservar a cadeia:

```text
proposition
  -> proposition_version
    -> voting_event
      -> legislative_vote
```

Cada voto deve manter, no mínimo:

- casa legislativa;
- identificador externo oficial;
- versão exata votada;
- evento e data;
- parlamentar e candidato TSE resolvidos;
- valor factual (`sim`, `nao`, `abstencao`, `ausente`, `obstrucao`);
- `absence_type` quando aplicável;
- referência pública de fonte;
- horário, parâmetros, paginação e hash do bruto no manifesto local.

### 4.2 Não misturar fato e interpretação

- `SIM` e `NÃO` não são, por si, impacto positivo ou negativo.
- `nominal_balance` é estatística descritiva de votos nominais.
- Impacto exige `assessment`, `impact_direction`, `defending_vote`, rationale,
  confiança e fontes.
- `unclear` ou `mixed` não pode produzir alinhamento político afirmativo.
- Ausência, presença sem voto, obstrução e votação simbólica não podem virar
  automaticamente zero, `NÃO` ou voto individual.
- A mesma proposição pode ter várias versões e vários eventos; a unidade de
  avaliação deve ser a versão efetivamente votada, evitando dupla contagem de
  turnos, destaques, urgências e emendas.

### 4.3 Comparação

- Câmara × Câmara: comparar apenas votações em comum, na mesma versão/evento e
  com cobertura factual compatível.
- Câmara × ALRS: comparar trajetória, temas e impactos separadamente; nunca
  inventar votação em comum entre casas.
- O portal deve mostrar coincidência nominal e evidência, não afirmar afinidade,
  compatibilidade política, vencedor ou recomendação.
- A dimensão populacional e a dimensão temática são independentes. Os 14 grupos
  da metodologia continuam sendo o eixo principal; temas podem ser associados
  à `proposition_version` futuramente sem criar um segundo score.

## 5. Protocolo para Supabase remoto

### 5.1 Bloqueio imediato de ambiente

Antes de qualquer nova escrita, confirmar que a sessão e o CLI apontam para o
mesmo projeto. No checkpoint atual, o Gate R0 foi confirmado em modo read-only:
ref `hhqxhxcfkoijevxyzfky`, projeto `eleicao2026`, migrations alinhadas e as
tabelas de candidatos e legislativas coexistem no mesmo banco.

Se uma nova sessão encontrar divergência, o writer deve bloquear somente o item
afetado e emitir `REMOTE_IDENTITY_MISMATCH`; o control plane continua com
scouts read-only até concluir:

1. confirmar URL, project ref e nome do projeto por CLI/MCP;
2. consultar read-only `information_schema`, migrations e tabelas legislativas;
3. comparar o ref com `supabase/.temp/project-ref`;
4. confirmar que `candidates.tse_candidate_id` e as tabelas legislativas estão
   no mesmo banco;
5. registrar a evidência em novo QA antes de liberar aquele writer.

Não aplicar migration, não recriar tabelas e não fazer carga em um projeto que
apenas pareça ter o nome correto. O bloqueio do writer não encerra a execução
contínua: o próximo trabalho seguro é preparar evidência e handoff.

### 5.2 Ordem segura de carga

Quando a identidade remota estiver confirmada, toda carga seguirá:

1. validar envelope local contra `legislative-votes-v1.schema.json`;
2. validar matriz contra `impact-matrix-v1.schema.json`;
3. executar dry-run e emitir SQL sem UUID inventado;
4. resolver candidatos por `tse_candidate_id` remoto;
5. resolver `source_references` por `content_hash` e, como fallback controlado,
   URL canônica;
6. fazer upsert idempotente de fontes públicas;
7. fazer upsert de proposição por `(house, external_id)`;
8. fazer upsert de versão por `(proposition_id, version_key)`;
9. fazer upsert de evento por `(house, external_id)`;
10. inserir/upsert votos por chave factual estável, sem duplicar evento;
11. materializar perfis nominais por `(candidate_id, house)`;
12. verificar contagens, FKs, duplicidades e segunda execução;
13. manter matrizes em `pending_review`;
14. somente após revisão humana, chamar a RPC oficial de aprovação.

UUIDs de snapshot, fixtures ou banco local nunca podem ser enviados como FK
remota sem lookup. SQL gerado deve usar chaves naturais e subselects resolvidos.

### 5.3 Separação de dados públicos e privados

- Bruto de API, HTML, documentos e payloads permanecem locais/privados e não
  entram no frontend, no snapshot público ou em `source_references`.
- `source_references` armazena somente metadados publicáveis, URL, título,
  datas e hash.
- Dados factuais aprovados podem ser lidos publicamente conforme RLS/grants.
- Matrizes `pending_review`, revisões internas e dados crus não são públicos.
- Claims novas entram como `pending_review`; nunca inserir diretamente como
  `published`.
- `service_role`/secret key só pode ser usada por script de ingestão controlado,
  nunca em `VITE_*`, frontend, logs ou documentos exportados.
- Toda execução deve registrar manifesto, versão do coletor, fonte, timestamp,
  paginação, hash e resultado sem expor credenciais.

### 5.4 Idempotência e transação

O writer deve ser reexecutável sem aumentar o conjunto factual. Cada execução
deve produzir relatório com:

- linhas planejadas, criadas, atualizadas e ignoradas;
- candidatos resolvidos e pendentes;
- fontes novas e já existentes;
- proposições, versões, eventos e votos afetados;
- impacto criado, sempre zero até aprovação explícita;
- segunda passagem com zero novas linhas;
- scan de segredos limpo.

Falha de resolução de identidade, fonte ou FK deve bloquear o item, não gerar
UUID, não usar fuzzy matching silencioso e não inserir voto parcialmente
identificado.

## 6. Plano proposto ao orquestrador

### Gate R0 — identidade e drift remoto

- Confirmar projeto remoto e schema real.
- Comparar migrations locais com migrations remotas.
- Confirmar Node 24 e ambiente limpo.
- Reexecutar auditorias read-only de contagem e RLS.
- Se houver divergência, bloquear somente o item remoto afetado; iniciar
  imediatamente reconciliação local, scouts oficiais e documentação das trilhas
  independentes.

### Gate R1 — recuperação de fontes ALRS

- Recuperar evidência oficial dos cinco eventos listados em FED-16, aplicando
  somente sublotes com data, identidade, proposição e voto exatos.
- Gerar manifesto com URL/hash.
- Fazer dry-run de backfill apenas depois de resolver cada evento e candidato.
- Reexecutar `impact:sources:audit --strict`.

### Gate R2 — ampliação factual da Câmara

- Selecionar novos eventos nominais oficiais e continuar a batch Q1 já descoberta.
- Priorizar candidatos com identidade confirmada.
- Manter o piloto em lotes pequenos.
- Reusar o PLP 230/2025 como regressão.
- Não incluir os 411/412 pendentes como “sem mandato” sem pesquisa individual.

### Gate R3 — materialização nominal

- Recalcular índices por `(candidate_id, house)`.
- Conferir que nenhum candidato perde perfil ao possuir mais de uma casa.
- Expor saldo nominal e cobertura, sem score de impacto.

### Gate R4 — revisão editorial de impacto

- Revisar a matriz do PLP 230/2025/SBT-1 e novas matrizes uma a uma.
- Exigir fontes, rationale, confiança e `defending_vote` válido.
- Aplicar revisão externa quando exigida pelo schema/gate.
- Aprovar via RPC somente após revisão humana registrada.

### Gate R5 — UI e comparação

- Exibir resumo, votações em comum, impacto por grupo, trajetória, cobertura e
  fontes.
- Não renderizar ranking, recomendação ou identidade política inferida.
- Testar Câmara × Câmara e Câmara × ALRS separadamente.
- Executar smoke com candidatos sem votos, sem impacto, com duas casas e com
  identidade pendente.

## 7. Critérios de aceite

O orquestrador só pode marcar a frente como implementada quando:

- a identidade do Supabase remoto estiver confirmada;
- o schema local e remoto estiverem alinhados ou a divergência estiver aprovada;
- nenhum voto factual estiver sem identidade ou fonte exigida pelo gate;
- a segunda execução do writer for idempotente;
- perfis multi-house não forem sobrescritos;
- saldo nominal e impacto forem exibidos separadamente;
- matrizes não aprovadas não aparecerem como públicas;
- o relatório de auditoria `--strict` estiver verde para o recorte publicado;
- testes, TypeScript, schema, data-check, build e smoke passarem;
- a mudança de UI for compatível com RLS e grants reais;
- houver revisão humana documentada antes de qualquer publicação de impacto.
- nenhum chunk elegível tiver sido deixado ocioso aguardando prompt entre gates.

## 8. Comandos de verificação local

```bash
npm run orch:doctor
npm run env:check
npm run data:check
npm run impact:dryrun
npm run impact:sources:audit
node scripts/validate-impact-schema.mjs
npm run test -- --passWithNoTests
npx tsc --noEmit
npm run build
npm run smoke:local
```

Comandos remotos de aplicação ficam liberados somente quando o Gate R0 estiver
verde e a autorização humana vigente cobrir a operação. A autorização global
fornecida para este arco cobre Supabase, GitHub e Cloudflare, mas não substitui
o Gate R0 nem permite contornar identidade, RLS, fontes ou schemas.

## 9. Decisão recomendada

Prosseguir em modo contínuo/local-first: scouts oficiais podem pesquisar e
preparar evidência enquanto o writer resolve divergências por item. Ao fechar
cada gate, Hermes deve iniciar o próximo chunk elegível automaticamente, publicar
quando os gates e a autorização estiverem verdes, verificar CI/produção e só
parar diante de bloqueio técnico, factual ou de segurança concreto. A cobertura
completa de parlamentares e matrizes federais só pode ser declarada quando os
critérios de aceite estiverem verdes.
