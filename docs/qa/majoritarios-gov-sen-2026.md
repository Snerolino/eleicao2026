# Majoritários RS 2026 — Governadores e Senadores (selo fonte oficial TSE)

Data: 2026-08-15
Escopo: `country=BR`, `state=RS`, `election_year=2026`
Critério de fonte: TSE — arquivo oficial de fotos `foto_cand2026_RS_div.zip`
Selo `oficial` (SourceReferenceBadge): `photo_source_url` aponta para o ZIP oficial TSE 2026.
Verificação: proveniência TSE confirmada para todos os 17; foto ausente quando o TSE não a publicou (sem fabricação de imagem).

## Selo de fonte oficial

- **🟦 OFICIAL** = `photo_source_url` = ZIP oficial TSE 2026 (CDN `cdn.tse.jus.br`).
- Link do selo: `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RS_div.zip`
- Candidato sem foto no TSE: selo oficial presente, mas `photo_url = null` (placeholder no app, não quebra).

## Governadores (5)

| Nome | Partido | Cargo | Foto TSE | Selo oficial | Slug |
|---|---|---|---|---|---|
| PRISCILA VOIGT SEVERIANO | UP | Governador | ✅ | 🟦 TSE 2026 | `priscila_voigt_severiano_210002533355` |
| MARCELO MARANATA SOARES REINALDO | PSDB | Governador | ✅ | 🟦 TSE 2026 | `marcelo_maranata_soares_reinaldo_210002535802` |
| REJANE SILVA DE OLIVEIRA | PSTU | Governador | ✅ | 🟦 TSE 2026 | `rejane_silva_de_oliveira_210002541367` |
| LUCIANO LORENZINI ZUCCO | PL | Governador | ❌ (TSE não publicou) | 🟦 TSE 2026 | `luciano_lorenzini_zucco_210002547857` |
| GABRIEL VIEIRA DE SOUZA | MDB | Governador | ✅ | 🟦 TSE 2026 | `gabriel_vieira_de_souza_210002542892` |

## Senadores (12)

| Nome | Partido | Cargo | Foto TSE | Selo oficial | Slug |
|---|---|---|---|---|---|
| LUCIANO SCHAFER | UP | Senador | ✅ | 🟦 TSE 2026 | `luciano_schafer_210002533435` |
| MANUELA PINTO VIEIRA D ÁVILA | PSOL | Senador | ✅ | 🟦 TSE 2026 | `manuela_pinto_vieira_d_avila_210002533581` |
| PAULO RENATO JAGUARÃO SILVA DA ROSA | CIDADANIA | Senador | ✅ | 🟦 TSE 2026 | `paulo_renato_jaguarao_silva_da_rosa_210002538465` |
| REGIS BATISTA ETHUR | PSTU | Senador | ✅ | 🟦 TSE 2026 | `regis_batista_ethur_210002544699` |
| UBIRATAN ANTUNES SANDERSON | PL | Senador | ❌ (TSE não publicou) | 🟦 TSE 2026 | `ubiratan_antunes_sanderson_210002547816` |
| TANIA MARA SANTORO PERES | UP | Senador | ✅ | 🟦 TSE 2026 | `tania_mara_santoro_peres_210002533434` |
| DANIELA MAIDANA DA SILVA | PSTU | Senador | ✅ | 🟦 TSE 2026 | `daniela_maidana_da_silva_210002544698` |
| MILTON BATISTA CARDOSO | PSDB | Senador | ✅ | 🟦 TSE 2026 | `milton_batista_cardoso_210002538467` |
| GERMANO ANTONIO RIGOTTO | MDB | Senador | ✅ | 🟦 TSE 2026 | `germano_antonio_rigotto_210002543863` |
| MARCEL VAN HATTEM | NOVO | Senador | ❌ (TSE não publicou) | 🟦 TSE 2026 | `marcel_van_hattem_210002547819` |
| PAULO ROBERTO SEVERO PIMENTA | PT | Senador | ✅ | 🟦 TSE 2026 | `paulo_roberto_severo_pimenta_210002533584` |
| FREDERICO CANTORI ANTUNES | PSD | Senador | ✅ | 🟦 TSE 2026 | `frederico_cantori_antunes_210002543865` |

## Resumo de verificação

- **17/17** com selo oficial TSE 2026 (`photo_source_url` definido em snapshot + Supabase).
- **14/17** com foto oficial TSE 2026 disponível.
- **3/17** sem foto no TSE (LUCIANO ZUCCO, UBIRATAN SANDERSON, MARCEL VAN HATTEM): TSE não publicou imagem em 2026 nem 2024; mantidos sem foto, sem fabricação.
- Claims relacionadas (lotas 1–3): 281 publicadas, 0 pendentes.

## Arquivos alterados nesta sessão

- `data/public-candidates.json` (2 senadores ganharam `photo_source_url` oficial)
- `scripts/fix-majoritarios-fotos.mjs` (idempotente, dry-run/--apply)
- Supabase `candidates`: Sanderson + Van Hattem com `photo_source_url` oficial (PATCH 204)
