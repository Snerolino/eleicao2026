# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 07:52Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only nas lanes ALRS/Câmara/Senado, verificar sincronização do dataset público, fechar os gates locais e preparar a publicação documental.

## Entregue e verificado
- Lock não bloqueante adquirido com `flock -n` e liberado ao fim do tick.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, 8 janelas trimestrais entre `2025-01-01` e `2026-12-31`, `max_pages=1`; 8/8 respostas `ok`, 700 `vote_ids` descobertos somente em artefato transitório. Nenhuma reconciliação ou aplicação.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro votos residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata; nada foi promovido.
- Senado: fail-closed. O envelope `/tmp/senado-nominal-envelope-latest.json` não existe; adaptação interrompida com `ENOENT`. Nenhum PDF, `legislator_id`, SHA ou voto foi inventado.
- Dataset: `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; 1.003 IDs no CSV e 1.003 no snapshot, diferença `0/0`.
- Auditoria de fontes read-only: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. O comando retornou cobertura com gaps reais; nenhuma promoção factual.

## Gates locais
Todos RC 0, usando Node `v24.19.0`:

- `npm run test`: 98 arquivos, 400 testes aprovados.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: aprovado; sitemap 1.003 candidatos + 2 estáticas; `release.json` local `4506791-20260822T075142832Z`.
- `npm run smoke:local`: aprovado; 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: aprovado.

## Estado Git/publicação
- HEAD local: `45067913e17ebe873dd23a99c8500baabae75d85`.
- Worktree permaneceu limpa antes deste documento; este QA é a única alteração esperada.
- Próxima ação automática: commit documental e tentativa de `git push origin main`. O histórico operacional registra que pushes anteriores falharam com HTTP 403; se repetir, manter bloqueio de publicação sem afirmar deploy.
- Produção e workflow não foram alterados neste tick; aplicação Supabase/Cloudflare factual segue proibida sem R0, schema/FK, fonte oficial, dry-run e idempotência.

## Bloqueios reais
1. Permissão efetiva do GitHub pode continuar negando `main -> main` (HTTP 403), impedindo acionar o workflow backup `334951434`.
2. Codex MCP/CLI permanece com refresh token inválido no doctor (`401 invalid_refresh_token`); não repetir neste tick.
3. Shell padrão ainda usa Node 22.22.2, embora Node 24.19.0 esteja disponível e tenha fechado os gates.
4. Gaps de fontes legislativas permanecem; Senado está sem envelope verificável e ALRS residual sem identidade/fonte exata.

## Próximo passo
Tentar publicação documental, validar o workflow backup e o `headSha` somente se o push for aceito; em paralelo manter a recon oficial read-only e o Senado/ALRS fail-closed. Não aplicar dados remotos neste lote.
