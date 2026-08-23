# QA — tick continuous ops: recon oficial, gates e transporte

- **Data/hora:** 2026-08-23 15:50 UTC
- **Objetivo:** executar um tick bounded do control plane, manter as três fontes federais em reconciliação read-only/fail-closed, verificar a aplicação local e retentar a publicação do `main`.

## Entregue e verificado

- Lock não bloqueante em `.orchestrator/runtime/locks/continuous-progress.lock`: adquirido e liberado no bootstrap.
- Estado local: `main`, HEAD `84560d1049fa16cba5b9c0421442599678716681`, worktree limpa antes do registro, `5` commits à frente de `origin/main`.
- ALRS FED-17 residual dry-run RC 0: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara API oficial read-only: `8/8` janelas trimestrais 2025–2026 OK, `vote_ids` apenas inventariados; nenhum ID reconciliado ou aplicado.
- Senado permanece fail-closed: sem derivação comprovada de SHA/`legislator_id`; nenhum dado produzido.
- Auditoria de fontes read-only: RC 2 por gaps reais — versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`. O comando não altera dados.
- Gates locais com Node `v24.19.0`: testes `401/401` em `98` arquivos; TypeScript RC 0; schema RC 0; `data:check` RC 0 (`1003` candidaturas, `988` fotos, `1` fonte TSE); build RC 0 (`225` módulos, sitemap `1003 + 2`, `release.json` local); smoke RC 0 (`1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto); `git diff --check` RC 0.
- Produção independente: raiz HTTP 200; `/release.json` HTTP 200; live `692094f875844d977f8436b02c04dacaa6423068`, versão `0.2.936`, snapshot `1003`.
- GitHub workflows descobertos: backup `334951434` disponível; nenhum workflow novo acionado porque o transporte não aceitou o push.

## Bloqueios reais

- `npm run orch:doctor` RC 1: shell padrão usa Node `22.22.2` embora o projeto exija Node 24; OpenCode ausente; smoke MCP Codex não exercitado no modo rápido. Os gates do projeto foram executados explicitamente com Node 24.19.0.
- `env -u GH_TOKEN git push origin main` foi tentado 3 vezes e falhou nas 3 com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Portanto não foi possível validar `main -> main`, `headSha` de CI ou publicar o HEAD local.

## Segurança/estado de dados

Nenhum candidato, identidade, voto, FK, `source_reference`, claim, Supabase remoto, Cloudflare ou segredo foi alterado. A lane `remote_factual_apply` continua bloqueada até R0, schema/FK, fonte oficial exata, dry-run e idempotência.

## Próximo passo

No próximo tick, retentar o transporte Git. Se `main -> main` for aceito, validar o workflow backup `334951434`, comparar `headSha` com o commit live e repetir HTTP raiz, `/release.json` e smoke de produção. Manter ALRS/Senado/Câmara em reconciliação read-only enquanto faltarem evidências exatas.
