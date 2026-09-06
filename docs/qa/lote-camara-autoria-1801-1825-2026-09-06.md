# QA — autoria Câmara 1801–1825 — 2026-09-06

## Objetivo
Processar o próximo intervalo sequencial de 25 projetos únicos da fila factual de autoria Câmara, com duas lanes editoriais independentes, cardinalidade/IDs exatos e fail-closed.

## Seleção verificada
- Intervalo: 1801–1825 (offset=1800, limit=25); 25 projetos únicos, 75 ocorrências candidato–projeto e 20 candidatos únicos.
- Fonte: índice factual oficial versionado; autoria/ementa não foram convertidas em voto, efeito, matriz ou score.

## Lanes e reconciliação
- Causal Antigravity: exit=0, saída parseável com 25/25 IDs exatos e 25 retenções; aceita somente como uma lane, não como reconciliação final.
- Red-team Codex exec Luna: exit=0, porém retornou envelope estruturado sem 25 decisões por item/IDs; cardinalidade exata não é verificável e a saída foi rejeitada.
- A saída AGY auxiliar continha 25 IDs exatos e retenções, mas não substitui a segunda lane independente.
- Resultado fail-closed: 25 withheld, 0 pending_review, 0 approved, 0 score_eligible; content_read=false, remote_apply=false.

## Artefato e checkpoint
- Artefato: data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1801-1825-reconciled.json.
- Checkpoint: projects_analyzed=1825, withheld=1825, próximo lote 1826–1850; lote encerrado e não será repetido.
- Nenhum authored project público, claim, voto, matriz, score, Supabase ou Cloudflare factual foi escrito.

## Bloqueios reais
- Não houve duas saídas editoriais independentes, parseáveis e verificáveis por ID para o mesmo lote.
- Para qualquer promoção futura continuam obrigatórios: texto integral oficial, versão/evento vinculante, fonte/hash, identidade exata e revisão causal + red-team. Não há dado fabricado.
- npm run orch:doctor -- --smoke retornou FAIL porque o shell usa Node v22.22.2 e o projeto exige Node 24; OpenCode ausente foi WARN. Isso não foi mascarado.

## Próximo passo
Usar exatamente 1826–1850 no próximo tick, mantendo descoberta oficial de texto/eventos, duas lanes independentes, validação estrita e retenção sem score. As lanes ALRS/Câmara/Senado de fontes e votos continuam read-only enquanto não houver evidência e sessão Auth/RPC válidas.
