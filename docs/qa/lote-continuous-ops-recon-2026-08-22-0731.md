# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 07:31Z

## Objetivo
Executar um tick bounded do control plane: reconciliação oficial read-only, conferência do `dataset2026`, gates locais completos e verificação da publicação existente, sem promover fatos sem fonte/identidade/dry-run/idempotência.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao fim de cada bloco.
- Câmara: 8 janelas trimestrais oficiais de 2025–2026, `max_pages=1`, todas observadas sem bloqueio; 700 `vote_ids` mantidos apenas no artefato transitório, sem reconciliação ou aplicação.
- ALRS FED-17 residual: dry-run `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Senado: envelope `/tmp/senado-nominal-envelope-latest.json` ausente; nenhum PDF/`legislator_id`/SHA/voto promovido.
- `dataset2026` contra snapshot: CSV SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; 1.003 IDs no CSV e 1.003 no snapshot; diferenças 0/0.
- Testes: 400/400 em 98 arquivos, exit 0.
- TypeScript: exit 0.
- Schema de impacto: exit 0.
- `data:check`: 1.003 candidaturas, 988 fotos, 1 fonte TSE; exit 0.
- Build: exit 0; sitemap 1.003 candidatos + 2 estáticas = 1.005 URLs; `release.json` local `553c3ce-20260822T073015329Z`.
- Smoke local: exit 0; 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: exit 0; worktree limpa após as verificações.

## Estado dos dados e bloqueios
- Auditoria estrita de fontes terminou exit 2 por gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`. Nenhum dado foi promovido.
- Os quatro residuais de Enio Carlos Terra continuam bloqueados por ausência de ID oficial e fonte exata. Não houve matching heurístico.
- Doctor: `OK=48 WARN=5 FAIL=1`; falha real é o shell cron em Node 22.22.2 enquanto o projeto exige Node 24. OpenCode está ausente, Ollama não respondeu ao preflight e a rota MCP Codex não foi exercitada neste tick. Os gates do projeto foram executados e passaram.
- Push documental tentou `git push origin main` e retry com `env -u GH_TOKEN`; ambos falharam HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. HEAD local permanece 60 commits à frente de `origin/main`; nenhum workflow novo foi acionado.
- Produção existente revalidada: raiz HTTP 200 e `/release.json` HTTP 200. Release live `e925327276b82481a348d4db3e2339d075dfe9a3`, versão `0.2.724`, snapshot 1.003 e SHA CSV acima; não corresponde ao HEAD local.
- Workflows remotos ativos: backup `334951434`, primário `320564705`, verificador `335560210`. Não foi forçado deploy porque o push não chegou ao remoto.

## Próximo passo
Retentar publicação documental somente quando a permissão efetiva do GitHub deixar `main -> main`; após isso validar o workflow backup `334951434`, `headSha` e produção. Manter Câmara apenas como recon read-only, ALRS/Senado fail-closed e qualquer aplicação remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
