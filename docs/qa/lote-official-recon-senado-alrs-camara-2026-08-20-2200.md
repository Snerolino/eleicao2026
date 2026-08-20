# QA — Reconhecimento oficial bounded Senado/ALRS/Câmara (2026-08-20 22:00 UTC)

## Objetivo
Repetir o tick somente leitura das fontes oficiais vivas, comparar o dataset2026,
executar os gates locais e manter qualquer item sem evidência em fail-closed.

## Evidência verificada
- **Senado:** 6/6 GETs HTTP 200, 6/6 prefixos PDF válidos. Os seis SHA-256 atuais foram recalculados e permanecem diferentes do manifesto de 2026-08-19; bytes atuais: 138361, 138557, 138149, 97445, 97428 e 97376. Nenhuma atualização de manifesto ou aplicação ocorreu.
- **ALRS:** rota oficial `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario` HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 atributos `data-item`, sem `Enio Carlos Terra` e sem `Terra`. Os quatro residuais continuam sem ID oficial exato e fonte auditável.
- **Câmara:** API oficial na janela `2026-10-01`–`2026-12-31` HTTP 200, 148 bytes, JSON válido, 0 votações; nenhum evento foi inferido.
- **Dataset vivo:** snapshot com 1.003 IDs; 6 arquivos CSV com identificadores comparáveis, 0 IDs ausentes. Nenhum refresh ou sincronização foi aplicado.
- **Auditoria de fontes:** modo read-only exit 0; gaps reais: versões ALRS 1.251, Câmara 3 e Senado 112 sem fonte; eventos ALRS 1.647, Câmara 2 e Senado 188 sem fonte; votos ALRS 4, Câmara 2 e Senado 455 sem fonte. `--strict` exit 2 por gaps reais.

## Gates locais
Executados com Node 24:
- `npm run test`: exit 0 — 84 arquivos, 377 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0 — 1.003 candidaturas, 988 fotos oficiais.
- `npm run build`: exit 0; sitemap com 1.003 candidatos + 2 estáticas (1.005 URLs); `release.json` gerado para `b0a024e`.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0; 1.002 cards, mínimo 1.002, 0 falhas HTTP, 0 erros de console online, service worker pronto; detalhe canônico `priscila_voigt_severiano_210002533355`.

## Estado, bloqueios e segurança
- `remote_apply=false`: nenhuma escrita Supabase, snapshot, claim, manifesto, source reference, voto, identidade, FK, Cloudflare ou matriz ocorreu.
- Senado bloqueado exclusivamente pela deriva persistente de bytes/SHA-256.
- ALRS bloqueado pela ausência de entidades/`data-item` e de ID oficial exato para os quatro residuais.
- Câmara sem lote elegível na janela consultada.
- Não foram lidos nem expostos segredos.

## Artefatos read-only
- `.orchestrator/runtime/continuous-tick-20260820T220006Z/senado-current.json`
- `.orchestrator/runtime/continuous-tick-20260820T220006Z/alrs.html`
- `.orchestrator/runtime/continuous-tick-20260820T220006Z/alrs.json`
- `.orchestrator/runtime/continuous-tick-20260820T220006Z/camara-q4.json`
- `.orchestrator/runtime/continuous-tick-20260820T220006Z/dataset-diff.json`

## Publicação e produção
- Commit documental inicial `4729e56d2b3ed9aee434c0e3080fa8f6521478a7` publicado em `origin/main`; workflow backup `334951434`, run `32422422008`, `completed/success`, `headSha` idêntico.
- Checkpoint operacional em `d75394505d93afde10335d7094c257e965e9bf45`; workflow backup `334951434`, run `32422546489`, `completed/success`, `headSha` idêntico.
- Produção raiz HTTP 200; `/release.json` confirmou SHA `d75394505d93afde10335d7094c257e965e9bf45`, `row_count=1003`, release `d753945-20260820T220454230Z`.

## Próximo passo
Repetir a reconciliação bounded no próximo tick; manter Senado/ALRS fail-closed e não aplicar fatos sem R0/schema/FK, fonte, dry-run e prova de idempotência.
