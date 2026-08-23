# QA — tick continuous ops: recon oficial, gates e transporte

- **Data/hora:** 2026-08-23 16:10 UTC
- **Objetivo:** repetir reconciliação oficial read-only, verificar fontes/produção e retentar o transporte Git sem aplicar fatos.

## Entregue e verificado

- Dataset vivo versus snapshot: `data:check` RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE. Nenhuma divergência factual foi detectada nesta retomada.
- Auditoria de fontes read-only RC 2 por gaps reais: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Auditoria do envelope Câmara RC 0: `7` URLs, todas HTTP 200.
- Câmara API oficial read-only, 8 janelas trimestrais 2025–2026, `8/8` OK, `700` `vote_ids` inventariados; nenhum ID reconciliado ou aplicado.
- Produção independente: raiz HTTP 200 e `/release.json` HTTP 200; live `3319c1d2fc490eba5eb3d0818636483207f23fbc`, versão `0.2.942`, snapshot `1003`.
- Gates locais RC 0: `401/401` testes em `98` arquivos; TypeScript; schema; `data:check`; build com `225` módulos e sitemap `1003 + 2`; `git diff --check`.
- Backup remoto `334951434` detectado no SHA atual como `completed/skipped` (`32650126358`); não houve novo deploy necessário porque o SHA já está live.

## Bloqueios reais

- `npm run orch:doctor` RC 1: shell Node `22.22.2` embora o projeto exija Node 24; OpenCode ausente; smoke MCP Codex não exercitado no modo rápido.
- `git push origin main` falhou RC 128 com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. O branch local já coincide com `origin/main`; nenhum workflow novo foi acionado por este tick.
- ALRS FED-17 residual permanece bloqueado nos quatro casos Enio Carlos Terra, sem ID oficial/fonte exata. Senado segue fail-closed sem envelope nominal verificável.

## Segurança/estado de dados

Nenhum candidato, identidade, voto, FK, `source_reference`, claim, matriz, assessment, Supabase remoto, Cloudflare ou segredo foi alterado. A lane `remote_factual_apply` continua condicionada a R0, schema/FK, fonte oficial exata, dry-run e idempotência.

## Próximo passo

Retentar transporte Git no próximo tick e, se houver mudança no remoto, validar `headSha`, workflow backup, raiz, `/release.json` e smoke. Manter recon Câmara/ALRS/Senado read-only/fail-closed e avançar apenas com evidência oficial exata.
