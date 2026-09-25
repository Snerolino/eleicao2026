# Relatório de estado ALRS — 2022 até o presente

Gerado em 2026-09-25T01:49:27.853Z. Auditoria somente leitura; nenhuma mutação remota foi executada.

## Estado factual remoto

- eventos ALRS: **2281**;
- votos nominais indexados: **31722**;
- candidatos com votos: **52**;
- perfis ALRS: **52**;
- eventos sem fonte: **1365**;
- assessments: **68**;
- matrizes aprovadas/contestadas: **66**.

| Ano | Eventos | Sem fonte |
|---:|---:|---:|
| 2022 | 382 | 191 |
| 2023 | 362 | 176 |
| 2024 | 365 | 182 |
| 2025 | 421 | 208 |
| 2026 | 751 | 608 |

## Estado editorial e v2

- disposições aprovadas: **1179**;
- disposições needs_changes: **24**;
- disposições não terminais: **0**;
- atribuições evento–assessment v2: **0**;
- atribuições v2 elegíveis para score: **0**;
- pendências da lane editorial ativa: **0**.

## Inventário de liberação

- itens evento × assessment: **114**;
- factual_ready: **0**;
- impact_ready_for_review: **0**;
- impact_release_ready: **0**;
- withheld_source: **114**;
- withheld_attribution: **0**;
- piloto: **blocked_no_eligible_items**, selecionados: **0**.

## Gargalo principal

- Não existem atribuições evento–assessment v2; por isso não há score v2 elegível.
- 1365 eventos ALRS não possuem source_reference_id.
- 18 chaves de colisão afetam 65 versões e 93 eventos.
- A fila de recuperação contém 152 itens, dos quais 87 sem vínculo de evento e 65 compostos não separáveis.

O gargalo semântico principal é a ausência de atribuições v2 por evento. A fila de disposição editorial não é o bloqueio atual: a leitura remota está confirmada e não há pendências ativas.

## Melhorias implementadas

1. Este comando consolida contagens remotas e artefatos locais em uma única leitura reproduzível, evitando decisões baseadas em snapshots antigos.
2. O monitor deve distinguir fila editorial ativa, corpus factual, fontes, colisões e atribuições v2; nenhuma dessas camadas é usada como substituta de outra.
3. A fila v2 permanece dry-run/fail-closed: nenhum score é promovido sem fonte do evento, voto defensor explícito, separação de evento e revisão.
4. Colisões e compostos permanecem em filas próprias, sem matching por título ou inferência de voto.

## Próximo plano eficiente

- priorizar um piloto de 5–10 eventos simples com fonte oficial e zero colisões;
- gerar envelopes de atribuição 'pending_review', sem apply remoto;
- revisar e aprovar atribuições pela RPC protegida;
- executar read-back e segunda passagem idempotente;
- só então recalcular scores e perfis;
- continuar em paralelo a recuperação de fontes dos 1365 eventos restantes.

## Colisões locais

- chaves: **18**;
- versões afetadas: **65**;
- eventos afetados: **93**.

