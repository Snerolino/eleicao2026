# QA — autoria Câmara 1676–1700 — 2026-09-06

## Objetivo
Processar o microbatch de 25 projetos únicos da fila factual de autoria Câmara com duas lanes read-only independentes, cardinalidade/IDs exatos e fail-closed.

## Baseline e seleção
- Checkpoint anterior: 1.675 projetos analisados; seleção offset=1675, limit=25.
- Seleção verificada localmente: 25 projetos únicos, 75 ocorrências candidato–projeto e 16 candidatos únicos.
- SHA-256 do artefato temporário: 918a0cdc97bd5a032eb6a31eef374e3dbe007d73cfdac691a77d4c67d77f3eef.

## Lanes e verificação independente
- Causal — Antigravity: exit=0, mas declarou falha de contrato porque o lote temporário não integra o snapshot read-only; não entregou decisões por item. Saída bruta preservada em /tmp; SHA-256: 0060015cae8439c647a16b390c9cb1f3a00d886524855326873a5baeb4e3630f.
- Red-team — Codex CLI Luna (gpt-5.6-luna): exit=0, mas retornou envelope executor status=blocked, sem array de decisões; não passou cardinalidade/IDs. Saída bruta preservada em /tmp; SHA-256: cb800638b3fa390e2a23289f9a1ad74e0535a0e02e2d5b60f50173426092e577.
- Nenhuma saída externa foi convertida em evidência editorial. O conteúdo do projeto não foi lido (content_read=false).

## Resultado fail-closed
- Status: blocked; 25 itens retidos, 0 approved, 0 pending_review, 0 score_eligible.
- Checkpoint atualizado: 1.700 projetos analisados, 1.700 withheld; próximo lote 1701–1725.
- Nenhum authored_projects, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.

## Artefato verificado
- data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1676-1700-reconciled.json
- SHA-256: bc6152c557542bf5aba513db0e20b56a4838ec0f45cb51a171eaed29fc2239ba
- Invariantes: 25 itens; IDs iguais à seleção; decision=withheld; score_eligible=false; remote_apply=false; content_read=false.

## Bloqueios reais
Ausência do lote temporário no snapshot do Antigravity e envelope bloqueado do executor Codex, impedindo reconciliação independente. Permanece ausente a cadeia fonte oficial → texto integral → versão/evento nominal → efeito; não há autorização para publicar autoria inferida.

## Próximo passo
Iniciar imediatamente o lote 1701–1725, repetindo seleção determinística, duas lanes read-only e fail-closed. Não publicar withheld.
