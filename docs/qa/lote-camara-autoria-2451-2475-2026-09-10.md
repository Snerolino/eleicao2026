# QA — autoria Câmara 2451–2475 — 2026-09-10

## Objetivo
Processar deterministicamente 25 projetos únicos de autoria Câmara em duas lanes independentes, mantendo retenção fail-closed e sem promover autoria a voto, impacto, score ou fato público.

## Fonte, seleção e identidade
- Seleção: `offset=2450`, `limit=25`; `25` projetos únicos e `50` ocorrências candidato–projeto.
- Fonte oficial Dados Abertos Câmara: `25/25` endpoints de proposição HTTP 200.
- Identidade: `25/25` `dados.id` exatamente igual ao ID da URL.
- Bytes revalidados: `77.621` somados entre endpoints de proposição e tramitação; `50` hashes SHA-256 preservados no manifesto.
- URLs oficiais: texto integral catalogado `25/25`; evento/tramitação independente catalogado `25/25`; conteúdo não foi lido nem validado como texto integral/evento vinculante.
- Classificação factual: `25 procedural_only`.

Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2451-2475-source-manifest.json`.

## Lanes e reconciliação
- Causal: `25/25` IDs exatos, `25 withheld`, `0 approved`, `0 pending_review`, `0 score_eligible`.
- Red-team: `25/25` IDs exatos, `25 withheld`, `0 approved`, `0 pending_review`, `0 score_eligible`.
- Reconciliação: `25 withheld`, `0 approved`, `0 pending_review`, `0 score_eligible`; `content_read=false`; `remote_apply=false`.
- Nenhum texto integral validado, versão/evento independente vinculante ou voto nominal individual foi demonstrado. Autoria/ementa/procedimento não prova posição, efeito causal ou score.

Artefatos:
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2451-2475-causal.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2451-2475-redteam.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2451-2475-reconciled.json`

## Checkpoint
- `projects_analyzed=2475`, `withheld=2475`, `approved=0`, `pending_review=0`, `blocked_items=101`.
- Último lote: `2451–2475` (`withheld`).
- Próximo lote calculado atomicamente: `2476–2500`.
- Checkpoint: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Segurança e escopo
Lock exclusivo `flock` adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`; um único writer. Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase, Cloudflare, claim, voto, matriz, score, `authored_project` público ou aplicação factual remota foi executada.

## Gates locais
Executados após a geração dos artefatos com Node `v24.18.1`:

- `npm run test`
- `npx tsc --noEmit`
- `node scripts/validate-impact-schema.mjs`
- `npm run data:check`
- `npm run build`
- `git diff --check`

Resultados reais: `499/499` testes em `120` arquivos; TypeScript sem erros; schema OK; `data:check` `1003` candidaturas/`988` fotos; build `245` módulos e sitemap `1003 + 2 = 1005` URLs; `git diff --check` OK. O aviso de UUID inválido pertence ao fixture negativo esperado e não falhou o teste.

## Publicação e verificação
- Commit de artefatos: `814349c7124f8518b24c04611f709da1026a91a4`, publicado em `origin/main`.
- CI `Deploy` run `34540867290`: `completed/success`, quality, build, deploy e smoke concluídos.
- Backup `Deploy to Cloudflare Pages (backup)` run `34541272624`: `completed/success`, `headSha` exato do commit de artefatos.
- Produção: raiz HTTP 200; `/release.json` HTTP 200; `sha` exato `814349c7124f8518b24c04611f709da1026a91a4`; snapshot `row_count=1003`; release `0.2.1294`.

## Próximo passo
Fechar a atualização documental final deste checkpoint e só depois iniciar `2476–2500`; nenhuma aplicação factual remota.
