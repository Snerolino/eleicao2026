# QA — pacote de resolução de colisões ALRS

**Data:** 2026-08-21

## Resultado

- 18 chaves duplicadas auditadas;
- 8 grupos classificados tecnicamente como possível mesmo texto em eventos
  diferentes;
- 10 grupos classificados como possível divergência de identidade/hash;
- 65 versões e eventos afetados no inventário completo;
- todos `needs_official_text_hash_review`;
- `human_review_required=true`;
- `remote_apply=false`.

Atualização por scout oficial: 6 colisões `alrs-*` foram confirmadas como
proposições diferentes no mesmo evento plenário, com data oficial `2026-08-11`,
URL e SHA-256. Elas não devem ser agrupadas pelo `version_key`; a resolução é
carregada pelo gerador em `version-key-collision-resolutions-confirmed.json`.
As outras 12 colisões continuam bloqueadas.

## Regra

A hipótese técnica não resolve a colisão. Cada grupo precisa confirmar, em fonte
oficial, se:

1. é o mesmo texto votado em eventos diferentes, permitindo uma matriz comum; ou
2. são versões distintas, exigindo chaves/text hashes distintos e matrizes
   independentes.

## Artefato

```text
data/legislative-import/alrs/version-key-collision-resolution-pack-v1.json
scripts/build-alrs-version-collision-resolution-pack.mjs
scripts/__tests__/build-alrs-version-collision-resolution-pack.test.mjs
npm run impact:alrs:r4:collision:pack
```
