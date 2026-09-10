# QA — autoria Câmara 2051–2075 — 2026-09-10

## Objetivo
Processar o próximo lote boundedamente, revalidar fontes oficiais e manter autoria separada de voto, impacto, score e claim público.

## Seleção e fontes
- Seleção determinística: 25 projetos únicos (offset=2050, limit=25), 45 ocorrências candidato–projeto e 15 candidatos únicos.
- Fonte oficial: 25/25 endpoints Câmara HTTP 200; identidade numérica exata em todos os itens.
- Manifesto versionado: data/legislative-import/camara/authored-project-review-batches/camara-authored-2051-2075-source-manifest.json.
- Bytes revalidados: 32.557; SHA-256 individual preservado.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos; todos withheld; content_read=false.
- Lane red-team independente: 25/25 IDs exatos; todos withheld.
- Reconciliação fail-closed: 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- Artefato: data/legislative-import/camara/authored-project-review-batches/camara-authored-2051-2075-reconciled.json.
- remote_apply=false; nenhuma escrita factual Supabase/Cloudflare.

## Bloqueio real
Os endpoints oficiais comprovam identidade e metadados da proposição, mas não fornecem neste lote a cadeia completa de texto integral validado, versão/evento independente e voto nominal individual. Autoria/ementa não prova posição, efeito causal ou score. Nenhum dado foi inventado ou promovido.

## Checkpoint
- projects_analyzed=2075, withheld=2075, approved=0, pending_review=0.
- Próximo lote corrigido automaticamente pelo script: 2076–2100.
- blocked_items=85; checkpoint: data/legislative-import/camara/authored-analysis-progress-v1.json.

## Verificação
- Revalidação programática: 25 fontes, 25 HTTP 200, 32.557 bytes; cardinalidade reconciliada 25/25.
- Sem aplicação remota, score, matriz, claim ou snapshot público.

## Próximo passo
Iniciar o lote 2076–2100 em nova retomada, mantendo fonte oficial, IDs exatos, duas lanes, remote_apply=false e retenção fail-closed até existir evidência independente de texto, versão/evento e voto nominal.
