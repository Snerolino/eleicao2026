# QA — precedência de fonte oficial sobre dataset2026

**Data:** 2026-08-20

## Regra implementada

Quando a mesma chave factual aparece no `dataset2026` e em fonte oficial
primária com valores divergentes, a fonte oficial vence automaticamente. O
registro inferior é descartado apenas na camada resolvida e permanece no relatório
`discarded` com campos conflitantes.

## Exceção controlada

O mirror local `dataset2026` que carrega `official_url` e hash do TSE é tratado
como evidência oficial TSE. Ele não é descartado por ser local.

## Artefatos

- `scripts/lib/source-precedence.mjs` — classificação e resolução;
- `scripts/apply-source-precedence.mjs` — CLI dry-run, sem escrita remota;
- `npm run data:source:precedence` — comando;
- `docs/architecture/politica-precedencia-fontes.md` — contrato.

## Verificação

- conflito oficial vs dataset: fonte oficial selecionada;
- campos divergentes registrados;
- mirror TSE oficial preservado;
- **3/3 testes focais**;
- **84 arquivos / 377 testes**;
- TypeScript, schema, data-check e build: verdes.

Nenhum dado remoto ou snapshot público foi alterado neste lote; a política passa a
ser obrigatória para os próximos merges de dados.
