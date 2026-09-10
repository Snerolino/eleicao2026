# QA — fila de recuperação de score ALRS — 2026-09-10

## Objetivo
Recalcular, em modo somente leitura, a fila ALRS de votos nominais pertinentes ainda sem elegibilidade de score, separando lacunas de evento vinculante e votações compostas.

## Entregue e verificado
- Comando: `node scripts/build-alrs-score-recovery-queue.mjs`.
- Artefato: `data/legislative-import/alrs/alrs-score-recovery-queue-v1.json`.
- Envelope: `packet_type=alrs_score_recovery_queue`, `mode=read-only`, `remote_apply=false`.
- Contagens: 152 itens; 87 `event_binding_missing`; 65 `compound_non_separable`; array com 152 itens.
- Cada item preserva URL oficial do Portal da Transparência ALRS. Nenhum score, matriz ou escrita remota foi criado.

## Estado e bloqueios
- Monitor: 4.000 votos factuais, 44.054 linhas ALRS reconciliadas, 0 faltantes, 0 conflitos.
- Os 152 itens permanecem inelegíveis sem evento nominal exato ou separação verificável da votação composta.
- Câmara: `authored_analyzed_projects=2300`, próximo intervalo `2301-2325`; nenhum lote Câmara novo foi promovido neste tick.
- Suite Vitest/TypeScript não concluiu após diagnóstico `UUID inválido ... not-a-uuid`; não tratar como gate verde.

## Gates
- `npm run data:check`: verde — 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: verde — sitemap 1003 candidatos + 2 estáticas; release local `6f29384-20260910T031601099Z`.
- `git diff --check`: verde.
- Sem commit, push ou deploy porque a suite completa não concluiu.

## Próximo passo
Retomar Câmara `2301-2325` com fonte oficial, duas lanes e retenção fail-closed; recuperar ALRS somente com evento oficial independente verificável.
