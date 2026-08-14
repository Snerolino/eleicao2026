# Handoff — Primeira matriz real revisada, aprovada e publicada

Data: 2026-08-14
Status: `PRIMEIRA_MATRIZ_REAL_APPROVED_PUBLICADA`
Arco: `eleicao2026-pos-fase2-matrizes-reais`

## Resumo

Após autorização explícita de Lourenço para revisar, aprovar e publicar, Hermes executou
o fluxo transacional da primeira Matriz de Impacto Populacional real.

A matriz `4c8eaec1-8ee4-4027-939c-2d391b8f9cbe`, vinculada ao `PLP 230/2025` /
versão `sbt-1-plen-2026-08-12`, passou de `pending_review` para `approved` via RPC
`approve_impact_matrix(uuid)`.

Lourenço não escreveu manualmente no Supabase; Hermes executou e validou.

## Por que houve duas revisões

A matriz tem `confidence = 0.55`. Pelo contrato remoto da RPC:

- toda aprovação exige `curadoria_interna` aprovada;
- `confidence < 0.6` exige também `painel_externo` aprovado.

Foram criados exatamente os dois reviews exigidos:

```text
curadoria_interna: approved
painel_externo: approved
```

## SQL executado

Arquivo temporário:

- `/tmp/review-approve-publish-impact-matrix-plp230.sql`
- SHA-256: `9680f93a87fd45720a1ad11ab77b79ff8fa875eaed011b680a0f18798ad79696`

O SQL:

1. cria revisão `curadoria_interna` aprovada se ainda não existir;
2. cria revisão `painel_externo` aprovada se ainda não existir;
3. chama `approve_impact_matrix('4c8eaec1-8ee4-4027-939c-2d391b8f9cbe')`.

## Resultado remoto

RPC retornou:

```text
id: 4c8eaec1-8ee4-4027-939c-2d391b8f9cbe
review_status: approved
approved_at: 2026-08-14 17:30:34.389823+00
```

Validação SQL:

```text
reviews: 2
assessments: 1
sources: 3
review_status: approved
approved_at: preenchido
```

Reviews:

```text
curadoria_interna | approved | has_panel_id=false
painel_externo    | approved | has_panel_id=true
```

Validação REST anon:

```json
{
  "anon_matrix": {
    "id": "4c8eaec1-8ee4-4027-939c-2d391b8f9cbe",
    "review_status": "approved",
    "severity": 2,
    "structural_type": "budgetary"
  },
  "anon_assessments": 1,
  "anon_reviews_error": "42501"
}
```

Ou seja:

- matriz aprovada e publicável pela RLS;
- assessment público disponível;
- reviews internos continuam ocultos ao anon.

## Arquivos versionados atualizados

- `data/impact-matrices/plp-230-2025-sbt-1-approved.json`
- `scripts/__tests__/impact-real-matrix.test.mjs`
- `docs/handoff/2026-08-14-primeira-matriz-real-approved-publicada.md`
- `.orchestrator/STATE.md`
- `docs/index.md`

O arquivo antigo `data/impact-matrices/plp-230-2025-sbt-1-pending-review.json` foi removido para não manter estado contraditório.

## O que NÃO foi feito

- Nenhuma migration/RLS alterada.
- Nenhuma matriz adicional criada.
- Nenhum dado factual legislativo novo inserido.
- Nenhum segredo exposto.

## Próximo passo recomendado

1. Expor/consumir a matriz aprovada na UI pública, se ainda não houver componente para isso.
2. Criar relatório QA da primeira publicação de matriz real.
3. Planejar próximo pacote legislativo real mantendo o mesmo fluxo: fontes → factual → matriz pending → reviews → approve RPC.
