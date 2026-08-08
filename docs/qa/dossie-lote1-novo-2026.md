# Dossiê Eleitoral RS 2026 — Lote 1 (NOVO / Deputado Federal) — Importação

Data: 2026-08-08
Script: `scripts/import-dossier-lote1-novo-2026.mjs`
Testes: `scripts/__tests__/dossier-lote1-novo.test.mjs`

## Origem

- Documento do usuário `novo 1.txt`: levantamento "Ficha Suja RS — Dossiê de Candidatos".
- Data de corte do levantamento: 2026-08-03 07:00; classificação **preliminar**.
- Escopo do Lote 1: candidatos 1 a 25 (Deputado Federal, partido NOVO/RS).
- Fontes consultadas no documento: DivulgaCandContas/TSE, TRE-RS, DataJud/CNJ, AL-RS, Diários Oficiais.

## Critério de importação

O projeto não importa "informação não localizada" como claim (ausência de registro ≠ certeza).

Foram importados **somente fatos com fonte oficial rastreável**:

| Candidato (SQ) | Categoria | Fato | Fonte | Confiança |
| --- | --- | --- | --- | --- |
| Ada Cristina Munaretto (210002532998) | `reputacao` | PC 2022 aprovada **com ressalvas** pelo TRE-RS em 24/10/2023 (REG-2026-RS-001) | Voto relator TRE-RS (sessão pública) | 3 |
| Ada Cristina Munaretto (210002532998) | `historico_politico` | Vereadora reeleita em Passo Fundo/RS | Votos/registros TRE-RS citados no dossiê | 2 |
| Felipe Zortéa Camozzato (210002533002) | `reputacao` | PC 2022 aprovada **sem sanção impeditiva** em 04/11/2022 (REG-2026-RS-002) | DivulgaCandContas TSE | 4 |
| Marco Antonio M. dos Santos (210002533003) | `historico_politico` | Oficial da reserva das Forças Armadas; sem condenação transitada em julgado | DivulgaCandContas TSE (portal) | 2 |

## Conformidade com os gates do projeto

- **Pending, nunca published:** todas as claims entraram `pending_review`.
- **Publicação exige review aprovação + RPC transacional** (H4.2) — nada foi publicado nesta etapa.
- **Fonte pública** (`source_references` com `content_hash` único), nunca `raw_content`.
- **Escrita só com service role** externa (`SUPABASE_SECRET_KEY`); dry-run funciona com anon.
- **Público (anon) não enxerga pending_review** — validado por REST após insert.
- **Candidato validado por `tse_candidate_id`** contra o `candidates` (RS 2026) antes do insert.
- **Não fabricação**: 21 candidatos do Lote 1 com "não localizado" não receberam claim.

## Verificação executada

- Script criado e validado em dry-run (4 recomendações, 0 escritas).
- `--apply` executou 2 inserts (Ada ×2) + 2 inserts anteriores, todos `pending_review`.
- Consulta anon: claims `pending_review` **invisíveis** (RLS publica só `published`/`corrected`).
- Consulta service role: 5 pending no total (4 do dossiê + 1 plataforma Ostermann de seed anterior).
- Typo "milhar"→"militar" corrigido na claim do Marco (PATCH service role ID empedance).

## Próximos passos

- Lote 2 (candidatos 26–50) e Lote 3 (51–76) ainda **não enviados**.
- Disponível para revisão humana no Admin; publicação por `publish_claim()` com review aprovado.