# QA — aprovação final do micro-lote ALRS

**Data:** 2026-08-23

## Resultado remoto verificado

- 12 matrizes ALRS novas em `approved`;
- 14 assessments aprovados;
- 14/14 assessments com fonte;
- 12 curadorias internas aprovadas;
- 5 revisões externas aprovadas;
- 7 candidatos com eventos ALRS afetados pelo lote;
- nenhuma matriz editorial aprovada sem fonte.

As duas matrizes adicionais na contagem global são Câmara e preexistentes.

## Segurança

A aprovação ocorreu pela sessão autenticada do editor via
`approve_impact_matrix`. Não houve UPDATE direto, service-role bypass ou criação
manual de reviewer_id.

## Estado público

O frontend calcula o score por categoria usando somente matrizes
`approved/contested`, assessments com fonte e votos do `legislator_vote_index`.
O lote está elegível para aparecer no recorte ALRS dos candidatos afetados.
