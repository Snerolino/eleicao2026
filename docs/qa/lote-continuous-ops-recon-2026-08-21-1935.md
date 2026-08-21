# QA — lote continuous ops recon — 2026-08-21 19:35 UTC

## Objetivo
Executar um tick bounded das quatro lanes: recon oficial read-only, comparação explícita entre `../dataset2026` e o snapshot, gates locais completos e verificação de produção. Nenhum fato legislativo foi aplicado sem R0, schema/FK, fonte oficial exata, dry-run e idempotência.

## Entregue e verificado
- `flock -n .orchestrator/runtime/locks/continuous-progress.lock` foi adquirido e liberado no bootstrap; nenhum loop ou `sleep` foi usado.
- ALRS FED-17: `node scripts/repair-alrs-fed17-residual.mjs` falhou fechado com `JWT issued at future` (exit 1); 0 votos, 0 correções de data e 0 escritas. Os quatro residuais de Enio Carlos Terra permanecem sem ID oficial e fonte exata.
- Câmara: `discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` consultou 8/8 janelas trimestrais da API oficial, todas `status=ok`, e descobriu 700 IDs. Resultado somente leitura; nenhuma reconciliação ou aplicação.
- Senado: `adapt-senado-nominal-envelope.mjs` falhou fechado por `ENOENT` para `/tmp/senado-nominal-envelope-latest.json`; nenhum PDF, `legislator_id`, FK ou voto foi promovido.
- Dataset/snapshot: CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` = 1.003 linhas/IDs; `data/public-candidates.json` = 1.003 linhas/IDs; somente no dataset = 0; somente no snapshot = 0.
- Auditoria de fontes read-only: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos. Gaps mantidos: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. `--strict` exit 2 por gaps reais; nenhum gap foi suprimido.
- Gates Node 24.19.0: `npm run test` — 400 testes/98 arquivos verdes; `npx tsc --noEmit` — exit 0; `node scripts/validate-impact-schema.mjs` — checkpoint OK; `npm run data:check` — 1.003 candidaturas/988 fotos; `npm run build` — exit 0, sitemap com 1.003 candidatos e `release.json` local; `git diff --check` — exit 0.
- `npm run smoke:local` — exit 0: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- Produção `https://rs.votopraquem.org` respondeu HTTP 200. `release.json?cb=f0e9b30` respondeu release anterior `e925327-20260821T145742462Z`, snapshot com `row_count=1003`; o build foi executado antes do commit documental `681f6ab`, e ambos ainda não estão publicados.
- GitHub: `gh api repos/Snerolino/eleicao2026` confirmou permissões administrativas/push para `Snerolino`; `git ls-remote` confirmou `origin/main=e925327276b82481a348d4db3e2339d075dfe9a3`. A worktree estava 17 commits à frente antes deste registro e agora está 18 commits à frente, mas a credencial HTTPS usada pelo Git continua retornando HTTP 403 em `git push`; nenhum deploy foi acionado.

## Estado dos dados
Nenhuma escrita factual, identidade, FK, voto, claim, source reference, Supabase, Cloudflare ou snapshot ocorreu. O dataset e o snapshot permanecem alinhados. O artefato desta rodada é apenas esta evidência QA.

## Bloqueios reais
- **Git push:** divergência entre a permissão administrativa visível na API do GitHub e a credencial efetiva do helper HTTPS do Git (`HTTP 403 Permission denied`). Repetir o push sem alterar a credencial não é uma solução; os 17 commits locais permanecem pendentes.
- **ALRS:** relógio/token remoto rejeitado por `JWT issued at future`; quatro residuais continuam fail-closed.
- **Senado:** envelope nominal transitório ausente; deriva/identidade não verificável.
- **Fontes legislativas:** gaps substantivos permanecem no auditor estrito.

## Próximo passo
Manter recon oficial bounded read-only e a lane local independente. Resolver a credencial efetiva de push antes da publicação; após `main -> main`, disparar/verificar o workflow backup Cloudflare `334951434`, confirmar HTTP 200 e `release.json` com SHA correspondente. Aplicação remota continua proibida até R0, schema/FK, fonte oficial exata, dry-run validado e prova de idempotência.
