# QA — autoria Câmara 2176–2200 — 2026-09-10

## Objetivo
Processar boundedamente o lote determinístico seguinte de autoria Câmara, com revalidação oficial de identidade/fonte, lanes causal e red-team independentes e retenção fail-closed.

## Seleção e fontes
- Seleção determinística: **25 projetos únicos**, offset=2175, limit=25, ordenação por ID de projeto único ascendente.
- Resultado factual: **57 ocorrências candidato–projeto** e **18 candidatos únicos**.
- Fonte oficial: **25/25** URLs da API Dados Abertos Câmara HTTP 200.
- Identidade: **25/25** valores dados.id conferidos exatamente contra o ID numérico da URL.
- Bytes/SHA: **33.335 bytes** totais; SHA-256 individual preservado e validado no manifesto data/legislative-import/camara/authored-project-review-batches/camara-authored-2176-2200-source-manifest.json.
- Nenhum texto/HTML bruto foi versionado.

## Lanes e reconciliação
- Lane causal: **25/25** IDs exatos; todos withheld; content_read=false.
- Lane red-team: **25/25** IDs exatos; todos withheld; content_read=false.
- Reconciliação: **25 withheld**, **0 pending_review**, **0 approved**, **0 score_eligible**; conjuntos de IDs coincidem exatamente.
- remote_apply=false em manifesto, lanes e reconciliado.

## Bloqueio real
Os endpoints oficiais comprovam identidade e metadados, mas o lote não demonstra simultaneamente texto integral validado, versão/evento independente vinculante e voto nominal individual. Autoria/ementa não provam posição, efeito causal ou score. Nenhum fato, claim, voto, matéria, matriz, score ou projeto público foi inventado ou promovido.

## Checkpoint
- projects_analyzed=2200, withheld=2200, approved=0, pending_review=0, blocked_items=90.
- Lote fechado: 2176–2200; próximo calculado atomicamente: 2201–2225.
- Lock exclusivo .orchestrator/runtime/locks/continuous-progress.lock adquirido com flock; um único writer.

## Gates locais — Node 24
- node -v: **v24.19.0**.
- npm run test -- --passWithNoTests: **RC 0 — 499/499 testes, 120 arquivos**.
- npx tsc --noEmit: **RC 0**.
- node scripts/validate-impact-schema.mjs: **RC 0**.
- npm run data:check: **RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE**.
- npm run build: **RC 0 — 245 módulos; sitemap 1003 + 2 URLs estáticas; release local gerado**.
- git diff --check: **RC 0**.

## Operação e segurança
Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase factual ou Cloudflare factual foi alterada. Nenhuma escrita remota foi executada. Nenhum score, matriz, claim ou voto foi criado.

## Publicação e verificação
- Commits publicados em `origin/main`: `07d4abb0e63d74158765a6347cfc0120b31b0161` (artefatos), `78b5632a9846823af158cc3f160f2eba40aa3001` e `196e8012dad014b9d26f68d3dbe7a8fe792ed506` (correções documentais finais).
- Backup Cloudflare workflow `334951434`: run `34429860066`, `completed/success`, `headSha` exato do commit final `196e8012dad014b9d26f68d3dbe7a8fe792ed506`.
- Produção: raiz HTTP 200; `/release.json` HTTP 200, SHA exato `196e8012dad014b9d26f68d3dbe7a8fe792ed506`, snapshot `row_count=1003`.
- O workflow primário `Deploy` ficou pendente/in-progress na janela; o caminho backup confiável concluiu com sucesso e a produção confirmou o SHA exato.
- Não houve aplicação factual Supabase/Cloudflare.

## Próximo passo
Somente após fechar e publicar este checkpoint iniciar 2201–2225, mantendo fonte oficial, identidade exata, duas lanes, remote_apply=false e retenção fail-closed.
