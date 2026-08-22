# QA — execução das três fases seguintes

**Data:** 2026-08-22

## Fase 1 — hardening Supabase

Concluída e verificada remotamente:

- migration `20260822120000` consta no histórico remoto;
- `public.legislators.relrowsecurity=true`;
- policy pública de leitura para `anon,authenticated`;
- `approve_impact_matrix` executável por `authenticated`;
- helpers internos sem execução pública;
- nenhum dado editorial criado.

## Fase 2 — preservação P0

Concluída:

- 5 páginas oficiais renovadas com HTTP 200;
- 5 PDFs rebaixados novamente;
- bytes/SHA reproduzidos exatamente;
- corpus content-addressed em `data/legislative-import/alrs/source-corpus/`;
- `source_bytes_preserved=true`;
- `renewable_locator_verified=true`;
- `durability_gate=green` em 5/5.

## Fase 3 — fontes substantivas P1

Em execução:

- 18 versões P1 na fila;
- uma coleta por versão;
- `requested_for_groups` preserva múltiplos grupos;
- sem assessment ou score automático;
- sem escrita Supabase.

Os scouts oficiais foram divididos em dois lotes de 9 versões.

## Estado remoto

```text
matrizes ALRS: 0
assessments ALRS: 0
score impacto ALRS: 0
remote_apply: false
```
