# QA — Impact Event Attribution v2 — dry-run pré-migration

Data: 2026-09-20  
Modo: read-only  
Projeto Supabase consultado: `eleicao2026`  
Mutação remota: **não**  
Deploy: **não**

## Estado observado

A leitura do banco remoto encontrou:

| Métrica | Valor |
|---|---:|
| Matrizes de impacto | 66 |
| Assessments | 68 |
| Versões com assessment publicável | 66 |
| Eventos associados a essas versões | 132 |
| Pares evento × assessment | 136 |
| Linhas factuais consideradas nos pares | 2.396 |
| Linhas do índice de votos nos 132 eventos | 2.318 |
| Candidatos distintos no índice afetado | 79 |

Distribuição dos eventos avaliados:

- ALRS: 130 eventos, 134 pares evento × assessment, 64 versões;
- Câmara: 2 eventos, 2 pares evento × assessment, 2 versões.

## Achado crítico

Das 66 versões avaliadas:

- **2** possuem apenas um evento;
- **64** possuem múltiplos eventos;
- uma mesma versão possui até **4 eventos**.

Isso confirma que uma atribuição armazenada somente no assessment da versão não pode representar com segurança todos os eventos ligados àquela versão.

## Estado da atribuição v1.1

No remoto atual:

- 68/68 assessments têm o legado `score_eligible=true`;
- 0/68 possuem `event_defending_vote` preenchido;
- `impact_event_attributions` ainda não existe, como esperado antes da migration v2.

Portanto, sob o gate v2, **nenhum dos 136 pares evento × assessment deve ser considerado automaticamente pontuável** antes do reprocessamento documental.

Isso não significa que os 136 sejam inválidos. Significa apenas que o sistema ainda não possui evidência persistida no nível correto para decidir quais são scoreáveis.

## Comportamento esperado depois desta branch

Antes da migration remota:

- o frontend falha fechado;
- scores legados não são ressuscitados;
- votos factuais continuam visíveis;
- score por categoria pode aparecer como não avaliado.

Depois da migration, mas antes da revisão dos eventos:

- os eventos continuam retidos;
- somente registros v2 aprovados com fontes passam a pontuar.

Depois do reprocessamento:

- `isolated` e `compound_separable` aprovados podem ser scoreáveis;
- `compound_non_separable`, `procedural` e `event_binding_missing` permanecem sem score.

## Gate ainda pendente

Não executar ainda:

1. migration remota;
2. inserção/revisão de atribuições;
3. recálculo persistido;
4. deploy para produção.

Esses passos dependem da revisão do PR e de autorização humana específica.
