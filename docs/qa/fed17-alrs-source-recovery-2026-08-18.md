# QA — FED-17: recuperação parcial de fontes ALRS

**Data:** 2026-08-18
**Modo:** evidência oficial, dry-run, aplicação idempotente e auditoria read-only

## Resultado aplicado

- 5 páginas ALRS oficiais verificadas com HTTP 200, hash SHA-256 e contagem de bytes.
- 5 IDs oficiais de parlamentar resolvidos por catálogo da página institucional.
- 2 eventos elegíveis por data, proposição e voto:
  - `alrs_pl134_2023`
  - `alrs_pl77_2025`
- 10 votos receberam `source_reference_id`.
- 5 `source_references` oficiais foram criadas.
- Primeira aplicação: `updated_votes=10`.
- Segunda aplicação: `updated_votes=0`.

## Bloqueios preservados

- `alrs_pl165_2025`: página oficial encontrada em 10/03/2026, remoto em 14/04/2026.
- `alrs_pl361_2025`: página oficial encontrada em 07/04/2026, remoto em 28/04/2026.
- `alrs_pl38_2026`: dois registros oficiais para o mesmo parlamentar/proposição/data.
- Enio Carlos Terra (`210002534312`): não aparece no catálogo oficial atual de opções ALRS.

Nenhum desses casos foi vinculado por aproximação.

## Auditoria pós-aplicação

- votos ALRS com fonte: **3985/4000**
- votos ALRS sem fonte: **15**
- fila restante:
  - PL134/2023: 1 (Enio)
  - PL165/2025: 6
  - PL361/2025: 6
  - PL38/2026: 1
  - PL77/2025: 1 (Enio)

`npm run impact:sources:audit -- --strict` permanece código 2 corretamente, pois
há lacunas factuais reais.

## Artefatos

- `data/legislative-import/alrs-fed17/recovery-manifest.json`
- `scripts/backfill-alrs-missing-sources.mjs`
- `scripts/__tests__/backfill-alrs-missing-sources.test.mjs`
- `npm run impact:alrs:sources:backfill`

O comando é dry-run por padrão; `--apply` só atualiza votos com hash, URL,
proposição, data-calendário, candidato e valor validados.
