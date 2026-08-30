# Guia e Contrato do Gabarito Universal de Matérias Legislativas

**Arquivo canônico de dados:** [`data/impact-matrices/gabarito-materias-aprovadas.json`](../../data/impact-matrices/gabarito-materias-aprovadas.json)  
**Schema de validação:** [`schemas/impact-matrix-v1.schema.json`](../../schemas/impact-matrix-v1.schema.json)  
**Status:** Versão 1.1.0 (Fonte Única de Verdade Multiagente — Metodologia v1.1)

---

## 1. Objetivo e Princípio de Reuso

O **Gabarito Universal de Matérias** armazena a análise substantiva aprovada de cada proposição legislativa (leis, PECs, PLPs, MPs) das casas legislativas (**ALRS**, **Câmara dos Deputados**, **Senado Federal**).

* **Unidade Concreta de Análise:** A análise não presume que toda votação de uma proposição possui o mesmo mérito. A unidade de classificação respeita a cadeia:
  `proposition -> proposition_version -> voting_event -> object_voted -> assessment -> score_eligible`.
* **Taxonomia v1.1:** 21 grupos populacionais canônicos fechados (sem inventar grupos genéricos como "população geral" ou confundir temas/atores econômicos com grupos populacionais).
* **Separação entre Efeito Textual e Atribuibilidade do Voto:**
  - `textual_defending_vote`: sentido puro do texto legal para o grupo (`sim` | `nao` | `null`).
  - `event_defending_vote`: sentido do voto no evento concreto (`sim` | `nao` | `null`).
  - `score_eligible`: indica se o evento concreto permite atribuir pontuação individual ao parlamentar (`false` em votações compostas não separáveis, procedimentais ou de destaques sem vínculo com dispositivo específico).
* **Multiplicação Determinística:** As pontuações dos parlamentares são derivadas exclusivamente a partir de eventos com `score_eligible = true` e `event_defending_vote in ('sim', 'nao')`.

---

## 2. Estrutura do Gabarito (`gabarito-materias-aprovadas.json`)

```json
{
  "schema_version": "1.1.0",
  "methodology_version": "1.1.0",
  "title": "Matriz Gabarito de Proposições Legislativas Aprovadas",
  "propositions": [
    {
      "proposition_id": "camara:plp-230-2025",
      "house": "camara",
      "type": "plp",
      "number": "230",
      "year": 2025,
      "title": "Conectividade de escolas públicas e regime orçamentário do FUST",
      "official_source_url": "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2480000",
      "official_source_label": "Câmara dos Deputados — PLP 230/2025",
      "severity": 3,
      "structural_type": "budgetary",
      "review_status": "approved",
      "assessments": [
        {
          "group": "estudantes",
          "impact_direction": "positive",
          "textual_defending_vote": "sim",
          "event_defending_vote": null,
          "defending_vote": null,
          "score_eligible": false,
          "vote_attribution_status": "compound_non_separable",
          "confidence": 0.97,
          "rationale": "Garante internet de banda larga em escolas públicas de educação básica. O voto no substitutivo global uniu conectividade a regras fiscais/executórias de telecomunicações; não é seguro atribuir o NÃO individual a uma posição anti-estudante.",
          "sources": ["https://www.camara.leg.br/..."]
        }
      ]
    }
  ]
}
```

---

## 3. Regras para os Agentes Adicionarem Novas Matérias

1. **Idempotência por `proposition_id`:** O ID deve ser único no formato `<casa>:<tipo>-<numero>-<ano>` (ex: `camara:plp-230-2025`, `alrs:pl-98-2024`).
2. **Defending Vote e Atribuibilidade:**
   - Votação isolada unívoca: `score_eligible: true`, `event_defending_vote: "sim"|"nao"`.
   - Votação composta não separável: `score_eligible: false`, `event_defending_vote: null`, `defending_vote: null`, `vote_attribution_status: "compound_non_separable"`.
   - Votação procedimental (urgência/retirada): `score_eligible: false`, `vote_attribution_status: "procedural"`.
3. **Fontes Oficiais Substantivas Obrigatórias:** Todo assessment deve conter links para o texto normativo/parecer (`sources[]`). Fontes genéricas de votação nominal não substituem a prova do texto votado.
4. **Validação:** Ao adicionar ou editar entradas, rodar `npm run test` e `node scripts/validate-impact-schema.mjs`.
