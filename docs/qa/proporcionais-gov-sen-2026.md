# Proporcionais RS 2026 — Deputado Estadual e Federal (selo fonte oficial TSE)

Data: 2026-08-15
Escopo: `country=BR`, `state=RS`, `election_year=2026`
Critério de fonte: TSE — arquivo oficial de fotos `foto_cand2026_RS_div.zip`
Selo `oficial` (SourceReferenceBadge): `photo_source_url` aponta para o ZIP oficial TSE 2026.
Verificação: proveniência TSE confirmada para todos os 892; foto ausente quando o TSE não a publicou (sem fabricação de imagem).

## Selo de fonte oficial

- **🟦 OFICIAL** = `photo_source_url` = ZIP oficial TSE 2026 (CDN `cdn.tse.jus.br`).
- Link do selo: `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RS_div.zip`
- Candidato sem foto no TSE: selo oficial presente, mas `photo_url = null` (placeholder no app, não quebra).

## Resumo de cobertura

| Cargo | Total | Com foto TSE 2026 | Sem foto (TSE não publicou) | Selo oficial |
|---|---|---|---|---|
| Deputado Estadual | 517 | — | — | 🟦 100% |
| Deputado Federal | 375 | — | — | 🟦 100% |
| **Total proporcionais** | **892** | **867** | **25** | **🟦 893/893** |

> Os 25 sem foto são todos do MDB, faixa `210002548xxx` (candidaturas tardias que entraram após o snapshot de fotos do TSE 2026). Sem foto em 2026, 2024 ou CDN — mantidos sem imagem, sem fabricação.

## Auditoria prévia (antes do ajuste)

- 841 com fonte 2026 oficial
- 26 com fallback 2024 (corrigidos para 2026)
- 25 sem fonte (corrigidos para 2026)
- Total de mudanças de fonte: 51 no snapshot

## Integração com majoritários

- Governadores (5) + Senadores (12) = 17 majoritários, todos com selo oficial (ver `majoritarios-gov-sen-2026.md`).
- **Total RS 2026 com selo oficial TSE: 910/910 candidaturas públicas.**

## Arquivos alterados nesta sessão

- `data/public-candidates.json` (51 proporcionais ganharam `photo_source_url` oficial 2026)
- `scripts/fix-proporcionais-fotos.mjs` (idempotente, dry-run/--apply)
- Supabase `candidates`: PATCH em lote (neq.SRC + is.null) → 893/893 com fonte 2026
