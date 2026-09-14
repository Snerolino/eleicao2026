# Revisão editorial final P2 ALRS — 15 itens — 2026-09-13

## Estado

Revisão recebida e incorporada localmente em `data/legislative-import/alrs/p2-external-editorial-dispositions-15-v1.json`.

- `remote_apply=false`.
- `public_approval=false`.
- `batch_hash_basis=external_source_batch`.
- A alteração revisa duas decisões anteriores; não é uma nova aprovação remota.

## Totais revisados

- `assess`: **4**
- `no_direct_population_group`: **9**
- `taxonomy_gap`: **2**
- `excluded`: **0**

## Correções aplicadas

- `PL-350-2011`:
  - anterior: `no_direct_population_group`;
  - atual: `assess`;
  - grupo: `populacao_carceraria`;
  - direção inicial: `unclear`;
  - `score_eligible=false`;
  - tipo estrutural inicial: `structural`.
- `PL-434-2023`:
  - anterior: `no_direct_population_group`;
  - atual: `taxonomy_gap`;
  - motivo: comunidades potencialmente afetadas e público diretamente impactado, sem grupo canônico v1.1 equivalente.

## Assessments encaminhados

- `PL-43-2019` → `mulheres`.
- `PL-350-2011` → `populacao_carceraria`, direção `unclear`, sem score.
- `PL-377-2023` → `servidores_publicos`.
- `PL-27-2024` → `lgbtqia`.

## Lacunas de taxonomia

- `PL-434-2023` → comunidades/pessoas diretamente afetadas por barragens.
- `PR-6-2022` → profissionais/realizadores do audiovisual.

## Gate seguinte

A revisão precisa passar pelo fluxo autenticado do `/admin`. Como as 15 versões aparecem no catálogo local como já resolvidas, o próximo writer remoto deve tratá-las como **revisão explícita de decisão existente**, não como insert cego. O apply deve exigir proveniência da revisão, preservar `review_key`, executar read-back e provar idempotência. Nenhuma matriz ou score deve ser criado nesta etapa.

Fontes declaradas no pacote revisado: páginas oficiais ALRS, PGE/Diário Oficial, Leis Estaduais, Secretaria da Educação, RRF/RS e demais URLs anexadas pelo revisor.
