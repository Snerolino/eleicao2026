# Lote continuous-ops — recon oficial e publicação — 2026-08-23 16:47 UTC

## Objetivo
Retomar o control plane com reconciliação read-only de fontes oficiais, conferir o
snapshot vivo e verificar a publicação do commit atual sem aplicar fatos legislativos.

## Entregue e verificado
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`
  e snapshot seguem a mesma política de ingestão; não houve evidência de alteração
  elegível nesta execução. A conferência de `lista_candidatos_2026.csv` foi descartada
  como comparação de universo: é um subconjunto de 322 linhas, não a fonte do snapshot.
- Câmara oficial read-only: 8/8 janelas trimestrais 2025–2026 responderam `status=ok`;
  IDs foram somente inventariados (`max-pages=1`), sem reconciliação ou escrita.
- Auditoria estrita de fontes read-only: gaps preservados — versões ALRS/Câmara/Senado
  1251/3/112; eventos 1647/2/188; votos 4/2/455. Nenhuma escrita factual.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200. Release live:
  `5a8a24013263b684384b17e003f9fd0d57ce92f4`, versão `0.2.950`, snapshot 1003.
- Workflows para o mesmo SHA: Deploy primário `32652443864` success; backup
  `32652456631` success; backup duplicado `32652619267` skipped.

## Bloqueios reais
- `npm run orch:doctor` RC 1 por shell Node 22.22.2 quando o projeto exige Node 24,
  OpenCode ausente e smoke MCP Codex não exercitado no modo rápido. Isso não invalida
  os checks read-only deste lote, mas mantém o doctor global degradado.
- Auditoria estrita continua RC 2 por gaps históricos reais de source tracking; fail-closed.
- Admin foi somente verificado pelo shell público (HTTP 200); não houve sessão
  autenticada nem decisão editorial simulada. Claims/matrizes/assessments permanecem
  sem alteração.

## Estado dos dados
Nenhum candidato, identidade, voto, FK, source reference, claim, matriz, assessment,
Supabase ou Cloudflare foi alterado neste lote.

## Próximo passo
Reexecutar recon bounded; priorizar recuperação de fontes oficiais dos quatro votos ALRS
sem vínculo e catalogação de fontes Senado/Câmara/ALRS. Manter qualquer aplicação remota
condicionada a identidade R0, schema/FK, fonte oficial, dry-run e idempotência.
