# QA — autoria Câmara 2476–2500 — 2026-09-10

## Objetivo
Processar o próximo lote boundedamente a partir do checkpoint, com seleção determinística, revalidação oficial Câmara, lanes causal/red-team independentes e retenção fail-closed. Nenhum fato editorial foi promovido.

## Seleção e fontes oficiais
- Seleção determinística pelo helper canônico: `offset=2475`, `limit=25`; 25 projetos únicos, 50 ocorrências candidato–projeto e 16 candidatos únicos.
- Revalidação oficial Dados Abertos Câmara: 25/25 endpoints de proposição e tramitação HTTP 200.
- Identidade exata: 25/25 respostas com `dados.id` igual ao ID numérico literal da URL.
- Bytes das respostas de proposição + tramitação: 84.558; SHA-256 individual preservado no manifesto.
- URLs oficiais de texto integral catalogadas: 25/25; eventos independentes distintos catalogados: 17/25. A presença da URL não foi tratada como validação do conteúdo.
- Nenhum JSON bruto foi versionado; somente manifesto derivado com URL, status, bytes e SHA-256.

Manifesto: `data/legislative-import/camara/authored-project-review-batches/camara-authored-2476-2500-source-manifest.json`.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Lane red-team: 25/25 IDs exatos, 25 `withheld`, `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; os conjuntos de IDs coincidem exatamente.
- Todos os artefatos têm `remote_apply=false`; nenhum projeto público, claim, voto, score, matriz ou assessment foi criado.

Artefatos:
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2476-2500-causal.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2476-2500-redteam.json`
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-2476-2500-reconciled.json`

## Bloqueio real
A revalidação oficial comprova identidade e metadados, mas não valida texto integral, versão/evento independente vinculante nem voto nominal individual. Autoria/ementa não prova posição legislativa, efeito causal ou score. Os 25 itens permanecem retidos; não houve escrita factual Supabase/Cloudflare.

## Checkpoint
- `projects_analyzed=2500`, `withheld=2500`, `approved=0`, `pending_review=0`, `blocked_items=102`.
- Lote encerrado: `2476-2500` (`withheld`).
- Próximo lote calculado atomicamente: `2501-2525`.
- Checkpoint: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Segurança e escopo
- Lock exclusivo adquirido com `exec 9>...; flock -x 9`; um único writer local.
- Node usado nos artefatos: `v24.19.0`.
- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase, Cloudflare ou aplicação factual remota foi alterada/executada.
- Churn não relacionado não foi incluído.

## Gates locais
- `node -v`: `v24.19.0`.
- `npm run test`: RC 0 — 499/499 testes em 120 arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0; fixtures boas aceitas e ruins rejeitadas.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 245 módulos; sitemap 1003 candidatos + 2 estáticas = 1005 URLs; release local gerado.
- `git diff --check`: RC 0.
- O aviso de UUID inválido pertence a fixture negativa esperada e não falhou teste.

Todos os gates locais obrigatórios ficaram verdes.
