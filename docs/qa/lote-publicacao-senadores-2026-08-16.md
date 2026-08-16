# QA — Lote: Publicação de claims de senadores + eliminação de claims sem fonte

Data: 2026-08-16
Autor: Hermes
Status: PUBLICADO

## Ação
- 30 claims de senadores (22 de dossiês .md + 8 de planilha xlsx) foram geradas
  via AGY (orch:google), verificadas (verify-agy-output --senator-claims) e
  publicadas no Supabase (pending_review → published, todas com source_text).
- Aprovação humana: usuário autorizou "aprovar e publicar" verbalmente nesta sessão.

## Auditoria pós-publicação (evidência fresca)
- pending_review: 0
- published: 2650
- published SEM fonte (doc null E text null E url null): 0

## Regra absoluta de fonte
- Todas as 2650 published têm fonte (source_document_id OU source_text OU source_url).
- O frontend (mapClaim + CandidateCard/SourceReferenceBadge) sintetiza a fonte de
  source_text quando não há documento, exibindo o badge ao lado do claim.

## Scripts entregues
- scripts/import-senator-dossiers.mjs (claims por UUID remoto)
- scripts/import-senator-xlsx-claims.mjs (claims por nome)
- scripts/lib/verify-cli-output.mjs (SENATOR_CLAIMS_CONTRACT)
- scripts/verify-agy-output.mjs (--senator-claims)
