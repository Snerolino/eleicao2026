# QA — Gate R0: identidade remota Supabase

**Data:** 2026-08-18
**Modo:** read-only

## Evidência

- `supabase/.temp/project-ref`: `hhqxhxcfkoijevxyzfky`
- `supabase projects list`: mesmo reference ID
- projeto remoto: `eleicao2026`
- região: South America (São Paulo)
- `supabase migration list`: migrations locais e remotas alinhadas até `20260816100000`
- nenhuma migration, RLS, RPC, dado ou secret foi alterado

## Resultado

A identidade básica do projeto está confirmada pelo Supabase CLI. O próximo
subgate é consultar read-only `information_schema`/tabelas legislativas e
confirmar que `candidates.tse_candidate_id` e o núcleo legislativo coexistem
nesse mesmo banco antes de liberar qualquer writer.
