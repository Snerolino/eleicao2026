# Contrato JSON Voto em Quem

Este documento registra o contrato de intercâmbio usado pelo Voto em Quem? RS e sua extensão aditiva para a Matriz de Impacto Populacional v1. O contrato base está resumido a partir de `.refs-fase0/contrato-json-votoemquem.md`, que permanece como referência histórica do formato canônico do raspador.

## Parte 1: contrato base

Novas saídas estruturadas devem retornar JSON UTF-8 com `schema_version`, metadados de geração, escopo territorial e eleitoral (`country=BR`, `state=RS`, `election_year=2026`) e exatamente um item em `politicians[]` por chamada de síntese.

Cada político pode conter blocos canônicos de identificação, aliases, identificadores externos, histórico partidário, histórico eleitoral, bens declarados, financiamento de campanha, mandatos, votos, proposições, papéis institucionais, despesas parlamentares, perfis temáticos, alinhamentos, compromissos de campanha, consistência de compromissos, registros legais/éticos, controvérsias, cobertura, fontes e qualidade.

Regras obrigatórias do contrato base:

- Todo registro factual precisa declarar `information_class`, `source_ids` e `quality`.
- `source_ids` deve apontar para itens existentes em `politicians[0].sources`.
- `review_status` do contrato base usa `automatic`, `needs_review`, `human_verified` ou `rejected`.
- `confidence_level` usa `alta`, `media` ou `baixa` e é mapeado pela persistência para pontuação interna.
- Não publicar CPF, telefone, endereço residencial completo, título eleitoral ou documentos pessoais.
- Não converter candidatura rotineira em controvérsia ou processo.
- Candidatura histórica não prova mandato; `mandates[]` exige eleição, posse ou exercício em fonte oficial.
- Nenhuma saída pode recomendar voto, ranquear candidatos, gerar nota única ou inferir culpa/inocência.

O contrato executável do raspador citado na referência vive em `src/raspador_candidatos/synthesis/schema.py`; o validador semântico citado vive em `src/raspador_candidatos/synthesis/validator.py`.

## Parte 2: extensão aditiva impacto

A Matriz de Impacto Populacional v1 é uma extensão aditiva do modelo legislativo. Ela não substitui fatos legislativos, não altera o contrato de candidatos e não transforma score derivado em fato primário.

Em `propositions[]`, cada versão votada de proposição pode expor `impact_matrix` com os campos abaixo:

- `schema_version`: versão semântica da estrutura JSON, no formato `MAJOR.MINOR.PATCH`.
- `methodology_version`: versão semântica da metodologia de interpretação, pesos e sinais.
- `severity`: inteiro de 1 a 5 atribuído no nível da versão da proposição.
- `structural_type`: `structural`, `budgetary` ou `symbolic`.
- `assessments[]`: avaliações por grupo populacional específico.
- `review_status`: `rascunho`, `pending_review`, `approved` ou `contested`.

Cada item em `assessments[]` contém:

- `group`: um dos 14 slugs pontuáveis definidos na metodologia v1; `geral` não é grupo pontuável.
- `impact_direction`: `positive`, `negative`, `mixed` ou `unclear`.
- `defending_vote`: `sim`, `nao` ou `null`, condicionado por `impact_direction`.
- `confidence`: número maior que 0 e menor ou igual a 1.
- `rationale`: justificativa textual rastreável, com no mínimo 20 caracteres.
- `sources`: lista de URLs públicas `http` ou `https` que sustentam a avaliação.
- `reviewed`: lista opcional de revisões com `reviewer_type`, `reviewed_at` e `reviewer_id`.

Regras de `defending_vote`:

- `positive` e `negative` exigem `defending_vote` como `sim` ou `nao`.
- `mixed` permite `sim`, `nao` ou `null` e exige justificativa explícita do saldo adotado.
- `unclear` exige `defending_vote = null` e não participa do score.

Em `votes[]`, o voto legislativo factual aceita `absence_type` como extensão aditiva:

- Para `value` igual a `sim`, `nao` ou `abstencao`, `absence_type` deve ser `null`.
- Para `value` igual a `ausente` ou `obstrucao`, `absence_type` deve ser `estrategica`, `obstrucao_coordenada` ou `justificada`.
- Votos continuam sendo fatos; não armazenam impacto, alinhamento, grupo, score, ideologia ou recomendação.

### Envelope operacional do importer local v1

O contrato histórico não define os campos de `propositions[]` necessários para
planejar as quatro tabelas legislativas. O importer local fecha essa lacuna com
um envelope `schema_version = "1.0.0"`, implementado em
`src/domain/impact/legislative-importer.ts`:

- `propositions[]` exige `external_id`, `house`, `proposition_type`, `number`,
  `year`, `title` e `versions[]`;
- cada versão exige `version_key`, `version_label`, `text_hash`,
  `effective_from` e `voting_events[]`; `impact_matrix` permanece opcional e é
  validado pelo schema v1 existente;
- cada evento exige `external_id`, `house` e `occurred_at`, e pode declarar
  sessão, rodada e fonte;
- `votes[]` mantém os campos factuais do schema de votos e acrescenta apenas
  `voting_event_id` para preservar a FK lógica no envelope;
- `proposition_version_id` e `voting_event_id` são referências lógicas
  (`proposition_versions:<house>:<external_id>:<version_key>` e
  `voting_events:<house>:<external_id>`), não UUIDs.

O planner emite operações na ordem proposição → versão → evento → voto. Os
campos UUID e `source_reference_id` são placeholders `logical_ref` no dry-run;
nenhuma resolução de `legislator_id`/`candidate_id`, geração de UUID, rede ou
persistência ocorre nesta fase. Duplicidades idênticas podem ser deduplicadas
pela chave idempotente; duplicidades com conteúdo diferente são rejeitadas.

## Parte 3: versionamento, usos e referências

`schema_version` e `methodology_version` respondem perguntas diferentes:

- `schema_version`: a estrutura dos dados mudou?
- `methodology_version`: a interpretação, pesos, sinais ou critérios de cálculo mudaram?

Mudanças em campos, tipos, obrigatoriedade ou formato alteram `schema_version`. Mudanças em pesos, sinais, tratamento de `contested`, uso de `confidence` no cálculo ou interpretação de `defending_vote` alteram `methodology_version`.

Usos previstos do contrato executável:

- Importação valida o JSON antes de qualquer escrita persistente.
- API pública valida ou rejeita payloads na borda antes de exposição.
- Testes de contrato usam fixtures bons e ruins para impedir regressões metodológicas.

Arquivos executáveis de contrato:

- `schemas/impact-matrix-v1.schema.json`
- `schemas/legislative-votes-v1.schema.json`

Referências normativas:

- `docs/metodologia-impacto-populacional-v1.md`
- `docs/governanca-impacto-populacional.md`
- `.refs-fase0/contrato-json-votoemquem.md`
