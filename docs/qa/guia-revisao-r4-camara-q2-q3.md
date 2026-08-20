# Guia de revisão R4 — Câmara Q2/Q3

## Objetivo

Revisar cada versão da fila `data/legislative-import/camara/r4-review-queue-q2-q3.json`
sem alterar o fato nominal já publicado.

## Procedimento por item

1. Abra a `proposition_external_id` e `version_key` do item.
2. Leia a proposição e a versão na fonte Câmara indicada em `source_urls`.
3. Confirme qual grupo populacional é diretamente afetado pela versão, sem usar o
   partido ou o voto do candidato como evidência do grupo.
4. Selecione somente grupos da taxonomia oficial:
   `povos_indigenas`, `comunidades_quilombolas`, `populacao_negra_periferica`,
   `mulheres`, `lgbtqia`, `pessoas_com_deficiencia`, `populacao_rua`,
   `populacao_carceraria`, `criancas_adolescentes_vulnerabilidade`,
   `pessoas_idosas_dependentes`, `trabalhadores_informais`,
   `agricultura_familiar_sem_terra`, `povos_de_terreiro`,
   `imigrantes_refugiados`.
5. Registre `impact_direction`: `positive`, `negative`, `mixed` ou `unclear`.
6. Registre `defending_vote` apenas para `positive`/`negative`; use `null` para
   `unclear`. Não deduza o voto defensor sem justificativa.
7. Escreva rationale com pelo menos 20 caracteres, citando a versão e a fonte.
8. Vincule pelo menos uma `source_reference` oficial.
9. Mantenha `review_status=pending_review` até a revisão final.

## Checklist de segurança

- `SIM`/`NÃO` continuam fatos; não são impacto automaticamente.
- Não usar ranking, recomendação ou afinidade política.
- Não alterar `legislative_votes` durante revisão editorial.
- Não preencher grupo quando a fonte não for suficiente: use `unclear` ou deixe o
  item pendente.
- Não aprovar via RPC sem revisão humana registrada.

## Validação

```bash
node scripts/validate-impact-schema.mjs
npm run test
npm run build
```

A aprovação deve ser feita uma versão por vez, com fonte, rationale, confiança e
revisão registrada. Até lá, a comparação pública exibe somente o recorte já
aprovado e mostra cobertura insuficiente para os demais itens.
