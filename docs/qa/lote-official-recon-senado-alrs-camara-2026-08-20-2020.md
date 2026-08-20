# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 20:20 UTC)

## Objetivo
Executar novo tick somente leitura, revalidar as fontes oficiais vivas, comparar o
`dataset2026` e fechar gates locais sem promover fatos sem fonte, identidade, FK,
dry-run e idempotência.

## Evidência verificada
- **Senado:** 6/6 GETs oficiais HTTP 200, 6/6 prefixos PDF válidos, 2/6 coincidências de bytes e 0/6 coincidências SHA-256 contra o manifesto de 2026-08-19. Deriva persistente; manifesto não foi alterado.
- **ALRS:** rota oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario` HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 `data-item`, sem `Enio Carlos Terra` e sem `Terra`. Os quatro residuais seguem sem ID oficial exato e fonte auditável.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31` HTTP 200, JSON válido, 0 votações; nenhum evento foi inferido.
- **Dataset vivo:** snapshot com 1.003 IDs; 7 CSVs TSE comparados, 0 IDs ausentes. Nenhum refresh/sincronização aplicado.
- **Auditoria de fontes:** exit 0 em modo read-only; gaps atuais: votos ALRS 4, Câmara 2 e Senado 455 sem fonte; versões/eventos Senado também permanecem sem fonte conforme relatório.

## Gates locais
- Node do cron: `v22.22.2` (doctor exit 1 pelo requisito Node 24; bloqueio operacional conhecido).
- `npm run test`: exit 0, 83 arquivos/374 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1.003 candidaturas/988 fotos oficiais.
- `npm run build`: exit 0, sitemap com 1.003 candidatos + 2 estáticas; release para `a84cd5c8ac2f5119c02fd233d1364e94d8cc9289`.
- `npm run smoke:local`: exit 0, 1.002 cards, mínimo 1.002, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: exit 0.

## Estado, bloqueios e segurança
- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto, source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente por deriva de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e ID oficial exato para os quatro residuais.
- Câmara sem lote elegível na janela futura consultada.
- `orch:doctor`: 48 OK, 5 WARN, 1 FAIL; OpenCode ausente e Ollama sem preflight são opcionais. Não foram lidos nem expostos segredos.

## Artefatos read-only
- `.orchestrator/runtime/continuous-tick-20260820T2020Z/senado.json`
- `.orchestrator/runtime/continuous-tick-20260820T2020Z/alrs.html`
- `.orchestrator/runtime/continuous-tick-20260820T2020Z/alrs.json`
- `.orchestrator/runtime/continuous-tick-20260820T2020Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-20260820T2020Z/dataset-diff.json`

## Próximo passo
Publicar este checkpoint documental pelos gates autorizados, verificar o workflow
backup e produção, e repetir a reconciliação bounded. Manter ALRS/Senado
fail-closed e não aplicar fatos sem R0/schema/FK/fonte, dry-run e prova de
idempotência.
