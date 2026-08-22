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

Concluída:

- 18/18 versões P1 com página oficial HTTP 200;
- 18/18 com documento NoPaper HTTP 200;
- 18/18 bytes/SHA preservados em corpus content-addressed;
- uma coleta por versão;
- `requested_for_groups` preserva grupos candidatos quando existirem;
- sem assessment ou score automático;
- sem escrita editorial Supabase.

## Estado remoto

```text
matrizes ALRS: 0
assessments ALRS: 0
score de impacto ALRS: 0
remote_apply: false

## Próximo gate

Com as fontes substantivas duráveis, o pacote consolidado está em `23/23`
`substantive_source_gate=green` e `source_durability_gate=green`. O próximo
bloqueio é a disposição editorial humana das 23 versões.
```
