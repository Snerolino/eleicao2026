# Fotos oficiais de candidaturas — atualização 2026

Fonte primária usada: ZIP oficial TSE 2026, `foto_cand2026_RS_div`.

- URL: https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RS_div.zip
- Diretório local: `/home/lourenco/Projetos/dataset2026/foto_cand2026_RS_div`
- Regra: aplicar somente arquivo oficial com correspondência exata `FRS{SQ_CANDIDATO}_div` ↔ `tse_candidate_id` do snapshot público.
- Fallback disponível no script: ZIP oficial TSE 2024 por match conservador nome + partido, usado apenas se faltar arquivo 2026.

## Resultado atual

| Métrica | Total |
|---|---:|
| Candidaturas no snapshot público | 212 |
| Fotos oficiais aplicadas | 212 |
| Match exato TSE 2026 por `SQ_CANDIDATO` | 212 |
| Fallback TSE 2024 usado | 0 |
| Caso ambíguo | 0 |
| Sem match | 0 |

## Decisão

As fotos 2024 temporárias foram substituídas por fotos oficiais TSE 2026 quando houve match exato por `SQ_CANDIDATO`. Não houve escolha manual nem resolução por semelhança visual.

## Verificação

- `npm run data:photos` aplicou 212 fotos.
- `data/public-candidate-photo-matches.json` registra `matched_2026_exact = 212`, `matched_2024_fallback = 0`, `unmatched = 0`.
- `scripts/__tests__/public-snapshot.test.mjs` exige 212 assets públicos em `/photos/tse-2026-rs/` com fonte TSE 2026.
