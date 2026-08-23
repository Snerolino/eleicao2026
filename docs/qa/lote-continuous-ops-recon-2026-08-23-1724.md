# QA — lote continuous ops recon — 2026-08-23 17:24Z

## Objetivo
Retomar o control plane contínuo com reconciliação read-only das fontes oficiais, conferir o snapshot vivo e retentar a publicação documental pendente, sem aplicar fatos legislativos sem fonte, identidade e idempotência comprovadas.

## Entregue e verificado
- Bootstrap do repositório revalidado: `main`, HEAD local `8642734a366ea08be46b9c6bf0c42ac19da7fefa`, worktree limpa antes deste registro.
- `npm run data:check`: RC 0; snapshot público com `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.
- Dataset oficial conferido por `SQ_CANDIDATO`: `consulta_cand_2026_RS.csv` tem `1003` linhas; arquivo com `553194` bytes e SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot tem `1003` IDs TSE únicos.
- Auditoria de cobertura de fontes read-only: RC 0, mas gaps reais preservados — versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Fila ALRS residual: quatro votos sem evidência vinculada (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`).
- Câmara oficial read-only: `8/8` janelas trimestrais 2025–2026 com `status=ok`, `blocked=null`; IDs apenas inventariados, sem reconciliação ou escrita.
- ALRS FED-17 residual: dry-run RC 0, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Nenhuma candidatura, identidade, voto, FK, `source_reference`, claim, matriz, assessment, Supabase ou Cloudflare foi alterado.

## Bloqueios reais
- `git push origin main` falhou RC 128 por HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. O registro QA/STATE deste lote não foi publicado e nenhum workflow novo foi acionado.
- `npm run orch:doctor` RC 1: shell usa Node `22.22.2` enquanto o projeto exige Node 24; OpenCode ausente; smoke MCP Codex não exercitado no modo rápido. Os gates de projeto anteriores permanecem os últimos gates verdes documentados e não foram repetidos neste tick.
- Auditoria strict de fontes continua bloqueada por gaps oficiais reais; nenhum dado foi inferido para fechá-los.

## Próximo passo
Retentar transporte Git no próximo tick. Se `main -> main` for aceito, validar o workflow backup `334951434`, `headSha`, HTTP da raiz e `/release.json`. Manter Câmara apenas em inventário, ALRS residual e Senado fail-closed; qualquer aplicação factual continua condicionada a R0 de identidade, schema/FK, fonte oficial, dry-run e prova de idempotência.
