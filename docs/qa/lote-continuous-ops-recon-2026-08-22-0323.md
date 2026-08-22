# Lote continuous ops — recon oficial e gates — 2026-08-22 03:23Z

## Objetivo
Executar um tick bounded das lanes de reconhecimento oficial, sem promover dados sem identidade/fonte, e verificar a continuidade local/publicação.

## Entregue e verificado
- Lock não bloqueante adquirido em `.orchestrator/runtime/locks/continuous-progress.lock`.
- Câmara: `scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 3`; 22 páginas em 8 janelas trimestrais, todas `status=ok`, `blocked=null`, 2.100 `vote_ids` descobertos somente em memória. Nenhuma reconciliação ou aplicação.
- ALRS FED-17: `scripts/repair-alrs-fed17-residual.mjs --help` acionou a verificação de fonte e falhou fechado com causa real `JWT issued at future`; 0 votos/correções promovidos. Os 4 residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: envelope nominal `/tmp/senado-nominal-envelope-latest.json` ausente; lane permanece fail-closed, sem PDF, `legislator_id`, FK ou voto promovido.
- Auditoria estrita: `node scripts/audit-legislative-source-coverage.mjs --strict` saiu código 2 por gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; fila ALRS com 4 itens. Nenhuma promoção.
- Dataset: CSV oficial em `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`, 1.003 linhas de dados, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot público com 1.003 registros. Não houve refresh factual.

## Estado dos dados e segurança
Nenhuma escrita em `data/public-candidates.json`, Supabase, Cloudflare, identidade, FK, voto, claim, source reference ou matriz. Sem fonte oficial exata, o dado fica bloqueado.

## Bloqueios reais
1. ALRS: JWT emitido no futuro impede a recuperação autenticada dos 4 residuais.
2. Senado: envelope nominal verificável ausente e SHA dos PDFs não estabelecido.
3. Push/publicação: revalidado neste tick; `git push origin main` e retry `env -u GH_TOKEN git push origin main` falharam com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). Nenhum workflow/deploy foi acionado. Produção atual respondeu raiz HTTP 200 e `/release.json` HTTP 200, 404 bytes, SHA live `e925327276b82481a348d4db3e2339d075dfe9a3`; commit local `b24612d` não está publicado.

## Próximo passo
Manter recon bounded da Câmara e fail-closed em ALRS/Senado; executar gates locais e tentar publicação documental somente se o push efetivo funcionar. Aplicação remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
