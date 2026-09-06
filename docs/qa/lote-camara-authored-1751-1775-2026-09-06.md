# QA — autoria Câmara 1751–1775 — 2026-09-06

## Objetivo
Processar o próximo intervalo sequencial de 25 projetos únicos da fila factual de autoria Câmara, preservando duas lanes editoriais independentes, cardinalidade/conjunto de IDs exatos e fail-closed.

## Seleção verificada
- Intervalo: `1751–1775`; offset `1750`, limit `25`; seleção não repete lote encerrado.
- `25` projetos únicos, `75` ocorrências candidato–projeto e `23` candidatos únicos.
- Fonte: índice factual oficial versionado; nenhum texto integral, versão, evento nominal, voto ou efeito foi inferido. IDs selecionados foram preservados no artefato reconciliado.

## Lanes e resultado
- Causal: `blocked`; não houve saída editorial independente verificável neste tick.
- Red-team: `blocked`; não houve saída editorial independente verificável neste tick.
- Reconciliação: `0 approved`, `0 pending_review`, `25 withheld`, `0 score_eligible`.
- Motivo: sem duas decisões verificáveis com cardinalidade e conjunto exatos de IDs, não é permitido promover autoria a análise causal, voto, score, matriz ou dado público.

## Artefato e checkpoint
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1751-1775-reconciled.json`.
- Checkpoint: `projects_analyzed=1775`, `withheld=1775`, `last_batch=1751-1775`, `next_batch=1776-1800`; lote encerrado e não será repetido.
- `remote_apply=false`; nenhum authored project, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.
- Saídas brutas de executores não foram versionadas.

## Bloqueios reais
- Executor editorial independente verificável indisponível neste tick; sem saída não há decisão editorial aceitável.
- Permanecem obrigatórios: texto integral oficial, versão/evento vinculante, fonte/hash e revisão causal + red-team com IDs exatos.

## Próximo passo
Iniciar exatamente `1776–1800` no próximo tick, mantendo o bloqueio por item e sem publicar itens `withheld`; lanes oficiais read-only ALRS/Câmara/Senado continuam independentes.

## Publicação e verificação
- Commit local: `253e5ee5dc410baac615d7b068c21117edc232ea` (inclui os artefatos/documentos pendentes já presentes na worktree).
- `git push origin main`: bloqueado neste tick por falha real de DNS (`Could not resolve host: github.com`); `origin/main` permanece em `80e8e61fafd1e88c3f91c36c88fed857e22a0e3e`.
- Produção: raiz `HTTP 000` por timeout de resolução DNS; `/release.json` respondeu com a release anterior `80e8e61`, versão `0.2.1218`, snapshot `1003`. Não há deploy deste commit nem `headSha` remoto a validar.
