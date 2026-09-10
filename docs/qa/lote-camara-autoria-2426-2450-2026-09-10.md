# QA — autoria Câmara 2426–2450 — 2026-09-10

## Objetivo
Processar o próximo lote determinístico de autoria Câmara em duas lanes independentes, mantendo retenção fail-closed e sem promover autoria a voto, impacto ou score.

## Fonte e reconciliação
- Seleção determinística: 25 projetos únicos, intervalo 2426–2450, 50 ocorrências candidato–projeto.
- Fonte oficial Dados Abertos Câmara: 25/25 endpoints de proposição HTTP 200; identidade exata 25/25.
- Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2426-2450-source-manifest.json`. Bytes revalidados: 76.163; SHA-256 individual preservado.
- Texto integral: URLs oficiais disponíveis em 25/25, mas `content_read=false`; tramitações foram coletadas como metadado independente, não como prova de evento vinculante.
- Lanes causal/red-team: 25/25 IDs exatos em cada lane; 25 withheld em cada uma. Reconciliação: 25 withheld, 0 pending_review, 0 approved, 0 score_eligible; `remote_apply=false`.

## Bloqueio real
Os endpoints oficiais revalidam identidade e metadados, mas este lote não possui validação de conteúdo integral, versão/evento independente vinculante e voto nominal individual. Autoria/ementa não prova posição legislativa, mecanismo causal, efeito populacional ou score. Nenhum fato, claim, voto, matriz, score, projeto público ou escrita remota foi promovido.

## Checkpoint
- `projects_analyzed=2450`, `withheld=2450`, `approved=0`, `pending_review=0`, `blocked_items=100`.
- Lote fechado: `2426-2450` (`withheld`).
- Próximo lote calculado atomicamente: `2451-2475`.
- Checkpoint: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Gates locais — Node 24.19.0
- `npm run test`: verde, 120 arquivos e 499 testes aprovados.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde; fixtures boas aceitas e ruins rejeitadas.
- `npm run data:check`: verde; 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: verde; 245 módulos, sitemap com 1003 candidatos + 2 estáticas = 1005 URLs, `release.json` gerado.
- `git diff --check`: verde.
- Churn de timestamps nos artefatos editoriais Câmara não relacionados foi restaurado; nenhum avanço factual ALRS foi alterado.

## Publicação
- Artefatos versionados: manifesto oficial, lanes causal/red-team, reconciliação e este QA.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada; nenhuma escrita Supabase factual, score, matriz, claim, voto ou projeto público foi executada.
- Commit/push e verificação CI/backup/produção ficam registrados no fechamento abaixo.

## Próximo passo
Iniciar o lote 2451–2475 somente após a confirmação de produção deste fechamento, mantendo retenção fail-closed e sem aplicar fatos editoriais/remotos.
