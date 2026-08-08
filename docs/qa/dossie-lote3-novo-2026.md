# Dossiê Eleitoral RS 2026 — Lote 3 / Consolidado — Importação

Data: 2026-08-08
Script: `scripts/import-dossier-lote3-novo-2026.mjs`
Testes: `scripts/__tests__/dossier-lote3-novo.test.mjs`

## Origem

- Documentos do usuário: `novo 3.txt` (Lote 3, corte 2026-08-05 07:18), `novo 4.txt` (consolidado, 2026-08-06 07:20), `novo 5.txt` (consolidado, 2026-08-07 07:44).
- Classificação: consolidado na data de corte; preliminar quanto ao julgamento final no TRE-RS.
- O arquivo HTML (`Eleio2026FichaSujaRS...html`) é um **template de Google Docs com placeholders** ("Candidato 01..25", Person/Date/Place) — sem dados reais; descartado.
- Lote 3 cobre candidatos 51-76; os consolidados confirmam os 4 registros documentais (REG-2026-RS-001 a 004) e os candidatos com mandato/gestão.

## Critério de importação

Mesmo critério dos Lotes 1 e 2: **somente fatos com fonte oficial rastreável**. Do Lote 3/consolidado, os fatos novos:

| Candidato (SQ) | Categoria | Fato | Fonte | Confiança |
| --- | --- | --- | --- | --- |
| Martin Cesar Kalkmann (210002533072) | `historico_politico` | Prefeito de Ivoti/RS por 2 mandatos (2017–2024), reeleito | Prefeitura de Ivoti | 3 |
| Giuseppe Ricardo M. Riesgo (210002533066) | `historico_politico` | Ex-dep. estadual RS (2019–2023); ex-secretário municipal em POA (2023–2026) | AL-RS | 3 |
| Giuseppe Ricardo M. Riesgo (210002533066) | `reputacao` | PC 2022 aprovadas sem sanção impeditiva (REG-2026-RS-004, 04/11/2022) | DivulgaCandContas TSE | 3 |
| Tiago José Albrecht (210002532989) | `historico_politico` | Vereador em Porto Alegre; ex-assessor parlamentar | Site oficial do candidato | 2 |

## Exclusões deliberadas

- **Candidatos UP sem fato concreto** (Luciano Schafer, Tania Peres, Gustavo Estery, Jaqueline Silinske, Bruno Freitas, Everaldo Oliveira Jr., Samara Almeida) e demais NOVO sem mandato: "não localizado"/"sem registros" não geram claim (ausência ≠ certeza).
- Candidatos já cobertos nos lotes 1/2 (Ada, Camozzato, Ostermann, Ramiro, Marco, Tiago já publicado/importado) não duplicados — idempotência por (candidato, categoria).

## Conformidade com os gates

- Todas as claims entram como **`pending_review`** (nunca published direto).
- Publicação exige revisão humana + RPC transacional (H4.2).
- Fontes em `source_references` (oficial; site de candidato cai em `outro`), nunca `raw_content`.
- Escrita só com service role externa; dry-run com anon.

## Verificação executada

- Dry-run: 4 recomendações, 0 escritas.
- `--apply` criou 4 claims pending (Kalkmann ×1, Riesgo ×2, Albrecht ×1).
- Consulta anon: 0 pending visíveis (RLS OK).
- Consulta service role: 5 pending no total (4 do Lote 3 + 1 plataforma Ostermann de seed anterior).

## Nota sobre lotes anteriores

- Lote 1 (4 claims) e Lote 2 (3 claims) publicados/importados conforme datas de corte​; estado verificado em 2026-08-08.
- Levantamento consolidado: **76/76 candidaturas auditadas** (Lotes 1-3 concluídos).