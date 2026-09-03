# QA — Autoria Câmara 1551–1575 — 2026-09-02

## Objetivo
Processar 25 projetos únicos de autoria oficial da Câmara em duas lanes read-only, sem converter autoria em voto, impacto, score ou claim público.

## Seleção e checkpoint
- Seleção determinística: 25 projetos únicos, offset 1550/limit 25, conforme pacote local `/tmp/camara-authored-unique-review-1551-1575.json`.
- Resultado: `blocked`; 25 itens `withheld`, 0 aprovados, 0 `pending_review`, 0 `score_eligible`; próximo lote `1576–1600`.
- Lock exclusivo adquirido com `flock`; nenhuma escrita remota foi executada.

## Lanes e verificação independente
- **Causal / Antigravity:** processo terminou com exit 0 e saída parseável, mas os 25 IDs pertenciam a outro recorte. Rejeição independente por identidade/cardinality; artefato temporário `/tmp/camara-1551-1575-causal.raw`.
- **Red-team / Codex readonly Luna:** processo terminou com exit 0 e envelope executor válido, mas sem 25 decisões por item verificáveis. Rejeição independente por formato/cardinality; artefato temporário `/tmp/camara-1551-1575-redteam.raw`.
- Nenhuma saída inválida foi promovida. Reconciliação fail-closed gerou o artefato versionado com `content_read=false` e `remote_apply=false`.

## Estado dos dados
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1551-1575-reconciled.json`.
- Nenhum `authored_projects`, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.
- A fonte disponível continua limitada ao índice/autoria e metadados oficiais; não há cadeia validada texto integral → versão/evento nominal → efeito.

## Bloqueios reais
- Antigravity: saída de outro recorte, falha na camada formato/identidade.
- Codex readonly: saída sem contrato por item, falha na camada formato/cardinality.
- Sem fonte normativa/eventual e análise causal/red-team reconciliadas, aplicação permanece proibida.

## Próximo passo
Retomar `1576–1600` com heartbeat, duas lanes read-only, validação estrita e fail-closed. Não aplicar authored_projects sem fonte primária, análise causal completa e red-team reconciliado.
