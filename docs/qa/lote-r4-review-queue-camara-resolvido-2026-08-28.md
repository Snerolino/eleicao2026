# Relatório de QA — Fila de Revisão R4 Câmara (Q2/Q3) Resolvida

**Data:** 2026-08-28  
**Status:** APROVADO (`approved`)  
**Arquivo de Origem:** [`data/legislative-import/camara/r4-review-queue-q2-q3.json`](../../data/legislative-import/camara/r4-review-queue-q2-q3.json)  
**Matriz Canônica Atualizada:** [`data/impact-matrices/gabarito-materias-aprovadas.json`](../../data/impact-matrices/gabarito-materias-aprovadas.json)

---

## 1. Resumo da Resolução

Todas as 13 proposições e versões legislativas da fila R4 (coletores Q2 e Q3 da Câmara dos Deputados) foram devidamente analisadas, revisadas e classificadas conforme o Guia Editorial e o schema canônico (`impact-matrix-v1.schema.json`):

| Categoria Editorial | Quantidade | Destino / Tratamento |
| :--- | :--- | :--- |
| **Procedimentais / Urgência / Retirada de Pauta** | **8** | Classificadas como `procedural_only` (não herdam pontuação de mérito). |
| **Sem Grupo Populacional Afetado** | **2** | Classificadas como `no_direct_population_group` (regulação tributária/processual neutra). |
| **Lacuna de Taxonomia v1** | **1** | Classificada como `taxonomy_gap` (`pescadores_artesanais`). |
| **Avaliação Substantiva Aprovada** | **1** | **PLP 41/2024** (`event-2606313-36`) ➔ Grupo `mulheres`, direção `positive`, voto defensor `sim`. |

---

## 2. Detalhe da Matriz Substantiva Incorporada ao Gabarito

* **Proposição:** PLP 41/2024 (Votação 2606313-36)
* **Título:** Política Nacional de Prevenção e Enfrentamento da Violência contra Mulheres e Feminicídio
* **Casa:** Câmara dos Deputados
* **Severidade:** 4
* **Tipo Estrutural:** `structural`
* **Grupo Canônico:** `mulheres`
* **Direção do Impacto:** `positive`
* **Voto Defensor (`defending_vote`):** `"sim"`
* **Confiança:** 0.99
* **Rationale:** *"O substitutivo cria estrutura nacional de prevenção e enfrentamento da violência contra meninas e mulheres, incluindo feminicídio; voto SIM aprova o instrumento de proteção."*
* **Fontes Oficiais:**
  - `https://dadosabertos.camara.leg.br/api/v2/proposicoes/2606313`
  - `https://dadosabertos.camara.leg.br/api/v2/votacoes/2606313-36`
  - `https://dadosabertos.camara.leg.br/api/v2/votacoes/2606313-36/votos`

---

## 3. Garantias Metodológicas e Rastreabilidade

- Nenhum voto factual bruto de parlamentar foi modificado.
- Os 12 itens não-pontuáveis permanecem transparentemente catalogados com seus motivos oficiais na fila revisada.
- O PLP 41 passa a alimentar o score da categoria **Mulheres** para todos os deputados federais e senadores com histórico na Câmara.
