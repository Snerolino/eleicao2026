# Guia e Contrato do Gabarito Universal de Matérias Legislativas

**Arquivo canônico de dados:** [`data/impact-matrices/gabarito-materias-aprovadas.json`](../../data/impact-matrices/gabarito-materias-aprovadas.json)  
**Schema de validação:** [`schemas/impact-matrix-v1.schema.json`](../../schemas/impact-matrix-v1.schema.json)  
**Status:** Versão 1.0.0 (Fonte Única de Verdade Multiagente)

---

## 1. Objetivo e Princípio de Reuso

O **Gabarito Universal de Matérias** armazena a análise substantiva aprovada de cada proposição legislativa (leis, PECs, PLPs, MPs) das casas legislativas (**ALRS**, **Câmara dos Deputados**, **Senado Federal**).

* **Análise Única:** Cada matéria é classificada **apenas uma vez** quanto aos grupos populacionais afetados, direção de impacto (`positive`, `negative`, `mixed`, `unclear`) e voto defensor (`defending_vote`: `"sim"` | `"nao"` | `null`).
* **Reuso Multiagente:** Qualquer agente (Hermes, Codex, OpenCode, Antigravity) que analisar uma nova matéria aprovada deve adicioná-la a este arquivo.
* **Multiplicação Automática:** As pontuações e perfis de todos os candidatos que votaram naquela matéria são calculados instantaneamente com base neste gabarito.

---

## 2. Estrutura do Gabarito (`gabarito-materias-aprovadas.json`)

```json
{
  "schema_version": "1.0.0",
  "methodology_version": "1.0.0",
  "title": "Matriz Gabarito de Proposições Legislativas Aprovadas",
  "propositions": [
    {
      "proposition_id": "alrs:pl-77-2025",
      "house": "alrs",
      "type": "pl",
      "number": "77",
      "year": 2025,
      "title": "Ampliação de mecanismos de proteção a vítimas com medidas protetivas de urgência",
      "official_source_url": "https://transparencia.al.rs.gov.br/parlamentares/votos-plenario",
      "official_source_label": "ALRS Sistema Legis — votação 10/03/2026",
      "severity": 4,
      "structural_type": "structural",
      "review_status": "approved",
      "assessments": [
        {
          "group": "mulheres",
          "impact_direction": "positive",
          "defending_vote": "sim",
          "confidence": 0.95,
          "rationale": "Ampliação de mecanismos de proteção a vítimas...",
          "sources": ["https://transparencia.al.rs.gov.br/..."]
        }
      ]
    }
  ]
}
```

---

## 3. Regras para os Agentes Adicionarem Novas Matérias

1. **Idempotência por `proposition_id`:** O ID deve ser único no formato `<casa>:<tipo>-<numero>-<ano>` (ex: `camara:plp-230-2025`, `alrs:pec-305-2026`).
2. **Defending Vote estrito:**
   - `positive` ou `negative` ➔ `defending_vote` **obrigatório** (`"sim"` ou `"nao"`).
   - `unclear` ➔ `defending_vote` deve ser `null`.
   - `mixed` ➔ `defending_vote` pode ser `"sim"`, `"nao"` ou `null` com justificativa no rationale.
3. **Fontes Oficiais Obrigatórias:** Todo assessment deve conter links para as fontes primárias institucionais (`sources[]`).
4. **Validação:** Ao adicionar ou editar entradas, rodar `npm run test` e a validação de schema.
