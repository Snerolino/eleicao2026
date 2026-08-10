-- Migration aprovada para idempotencia do coletor de candidatos.

begin;

alter table public.claims
  add column if not exists external_id text,
  add column if not exists content_hash text,
  add column if not exists generated_by_ai boolean not null default false,
  add column if not exists prompt_version text;

create unique index if not exists claims_collector_identity_version_uq
  on public.claims (candidate_id, category, external_id, content_hash);

comment on column public.claims.external_id is
  'Identificador estavel do fato no coletor; nao e ranking nem score.';
comment on column public.claims.content_hash is
  'SHA-256 do conteudo canonico sanitizado para impedir versao identica duplicada.';
comment on column public.claims.generated_by_ai is
  'Rotulo tecnico obrigatorio para conteudo sintetizado por IA.';
comment on column public.claims.prompt_version is
  'Versao do contrato/prompt que gerou a claim.';

-- RLS e grants existentes permanecem inalterados. Nenhuma policy anonima e criada.
commit;
