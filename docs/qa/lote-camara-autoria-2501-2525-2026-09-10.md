# QA — autoria Câmara 2501–2525 — 2026-09-10

## Objetivo
Fechar o lote determinístico de autoria Câmara 2501–2525 sem reabrir lotes anteriores, preservando análise editorial read-only e retenção fail-closed.

## Evidência oficial verificada
- Seleção: 25 projetos únicos, offset 2500/limit 25; 50 ocorrências candidato–projeto e 20 candidatos únicos.
- Proposições Câmara: 25/25 HTTP 200; identidade dados.id exata em 25/25.
- Tramitações/status oficial: 25/25 HTTP 200; 79.596 bytes somados nas respostas oficiais de proposição e tramitação; SHA-256 preservado no manifesto.
- Texto integral: 25/25 URLs catalogadas, mas conteúdo não lido/validado.
- IDs de lane: causal 25/25 exatos; red-team 25/25 exatos; reconciliação por conjunto exato.

## Resultado editorial fail-closed
- 25 withheld; 0 pending_review; 0 approved; 0 score_eligible.
- content_read=false e remote_apply=false em todos os quatro artefatos.
- Nenhum fato de voto, claim, score, matriz, authored project público ou escrita factual Supabase/Cloudflare foi promovido.
- Bloqueio real: texto integral não validado, evento/versão independente vinculante não demonstrado e voto nominal individual ausente. Autoria/ementa não prova posição legislativa, efeito causal ou score.

## Artefatos e hashes
- data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-source-manifest.json: 1bf3088add96ed5a2bcbb17cb5b547d84dc409ac6003b64fb864d7c898b76a8f\n- data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-causal.json: e5bff7ad98ff8b4a05a1a0007382a64f74367a9efee1ea015859f64d500bf38e\n- data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-redteam.json: 8ccc8a5b32c462df23970a1bc9d43bf957f44697dee960c2e27446e9ff63674d\n- data/legislative-import/camara/authored-project-review-batches/camara-authored-2501-2525-reconciled.json: 8c366756f9cab30774c63d87bbbbb2c0b5c4ca8fd7ce36fb7a2b8379e7b8ac8e

## Gates
- Node 24.19.0: test, TypeScript, validate-impact-schema, data:check, build e git diff --check executados após a atualização documental.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada.

## Próximo passo
Próximo lote calculado: autoria Câmara 2526–2550, somente após este fechamento/publicação; manter duas lanes independentes, fontes oficiais e retenção fail-closed.
