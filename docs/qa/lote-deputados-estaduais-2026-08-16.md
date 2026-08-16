# QA — Lote: Deputados Estaduais (dataset2026)

Data: 2026-08-16
Autor: Hermes
Status: SINCRONIZADO · sem novidade pendente

## Análise (Passo 2)
Fonte: `dataset2026/candidatos/lista_candidatos_2026.csv` (162 Deputado Estadual),
`candidatos_agregado_2026.csv` (109), `candidatos/fotos/` (379 fotos oficiais TSE).

- Candidatos Deputado Estadual no dataset: **162** → todos presentes no snapshot/banco (0 novos).
- Fotos oficiais TSE: app já aponta `photo_url` + `photo_source_url` (cdn.tse.jus.br) para os cobertos.
- Claims de deputados estaduais: já publicadas (blocos AGY 0-40, 2093 claims AGY no total).
- Conclusão: **sem dado novo de deputado estadual para publicar** — já está 100% no ar.

## Publicação (Passo 3)
- Git: commit `10db90d` (TENENTE NETO + limpeza) já em main; este lote documenta a cobertura.
- Supabase: 162 deputados estaduais presentes, claims publicadas com fonte.
- Cloudflare Pages: produção HTTP 200 (backup cobriu deploy do commit 10db90d).

## Próximo (Passo 4 — Senadores)
Há dado NOVO de senadores no dataset2026:
- `relatorios/dossies/dossie_*.md` (12 arquivos, maioria senadores) com
  `project_candidate_id_remote` (UUID do Supabase) — ligação direta ao banco.
- `candidatos/_dossies/dossie_senado_rs_2026_inicial.xlsx`.
Serão processados via AGY (orch:google) e importados como claims com fonte.
