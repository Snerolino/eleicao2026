# QA — autoria Câmara 1626–1650 — 2026-09-06

## Objetivo
Processar o próximo microbatch de 25 projetos únicos da fila factual de autoria Câmara, com duas lanes read-only independentes, validação estrita e fail-closed.

## Baseline e seleção
- Checkpoint inicial: `1.625` projetos analisados; próximo lote `1626–1650`.
- Seleção determinística: `25` projetos únicos, IDs exatos preservados; `13` candidatos únicos verificáveis no pacote de seleção.
- Lock exclusivo `flock` adquirido; nenhum segundo writer executado.

## Lanes e verificação independente
- Causal — Antigravity: exit `0`; JSON puro; `25/25` objetos; conjunto e ordem de IDs exatos; todas as decisões `withheld`, `score_eligible=false`. Aceita somente como evidência de retenção.
- Red-team — Codex read-only Luna: exit `0`, mas retornou apenas envelope de executor sem decisões por item; cardinalidade não verificável. Rejeitado na camada contrato/formato, não convertido em decisão.
- Nenhum output externo foi tratado como fonte oficial ou prova de texto integral, versão, evento nominal ou efeito.

## Resultado fail-closed
- Lote `1626–1650`: `25` withheld, `0` pending_review, `0` approved, `0` score_eligible.
- Checkpoint final: `1.650` projetos analisados; `withheld=1.650`; próximo `1651–1675`; `49` bloqueios acumulados.
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1626-1650-reconciled.json`.
- `content_read=false`; `remote_apply=false`.
- Nenhum `authored_projects`, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare foi escrito.

## Bloqueios reais
- Red-team não entregou envelope editorial por item com cardinalidade 25; manter bloqueio do executor/contrato.
- Cadeia fonte oficial → texto integral → versão → evento nominal → efeito continua ausente para autoria; autoria não equivale a voto.
- Doctor permanece degradado por shell Node `22.22.2` enquanto o projeto exige Node 24; OpenCode indisponível. Esses bloqueios não foram contornados por inferência.
- Arquivos preexistentes fora deste lote (`docs/portable-ai-orchestration/` e QA anterior) foram preservados sem alteração.

## Próximo passo
Retomar `1651–1675` com duas lanes independentes; não publicar withheld nem aplicar autoria sem decisão approved, source gate, análise causal completa e red-team reconciliado.
