# QA — autoria Câmara 1701–1725 — 2026-09-06

## Objetivo
Processar 25 projetos únicos da fila factual de autoria Câmara em duas lanes read-only, com fail-closed.

## Seleção verificada
- Seleção determinística: offset=1700, limit=25.
- Resultado local: 25 projetos, 3 ocorrências no primeiro item; contagem total de ocorrências: 75; 16 candidatos únicos.
- SHA-256 seleção temporária: 908ce3fd5fcac77082b2d296d762701bd9b4c2aced95fa0091d07672ecd8a8dd.

## Lanes e verificação
- Causal — free pool: exit=1; deepseek, nemotron, laguna, ling e mimo falharam, sem saída verificável. Causa observada: erros de servidor/saída sem resposta final. Brutos somente em /tmp; causal output SHA-256: d1ffbfde72782f46111916b5ea8819b7f50ceccb878d3bd658f4338f3ac36bcd.
- Red-team — Gemini legacy: exit=0, mas resposta final `blocked`; houve erro 404 do calibrador e bloqueio de execução de leitura por política, sem array com 25 decisões. Bruto somente em /tmp; redteam output SHA-256: 951f371236ad7302e9706d50f1c279de2979dc3fa0163ff25f560688761f1903.
- Nenhuma saída externa foi aceita como evidência editorial.

## Resultado fail-closed
- Status: blocked; 25 withheld; 0 approved; 0 pending_review; 0 score_eligible.
- Checkpoint: 1.725 projetos analisados; próximo lote 1726–1750.
- Nenhum authored_projects, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.

## Artefato
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1701-1725-reconciled.json`
- SHA-256: ad4ba941b256fe798f2ac4ba666c9e1c6c0844717800c9556d4cbb273de286d7.
- Verificado: 25 itens, IDs iguais à seleção, `decision=withheld`, `score_eligible=false`, `content_read=false`, `remote_apply=false`.

## Bloqueios reais
O pool gratuito esgotou sua cadeia de modelos sem resposta verificável; Gemini legacy retornou envelope bloqueado e não forneceu decisões por item. A cadeia fonte oficial → texto integral → versão/evento nominal → efeito continua ausente. Nenhum dado foi inventado.

## Próximo passo
Iniciar o lote 1726–1750 com circuit-breaker respeitado; não repetir providers bloqueados neste tick e não publicar `withheld`.
