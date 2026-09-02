# QA — Autoria Câmara 1476–1500 — 2026-09-02

## Objetivo
Processar o microbatch seguinte de 25 projetos únicos de autoria da Câmara em duas lanes read-only, sem converter autoria em voto, impacto, score ou claim público.

## Seleção e checkpoint
- Seleção determinística: 25 projetos únicos, 100 ocorrências candidato–projeto e 19 candidatos únicos, offset 1475/limit 25.
- Checkpoint inicial emitido antes das lanes; checkpoint final `blocked`, `projects_analyzed=1500`, `approved=0`, `pending_review=0`, `withheld=1500`, próximo `1501–1525`.
- Lock exclusivo adquirido com `flock`; nenhuma escrita remota foi executada.

## Lanes e verificação independente
- **Causal / Antigravity:** processo concluído `exit=0`; payload JSON parseável após remover o marcador de conclusão, com 25 itens e 25 IDs únicos, porém todos os IDs pertencem a outro recorte (`151–158`), não ao conjunto esperado (`2183/2020` … `251/2023`). Saída rejeitada independentemente na camada `contrato/cardinalidade-identidade`; não houve promoção nem substituição automática.
- **Red-team / Codex MCP Luna:** retorno JSON com exatamente 25 IDs esperados, cada um único, todos `decision=withheld`, `score_eligible=false`, risco `high`, e ausência declarada de texto integral versionado, versão, evento nominal e evidência de efeito. A saída foi aceita somente como lane independente; não autoriza publicação.
- Reconciliação fail-closed: 25 itens, 0 divergências entre o conjunto válido e o recorte, 0 aprovados, 0 `pending_review`, 25 withheld, 0 `score_eligible`.

## Estado dos dados
- Artefato reconciliado: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1476-1500-reconciled.json`.
- O artefato preserva `content_read=false` e `source=official_authorship_metadata_only`; não afirma texto normativo, versão, evento nominal ou efeito causal inexistentes.
- Nenhum `authored_projects`, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.

## Bloqueios reais
- Antigravity forneceu cardinalidade correta, mas IDs de outro recorte; falha de identidade/cardinalidade impede reconciliação causal.
- A cadeia oficial necessária para autoria publicável e impacto continua ausente: fonte normativa verificável → texto integral → versão → evento nominal vinculante → efeito. Autoria e ementa não equivalem a voto.
- OpenCode/free pool continua indisponível conforme checkpoints anteriores; não foi repetido neste tick. O red-team Codex válido confirmou retenção, não supriu a cadeia documental.

## Próximo passo
Retomar `1501–1525` com heartbeat, seleção determinística e duas lanes read-only. Exigir conjunto exato de IDs, validar cardinalidade e manter fail-closed; não aplicar `authored_projects` sem fonte primária, análise causal completa e red-team reconciliado.
