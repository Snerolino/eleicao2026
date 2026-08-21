# QA — Tick contínuo: recon bounded e gate fail-closed — 2026-08-21 04:55Z

## Objetivo
Executar o próximo tick sem promover fatos sem fonte: repetir a preparação local
ALRS, verificar a fila de fontes substantivas, testar o reparo residual Enio/Terra
e comparar o dataset vivo com o snapshot público.

## Entregue e verificado

- Pacote local ALRS regenerado: `9` pedidos para `8` versões em
  `data/legislative-import/alrs/substantive-source-request-pack-v1.json`.
- Gate substantivo executado fail-closed: `25` itens verificados, todos sem fonte
  substantiva exata; RC `2`; nenhuma escrita factual.
- Reparador ALRS FED17 em dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Auditoria read-only de cobertura: ALRS `1251/1282` versões sem fonte,
  `1647/1678` eventos sem fonte e `4/4000` votos sem fonte; Câmara `3/37`,
  `2/36`, `2/552`; Senado `112/112`, `188/188`, `455/455`.
- Comparação do dataset: `22` CSVs, `8` arquivos comparáveis por identificador;
  os CSVs de candidatos não apresentaram IDs ausentes no snapshot (`1003` IDs).
  O único ID extra veio de `SQ_CANDIDATO_DOADOR` em receita partidária e não é
  evidência de candidato novo; nenhum refresh foi aplicado.

## Bloqueios reais

- Quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata.
- As 25 versões ALRS continuam sem fonte substantiva fora da rota de votos.
- Senado permanece fail-closed por divergência de bytes/SHA do manifesto.
- Câmara não apresentou lote novo.
- Doctor smoke: `OK=51`, `WARN=5`, `FAIL=1`; o único FAIL é a comprovação da
  rota MCP Codex, com logs de `401 invalid_refresh_token`/token expirado. OpenCode
  está ausente; Ollama não respondeu ao preflight. Os gates locais seguem usando
  Node `v24.19.0`.

## Segurança e estado remoto

Nenhum voto, identidade, FK, matriz, claim, `source_reference`, Supabase,
Cloudflare ou snapshot foi alterado. Nenhum dado foi inferido a partir do
`dataset2026`; os leads continuam apenas pistas para localizar fonte oficial.

## Próximo passo

Repetir recon bounded oficial e manter a lane local independente ativa. Aplicação
remota somente após R0, schema/FK, fonte oficial exata, dry-run e idempotência.
