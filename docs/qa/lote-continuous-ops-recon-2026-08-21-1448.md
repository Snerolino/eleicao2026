# Lote continuous ops — recon oficial e gates locais — 2026-08-21 14:48Z

## Objetivo
Executar um tick bounded do control plane, manter a recon oficial read-only ativa e fechar a verificação local sem aplicar fatos remotamente.

## Reconhecimento oficial verificado
- **Câmara:** `scripts/discover-camara-vote-ids.mjs` consultou a API oficial `https://dadosabertos.camara.leg.br/api/v2` em 8 janelas trimestrais de 2025–2026; 8/8 respostas `status=ok` e 700 `vote_ids` descobertos na primeira página de cada janela. Nenhuma identidade, FK, evento ou voto foi reconciliado/aplicado.
- **ALRS:** o comando genérico `npm run impact:alrs` foi executado read-only, mas saiu com erro de uso (`--solicitante` obrigatório; exit 1). Não houve promoção de dado nem alegação de evidência ALRS nova. Os quatro residuais de Enio Carlos Terra permanecem bloqueados até ID oficial e fonte exata.
- **Senado:** `npm run impact:senado:envelope:adapt` permaneceu fail-closed porque `/tmp/senado-nominal-envelope-latest.json` não existe (exit 1). Nenhum PDF, identidade, FK ou voto foi promovido.
- **dataset2026:** `npm run data:check` validou snapshot público com 1.003 candidaturas e 988 fotos oficiais; nenhum refresh ou alteração factual foi aplicado.

## Entregue e verificado
- Lock bounded não bloqueante adquirido/liberado com `flock -n .orchestrator/runtime/locks/continuous-progress.lock`; nenhuma espera/loop foi mantida.
- `npm run test` com Node 24.19.0: 98 arquivos, 400 testes, exit 0.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: 1.003 candidaturas, 988 fotos oficiais, exit 0.
- `npm run build`: exit 0; sitemap 1.003 candidatos + 2 estáticas e `release.json` local para `90bc4f5`.
- `npm run smoke:local`: 1.002 cards visíveis, 0 falhas HTTP, 0 erros de console online, service worker pronto, exit 0.
- `git diff --check`: exit 0; worktree permaneceu limpa antes deste documento.
- Auditoria estrita read-only: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos; gaps de fonte versões `ALRS 1251 / Câmara 3 / Senado 112`, eventos `1647 / 2 / 188`, votos `4 / 2 / 455`; exit 2 por gaps reais.

## Estado dos dados e bloqueios
- Nenhum voto, identidade, FK, claim, source reference, migration, Supabase ou Cloudflare foi alterado neste tick.
- ALRS: falta executar o coletor com `--solicitante`/`--ano`/catálogo explícitos; isso não autoriza inferência para Enio/Terra.
- Senado: envelope transitório ausente; deriva criptográfica anterior permanece fail-closed.
- Gaps de fonte legislativa continuam reais e separados da lane local.
- Doctor operacional segue com o conhecido risco do shell de cron em Node 22.22.2, enquanto os gates deste tick foram executados com Node 24.19.0.

## Publicação
Este tick gerou QA local novo após gates verdes. Como o documento ainda não está commitado, não houve commit/push/deploy neste ponto; a publicação automática deve ocorrer somente após revalidar os gates incluindo este arquivo.

## Próximo passo
Revalidar gates finais, publicar o lote documental no caminho backup do Cloudflare somente após commit/push, confirmar `headSha`/`release.json`/HTTP 200, e iniciar novo chunk bounded. Aplicação factual remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
