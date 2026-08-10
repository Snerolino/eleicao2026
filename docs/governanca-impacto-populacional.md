# Governança da Matriz de Impacto Populacional

Este documento define o fluxo editorial, os gates de aprovação e as regras públicas da Matriz de Impacto Populacional. A matriz é interpretação metodológica revisada; não é fato legislativo bruto e não pode ser publicada automaticamente por scripts de coleta ou modelos de IA.

## Fluxo Editorial

O fluxo canônico é:

```text
rascunho
  -> pending_review
  -> revisão interna
  -> painel externo, se obrigatório
  -> approved
```

Alternativamente, uma avaliação pode seguir para:

```text
pending_review -> contested
```

Estados públicos e internos:

| Estado | Semântica |
|---|---|
| `rascunho` | Conteúdo em elaboração, nunca público. |
| `pending_review` | Conteúdo aguardando revisão humana, nunca público. |
| `approved` | Conteúdo aprovado para leitura pública. |
| `contested` | Conteúdo aprovado ou avaliado com contestação registrada, visível com alerta. |

## Gate de Painel Externo

A função de governança é:

```text
requireExternalReview(matrix) = severity >= 4 OR qualquer confidence < 0.6
```

Se `severity >= 4` ou qualquer assessment tiver `confidence < 0.6`, o painel externo é obrigatório antes de `approved`.

O painel externo atua como revisor especializado, não como proprietário da verdade. Divergências relevantes devem ser registradas e manter o assessment ou a matriz como `contested` até resolução documentada.

## RPC de Aprovação

A aprovação deve espelhar o padrão transacional de `publish_claim()`. A RPC conceitual de aprovação da matriz deve verificar atomicamente:

1. A matriz existe.
2. O status atual é `pending_review`.
3. Os assessments são válidos, inclusive o caso explícito `assessments = []` quando não houver grupo populacional específico.
4. As fontes são suficientes para cada assessment aplicável.
5. Todos os valores de `confidence` estão na faixa `[0, 1]`.
6. Cada `defending_vote` obedece à metodologia: obrigatório em `positive` e `negative`, condicionado em `mixed`, `null` em `unclear`.
7. Existe revisão interna aprovada.
8. Existe revisão de painel externo aprovada quando `requireExternalReview(matrix)` for verdadeiro.
9. Não existe contestação bloqueante anterior.
10. A `methodology_version` informada existe e está vigente para aprovação.
11. Somente então o status muda para `approved`.

Nenhum script de coleta, importação, refresh, síntese por IA ou carga em lote pode chamar essa RPC automaticamente. Importadores podem, no máximo, criar ou atualizar conteúdo até `pending_review` quando explicitamente autorizados.

## Contestação

Na metodologia `1.0`, assessment `contested` permanece no score usando a última avaliação vigente, mas o resultado derivado deve registrar:

```text
score.contested_assessments += 1
```

A UI pública deve exibir alerta de contestação e permitir auditoria da avaliação, rationale, fontes, motivo da contestação, estado da análise e resolução quando houver.

Excluir assessments contestados do score mudaria a interpretação da métrica e exigiria nova `methodology_version`.

## Tipos de Revisores

Valores aceitos para `reviewer_type`:

| Valor | Papel |
|---|---|
| `curadoria_interna` | Revisão editorial interna do projeto. |
| `painel_externo` | Revisor especializado externo, acionado quando obrigatório ou recomendável. |

O painel externo não substitui a metodologia e não possui poder unilateral de definir a verdade. Quando houver divergência entre curadoria interna e painel externo, a avaliação deve permanecer `contested` até resolução documentada.

## Conflitos de Interesse

Conflitos de interesse devem ser declarados em documentação separada, fora do schema público de dados. Esse registro não deve incluir dados pessoais sensíveis no contrato público nem em `docs/context-export/`.

## Evidências e Rationale

Cada rationale deve permitir distinguir evidência factual de evidência contextual.

Evidência factual inclui:

| Tipo |
|---|
| Texto da lei |
| Emenda |
| Substitutivo |
| Parecer |
| Registro de votação |

Evidência contextual inclui:

| Tipo |
|---|
| Estudo técnico |
| Estatística oficial |
| Nota técnica |
| Literatura acadêmica |
| Manifestação de organização especializada |

Uma nota de advocacy não substitui o texto legal, mas o texto legal isolado também pode ser insuficiente para estimar efeitos sociais. O rationale deve deixar explícito o que vem do texto votado e o que depende de interpretação contextual.

## Validação dos Grupos

Antes de congelar o vocabulário `beneficiary_groups v1.0`, os 14 slugs devem ser validados com organização representativa ou painel especializado relevante.

O registro futuro deve ficar em:

```text
docs/governanca/beneficiary-groups-validation.md
```

Esse documento deverá registrar, para cada grupo, descrição operacional, critérios de inclusão, critérios de exclusão, organização ou painel consultado, data e resultado, sem incluir dados pessoais sensíveis.

## RLS e Superfície Pública

Regras de leitura pública:

| Conteúdo | Público anônimo |
|---|---|
| Matrizes `approved` | Pode ler |
| Matrizes `contested` | Pode ler com alerta |
| Assessments de matrizes públicas | Pode ler |
| Fontes publicáveis relacionadas | Pode ler |
| `rascunho` | Nunca lê |
| `pending_review` | Nunca lê |
| Reviews internas | Nunca lê |
| Raw documents | Nunca lê |
| PII ou dados crus | Nunca lê |

RLS deve impedir que `rascunho`, `pending_review`, reviews internas, payloads brutos, documentos crus e PII sejam expostos pela superfície pública. A UI pública deve consumir apenas dados aprovados ou contestados explicitamente publicáveis.
