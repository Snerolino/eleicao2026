# QA — FED-19: batch Câmara Q1/2026 em dry-run

**Data:** 2026-08-18
**Modo:** coleta oficial read-only e dry-run factual

## Descoberta e coleta

- Janela: 2026-01-01 a 2026-03-31
- endpoint: `/api/v2/votacoes`
- eventos descobertos: **100**
- eventos nominais: **10**
- eventos sem votos individuais: **90**
- votos RS nos envelopes nominais: **268**
- envelopes gerados: **10**
- envelopes validados pelo importer: **10/10**
- simbólicos convertidos em votos: **0**

Os 90 eventos sem individualização não geraram envelopes factuais.

## Identidade

Comparação contra `remote-catalog.json`:

- votos com parlamentar remoto resolvido: **35**
- votos ainda pendentes de identidade: **233**
- nenhum pendente foi aplicado ou tratado como ausência de mandato.

O lote permanece em `dry-run`; a chave `remote-catalog-extended.json` não foi
usada por conter UUIDs não verificados.

## Artefatos versionados

- `data/legislative-import/camara/collector-2026-q1/manifest.json`
- `data/legislative-import/camara/collector-2026-q1/scout-summary.json`
- 10 envelopes JSON nominais derivados

HTML/JSON bruto foi removido da worktree e não entra no Git.

## Gate

Nenhuma escrita Supabase, migration, RPC de aprovação ou matriz de impacto foi
executada. Próximo passo seguro: resolver os 233 votos por `tse_candidate_id`,
sem fuzzy matching, antes de ampliar o envelope aplicável.
