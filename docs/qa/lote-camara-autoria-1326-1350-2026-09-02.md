# QA — Autoria Câmara 1326–1350 — 2026-09-02

## Objetivo
Processar o próximo microbatch de 25 projetos únicos de autoria da Câmara em duas lanes read-only, sem converter autoria em voto, impacto ou score.

## Preparação e fontes
- Lock exclusivo `flock` adquirido antes do checkpoint e mantido durante a operação.
- Seleção local `/tmp/camara-authored-unique-review-1326-1350.json`: 25 IDs únicos, 6 candidatos no campo primário; a seleção não foi promovida a dado versionado.
- O manifesto factual mantém URLs oficiais `dadosabertos.camara.leg.br`; não houve escrita remota nem alteração do snapshot público.
- A contagem de 100 ocorrências não foi assumida: o recorte selecionado não possui `candidate_occurrences` preenchido. Isso foi tratado como discrepância de contrato, não corrigido por inferência.

## Resultado das lanes
- **Causal / Antigravity:** processo concluiu com JSON fail-closed (`items=0`). Relatou que o manifesto flat não define claramente uma janela nominal de 25 projetos e que a fila versionada é agrupada por candidatos, não por `1326–1350`; portanto não forneceu cardinalidade/IDs verificáveis para este pacote.
- **Red-team / Codex MCP Luna:** bloqueado antes da análise por erro de autenticação: `Your access token could not be refreshed because you have since logged out or signed in to another account.`
- Sem duas saídas independentes reconciliáveis e com divergência de cardinalidade/contrato, o lote foi marcado `blocked` e `withheld`.

## Estado dos dados
Checkpoint atualizado: `projects_analyzed=1350`, `approved=0`, `pending_review=0`, `withheld=1350`, `last_batch=1326-1350=blocked`, `next_batch=1351-1375`.
Nenhum `authored_projects`, claim, voto, score, matriz, Supabase ou Cloudflare foi escrito.

## Gates locais
- `npm run orch:doctor`: executado; `OK=46`, `WARN=5`, `FAIL=1` — bloqueio de infraestrutura: shell em Node `v22.22.2`, projeto exige Node 24.
- O gate de dados desta operação é fail-closed; não houve artefato entregável para build/deploy.

## Próximo passo
Retomar `1351–1375` somente após definir a seleção por projeto e cardinalidade de ocorrências de forma determinística e com duas lanes independentes disponíveis. Manter todos os itens sem cadeia completa fonte → texto → versão/evento como `withheld`; não publicar automaticamente.
