# QA — plano idempotente de catálogo Câmara histórico — 2026-08-18

## Objetivo

Preparar, sem escrita remota, o input idempotente de `source_references` para as
7 fontes oficiais do envelope histórico Câmara, preservando URL, hash SHA-256 e
método de hash do manifesto revalidado.

## Evidência executada

- Worktree estava limpa no início do chunk e lock bounded foi adquirido.
- `supabase migration list --linked`: local/remoto alinhados até
  `20260816100000`; identidade do projeto confirmada pelo CLI vinculado.
- Consulta read-only a `information_schema`: `source_references` possui
  `id`, `url`, `content_hash`, `source_name`, `source_category`, `title`,
  `fetched_at` e `published_at`; as tabelas legislativas e
  `candidates.tse_candidate_id` também estão presentes.
- Consulta read-only por URL + hash contra `public.source_references`: **7/7
  ausentes**, **0 divergentes**, **0 UUID resolvidos**.
- O manifesto oficial `historical-resolved-source-manifest.json` contém 7
  entradas HTTP 200, cada uma com bytes e SHA-256; nenhum valor foi inferido.

## Entrega

- Criado `data/legislative-import/camara/historical-source-catalog-input.json`.
- O arquivo é somente um plano/input de dry-run: não contém UUID remoto, FK,
  voto ou SQL executável.
- As 7 entradas mantêm exatamente as URLs e hashes do manifesto; títulos são
  rótulos descritivos derivados do endpoint oficial e não constituem nova prova
  factual.

## Resultado e bloqueio

- Plano preparado: **7 fontes**.
- Aplicação remota: **não executada**; as referências seguem ausentes no
  catálogo remoto.
- Nenhuma proposição, versão, evento, voto, identidade, FK ou matriz foi
  alterada.
- Antes de qualquer `--apply`, o writer deve refazer cada GET oficial e falhar
  fechado se HTTP, bytes ou SHA-256 divergirem; depois deve consultar novamente
  URL/hash e provar idempotência em segunda execução.

## Próximo passo bounded

Executar dry-run remoto com este input, ou adaptar o writer para aceitar o
arquivo histórico explicitamente, sem usar `ON CONFLICT` presumido; somente após
hash/bytes e schema/FK permanecerem exatos considerar a criação idempotente das
7 referências. Os 8 casos de identidade bloqueada continuam fora da carga.
