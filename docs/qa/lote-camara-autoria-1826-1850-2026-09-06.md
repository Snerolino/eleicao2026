# QA — autoria Câmara 1826–1850 — 2026-09-06

## Objetivo
Processar o próximo intervalo sequencial de 25 projetos únicos da fila factual de autoria Câmara, sem transformar autoria em voto, impacto, matriz ou score.

## Evidência verificada
- Seleção determinística: offset 1825, limit 25; 25 projetos únicos, 75 ocorrências candidato–projeto e 23 candidatos únicos.
- Todos os 25 itens são REQ (requerimentos), portanto foram retidos como procedimentais.
- Descoberta oficial: 25 de 25 URLs da API dadosabertos.camara.leg.br responderam HTTP 200; manifesto versionado com bytes e SHA-256 em data/legislative-import/camara/authored-project-review-batches/camara-authored-1826-1850-source-manifest.json.
- Lanes causal e red-team produziram o mesmo conjunto exato de 25 IDs; reconciliação independente: 25 withheld, 0 pending_review, 0 approved, 0 score_eligible.
- content_read=false: a consulta confirmou identidade e metadados oficiais, não texto integral normativo nem evento nominal vinculante.

## Dados e publicação
- Nenhum authored_projects, claim, voto, assessment, matriz, score, Supabase ou Cloudflare factual foi escrito.
- Checkpoint atômico: projects_analyzed=1850, withheld=1850, próximo lote 1851–1875.

## Bloqueios reais
- Requerimento não prova efeito material, versão vinculante, evento de votação ou voto defensor; a cadeia editorial permanece fail-closed.
- O lote não é elegível para publicação factual adicional nem score.

## Próximo passo
Processar exatamente 1851–1875, mantendo fonte oficial, cardinalidade e IDs exatos, duas lanes independentes e retenção fail-closed; em paralelo, continuar auditoria read-only de fontes ALRS, Câmara e Senado e recuperação de eventos sem inventar dados.

Timestamp do checkpoint: 2026-09-06T09:44:02Z

## Publicação
- Commit local 9b07f5d criado com os artefatos do lote. O push para origin/main foi tentado três vezes e bloqueado por HTTP 403: Permission to Snerolino/eleicao2026.git denied to Snerolino. Nenhum deploy novo foi acionado; alterações preexistentes não relacionadas permaneceram fora do commit.
