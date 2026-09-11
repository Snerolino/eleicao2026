# QA — lane editorial exclusiva ALRS — 2026-09-11

## Objetivo

Separar a throughput ALRS da lane de autoria Câmara, eliminar reavaliação por
`version_key` em colisão e produzir batches determinísticos fonte-first para
P0/P1 e demais versões pendentes. Esta entrega é somente local/read-only.

## Estado de entrada

- Fila ALRS: `1281` proposition versions.
- Votos factuais na fila: `4000`.
- Prioridade total: `30` P0 e `82` P1.
- Colisões de `version_key`: `18` chaves, `65` versões afetadas; resolução classifica `8` como possível mesmo texto/eventos múltiplos e `10` como possível mismatch de identidade.
- Nenhum `proposition_version_id` ou `review_key` é duplicado na fila.

## Lane exclusiva gerada

- Artefato: `data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json`.
- Pending não resolvido e não colidente: `1199` versões.
- Prioridade na lane após exclusões: `11` P0, `74` P1, `893` P2, `221` P3.
- Microbatches determinísticos: `48`, com limite de `25` itens.
- `proposition_version_id` únicos: `1199/1199`.
- `review_key` únicos: `1199/1199`.
- `remote_apply=false` e `public_approval=false`.
- Nenhuma matriz, score, assessment ou escrita Supabase foi criada.

A diferença entre P0/P1 totais e os itens atualmente elegíveis na lane é causada
por versões já encerradas/procedurais ou excluídas por colisão. As 18 colisões
não foram descartadas: permanecem no pacote de resolução canônico e bloqueadas
até identidade/evento/texto oficial serem diferenciados.

## Reprodutibilidade e gates

- Segunda execução do builder deve produzir byte-for-byte o mesmo artefato.
- A seleção ordena por prioridade, cobertura factual e `review_key`.
- Cada batch conserva `remote_apply=false` e `public_approval=false`.
- Próximo passo: fonte oficial/durabilidade, depois causal + red-team, disposição
  editorial no `/admin`, e somente então matriz pending_review, aprovação e
  fan-out idempotente.

## Bloqueios reais

- As 18 colisões ainda não têm resolução editorial canônica final.
- P0/P1 não devem ser autoaprovados: faltam disposições/revisão humana onde o
  pacote não contém decisão completa.
- Os 152 itens de score recovery continuam separados: 87 sem binding de evento
  e 65 compostos não separáveis.

## Segurança

- Nenhuma migration, RLS, Auth, Storage, Edge Function, Supabase remoto ou
  Cloudflare factual foi alterada.
- A lane de autoria Câmara continua independente; um writer por worktree.
