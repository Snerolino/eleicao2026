# QA — auditoria de colisões de version_key ALRS

**Data:** 2026-08-21

## Resultado read-only

- chaves duplicadas: **18**;
- `proposition_version_id` afetados: **65**;
- eventos afetados: **65**;
- escrita remota: nenhuma;
- status de todos: `blocked_until_official_version_identity`.

A diferença para a contagem de 64 itens do pacote prioritário ocorre porque este
relatório audita a fila ALRS completa, não apenas P0/P1.

## Regra

`version_key` sozinho não pode identificar uma matriz quando há mais de uma
`proposition_version_id`. A matriz só poderá ser criada após confirmar, na fonte
official, o texto/versão correspondente a cada evento.

## Artefato

```text
data/legislative-import/alrs/version-key-collision-audit-v1.json
scripts/audit-alrs-version-key-collisions.mjs
npm run impact:alrs:r4:collisions
```
