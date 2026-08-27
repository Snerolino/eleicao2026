# QA — continuous ops: throughput da reconciliação ALRS — 2026-08-27

## Objetivo

Aumentar a eficiência da descoberta/reconciliação nominal ALRS sem alterar o
contrato factual, mantendo coleta com hash, identidade exata e fail-closed.

## Entregue e verificado

- `scripts/lib/http-pool.mjs`: pool concorrente bounded, retries para 429/502/503/504 e timeout por requisição.
- `scripts/discover-alrs-nominal-votes.mjs`: páginas ALRS coletadas pelo pool (concorrência 16), preservando URL, HTTP, bytes, SHA-256 e `data-item`.
- `scripts/reconcile-alrs-nominal-votes.mjs`: consulta read-only via cliente Supabase anon/publishable, paginação em blocos de 1000 e reconciliação concorrente das tabelas públicas.
- Teste manual do pool: 5 tarefas, máximo observado de 2 workers quando configurado com concorrência 2.
- Reconciliação real read-only: `2092` linhas, `2092` já presentes exatamente, `missing_safe_to_import=0`, conflitos `0`, ambíguos `0`, bloqueios de identidade/proposição `0`.

## Estado dos dados

- Manifesto ALRS vigente tem aproximadamente 1 minuto no tick; descoberta nova não foi executada porque o gate exige manifesto com pelo menos 6 horas.
- Auditoria de fontes read-only: gaps permanecem ALRS/Câmara/Senado — versões `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Nenhuma inserção/atualização factual, editorial, matriz, Supabase ou Cloudflare foi realizada.

## Gates locais

- Node `v24.19.0`.
- `npm run test`: `413/413` testes em `102` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos.
- `npm run build`: RC 0 — `233` módulos, sitemap `1003 + 2`, release local gerado.
- `npm run smoke:local`: RC 0 — `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto.
- `git diff --check`: RC 0.

## Bloqueios

- `npm run orch:doctor`: RC 1 por shell Node 22 e OpenCode ausente; os gates do projeto foram executados explicitamente com Node 24.
- Auditoria strict de fontes continua fail-closed pelos gaps oficiais acima.
- Transporte/publicação Git depende da tentativa após o commit; não aplicar fatos sem fonte exata.

## Próximo passo

Retomar reconciliação read-only no próximo tick; somente redescobrir ALRS quando o
manifesto superar 6 horas. Se surgirem linhas `missing_safe_to_import`, exigir
fonte/hash/identidade/versão/dry-run/idempotência antes de qualquer gate factual.
