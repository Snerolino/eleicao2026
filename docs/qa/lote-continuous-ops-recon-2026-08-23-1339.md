# QA — continuous ops recon — 2026-08-23 13:39 UTC

## Objetivo
Executar um tick bounded do control plane: conferir drift do dataset vivo,
reconhecer fontes oficiais em modo somente leitura e verificar os gates locais
antes de tentar a publicação pendente.

## Entregue e verificado
- `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`:
  1003 linhas/IDs; `data/public-candidates.json`: 1003 registros/IDs;
  diferença em ambos os sentidos: 0.
- CSV oficial: 553194 bytes, SHA-256
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Câmara dos Deputados, API oficial, janelas trimestrais
  `2025-01-01`–`2026-12-31`: 8/8 HTTP/status `ok`, 700 vote IDs
  inventariados, sem reconciliação ou escrita.
- ALRS FED-17 residual: dry-run RC 0, `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
  Os quatro casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria de fontes read-only RC 0: versões sem fonte ALRS/Câmara/Senado
  `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Gates locais com Node 24.19.0: testes `401/401` em 98 arquivos (RC 0),
  TypeScript RC 0, schema RC 0, `data:check` RC 0 (`1003` candidaturas,
  `988` fotos, `1` fonte TSE), build RC 0 (`224` módulos; sitemap `1003 + 2`),
  `git diff --check` RC 0.
- `/release.json` local gerado para HEAD `08e5c0f`; produção ainda não é
  considerada atualizada.

## Bloqueios reais
- `git push origin main` ainda precisa ser tentado neste tick; o estado anterior
  registra HTTP 403 de permissão para `Snerolino`.
- Doctor global RC 1: shell usa Node 22.22.2, OpenCode ausente e smoke MCP
  Codex sem evidência estruturada; os gates do projeto foram executados em
  Node 24.19.0.
- ALRS residual e Senado permanecem fail-closed; nenhuma identidade, voto,
  FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado.

## Próximo passo
Tentar `main -> main`; somente se aceito, validar workflow backup `334951434`,
`headSha`, HTTP de produção e `/release.json`. Manter aplicação factual
condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
