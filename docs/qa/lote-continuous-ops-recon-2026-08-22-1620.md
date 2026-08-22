# QA — lote continuous ops recon — 2026-08-22 16:20 UTC

## Objetivo
Executar um tick bounded com recon oficial read-only, verificar o snapshot vivo, fechar os gates locais e tentar a publicação documental sem promover fatos sem fonte.

## Entregue e verificado
- Lock não bloqueante adquirido com `flock -n` e encerrado ao fim do tick.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata verificável; nenhuma escrita ocorreu.
- Câmara: descoberta oficial read-only para `2026-10-01`–`2026-12-31`, duas páginas máximas, HTTP sem bloqueio, `vote_ids=0` no intervalo consultado. Nenhum voto foi reconciliado ou aplicado.
- Senado mantido fail-closed: envelope nominal verificável ausente; nenhum parsing, identidade ou voto foi inventado.
- Dataset conferido pelo gate oficial `npm run data:check`: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE. Não foi executado refresh nem houve alteração no snapshot.
- Auditoria de fontes regular: RC 0. Auditoria estrita: RC 2 pelos gaps reais — versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Gates locais com Node 24.19.0: 401 testes em 98 arquivos, TypeScript, schema de impacto, `data:check`, build e `git diff --check` verdes.
- Build gerou `release.json` local `03b43bd-20260822T162024185Z`.
- Smoke local verificado: 1.002 cards, mínimo esperado 1.002, 0 falhas HTTP, 0 erros de console online, service worker pronto; detalhe canônico de Priscila Voigt Severiano validado.

## Publicação
- `gh auth setup-git` foi executado e `git push origin main` foi tentado.
- Push rejeitado pelo GitHub com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Portanto, nenhum workflow Cloudflare novo foi acionado e não há `headSha` remoto correspondente a este tick.

## Bloqueios
- Autorização efetiva de escrita no remoto GitHub continua rejeitada (403), embora `gh auth status` reporte sessão autenticada.
- Doctor continua com FAIL porque o shell padrão usa Node 22.22.2, enquanto o projeto exige Node 24; o tick usou explicitamente Node 24.19.0 para os gates.
- ALRS/Senado continuam bloqueados por identidade/fonte oficial; auditoria estrita segue não-zero. Nenhum UUID, voto, URL, hash ou identidade foi fabricado.

## Próximo passo
Retentar publicação documental quando a permissão efetiva permitir `main -> main`; após aceite, acompanhar o workflow backup Cloudflare `334951434`, conferir `headSha`, HTTP de produção e smoke. Manter Câmara em recon read-only e ALRS/Senado fail-closed até R0/schema/FK/fonte/dry-run/idempotência.
