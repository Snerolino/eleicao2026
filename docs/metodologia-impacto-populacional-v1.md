# Metodologia da Matriz de Impacto Populacional v1

Este documento congela a metodologia `1.0` da Matriz de Impacto Populacional. A matriz classifica o impacto de uma versão votada de proposição sobre grupos populacionais específicos e permite derivar, de forma reproduzível, o alinhamento de votos parlamentares e scores por grupo.

A matriz não substitui o fato legislativo. A fonte primária continua sendo a cadeia factual: proposição -> versão da proposição -> evento de votação -> voto. A avaliação metodológica vive na `proposition_version` efetivamente votada, nunca apenas no identificador genérico da proposição.

## Escopo

- `impact_matrix` pertence a uma `proposition_version`.
- `votes` registram somente fatos: parlamentar, evento de votação, valor do voto, ausência e fonte.
- `alignment` e `score` são derivados e recalculáveis.
- `geral` não é grupo pontuável na v1. Quando não houver grupo populacional específico avaliável, `assessments = []`.
- Grupos não avaliados não são tratados como neutros.

## Vocabulário Controlado: `beneficiary_groups`

Os slugs abaixo são os únicos grupos populacionais pontuáveis na metodologia `1.0`. Slugs publicados não devem ser renomeados; evolução futura deve usar depreciação, alias ou novo slug versionado.

| Slug | Rótulo operacional |
|---|---|
| `povos_indigenas` | Povos indígenas |
| `comunidades_quilombolas` | Comunidades quilombolas |
| `populacao_negra_periferica` | População negra periférica |
| `mulheres` | Mulheres |
| `lgbtqia` | Pessoas LGBTQIA+ |
| `pessoas_com_deficiencia` | Pessoas com deficiência |
| `populacao_rua` | População em situação de rua |
| `populacao_carceraria` | População carcerária / sistema prisional |
| `criancas_adolescentes_vulnerabilidade` | Crianças e adolescentes em vulnerabilidade |
| `pessoas_idosas_dependentes` | Pessoas idosas dependentes |
| `trabalhadores_informais` | Trabalhadores informais e de aplicativo |
| `agricultura_familiar_sem_terra` | Agricultura familiar, assentados e sem-terra |
| `povos_de_terreiro` | Povos de terreiro / religiões de matriz africana |
| `imigrantes_refugiados` | Imigrantes e refugiados |

## Enums

```text
impact_direction := positive | negative | mixed | unclear
structural_type  := structural | budgetary | symbolic
absence_type     := null | estrategica | obstrucao_coordenada | justificada
review_status    := rascunho | pending_review | approved | contested
reviewer_type    := curadoria_interna | painel_externo
```

## Severidade

`severity` mede alcance, reversibilidade e tipo de direito atingido. Deve ser atribuído no nível da matriz da versão da proposição, em escala inteira de 1 a 5.

| Valor | Rubrica reproduzível |
|---:|---|
| 1 | Efeito limitado, localizado ou simbólico. |
| 2 | Efeito setorial de baixa magnitude. |
| 3 | Efeito material relevante ou orçamentário importante. |
| 4 | Efeito amplo, relacionado a direito básico ou de difícil reversão. |
| 5 | Efeito sistêmico, constitucional ou potencialmente duradouro sobre direitos fundamentais. |

## Tipo Estrutural e Peso

O peso de cada assessment no score é definido por `severity` e `structural_type`:

```text
structural = severity × 1.5
budgetary  = severity × 1.0
symbolic   = severity × 0.5
```

## Confiança

`confidence` mede robustez da classificação, não magnitude do impacto. O valor deve estar em `[0, 1]` e ser justificado por evidências observáveis.

| Faixa | Critério |
|---|---|
| 0.90-1.00 | Efeito direto e documentado. |
| 0.75-0.89 | Efeito bem sustentado com inferência limitada. |
| 0.60-0.74 | Efeito plausível dependente de contexto. |
| < 0.60 | Incerteza material; painel externo obrigatório. |

Nota metodológica: `confidence` NÃO pondera o score na v1. Usar `confidence × peso` mudaria a interpretação do cálculo e exigiria `methodology_version` nova, por exemplo `1.1`.

## `defending_vote`

`defending_vote` indica qual voto factual defende o interesse do grupo naquela versão da proposição. Valores aceitos: `sim`, `nao` ou `null`.

Regras obrigatórias:

| `impact_direction` | Regra para `defending_vote` |
|---|---|
| `positive` | Obrigatório: `sim` ou `nao`. |
| `negative` | Obrigatório: `sim` ou `nao`. |
| `mixed` | Pode ser `sim`, `nao` ou `null`; exige `rationale` explicando o saldo adotado. |
| `unclear` | Deve ser `null`. |

`unclear` não significa neutro. Significa insuficiência metodológica para determinar um voto defensor. Quando `defending_vote = null`, o assessment gera `nao_avaliavel` e não participa do score.

## Alinhamento Derivado

O alinhamento é uma função pura entre o voto factual e o assessment aprovado ou contestado:

```text
alinhamento(voto, assessment) =
  se assessment.defending_vote == null:
      nao_avaliavel

  se voto.value == assessment.defending_vote:
      a_favor

  se voto.value em {sim, nao} e voto.value != assessment.defending_vote:
      contra

  se voto.value == abstencao:
      neutro_declarado

  se voto.value == ausente e voto.absence_type == estrategica:
      omissao_estrategica

  se voto.value == ausente sem ausencia estrategica:
      sem_dado

  se voto.value == obstrucao:
      omissao_coordenada
```

`ausente` sem ausência estratégica inclui ausência justificada, ausência geral ou ausência sem evidência suficiente de estratégia. Esses casos não entram no denominador.

## Sinais da Metodologia 1.0

| Alinhamento | Sinal no score |
|---|---:|
| `a_favor` | +1 |
| `contra` | -1 |
| `neutro_declarado` | 0 |
| `omissao_estrategica` | -0.5 |
| `omissao_coordenada` | 0 |
| `sem_dado` | Excluído do denominador |
| `nao_avaliavel` | Excluído do denominador |

`omissao_coordenada = 0` é decisão fechada da metodologia `1.0`. Obstrução coordenada deve ser exibida como categoria própria, mas não equivale automaticamente a voto contrário. Alterar esse sinal exige nova `methodology_version`.

## Fórmula do Score

Para cada parlamentar e grupo:

```text
score = Σ(peso × sinal) / Σ(peso incluído)
```

Onde:

```text
peso = severity × multiplicador(structural_type)
```

O denominador inclui apenas itens com sinal numérico definido. `sem_dado` e `nao_avaliavel` são excluídos. O resultado é normalizado em `[-1, 1]`.

Quando não houver peso incluído, o score do grupo é indisponível, não zero.

## Revisão Externa Obrigatória

A regra pura da metodologia é:

```text
requireExternalReview(matrix) = severity >= 4 OR qualquer confidence < 0.6
```

Quando a função retorna verdadeiro, a matriz não pode chegar a `approved` sem revisão por `painel_externo`.

## Versões

`schema_version` e `methodology_version` respondem perguntas diferentes:

| Campo | Pergunta respondida |
|---|---|
| `schema_version` | A estrutura dos dados mudou? |
| `methodology_version` | A interpretação, pesos ou sinais mudaram? |

Mudanças em campos, tipos, obrigatoriedade ou formato alteram `schema_version`. Mudanças em pesos, sinais, critérios de score, tratamento de `contested`, uso de `confidence` no cálculo ou interpretação de `defending_vote` alteram `methodology_version`.
