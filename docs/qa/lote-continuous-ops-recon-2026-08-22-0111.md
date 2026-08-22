# QA — lote continuous ops recon — 2026-08-22 01:11 UTC

## Objetivo
Executar tick bounded do control plane com recon oficial read-only nas lanes ALRS/Senado/Câmara, comparação do dataset vivo, gates locais e publicação/verificação quando possível.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido de forma não bloqueante e liberado ao fim de cada etapa.
- Recon Câmara oficial: 22 páginas em oito janelas 2025–2026, HTTP/JSON válidos, `blocked=null`, 2.100 `vote_ids` descobertos; nenhum voto reconciliado ou aplicado.
- Recon ALRS FED-17 residual: falhou fechado com `JWT issued at future`; nenhum voto/data/fonte aplicado. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: envelope `/tmp/senado-nominal-envelope-latest.json` continua ausente; nenhum PDF, `legislator_id`, FK ou voto promovido.
- Dataset oficial: CSV `consulta_cand_2026_RS.csv` SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`, 1.003 linhas/IDs; snapshot 1.003 IDs; diferença 0/0.
- Gates Node 24.19.0: `npm run test` 400/400 em 98 arquivos; TypeScript 0; schema 0; `data:check` 1.003 candidaturas/988 fotos/1 fonte TSE; build 0; sitemap 1.003 candidatos + 2 estáticas; `git diff --check` 0.
- Smoke local: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- Auditoria read-only de fontes: gaps reais ALRS/Câmara/Senado `1251/3/112` em versões, `1647/2/188` em eventos e `4/2/455` em votos; sem promoção.
- Produção foi revalidada: raiz HTTP 200 e `/release.json` HTTP 200, live permanece `e925327276b82481a348d4db3e2339d075dfe9a3`, snapshot live 1.003.
- Workflows confirmados: backup Cloudflare `334951434`, primário `320564705`, verificador `335560210`.

## Estado dos dados
Nenhuma escrita factual, snapshot, claim, source reference, FK, voto, matriz, Supabase ou Cloudflare ocorreu. O build apenas regenerou artefatos ignorados/locais. O recon Câmara é inventário read-only, não evidência suficiente para reconciliação nominal.

## Bloqueios reais
- `git push origin main` falhou três vezes com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`, inclusive após `gh auth setup-git` e com `GH_TOKEN` removido. O commit local `823fd1791b895912ff01165c38877de1b7f5e328` segue 36 commits à frente de `origin/main`; nenhum workflow/deploy novo foi acionado.
- ALRS retornou `JWT issued at future` no reparo FED-17; sem evidência oficial recuperável não há aplicação.
- Senado sem envelope nominal transitório e com gaps de SHA previamente registrados; fail-closed.
- `orch:doctor` anterior segue com FAIL de shell Node 22.22.2; este tick executou os gates do projeto explicitamente com Node 24.19.0.

## Próximo passo
Repetir recon oficial bounded mantendo ALRS/Senado fail-closed; resolver a identidade/permissão efetiva do push GitHub antes da publicação. A lane Câmara pode preparar reconciliação somente após catálogo de identidade exata, FK remota, fonte/hash, dry-run e prova de idempotência.
