# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 22:25 UTC)

## Objetivo
Repetir o tick somente leitura das fontes oficiais vivas, comparar o dataset2026,
executar os gates locais e manter qualquer item sem evidência em fail-closed.

## Evidência verificada
- **Senado:** 6/6 GETs HTTP 200, 6/6 prefixos PDF válidos, 0/6 SHA-256 coincidentes com o manifesto de 2026-08-19. Nenhum manifesto foi atualizado e nenhum voto, identidade ou FK foi aplicado.
- **ALRS:** rota oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario` HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 atributos `data-item`, sem `Enio Carlos Terra` e sem `Terra`. Os quatro residuais continuam sem ID oficial exato e fonte auditável.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31` HTTP 200, JSON válido, 0 votações; nenhum evento foi inferido.
- **Dataset vivo:** snapshot com 1.003 IDs; 5 CSVs comparáveis encontrados, 0 IDs ausentes no snapshot. Nenhum refresh ou sincronização foi aplicado.
- **Auditoria de fontes:** modo read-only exit 0; `--strict` exit 2 por gaps reais: versões ALRS 1.251, Câmara 3 e Senado 112 sem fonte; eventos ALRS 1.647, Câmara 2 e Senado 188 sem fonte; votos ALRS 4, Câmara 2 e Senado 455 sem fonte.

## Gates locais
Executados com Node 24.19.0:
- `npm run test`: exit 0 — 84 arquivos, 377 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0 — 1.003 candidaturas, 988 fotos oficiais.
- `npm run build`: exit 0; sitemap com 1.003 candidatos + 2 estáticas (1.005 URLs); `release.json` gerado para `a052523`.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0; 1.002 cards, mínimo 1.002, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `npm run impact:sources:audit`: exit 0.
- `node scripts/audit-legislative-source-coverage.mjs --strict`: exit 2 pelos gaps reais acima; não foi suprimido.

## Estado, bloqueios e segurança
- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto, source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva persistente de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato para os quatro residuais.
- Câmara sem lote elegível na janela consultada.
- Doctor do cron: FAIL somente pelo shell Node 22.22.2; OpenCode ausente e Codex/MCP read-only sem evidência por refresh token expirado são bloqueios de executor, não de dados. Antigravity comprovou leitura; nenhuma autenticação foi tentada.
- Não foram lidos nem expostos segredos.

## Artefatos read-only
- `.orchestrator/runtime/continuous-tick-20260820T222505Z/senado-current.json`
- `.orchestrator/runtime/continuous-tick-20260820T222505Z/alrs.html`
- `.orchestrator/runtime/continuous-tick-20260820T222505Z/alrs.json`
- `.orchestrator/runtime/continuous-tick-20260820T222505Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-20260820T222505Z/dataset-diff.json`

## Próximo passo
Repetir a reconciliação bounded no próximo tick; manter Senado/ALRS fail-closed e não aplicar fatos sem R0/schema/FK, fonte, dry-run e prova de idempotência.
