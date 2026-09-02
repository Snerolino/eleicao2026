# QA — Autoria Câmara 1576–1600 — 2026-09-02

## Objetivo
Processar 25 projetos únicos de autoria oficial da Câmara em duas lanes read-only, sem converter autoria em voto, impacto, score ou claim público.

## Seleção e checkpoint
- Seleção determinística: 25 projetos únicos, 45 ocorrências candidato–projeto e 16 candidatos únicos (`offset=1575`, `limit=25`) a partir do manifesto oficial versionado.
- Resultado: `blocked`; 25 itens `withheld`, 0 aprovados, 0 `pending_review`, 0 `score_eligible`; próximo lote `1601–1625`.
- Lock exclusivo adquirido com `flock`; nenhuma escrita remota foi executada.

## Lanes e verificação independente
- **Causal / Antigravity:** exit 0; JSON parseável com 25/25 IDs exatos. Retido: `content_read=false`; não houve leitura de texto integral nem inferência causal.
- **Red-team / Codex readonly Luna:** exit 0, mas devolveu envelope `executor-result` sem decisões por item; rejeitado independentemente por contrato/cardinality.
- **Red-team / free pool:** exit 69, sem saída verificável; não repetido neste tick.
- Reconciliação fail-closed: 25 itens, 0 divergências avaliáveis, 0 aprovados, 0 pending, 25 withheld.

## Estado dos dados
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1576-1600-reconciled.json`.
- `content_read=false` e `remote_apply=false`; somente o índice/manifesto de autoria oficial foi usado.
- Nenhum `authored_projects`, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.

## Bloqueios reais
- Codex: formato incompatível com o contrato por item (envelope executor sem cardinalidade verificável).
- Free pool: indisponível no tick (`exit=69`, sem saída).
- Continua ausente a cadeia fonte normativa → texto integral → versão → evento nominal vinculante → efeito, além do red-team independente reconciliável.

## Publicação e verificação
- Commit: `aec5cff471d199c9392eb6fbcaf8eccb6ab23bb3`, pushed com sucesso para `origin/main`.
- Backup Cloudflare: workflow `334951434`, run `33662254607`, `completed/success`, `headSha` exato.
- Produção: `https://rs.votopraquem.org` HTTP 200; `/release.json` HTTP 200 confirmou SHA `aec5cff471d199c9392eb6fbcaf8eccb6ab23bb3`, `row_count=1003`.

## Próximo passo
Retomar `1601–1625` com heartbeat, duas lanes read-only e validação estrita de cardinalidade/IDs/fontes. Não aplicar `authored_projects` sem fonte primária, análise causal completa e red-team reconciliado.
