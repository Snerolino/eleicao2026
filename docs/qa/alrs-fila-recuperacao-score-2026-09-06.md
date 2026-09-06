# QA — fila de recuperação de score ALRS — 2026-09-06

## Resultado

Dos votos ALRS relacionados às categorias populacionais, **149** ainda não podem receber score com segurança:

- `event_binding_missing`: **85**;
- `compound_non_separable`: **64**.

## Interpretação

- `event_binding_missing`: o voto tem categoria e, em alguns casos, voto defensor textual, mas não há vínculo exato do evento nominal que permita atribuir o score à versão correta.
- `compound_non_separable`: a votação combina matéria, preferência, emenda, veto ou outro objeto sem separação segura; não deve herdar impacto da matéria principal.

## Ação

A fila versionada foi criada em:

`data/legislative-import/alrs/alrs-score-recovery-queue-v1.json`

O comando é somente leitura e idempotente:

`npm run impact:alrs:score-recovery-queue`

Cada item preserva candidato, proposição, grupo, voto, data, fonte e resolução exigida. Nenhum score foi fabricado ou aplicado.

## Próximo passo

Recuperar o identificador/evento oficial exato dos 85 casos e separar os 64 compostos com evidência oficial. Só depois recalcular pontuação e profiles.
