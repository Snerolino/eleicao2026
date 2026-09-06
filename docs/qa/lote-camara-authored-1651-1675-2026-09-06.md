# QA — autoria Câmara 1651–1675 — 2026-09-06

## Objetivo
Processar o microbatch seguinte de 25 projetos únicos da fila factual de autoria Câmara com duas lanes read-only independentes, validação estrita de cardinalidade/IDs e fail-closed.

## Baseline e seleção
- Checkpoint anterior: `1.650` projetos analisados; próximo lote `1651–1675`.
- Seleção determinística: `25` projetos únicos, `75` ocorrências candidato–projeto e `18` candidatos únicos (`offset=1650`, `limit=25`).
- Worktree: alterações preexistentes fora deste lote foram preservadas; nenhum arquivo fora do escopo foi editado.

## Lanes e verificação independente
- **Causal — Antigravity:** processo terminou `exit=0`, mas a saída continha `25` objetos com IDs de outro recorte e marcador `<!-- GOAL_COMPLETE -->`. Após normalização do marcador, o conjunto/ordem não coincidiu com os 25 IDs esperados; rejeitada na camada `formato/identidade/cardinalidade`. SHA-256 do bruto temporário: `1a8bf97c64953ca67999cd50d64cda41769f69472f8b270246b98ea8c5500b16`.
- **Red-team — Codex MCP Luna (`gpt-5.6-luna`):** resposta foi um array JSON de `25` decisões; IDs, ordem e cardinalidade exatos; todas `withheld`, `score_eligible=false`, `content_read=false`. Aceita apenas como lane red-team read-only; não é fonte primária nem aprovação editorial.
- O artefato reconciliado preserva `content_read=false`, `remote_apply=false` e não promove nenhum item.

## Resultado fail-closed
- Status: `blocked`.
- Projetos analisados no checkpoint: `1.675`.
- Aprovados: `0`; `pending_review`: `0`; `withheld`: `1.675`.
- Este lote: `25` itens, `0` approved`, `0` pending_review`, `25` withheld`, `0` score-eligible.
- Nenhum `authored_projects`, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.
- Bloqueios persistidos no checkpoint: contrato causal/cardinalidade, retenção da lane independente e ausência de cadeia verificável fonte oficial → texto integral → versão/evento nominal → efeito.

## Artefato
- `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1651-1675-reconciled.json`
- SHA-256: `eba4d01225e8c26c45fada994fc819a077f5fa5d1fb4af906da7079b59973637`

## Publicação e verificação
- Commit: `c923b4b81fc4819acfc609ef13b0991982e78e83`, confirmado em `origin/main`.
- Produção: raiz `https://rs.votopraquem.org` HTTP `200`; `/release.json` HTTP `200`, `sha` exato do commit e snapshot `1003`.
- Workflow primário `Deploy`, run `34019997668`: observado `queued` → `in_progress`, `headSha` exato; consulta intermediária teve erro transitório de conexão da API GitHub e não foi possível capturar a conclusão nesta janela.
- Workflow backup `Deploy to Cloudflare Pages (backup)`, run `34020001523`: `completed/skipped` para o mesmo SHA. O `release.json` já confirma a publicação do SHA exato.

## Próximo passo
Retomar `1676–1700` com duas lanes read-only independentes; não publicar `withheld` nem aplicar autoria sem decisão `approved`, source gate verde, análise causal completa e red-team reconciliado.
