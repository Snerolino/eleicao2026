# QA — autoria Câmara 2326–2350 — 2026-09-10

## Objetivo
Processar o próximo lote bounded de autoria Câmara, com seleção determinística, revalidação de fonte oficial, lanes causal/red-team independentes e retenção fail-closed.

## Seleção e fonte oficial
- Seleção: 25 projetos únicos, `offset=2325`, `limit=25`, ordenação determinística por cobertura exata de candidatos e ID.
- Ocorrências candidato–projeto: 50; candidatos únicos: 18.
- Fonte Dados Abertos Câmara: 25/25 endpoints HTTPS oficiais HTTP 200.
- Identidade: 25/25 IDs oficiais exatos.
- Bytes revalidados: 46.538; SHA-256 individual preservado em `data/legislative-import/camara/authored-project-review-batches/camara-authored-2326-2350-source-manifest.json`.
- Nenhum JSON bruto de resposta foi versionado. A revalidação de URLs de texto/evento não foi tratada como validação do conteúdo nem como prova de voto.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos, todos `withheld`, `content_read=false`.
- Lane red-team: 25/25 IDs exatos, todos `withheld`, `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; conjuntos de IDs coincidem exatamente.
- `remote_apply=false` em todos os artefatos; nenhum score, matriz, assessment, claim, voto ou projeto público foi criado.

## Bloqueio real
A fonte oficial comprova identidade e metadados da proposição, mas o lote não possui cadeia validada de texto integral, versão/evento independente vinculante e voto nominal individual. Autoria/ementa não provam posição legislativa, efeito causal ou score. Nenhum fato foi promovido e nenhuma escrita factual Supabase/Cloudflare ocorreu.

## ALRS preservado
A fila `data/legislative-import/alrs/alrs-score-recovery-queue-v1.json` não foi alterada: permanecem 152 itens (`87` sem evento vinculante e `65` compostos), `remote_apply=false`, sem score/matriz promovido.

## Checkpoint
- `projects_analyzed=2350`, `withheld=2350`, `approved=0`, `pending_review=0`, `blocked_items=96`.
- Lote fechado: `2326-2350` (`withheld`).
- Próximo lote calculado atomicamente: `2351-2375`.
- Checkpoint: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Segurança e escopo
Lock exclusivo adquirido com `flock`; um único writer local. Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada. Nenhuma escrita factual remota foi executada.

## Próximo passo
Executar os gates locais; se verdes, publicar apenas os artefatos documentais e iniciar o lote `2351–2375` no próximo tick, mantendo retenção fail-closed.
