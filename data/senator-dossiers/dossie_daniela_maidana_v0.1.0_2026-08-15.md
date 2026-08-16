---
document_type: "candidate_legislative_dossier"
title: "Dossie Daniela Maidana - Senado RS 2026"
source_reliability: "official"
candidate_name: "Daniela Maidana da Silva"
ballot_name_2026: "DANIELA MULHERES SOCIALISTAS"
office_2026: "Senadora/Senador - Rio Grande do Sul"
party_2026: "PSTU"
candidate_number_2026: 160
tse_candidate_id_2026: "210002544698"
project_candidate_id_remote: "fc8a96b1-42eb-47d2-b0ea-62c32b68cb71"
project_slug: "daniela_maidana_da_silva_210002544698"
portal_public_claims_at_cutoff: 0
dossier_version: "0.1.0"
schema_reference: "impact-matrix-v1"
methodology_version: "1.0.0"
status: "pending_review"
review_status: "pending_review"
data_cutoff: "2026-08-15"
language: "pt-BR"
legislative_vote_score: null
overall_score: null
---

# Dossiê Legislativo — Daniela Maidana da Silva

**Versão:** 0.1.0  
**Data de corte:** 15/08/2026  
**Status:** referência inicial / `pending_review`  
**Cargo em 2026:** Senado Federal — Rio Grande do Sul  
**Partido:** PSTU  
**Nome de urna:** DANIELA MULHERES SOCIALISTAS  
**Finalidade:** referência documental para o projeto **Voto Pra Quem?**. Este arquivo não publica, recomenda, ranqueia nem substitui revisão humana.

> **Regra central:** fato legislativo, avaliação de impacto e score são camadas diferentes. Ausência de dado produz `null`, nunca nota zero.

## 1. Resumo executivo

Nenhum mandato legislativo anterior foi localizado nas fontes consultadas nesta versão.

A candidatura 2026 está presente no conjunto atual de senadores do projeto com `tse_candidate_id=210002544698`, número 160 e slug `daniela_maidana_da_silva_210002544698`. No corte desta pesquisa, o portal possuía **0 claim(s) pública(s)** associadas a esta candidatura no Supabase do projeto.

**Resultado metodológico desta versão:** `overall_score = null`.

Sem mandato legislativo identificado e sem votos parlamentares localizados; nenhum score pode ser calculado.

## 2. Identificação 2026

| Campo | Valor |
|---|---|
| Nome | Daniela Maidana da Silva |
| Nome de urna | DANIELA MULHERES SOCIALISTAS |
| Partido | PSTU |
| Número | 160 |
| TSE candidate ID | `210002544698` |
| Project candidate ID remoto | `fc8a96b1-42eb-47d2-b0ea-62c32b68cb71` |
| Slug | `daniela_maidana_da_silva_210002544698` |
| Status no banco no corte | `registration_requested` |
| Claims públicas no portal | 0 |

**Fonte de identidade:** snapshot/QA atual do projeto e estado remoto lido em 15/08/2026. A situação eleitoral deve ser revalidada no TSE quando o status de registro mudar.

## 3. Trajetória documentada

- Advogada e militante socialista; em 2026 disputa o Senado pelo PSTU no RS.
- Atuou como advogada do Sindicato dos Trabalhadores em Empresas de Transporte Coletivo de Porto Alegre.
- Iniciou militância no Movimento Mulheres em Luta (MML) e integra a direção estadual da CSP-Conlutas no Rio Grande do Sul.

## 4. Histórico eleitoral adicional

Nenhum resultado eleitoral anterior foi estruturado com segurança nesta primeira versão.

## 5. Universo de votações legislativas

Não foi identificado um universo de votações nominais elegível para cálculo nesta versão. Isso não prova inexistência histórica de todo ato político; indica que não há um denominador legislativo auditado disponível neste dossiê.

## 6. Votações nominais examinadas

Nenhuma votação parlamentar individual foi incorporada a esta versão.

## 7. Evidências políticas não legislativas

| Tema | Grupo v1 | Evidência | Confiança documental | Score? |
|---|---|---|---:|---|
| `direitos_trabalhistas` | `null` | Atuação profissional e sindical ligada a trabalhadores do transporte coletivo e à CSP-Conlutas. | 0.90 | não |
| `mulheres` | `mulheres` | Trajetória de militância iniciada no Movimento Mulheres em Luta. | 0.90 | não |

Esses registros servem para histórico e agenda. **Não são convertidos em votos legislativos.**

## 8. Matriz de Impacto e score

```yaml
methodology_version: "1.0.0"
legislative_vote_score: null
overall_score: null
reason: "no_prior_legislative_roll_call_record_identified"
```

Sem mandato legislativo identificado e sem votos parlamentares localizados; nenhum score pode ser calculado.

### Regras aplicadas

- `score = null` quando não há peso elegível;
- voto factual não recebe direção política automaticamente;
- `unclear` com `defending_vote = null` gera `nao_avaliavel`;
- atuação partidária, sindical, profissional ou executiva fica fora de `legislative_votes`;
- nenhuma comparação entre candidatos é produzida por este dossiê.

## 9. Cobertura desta versão

| Métrica | Valor |
|---|---:|
| Claims públicas já existentes no portal | 0 |
| Universo nominal 2026 identificado | `null` |
| Registros nominais contextualizados aqui | 0 |
| Cobertura nominal detalhada | `null` |
| Score legislativo | `null` |
| Score geral | `null` |
| Versão | `0.1.0` |

## 10. Lacunas prioritárias

- Confirmar sistematicamente no TSE eventual candidatura anterior.
- Localizar documentos primários adicionais sobre atuação sindical e posições programáticas individuais.
- Não converter atuação sindical ou partidária em voto legislativo.

## 11. Fontes

**[S01] Voto Pra Quem? — QA dos majoritários RS 2026**  
https://github.com/Snerolino/eleicao2026/blob/main/docs/qa/majoritarios-gov-sen-2026.md

**[S02] TSE — Portal de Dados Abertos**  
https://dadosabertos.tse.jus.br/

**[S03] Correio do Povo — Eleições 2026: saiba quem é Daniela Maidana da Silva (PSTU)**  
https://www.correiodopovo.com.br/not%C3%ADcias/pol%C3%ADtica/elei%C3%A7%C3%B5es/eleicoes-2026-saiba-quem-e-daniela-maidana-da-silva-pstu-1.1728022

## 12. Registro estruturado resumido

```json
{
  "candidate": {
    "name": "Daniela Maidana da Silva",
    "ballot_name": "DANIELA MULHERES SOCIALISTAS",
    "office_2026": "senador",
    "state": "RS",
    "party_2026": "PSTU",
    "number_2026": 160,
    "tse_candidate_id": "210002544698",
    "project_candidate_id": "fc8a96b1-42eb-47d2-b0ea-62c32b68cb71",
    "slug": "daniela_maidana_da_silva_210002544698"
  },
  "dossier": {
    "version": "0.1.0",
    "data_cutoff": "2026-08-15",
    "methodology_version": "1.0.0",
    "review_status": "pending_review",
    "legislative_vote_score": null,
    "overall_score": null
  },
  "coverage": {
    "portal_public_claims": 0,
    "roll_call_universe_2026": null,
    "roll_call_records_contextualized": 0,
    "detailed_coverage_pct": null
  }
}
```

## 13. Controle de versão

### `0.1.0` — 2026-08-15

Primeiro dossiê estruturado desta candidatura neste lote. Foram adicionados:

- identidade atual no projeto;
- trajetória documentada;
- histórico eleitoral disponível;
- estado de cobertura legislativa;
- votos selecionados, quando existentes;
- evidências não legislativas separadas do score;
- fontes rastreáveis;
- lacunas e próximos passos;
- regra explícita de `score=null` quando a cobertura não permite cálculo auditável.

**Próxima versão sugerida:** `0.2.0` após expansão sistemática das fontes legislativas/eleitorais relevantes.

## 14. Regra de uso

Este documento é uma **fonte de referência**. Campos de interpretação (`beneficiary_group`, `impact_direction`, `defending_vote`, `confidence`, `alignment`, `score`) só podem alimentar a superfície pública após validação metodológica e revisão humana.

Não inferir caráter, recomendação de voto, ranking ou alinhamento ideológico a partir deste arquivo.
