# QA — Autoria Câmara 1526–1550 — 2026-09-02

## Objetivo
Processar 25 projetos únicos de autoria oficial da Câmara em duas lanes read-only, sem converter autoria em voto, impacto, score ou claim público.

## Seleção e checkpoint
- Seleção determinística: 25 projetos únicos, offset 1525/limit 25, 100 ocorrências candidato–projeto e 23 candidatos únicos, a partir do índice oficial Câmara.
- Checkpoint final: `blocked`, `projects_analyzed=1550`, `approved=0`, `pending_review=0`, `withheld=1550`, próximo `1551–1575`.
- Lock exclusivo adquirido com `flock`; nenhuma escrita remota foi executada.

## Lanes e verificação independente
- **Causal / Antigravity:** `exit=0`, 25 objetos parseáveis, mas os 25 IDs não pertencem ao lote exato 1526–1550. Validação independente rejeitou por identidade/cardinalidade.
- **Red-team / Codex readonly Luna:** `exit=0`, mas devolveu envelope `executor-result` sem os 25 objetos por item. Cardinalidade/IDs não verificáveis; saída não foi aceita. Stderr registrou autenticação MCP auxiliar, sem atribuir isso ao conteúdo.
- Reconciliação fail-closed: 25 itens, 0 aprovados, 0 pending_review, 25 withheld, 0 score_eligible.

## Estado dos dados
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1526-1550-reconciled.json`.
- `content_read=false` e `remote_apply=false`; somente URLs oficiais de autoria/proposição são preservadas.
- Nenhum authored_projects, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.

## Bloqueios reais
- Antigravity entregou outro recorte: falha de formato/identidade.
- Codex readonly não entregou o contrato por item: falha de formato/cardinalidade; não repetir provider bloqueado neste tick.
- Continua ausente a cadeia fonte normativa → texto integral → versão → evento nominal vinculante → efeito.

## Próximo passo
Retomar `1551–1575` com heartbeat, duas lanes read-only, validação estrita e fail-closed. Não aplicar authored_projects sem fonte primária, análise causal completa e red-team reconciliado.
