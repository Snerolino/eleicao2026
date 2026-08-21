# QA — lote continuous ops recon — 2026-08-21 22:13Z

## Objetivo
Executar tick bounded do control plane com recon oficial read-only, gates locais, smoke e verificação de produção, sem promover dado factual sem fonte/identidade exata.

## Entregue e verificado
- Lock bounded previsto em `.orchestrator/runtime/locks/continuous-progress.lock`; nenhuma escrita factual/remota ocorreu.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2`, 22/22 páginas observadas em oito janelas trimestrais, `blocked=null`; IDs somente read-only, sem reconciliação/aplicação.
- Senado: adaptador falhou fechado por `/tmp/senado-nominal-envelope-latest.json` ausente (`ENOENT`); nenhum PDF, `legislator_id`, FK ou voto promovido.
- Gates Node `v24.19.0`: 400 testes/98 arquivos, TypeScript, schema de impacto, `data:check`, build e `git diff --check` verdes.
- `data:check`: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE. Build: sitemap 1.003 candidatos + 2 estáticas; `release.json` local `92c73a2-20260821T221241235Z`.
- Smoke local passou: 1.002 cards, busca 2 cards, detalhe Priscila Voigt Severiano, service worker pronto, 0 falhas HTTP e 0 erros de console online.
- Produção `https://rs.votopraquem.org`: HTTP 200. `/release.json` live permanece em `e925327` (`2026-08-21T14:57:42.462Z`), portanto o build local ainda não está publicado.
- Dataset: CSV oficial `consulta_cand_2026_RS.csv` com SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; contagem do snapshot permanece 1.003/1.003, sem diferença observada.

## Estado dos dados
Nenhum candidato, voto, claim, source reference, identidade, FK, Supabase ou Cloudflare foi alterado. O worktree permanece sem mudanças rastreadas após os gates; a documentação deste tick é a única alteração intencional a registrar.

## Bloqueios reais
- `npm run orch:doctor` ainda retorna FAIL porque o shell padrão usa Node 22.22.2; gates foram executados explicitamente com Node 24.19.0.
- Push GitHub continua bloqueado por HTTP 403; nenhum deploy novo foi acionado. Produção segue no SHA anterior.
- ALRS residual sem evidência recuperável nesta execução; Senado sem envelope nominal; auditoria de cobertura mantém gaps já registrados. Fail-closed aplicado.

## Próximo passo
Continuar recon oficial bounded e lane local independente. Tentar publicação após a credencial efetiva de push deixar de retornar 403. Aplicação remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
