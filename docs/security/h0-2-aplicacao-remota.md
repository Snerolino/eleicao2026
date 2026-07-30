# H0.2 — Aplicação remota e verificação

Base local: `h0-contencao-restauracao` @ `58f5ac5`
Data: 2026-07-30
Escopo: Supabase remoto — contenção de staging/RPCs e grants públicos básicos.

## Migration aplicada

- `20260730042755_h0_2_conter_staging_e_rpcs`
- `20260730053257_h0_2_restringir_grants_publicos_basicos`

A primeira tentativa falhou ao tentar alterar default privileges da role `supabase_admin`; o SQL local foi ajustado para não tocar essa role diretamente, e os objetos atuais foram protegidos com REVOKE explícito. A migration foi reaplicada com sucesso via Supabase CLI.

## Verificação de metadados

### Staging

As quatro tabelas de staging estão com RLS habilitado e forçado:

- `tse_candidates_staging`
- `tse_candidates_complementar_staging`
- `tse_coligacoes_staging`
- `tse_vagas_staging`

`anon` e `authenticated` não possuem grants nessas tabelas. `service_role` mantém operação administrativa.

### RPCs administrativas

| Função | anon | authenticated | service_role |
|---|---:|---:|---:|
| `rpc_upsert_candidates` | sem EXECUTE | sem EXECUTE | EXECUTE |
| `upsert_candidates_from_staging` | sem EXECUTE | sem EXECUTE | EXECUTE |

### Objetos públicos previstos

| Objeto | anon/authenticated |
|---|---|
| `candidates` | SELECT |
| `claims` | SELECT |
| `source_references` | SELECT |

## Verificação via Data API anon

- Staging tables: HTTP 401 permission denied.
- `tse_candidates_for_upsert`: HTTP 401 permission denied.
- `raw_documents_metadata`: HTTP 401 permission denied.
- `rpc_upsert_candidates`: HTTP 401 permission denied.
- `upsert_candidates_from_staging`: HTTP 401 permission denied.
- `candidates`, `claims`, `source_references`: HTTP 200 com `limit=0`.

## Verificação operacional

A RPC foi testada em dry-run com claim local simulada de `service_role` via conexão direta, retornando contagem `69`, sem imprimir dados pessoais.

## Risco residual

- Default privileges de `supabase_admin` não foram alterados por permissão insuficiente; mitigação atual: objetos existentes foram revogados explicitamente e a verificação confirma a superfície fechada.
- Próximo passo seguro: H0.4 smoke controlado do hotfix e/ou abrir PR para revisão antes de qualquer merge/deploy.
