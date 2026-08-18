# QA — lote continuous-ops (2026-08-18)

## Objetivo

Executar uma retomada bounded do control plane: revalidar infraestrutura,
dados públicos, contrato legislativo, cobertura de fontes, gates locais e
produção, sem inventar evidência nem alterar dados remotos sem prova.

## Entregue e verificado

- `npm run orch:doctor`: primeira execução detectou **FAIL=1** porque o shell
  estava em Node 22; o projeto exige Node 24. O ambiente foi corrigido para
  Node **v24.19.0** (já instalado) e a segunda execução terminou **OK=50,
  WARN=4, FAIL=0**. Warnings: OpenCode ausente, Gemini legacy informativo,
  Ollama sem resposta no preflight e rota Codex não exercitada no modo rápido;
  nenhuma bloqueou os gates locais.
- `npm run data:check`: **passou**; snapshot com **1003 candidaturas** e
  **988 fotos oficiais**.
- `node scripts/validate-impact-schema.mjs`: **passou**.
- `npm run impact:sources:audit`: executado em modo read-only; lacunas reais
  permanecem, portanto não houve backfill inventado.
- `npm run impact:alrs:sources:backfill`: dry-run passou com
  `planned_votes=0`, `planned_sources=0`, `blocked_events=3` e
  `blocked_identity=1`; não houve escrita remota.
- Diff explícito do CSV oficial local `../dataset2026/candidatos/lista_candidatos_2026.csv`:
  322 IDs do CSV estão no snapshot; o CSV é parcial e não representa todos os
  1003 registros do snapshot (`snapshot_not_csv=681`), portanto não foi feita
  sincronização destrutiva.
- Suíte local: **73 arquivos / 347 testes passando**.
- TypeScript, schema, data-check, build e `git diff --check`: **passaram**.
- Build gerou release local para o SHA `37b76c5` sem alterações pendentes.
- Produção `https://rs.votopraquem.org`: **HTTP 200**; `/release.json` reporta
  SHA completo `37b76c5355a33a65ef88b164263fe2a4b780f4`, versão `0.2.307`.
- Smoke de produção: **passou**, 1002 cards visíveis, 0 falhas HTTP, 0 erros de
  console online e service worker pronto.
- Git: `main` alinhada com `origin/main`; worktree limpa. Não havia mutação
  funcional para commit/push neste tick.

## Atualização deste tick — 2026-08-18

- HEAD revalidado em `f30a42f1c3922746ba66a2e77635fdc7158226ed`, `main` alinhada
  com `origin/main` e worktree limpa antes da documentação.
- Auditoria read-only atual: **1381 proposições**, **1408 versões**, **1879
  eventos** e **4652 votos**. Cobertura de votos: ALRS **3985/4000**, Câmara
  **195/197**, Senado **0/455**.
- `--strict` retornou código **2** por lacunas de fonte, como esperado; o
  auditor classificou cinco eventos ALRS na fila: `alrs_pl134_2023` (1),
  `alrs_pl165_2025` (6), `alrs_pl361_2025` (6), `alrs_pl38_2026` (1) e
  `alrs_pl77_2025` (1).
- Dry-run do backfill oficial terminou com **2 eventos elegíveis, 0 votos e 0
  fontes planejados, 3 eventos bloqueados e 1 identidade bloqueada**. Nenhum
  `--apply`, escrita remota, commit ou push foi executado neste ponto.

## Estado dos dados e bloqueios

A auditoria read-only encontrou:

- ALRS: 3985/4000 votos com fonte; 15 sem fonte.
- Câmara: 195/197 votos com fonte; 2 sem fonte.
- Senado: 0/455 votos com fonte; recuperação permanece bloqueada até evidência
  oficial adequada.
- Eventos elegíveis do manifesto FED-17 não produziram plano novo no dry-run;
  os casos restantes seguem fail-closed.
- Bloqueios conhecidos: divergência de datas oficiais, ambiguidade de registros
  e identidade ALRS ausente no catálogo oficial. Nenhuma heurística foi usada.

## Próximo passo

No próximo tick, manter a trilha independente read-only para recuperar evidência
oficial dos 15 votos ALRS sem fonte e auditar os 2 votos Câmara sem fonte; só
preparar `--apply` quando URL, HTTP, bytes, SHA-256, proposição, data,
candidato e valor coincidirem exatamente. Em paralelo, manter o gate de
identidade/schema remoto antes de qualquer escrita.
