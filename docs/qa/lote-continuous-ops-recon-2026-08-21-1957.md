# QA — lote continuous ops recon — 2026-08-21 19:57 UTC

## Objetivo
Executar um tick bounded das quatro lanes: recon oficial read-only, diff do dataset vivo contra o snapshot, gates locais completos e verificação da produção. Nenhum dado legislativo é aplicado sem R0, schema/FK, fonte oficial exata, dry-run e idempotência.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado; nenhum loop ou `sleep` usado.
- ALRS FED-17: `node scripts/repair-alrs-fed17-residual.mjs --dry-run` falhou fechado com `JWT issued at future` (exit 1). Nenhum voto/correção foi escrito; os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: `node scripts/adapt-senado-nominal-envelope.mjs` falhou fechado com `ENOENT` para `/tmp/senado-nominal-envelope-latest.json` (exit 1). Nenhum PDF, `legislator_id`, FK ou voto foi promovido.
- Câmara: `discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` consultou 8/8 janelas trimestrais oficiais, todas `status=ok`, e retornou IDs; operação somente leitura, sem reconciliação/aplicação.
- Dataset/snapshot: CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` = 1.003 linhas/IDs; `data/public-candidates.json` = 1.003 linhas/IDs; diferença CSV→snapshot = 0 e snapshot→CSV = 0.
- Auditoria read-only: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos. Gaps: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. `--strict` exit 2 por gaps reais; nenhum gap foi suprimido.
- Gates Node 24.19.0: `npm run test` = 400 testes/98 arquivos verdes; `npx tsc --noEmit` exit 0; schema exit 0; `npm run data:check` = 1.003 candidaturas/988 fotos; `npm run build` exit 0, sitemap com 1.003 candidatos e release local `493a0e6-20260821T195458702Z`; `git diff --check` exit 0.
- Smoke: primeira execução teve timeout transitório na rota legada durante inicialização do preview; a repetição imediata passou: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto, detalhe canônico `/candidatos/priscila_voigt_severiano_210002533355`.
- Produção `https://rs.votopraquem.org` respondeu HTTP 200. `/release.json?cb=493a0e6` confirmou live ainda em `e925327276b82481a348d4db3e2339d075dfe9a3`, `row_count=1003`; o HEAD local `493a0e623e1c465763ce69f5d7bf11c60af7495b` não está publicado.
- Worktree segue limpa, `main` 19 commits à frente de `origin/main`.

## Estado dos dados
Nenhuma escrita factual, identidade, FK, voto, claim, source reference, Supabase, Cloudflare ou snapshot ocorreu. Dataset e snapshot permanecem alinhados.

## Bloqueios reais
- **Push GitHub:** a credencial efetiva do helper HTTPS continua retornando HTTP 403, apesar de `gh api` indicar permissão administrativa/push. Os 19 commits locais permanecem pendentes; sem `main -> main` não há workflow de deploy a verificar.
- **ALRS:** token remoto rejeitado por `JWT issued at future`; quatro residuais permanecem fail-closed.
- **Senado:** envelope nominal transitório ausente; identidade e deriva criptográfica não verificáveis.
- **Fontes legislativas:** gaps substantivos mantêm o auditor estrito vermelho.
- **Doctor:** shell padrão ainda usa Node 22.22.2 (projeto exige Node 24); gates foram executados explicitamente com Node 24.19.0. OpenCode ausente e Codex MCP não exercitado permanecem avisos de infraestrutura, sem bloquear a lane local.

## Próximo passo
Manter recon oficial bounded read-only e lane local independente. Resolver a credencial efetiva de push; após `main -> main`, disparar/verificar o workflow backup Cloudflare `334951434`, confirmar HTTP 200 e `release.json` com SHA correspondente. Aplicação remota continua proibida até R0, schema/FK, fonte oficial exata, dry-run validado e prova de idempotência.
