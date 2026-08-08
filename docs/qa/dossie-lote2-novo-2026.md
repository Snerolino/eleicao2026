# Dossiê Eleitoral RS 2026 — Lote 2 (NOVO / Dep. Federal e Estadual) — Importação

Data: 2026-08-08
Script: `scripts/import-dossier-lote2-novo-2026.mjs`
Testes: `scripts/__tests__/dossier-lote2-novo.test.mjs`

## Origem

- Documento do usuário `novo 2.txt`: levantamento "Ficha Suja RS — Dossiê de Candidatos".
- Data de corte do levantamento: 2026-08-04 07:35; classificação **preliminar**.
- Escopo do Lote 2: candidatos 26 a 50 (Deputado Federal 26-29 e Deputado Estadual 30-50, NOVO/RS).
- Fontes consultadas no documento: DivulgaCandContas/TSE, TRE-RS, DataJud/CNJ, AL-RS, Câmara de Porto Alegre.

## Critério de importação

Mesmo critério do Lote 1: **somente fatos com fonte oficial rastreável**. Dos 25 candidatos do Lote 2, apenas 2 tinham fatos concretos:

| Candidato (SQ) | Categoria | Fato | Fonte | Confiança |
| --- | --- | --- | --- | --- |
| Ramiro Stallbaum Rosário (210002533056) | `reputacao` | PC campanha Vereador POA 2020 (proc. 0601916-16.2020.6.21.0111, 111ª ZE) aprovada **com ressalvas** em 11/12/2020 (REG-2026-RS-003) | DivulgaCandContas TSE | 3 |
| Ramiro Stallbaum Rosário (210002533056) | `historico_politico` | Vereador reeleito em Porto Alegre; ex-Secretário Municipal de Serviços Urbanos (2017-2020) | Site oficial do candidato | 2 |
| Everton de Souza Dias (210002533053) | `historico_politico` | Militar da reserva (registro de candidatura) | DivulgaCandContas TSE (portal) | 2 |

## Exclusões deliberadas

- **Francisco Marques Neto** (210002533050): presente no Supabase mas **fora do snapshot público** (override anterior). Sem claim.
- **26-29 e 31-46, 48-50**: "Informação não localizada" — sem claims (ausência ≠ certeza).

## Conformidade com os gates

- Todas as claims entraram como **`pending_review`** (nunca published direto).
- Publicação exige revisão humana + RPC transacional (H4.2).
- Fontes em `source_references` (oficial + site oficial do candidato), nunca `raw_content`.
- Escrita só com service role externa; dry-run com anon.
- **Público (anon) não enxerga pending_review** — validado por REST após insert (0 pending visíveis via anon).

## Verificação executada

- Script validado em dry-run (2 recomendações, 0 escritas).
- `--apply` criou 2 claims:
  - Ramiro: `reputacao` + `historico_politico` (pending_review)
  - Everton: `historico_politico` (pending_review)
- Consulta anon: 0 claims pending visíveis (RLS OK).
- Consulta service role: 4 pending no total (3 do Lote 2 + 1 plataforma Ostermann de seed anterior).
- Lote 1: as 4 claims foram **publicadas** pelo usuário via RPC em 2026-08-08 08:29 — publicadas com `published_at` registrado.

## Próximos passos

- Lote 3 (candidatos 51-76 — Dep. Estadual e Senador) ainda **não enviado**.
- Revisar no Admin as 3 claims pending do Lote 2; publicação via `publish_claim()` após review aprovado.