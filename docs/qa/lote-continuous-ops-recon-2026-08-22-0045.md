# QA — lote continuous ops recon — 2026-08-22 00:45 (-03)

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only (Câmara,
ALRS residual e auditoria de fontes), validar o snapshot público e rodar os
gates locais antes da publicação documental.

## Entregue e verificado
- Câmara: `impact:camara:discover --start 2025-01-01 --end 2026-12-31 --max-pages 3` consultou 22 páginas/janelas oficiais, todas `status=ok`, `blocked=null`; IDs foram apenas descobertos em memória, sem reconciliação ou aplicação.
- ALRS FED-17: dry-run não foi concluído; falhou fechado com a causa real `JWT issued at future`. Nenhum voto, data, FK ou fonte foi alterado.
- Auditoria estrita read-only: 1.397 proposições, 1.431 versões, 1.902 eventos e 5.007 votos; gaps permanecem versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`. Exit 2 por gaps reais; nenhum registro foi promovido.
- Snapshot: `data:check` verde com 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.
- Gates locais: 400 testes em 98 arquivos; TypeScript; schema de impacto; `data:check`; build Vite/PWA; `git diff --check` — todos verdes.
- Smoke local: primeira execução falhou durante carregamento (`main h1` timeout); repetição passou com 1.002 cards, mínimo esperado 1.002, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200.

## Estado dos dados
Nenhuma alteração em `data/public-candidates.json`, Supabase, claims, source references,
identidades, FKs, votos ou matrizes. Senado continua fail-closed por ausência do
envelope nominal/PDF/SHA verificável. A contagem do snapshot permanece 1.003.

## Bloqueios
- ALRS: identidade/token remoto rejeitado com `JWT issued at future`; os quatro residuais de Enio Carlos Terra seguem sem ID oficial e fonte exata.
- Auditoria: gaps de fontes oficiais ainda exigem recuperação com URL/hash/evidência exatos.
- Push GitHub/publicação: `origin/main` continua 48 commits atrás do HEAD local; deve ser tentado após este registro, mas pode permanecer bloqueado por permissão efetiva 403 já observada.
- Doctor: FAIL por shell cron em Node 22.22.2, embora os gates do projeto tenham sido executados com Node 24; WARNs de executor não impedem a lane local.

## Próximo passo
Repetir recon bounded da Câmara em novo tick; manter ALRS e Senado fail-closed.
Tentar publicar o checkpoint documental via GitHub e, somente se o push for efetivo,
validar workflow backup Cloudflare, `headSha`, HTTP e SHA de produção. Aplicação
factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e
idempotência.
