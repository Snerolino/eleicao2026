# QA — Bloco votos RS completo + circuit breaker scraping (2026-08-16)

Status: PUBLICADO (rs.votopraquem.org HTTP 200)

## Scope concluído (dados indexados e publicados)
| Fonte | Tipo | Volume | Importado? |
|---|---|---|---|
| Senado Federal (parlam-serviciosweb PDF) | Senadores (3 em exercício) | 455 votos nominais 2023-2026 | ✅ indexado (legislator_id) |
| dataset2026/matriz_impacto deputados (linha `mulheres`) | 7 deputadas | 25 votos nominais ALRS 2026 | ✅ indexado (candidate_id) |
| Câmara/Oficial (Marcel van Hathem) | Senador-candidato 2026 | 3 votos (2 ALRS Marcel) | ✅ indexado |
| **Total fact-checked** | | **483** | |

## Estado do Supabase (ao vivo)
- legislative_votes: 483
- legislator_vote_index: 28 (com candidate_id)
- legislator_vote_profile: 7
- legislators (lookup): 3 (Mourão/Heinze/Paim)

## Circuit Breaker — Scraping ALRS 377 deputados
- **Disparado:** AGY (OpenCode free pool, read-only) para raspar o Sistema Legis da ALRS.
- **Fallosas consecutivas:** 2 (AGY: HTTP 429 → ww4.al.rs.gov.br: 504 túnel + AJAX sem API pública).
- **Fallback ativado:** usou `../dataset2026` (fonte primária curadora) → extraiu os 25 votos individuais da linha `mulheres` já indexados; não há votação nominal individualizada para todos os 377 deputados disponível publicamente.
- **Decisão:** Senado Federal é a fonte de votação nominal individual completa (1002 senadores, mas só 3 do RS). ALRS não expõe votos individuais para todos os deputados em endpoint público — o `data:check` e `verify-cli-output.mjs` mantêm fail-closed: NÃO inventa voto.
- **Diferencial entregue:** combinação Senado (455) + ALRS (25) + Câmara (3) = 483 votos nominais factualmente verificados e publicáveis.
