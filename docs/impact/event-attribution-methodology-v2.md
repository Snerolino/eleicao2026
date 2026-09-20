# Metodologia de atribuição de evento e score — v2.0.0

Status: implementação em branch, **não aplicada ao Supabase remoto**.

## Problema corrigido

A metodologia v1.1 separou `textual_defending_vote` de `event_defending_vote`, mas persistiu ambos em `impact_assessments`, cuja identidade é versão × grupo. Isso é insuficiente quando a mesma versão possui mais de um evento nominal.

Na metodologia v2, o significado de SIM/NÃO pertence ao evento concreto:

```text
proposition
→ proposition_version
→ voting_event
→ object_voted
→ impact_assessment (efeito textual)
→ impact_event_attribution (efeito atribuível ao evento)
→ legislative_vote (fato)
→ alinhamento derivado
```

## Regra de score

Um voto só entra no cálculo se existir uma atribuição v2 que satisfaça simultaneamente:

- `methodology_version = 2.0.0`;
- `review_status ∈ {approved, contested}`;
- `score_eligible = true`;
- `vote_attribution_status ∈ {isolated, compound_separable}`;
- `event_defending_vote ∈ {sim, nao}`;
- fontes próprias da atribuição de evento;
- assessment textual com fonte e matriz publicável.

Caso contrário:

- o voto factual permanece preservado;
- o assessment textual permanece preservado;
- o alinhamento fica `withheld` ou `no_alignment`;
- o evento não entra no denominador;
- ausência de evidência nunca vira score zero.

## Votos não binários

Na v2:

- `abstencao` → `no_alignment`;
- `ausente` → `no_alignment`;
- `obstrucao` → `no_alignment`.

Esses fatos podem ter contexto documental separado, mas não são convertidos automaticamente em posição sobre o mérito.

## Persistência

Nova tabela:

`impact_event_attributions`

Chave lógica:

```text
(voting_event_id, assessment_id, methodology_version)
```

Nova relação de fontes:

`impact_event_attribution_sources`

Os campos v1.1 de evento ainda existentes em `impact_assessments` permanecem temporariamente para histórico/migração, mas são **deprecated para score**.

## Snapshot local

`data/candidate-nominal-votes.json` deixa de herdar `score_eligible` e `event_defending_vote` do gabarito textual.

O gabarito pode continuar a informar:

- grupo;
- direção textual;
- voto textual defensor.

Mas não pode criar atribuição de evento.

## Frontend

O serviço de score:

1. carrega votos factuais;
2. encontra matriz/assessment da versão;
3. procura `impact_event_attributions` pela dupla evento × assessment;
4. exige fontes da atribuição;
5. deriva alinhamento v2;
6. calcula apenas eventos elegíveis.

O fallback para `candidate.category_scores` legado foi desativado. Resultado v2 `null` é autoritativo e nunca é substituído por score antigo.

## Reprocessamento

Executar em ambiente autorizado:

```bash
npm run impact:v2:audit
```

O comando é read-only e gera:

```text
artifacts/reprocess-impact-v2/
  inventory.json
  reanalysis-queue.json
  verified-scoreable.json
  withheld-events.json
  affected-legislators.json
  final-audit.md
```

A migration remota e o preenchimento de `impact_event_attributions` exigem gate humano separado.

## Critério editorial

A unidade de inferência não é a proposição.

É:

```text
assessment textual específico
×
evento nominal específico
×
objeto efetivamente votado
```

Se o vínculo não puder ser demonstrado, o resultado correto é **reter o score**.
