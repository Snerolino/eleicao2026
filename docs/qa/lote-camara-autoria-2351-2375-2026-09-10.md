# QA — autoria Câmara 2351–2375 — 2026-09-10

## Objetivo
Processar boundedamente o próximo lote do checkpoint de autoria Câmara, com seleção determinística de 25 projetos, revalidação de fonte oficial, duas lanes independentes e retenção fail-closed. Nenhum fato editorial foi promovido.

## Escopo e seleção
- Seleção determinística: 25 projetos únicos, `offset=2350`, `limit=25`, ordenação pelo helper canônico de cobertura exata de candidatos.
- Ocorrências candidato–projeto: 50; candidatos únicos: 19.
- Artefato de seleção transitório: `/tmp/camara-authored-unique-review-2351-2375.json`.

## Fontes oficiais e identidade
- 25/25 endpoints oficiais Dados Abertos Câmara HTTP 200.
- Identidade exata: 25/25 (`dados.id` igual ao ID extraído da URL oficial).
- URLs de texto integral/evento foram apenas catalogadas; a presença de URL não foi tratada como validação do conteúdo integral nem como voto nominal.
- Bytes contabilizados no manifesto: 297.800; SHA-256 por resposta preservado em `data/legislative-import/camara/authored-project-review-batches/camara-authored-2351-2375-source-manifest.json`.
- Nenhum JSON bruto de resposta foi versionado.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Lane red-team: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; conjuntos de IDs idênticos.
- `remote_apply=false`; nenhum projeto público, claim, voto, score, matriz ou fato remoto foi criado.

## Bloqueio real
Apesar dos metadados e URLs oficiais, não houve validação de texto integral, versão/evento independente vinculante e voto nominal individual. Autoria/ementa não prova posição, mecanismo causal, efeito populacional ou score. Os 25 itens permanecem retidos.

## Checkpoint
- `data/legislative-import/camara/authored-analysis-progress-v1.json` atualizado atomicamente sob lock.
- `projects_analyzed=2375`, `withheld=2375`, `approved=0`, `pending_review=0`, `blocked_items=97`.
- Próximo lote calculado: `2376–2400`.

## Gates locais — Node 24
- `node -v`: `v24.19.0`.
- `npm run test -- --passWithNoTests`: RC 0 — 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 245 módulos; sitemap 1003 candidatos + 2 estáticas (1005 URLs); release local gerado.
- `git diff --check`: RC 0.
- Invariantes dos artefatos: lanes 25/25 exatas; 25 retidos; 0 aprovados; 0 pending; 0 elegíveis; `remote_apply=false`.

## Segurança
- Lock exclusivo adquirido com `flock` em `.orchestrator/runtime/locks/continuous-progress.lock`; um único writer.
- Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada.
- Nenhuma escrita Supabase/Cloudflare factual foi executada.

## Publicação
Após os gates verdes, o lote foi publicado e verificado:
- Commit final documental: `d48479a2caed8cf8299a89eb7e59744881575189` em `origin/main` (reversão explícita de artefatos do lote seguinte iniciado prematuramente).
- Deploy primário anterior `34434958472`: `completed/success` para o commit `8d139bf`; novo deploy do commit final documental será verificado abaixo.
- Backup Cloudflare `334951434`, run `34434974959`: `completed/success` para o commit `8d139bf`; novo backup do commit final documental será verificado abaixo.
- Produção: raiz HTTP 200; `/release.json` HTTP 200, SHA exato do commit final documental será registrado após a nova publicação; snapshot permanece `row_count=1003`., snapshot `row_count=1003`.
- Lote fechado; próximo lote permanece `2376–2400`, sem iniciar nesta execução.
