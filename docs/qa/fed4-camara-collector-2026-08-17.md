# QA — FED-4: coletor oficial Câmara em dry-run

**Data:** 2026-08-17
**Status:** piloto concluído; nenhuma carga remota executada

## Coletor

Criado `scripts/collect-camara-votes.mjs`, somente leitura, sem `--apply`.

Para cada `vote_id`, o coletor consulta:

- `GET /api/v2/votacoes/{id}`
- `GET /api/v2/votacoes/{id}/votos`

O JSON bruto é preservado localmente para auditoria, mas não entra no Git:
`*.raw.json` pode conter campos institucionais extras e fica protegido pelo
`.gitignore`. O envelope factual e o manifesto são versionáveis.

## Piloto PLP 230/2025

Evento consultado:

```text
2580259-24
```

Resultado oficial:

- registros brutos retornados: **425**
- método: **nominal**
- individualizado: **sim**
- votos normalizáveis no recorte RS: **29**
- votos fora do RS excluídos do envelope: **395**
- registros não normalizáveis/excluídos: **1**
- proposições: **1**
- versões: **1**
- eventos: **1**

O filtro `siglaUf=RS` é aplicado ao envelope, não ao bruto. O pacote inclui
Marcel van Hattem como regressão factual quando o registro oficial o contém;
o catálogo de identidade continua sendo o gate separado para vincular candidato.

## Salvaguardas

- Sem Supabase, secrets ou mutação remota.
- Sem fuzzy matching.
- Valores desconhecidos não são convertidos silenciosamente.
- Evento sem votos individuais não gera votos individuais.
- Votação simbólica não é convertida em `sim`.
- Votos entram sem `impact`, `alignment`, `score` ou `defending_vote`.
- O pacote passa pelo `import-legislative-dry-run` existente.
- `--apply` é rejeitado pelo coletor.

## Artefatos

- `scripts/collect-camara-votes.mjs`
- `scripts/__tests__/collect-camara-votes.test.mjs`
- `data/legislative-import/camara/collector-pilot/2580259-24.json`
- `data/legislative-import/camara/collector-pilot/manifest.json`
- bruto local: `2580259-24.raw.json` (não versionado)

## Limitações conhecidas

- A descoberta ampla por intervalo de datas da API retornou lista vazia para o
  recorte testado; o coletor atual trabalha com IDs de votação conhecidos.
- A versão textual integral não é baixada neste gate; o envelope usa hash
  determinístico da ementa/ID e mantém a URL oficial. A coleta de inteiro teor
  fica para FED-5/FED-6 antes de qualquer impacto.
- A classificação de ausência como `justificada` é apenas uma normalização
  operacional provisória para o contrato atual; não significa juízo político.

## Próximo passo

FED-5: transformar o piloto em lote factual de 3–5 candidatos com vínculo
institucional validado, começando por Marcel como regressão e adicionando apenas
identidades resolvidas ou explicitamente pendentes.
