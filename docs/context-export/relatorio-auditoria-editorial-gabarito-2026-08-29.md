# Auditoria editorial integral — gabarito de matérias aprovadas

**Data:** 29/08/2026  
**Arquivo auditado:** `gabarito-materias-aprovadas.json`  
**Escopo:** 350 entradas, 352 assessments.

## Resultado executivo

- Entradas no arquivo original: **350**.
- Assessments no arquivo original: **352**.
- Assessments com grupo fora da taxonomia v1: **226**, em **226 entradas**.
- Entradas com identidade placeholder `number=1/year=2026`: **271**.
- Entradas atingidas por justificativa de template heurístico: **269**.
- Matérias únicas do arquivo reconciliadas e mantidas no gabarito corrigido: **56**.
- Duplicatas reconciliadas e removidas: **15**.
- Entradas retiradas de `approved` e preservadas para nova revisão: **279**.

## Categorias inválidas encontradas

| categoria inválida | assessments |
|---|---:|
| `meio_ambiente_clima` | 127 |
| `servidores_publicos` | 57 |
| `educacao_estudantes` | 22 |
| `saude_usuarios_sus` | 15 |
| `agricultores_familiares` | 3 |
| `micro_pequenos_empreendedores` | 2 |

Essas categorias representam áreas temáticas, profissões ou políticas públicas, não grupos populacionais da taxonomia v1. Elas não podem participar do score.

## Grupos válidos que permanecem no corrigido

| grupo v1 | assessments no corrigido |
|---|---:|
| `mulheres` | 33 |
| `criancas_adolescentes_vulnerabilidade` | 11 |
| `pessoas_com_deficiencia` | 9 |
| `populacao_negra_periferica` | 2 |
| `lgbtqia` | 1 |
| `pessoas_idosas_dependentes` | 1 |

## Correções de julgamento com maior impacto

| matéria | erro anterior | correção |
|---|---|---|
| PLP 230/2025 | `criancas_adolescentes_vulnerabilidade`, positive/SIM, severidade 3 estrutural | `pessoas_com_deficiencia`, **unclear/null**, severidade 2 budgetary |
| PL 408/2025 | `meio_ambiente_clima` | `criancas_adolescentes_vulnerabilidade`, positive/SIM |
| PL 328/2024 | `meio_ambiente_clima` | `pessoas_idosas_dependentes`, positive/SIM |
| PL 163/2025 | `mulheres` | `criancas_adolescentes_vulnerabilidade`, positive/SIM |
| PL 471/2023 | `mulheres` | `criancas_adolescentes_vulnerabilidade`, positive/SIM |
| PL 499/2023 | somente `criancas_adolescentes_vulnerabilidade` | mantém crianças/adolescentes e adiciona `pessoas_com_deficiencia` |
| PL 134/2023 | incluía `trabalhadores_informais` e tratava selo como estrutural | somente `mulheres`; tipo `symbolic`, severidade 2 |
| PL 8/2023 | `meio_ambiente_clima`, estrutural/severidade 4 em uma duplicata | `populacao_negra_periferica`, symbolic/severidade 2 |
| PL 523/2019 | estrutural/severidade 3 | symbolic/severidade 1 |

## Regra aplicada às 279 entradas retidas para revisão

Elas **não foram declaradas falsas**. Foram retiradas do gabarito `approved` porque não foi possível reconciliá-las com uma matriz atualmente aprovada e substantivamente segura. O erro do arquivo era tratá-las como gabarito imutável apesar dessa lacuna. O CSV/JSON de auditoria preserva cada uma, com o motivo da retenção.

## Invariantes do novo gabarito

- Só usa os 14 grupos populacionais v1.
- `unclear` sempre usa `defending_vote = null`.
- `positive`/`negative` só pontuam com `defending_vote` definido.
- Duplicatas são consolidadas por matéria real.
- Itens sem matriz aprovada ficam fora do score, em vez de receber categoria por palavra-chave.
- Nenhuma alteração foi aplicada ao Supabase ou ao repositório por esta auditoria.

## Arquivos entregues

- `gabarito-materias-aprovadas-corrigido-2026-08-29.json`: gabarito limpo.
- `auditoria-editorial-gabarito-2026-08-29.json`: auditoria completa, linha a linha.
- `auditoria-editorial-gabarito-2026-08-29.csv`: mesma auditoria em formato tabular.
