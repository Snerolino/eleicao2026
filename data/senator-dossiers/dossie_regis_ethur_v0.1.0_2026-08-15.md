---
document_type: "candidate_legislative_dossier"
title: "Dossie Regis Ethur - Senado RS 2026"
source_reliability: "official"
candidate_name: "Regis Batista Ethur"
ballot_name_2026: "REGIS ETHUR"
office_2026: "Senadora/Senador - Rio Grande do Sul"
party_2026: "PSTU"
candidate_number_2026: 161
tse_candidate_id_2026: "210002544699"
project_candidate_id_remote: "f22a1162-28a9-470e-b34f-7de47def92a2"
project_slug: "regis_batista_ethur_210002544699"
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

# Dossiê Legislativo — Regis Batista Ethur

**Versão:** 0.1.0  
**Data de corte:** 15/08/2026  
**Status:** referência inicial / `pending_review`  
**Cargo em 2026:** Senado Federal — Rio Grande do Sul  
**Partido:** PSTU  
**Nome de urna:** REGIS ETHUR  
**Finalidade:** referência documental para o projeto **Voto Pra Quem?**. Este arquivo não publica, recomenda, ranqueia nem substitui revisão humana.

> **Regra central:** fato legislativo, avaliação de impacto e score são camadas diferentes. Ausência de dado produz `null`, nunca nota zero.

## 1. Resumo executivo

Nenhum mandato legislativo anterior foi localizado nesta versão.

A candidatura 2026 está presente no conjunto atual de senadores do projeto com `tse_candidate_id=210002544699`, número 161 e slug `regis_batista_ethur_210002544699`. No corte desta pesquisa, o portal possuía **0 claim(s) pública(s)** associadas a esta candidatura no Supabase do projeto.

**Resultado metodológico desta versão:** `overall_score = null`.

Há histórico eleitoral e sindical, mas não mandato legislativo identificado. Sem votos parlamentares, score legislativo = null.

## 2. Identificação 2026

| Campo | Valor |
|---|---|
| Nome | Regis Batista Ethur |
| Nome de urna | REGIS ETHUR |
| Partido | PSTU |
| Número | 161 |
| TSE candidate ID | `210002544699` |
| Project candidate ID remoto | `f22a1162-28a9-470e-b34f-7de47def92a2` |
| Slug | `regis_batista_ethur_210002544699` |
| Status no banco no corte | `registration_requested` |
| Claims públicas no portal | 0 |

**Fonte de identidade:** snapshot/QA atual do projeto e estado remoto lido em 15/08/2026. A situação eleitoral deve ser revalidada no TSE quando o status de registro mudar.

## 3. Trajetória documentada

- Professor da rede pública estadual e bancário.
- A cobertura de 2026 registra mais de quatro décadas de atuação ligada a lutas de trabalhadores.
- Foi diretor do CPERS-Sindicato nas gestões 2008–2014.
- O resultado oficial do TRE-RS de 1998 registra candidatura a deputado federal pelo PSTU, número 1601, com 99 votos.
- Em 2026 concorre ao Senado pelo PSTU.

## 4. Histórico eleitoral adicional

- 1998 — candidato a deputado federal pelo PSTU, número 1601; 99 votos no resultado oficial do TRE-RS.

## 5. Universo de votações legislativas

Não foi identificado um universo de votações nominais elegível para cálculo nesta versão. Isso não prova inexistência histórica de todo ato político; indica que não há um denominador legislativo auditado disponível neste dossiê.

## 6. Votações nominais examinadas

Nenhuma votação parlamentar individual foi incorporada a esta versão.

## 7. Evidências políticas não legislativas

| Tema | Grupo v1 | Evidência | Confiança documental | Score? |
|---|---|---|---:|---|
| `educacao_trabalho` | `null` | Trajetória sindical documentada em educação pública e representação de trabalhadores. | 0.92 | não |

Esses registros servem para histórico e agenda. **Não são convertidos em votos legislativos.**

## 8. Matriz de Impacto e score

```yaml
methodology_version: "1.0.0"
legislative_vote_score: null
overall_score: null
reason: "no_prior_legislative_roll_call_record_identified"
```

Há histórico eleitoral e sindical, mas não mandato legislativo identificado. Sem votos parlamentares, score legislativo = null.

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

- Pesquisar sistematicamente outras candidaturas no histórico TSE.
- Verificar eventuais funções sindicais posteriores a 2014 em fonte primária.
- Não converter representação sindical em score parlamentar.

## 11. Fontes

**[S01] Voto Pra Quem? — QA dos majoritários RS 2026**  
https://github.com/Snerolino/eleicao2026/blob/main/docs/qa/majoritarios-gov-sen-2026.md

**[S02] Correio do Povo — Eleições 2026: saiba quem é Regis Ethur (PSTU)**  
https://www.correiodopovo.com.br/not%C3%ADcias/pol%C3%ADtica/elei%C3%A7%C3%B5es/eleicoes-2026-saiba-quem-e-regis-ethur-pstu-1.1728009

**[S03] TRE-RS — apuração oficial 1998, deputado federal**  
https://resultados.tre-rs.jus.br/eleicoes/1998/1oturno/fed_tot_dec_vot.html

## 12. Registro estruturado resumido

```json
{
  "candidate": {
    "name": "Regis Batista Ethur",
    "ballot_name": "REGIS ETHUR",
    "office_2026": "senador",
    "state": "RS",
    "party_2026": "PSTU",
    "number_2026": 161,
    "tse_candidate_id": "210002544699",
    "project_candidate_id": "f22a1162-28a9-470e-b34f-7de47def92a2",
    "slug": "regis_batista_ethur_210002544699"
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
