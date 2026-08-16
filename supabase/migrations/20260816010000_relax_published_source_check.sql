-- Migration: relaxa constraint de publicação para aceitar fonte textual
-- Data: 2026-08-16
-- Motivo: claims do AGY trazem fonte como texto livre (source_text/source_url),
-- não necessariamente um documento ingerido (source_document_id). A política de
-- "toda claim publicada precisa de fonte" é satisfeita por source_text OU source_document_id.
-- Resolve: chk_published_claim_requirements barrava publicação de claims com fonte textual.

begin;

alter table public.claims drop constraint if exists chk_published_claim_requirements;

alter table public.claims
  add constraint chk_published_claim_requirements
  check (
    status <> 'published'
    or (
      candidate_id is not null
      and published_at is not null
      and (source_document_id is not null or source_text is not null)
    )
  );

comment on constraint chk_published_claim_requirements on public.claims is
  'Claim publicada exige candidato, published_at e fonte (source_document_id OU source_text).';

commit;
