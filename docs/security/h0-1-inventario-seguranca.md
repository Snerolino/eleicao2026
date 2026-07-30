# H0.1 — Inventário de segurança antes do SQL

Base: `h0-contencao-restauracao` @ `371d6929ef1538195ba0d977822024db5f105f38`
Data: 2026-07-30
Escopo: metadados de schema/grants/RLS/policies/views/funções. Nenhum dado pessoal foi inventariado.

## Estado operacional

- Worktree inicial: `main...origin/main`, com `opencode.jsonc` não versionado já existente.
- Branch de trabalho criada: `h0-contencao-restauracao`.
- Node: `v22.22.2`; npm: `10.9.7`; Supabase CLI: `2.110.0`; OpenCode: `1.18.9`.
- Guardrails: `README.md` encontrado; `AGENTS.md`, `CLAUDE.md` e `.cursorrules` não encontrados no repo.

## Objetos auditados

### Relações

| Objeto | Tipo | RLS |
|---|---:|---:|
| `candidates` | table | habilitado |
| `claims` | table | habilitado |
| `source_references` | table | habilitado |
| `raw_documents_metadata` | view | não aplicável |
| `tse_candidates_staging` | table | **desabilitado** |
| `tse_candidates_complementar_staging` | table | **desabilitado** |
| `tse_coligacoes_staging` | table | **desabilitado** |
| `tse_vagas_staging` | table | **desabilitado** |
| `tse_candidates_for_upsert` | view | não aplicável |

### Grants efetivos

`anon`, `authenticated` e `service_role` possuem `DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE` nos objetos auditados, incluindo as quatro tabelas de staging e a view `tse_candidates_for_upsert`.

### Policies observadas

- `candidates`: leitura pública.
- `claims`: leitura pública apenas `published`; leitura/escrita editorial via `editor_roles`.
- `source_references`: leitura pública.
- Tabelas de staging: sem policies e com RLS desabilitado.

### Views

- `raw_documents_metadata`: expõe metadados de `raw_documents`, sem `raw_content`.
- `tse_candidates_for_upsert`: view interna derivada de staging para upsert.

### Funções

| Função | Security | search_path | EXECUTE anon/authenticated |
|---|---|---|---|
| `rpc_upsert_candidates(uf_filter text, dry_run boolean)` | SECURITY DEFINER | `public` | **sim** |
| `upsert_candidates_from_staging(uf_filter text, dry_run boolean)` | SECURITY INVOKER | padrão | **sim** |

## Teste anônimo sem expor dados

Acesso anônimo com `limit=0` retornou HTTP 206/200 para as tabelas de staging, confirmando superfície pública. RPCs administrativas também responderam anonimamente em dry-run. O conteúdo pessoal retornado pelo teste bruto não foi preservado neste relatório.

## Lista fechada de objetos a proteger em H0.2

- Tabelas: `tse_candidates_staging`, `tse_candidates_complementar_staging`, `tse_coligacoes_staging`, `tse_vagas_staging`.
- Views internas: `tse_candidates_for_upsert`; revisar `raw_documents_metadata`.
- Funções administrativas: `rpc_upsert_candidates`, `upsert_candidates_from_staging`.
- Default privileges de `public` para tabelas, funções e sequences futuras.

## Divergências relevantes

- O guia esperava exposição provável; o estado remoto confirma exposição ampla.
- A RPC `rpc_upsert_candidates` está protegida no corpo da função versionada, mas o estado remoto atual ainda permite execução anônima; H0.2 deve corrigir grants e reaplicar a definição restrita.

## Próximo bloco seguro

H0.2 — preparar migration de contenção localmente. Aplicação remota exige autorização separada, conforme guia.
