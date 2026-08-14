# Handoff — Primeira matriz real criada em pending_review

Data: 2026-08-14
Status: `SUPERADO_POR_APPROVED_PUBLICADA`
Arco: `eleicao2026-pos-fase2-matrizes-reais`

## Resumo

Foi criada a primeira Matriz de Impacto Populacional real, vinculada à versão
votada `sbt-1-plen-2026-08-12` do `PLP 230/2025`, já com dados factuais
legislativos aplicados no Supabase.

A matriz nasceu como `pending_review`, sem aprovação e sem publicação automática.
Depois, com autorização explícita, ela foi revisada, aprovada e tornou-se publicável.
Checkpoint sucessor:

- `docs/handoff/2026-08-14-primeira-matriz-real-approved-publicada.md`

Lourenço não escreveu manualmente no Supabase; Hermes executou e validou.

## Matriz criada

- Proposição: `camara-proposicao-2580259-plp-230-2025`
- Versão: `sbt-1-plen-2026-08-12`
- `impact_matrices.id`: `4c8eaec1-8ee4-4027-939c-2d391b8f9cbe`
- `schema_version`: `1.0.0`
- `methodology_version`: `1.0.0`
- `severity`: `2`
- `structural_type`: `budgetary`
- `review_status`: `pending_review`
- `generated_by_ai`: `true`
- `approved_at`: `NULL`

## Avaliação inicial

Grupo:

- `pessoas_com_deficiencia`

Classificação:

- `impact_direction`: `unclear`
- `defending_vote`: `NULL`
- `confidence`: `0.55`

Racional:

> O PLP 230/2025 trata do Fundo de Universalização dos Serviços de Telecomunicações
e pode afetar políticas de conectividade relevantes para acessibilidade e inclusão
digital, mas o texto oficial votado não segmenta explicitamente pessoas com
deficiência; por isso a direção do impacto deve permanecer pendente de revisão
humana antes de qualquer publicação.

## Fontes associadas

A avaliação foi vinculada a 3 `source_references` oficiais:

- `https://dadosabertos.camara.leg.br/api/v2/proposicoes/2580259`
- `https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=3170169`
- `https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24/votos`

## Arquivos versionados criados

- `data/impact-matrices/plp-230-2025-sbt-1-pending-review.json`
- `scripts/__tests__/impact-real-matrix.test.mjs`

## SQL executado

Arquivo temporário:

- `/tmp/create-first-impact-matrix-plp230.sql`
- SHA-256: `3fa451d01c5d6a86d0a95ce4db0be992a83e625078ddc4058231fc521b56bc82`

## Validações remotas

Matriz:

```text
id: 4c8eaec1-8ee4-4027-939c-2d391b8f9cbe
review_status: pending_review
severity: 2
structural_type: budgetary
generated_by_ai: true
approved_at: NULL
version_key: sbt-1-plen-2026-08-12
```

Assessment:

```text
group_slug: pessoas_com_deficiencia
impact_direction: unclear
defending_vote: NULL
confidence: 0.55
rationale_len: 356
sources_count: 3
```

Reviews/aprovação:

```text
impact_reviews_count: 0
approved_count: 0
```

## O que NÃO foi feito

- Nenhuma matriz foi aprovada.
- Nenhum `impact_review` foi criado.
- Nenhuma publicação automática ocorreu.
- Nenhuma RPC de aprovação foi chamada.
- Nenhuma RLS/migration foi alterada.

## Próximo passo recomendado

1. Criar gate de revisão humana/curadoria para a matriz `4c8eaec1-8ee4-4027-939c-2d391b8f9cbe`.
2. Revisar se o grupo `pessoas_com_deficiencia` deve permanecer `unclear` ou se há base suficiente para outro grupo/direção.
3. Só depois criar `impact_review` interno; aprovação/publicação continua exigindo gate separado.
