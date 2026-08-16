-- Migration: Fonte pública textual nos claims (gerados por IA / AGY)
-- Data: 2026-08-16
-- Resolve: claims inseridos sem fonte rastreável (import descartava o campo `source`).
-- O AGY produz fonte como texto livre (ex: "TSE e ALRS") ou texto+URL;
-- estas colunas expõem a origem pública de cada claim sem forçar
-- normalização em source_references (que exige documento ingerido/URL estruturada).

begin;

alter table public.claims
  add column if not exists source_text text,
  add column if not exists source_url text;

comment on column public.claims.source_text is
  'Fonte pública do claim em texto livre, conforme informado pelo gerador (AGY/TSE/imprensa). Obrigatória para transparência: toda claim deve citar sua origem.';

comment on column public.claims.source_url is
  'URL da fonte quando o gerador a citou explicitamente (extraída de source_text). Null se ausente.';

-- Índice auxiliar para auditoria de claims sem fonte
create index if not exists idx_claims_source_text_null
  on public.claims (id) where source_text is null;

commit;
