# Lote Câmara — autoria 1776–1800 — 2026-09-06

## Objetivo
Avançar o próximo intervalo determinístico de 25 projetos únicos de autoria Câmara, preservando a separação entre autoria factual e análise causal/votos/score.

## Entregue e verificado
- Seleção: posições 1776–1800 (`offset=1775`, `limit=25`), 25 projetos, 75 ocorrências candidato–projeto e 23 candidatos únicos.
- Red-team Codex exec em modo read-only: 25/25 IDs exatos; 25 decisões `withheld`; `score_eligible=false` em todos.
- Lane causal Antigravity: bloqueada por timeout sem saída verificável; nenhuma decisão foi aceita dessa lane.
- Reconciliação fail-closed: 25 `withheld`, 0 `pending_review`, 0 aprovados, 0 elegíveis para score, `remote_apply=false`, `content_read=false`.
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1776-1800-reconciled.json`.
- Checkpoint: `projects_analyzed=1800`, `next_batch=1801-1825`.

## Estado dos dados
A autoria possui metadados oficiais, mas este lote não demonstrou cadeia independente completa de texto integral, versão da matéria, evento nominal e evidência causal. Nenhum fato de voto, matriz, score ou claim pública foi fabricado ou aplicado.

## Bloqueios reais
- Antigravity não produziu saída dentro do timeout; o processo pendurado foi encerrado para evitar reinício/lock órfão.
- Sem duas lanes editoriais independentes completas, a promoção permanece proibida.
- Doctor local: FAIL por Node 22.22.2 enquanto o projeto exige Node 24; OpenCode ausente (WARN). Não tratar como gate verde.

## Próximo passo
Usar `1801–1825` como próximo chunk, mantendo descoberta oficial de texto/eventos, duas lanes independentes, cardinalidade/IDs exatos e fail-closed. Em paralelo, manter lanes ALRS/Câmara/Senado de fontes e votos sem escrita remota enquanto não houver evidência e sessão Auth/RPC válidas.

## Publicação verificada
- Commit/push: `2126b80f78859fbfd645707978075a91946c5e56` em `origin/main`.
- Backup Cloudflare workflow `334951434`, run `34023730089`: `success`, `headSha` exato.
- Produção: `https://rs.votopraquem.org` HTTP 200; `release.json` HTTP 200, SHA exato `2126b80f78859fbfd645707978075a91946c5e56`, versão `0.2.1222`, snapshot 1003.
