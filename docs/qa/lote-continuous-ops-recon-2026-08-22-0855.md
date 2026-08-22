# QA — tick contínuo de recon oficial — 2026-08-22 08:55Z

## Objetivo
Retomar as quatro lanes bounded: recon oficial read-only, verificação local,
publicação documental e confirmação de produção, sem aplicar fatos legislativos
sem R0/schema/FK/fonte/dry-run/idempotência.

## Entregue e verificado

- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock`
  adquirido e liberado dentro do tick.
- ALRS FED-17 residual em dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
  Os quatro residuais de Enio Carlos Terra continuam bloqueados por ausência de
  ID oficial e fonte exata; nenhuma escrita ocorreu.
- Câmara oficial read-only: 8/8 janelas trimestrais de 2025–2026 responderam
  `status=ok` em `https://dadosabertos.camara.leg.br/api/v2/votacoes`,
  `max_pages=1`; IDs ficaram transitórios, sem reconciliação ou aplicação.
- Dataset vivo: arquivo oficial completo
  `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`
  permanece com SHA-256
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`,
  1.003 IDs; o snapshot também tem 1.003 registros/IDs. Nenhuma mudança de
  snapshot foi identificada.
- `npm run data:check`: RC 0; 1.003 candidaturas e 988 fotos oficiais.
- `npm run test`: RC 0; 98 arquivos, 400 testes aprovados.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run build`: RC 0; sitemap com 1.003 candidatos + 2 estáticas e
  `dist/release.json` local `931629a-20260822T085326549Z`.
- `git diff --check`: RC 0.
- `npm run smoke:local`: primeira execução expirou aguardando carregamento;
  repetição RC 0 com 1.002 cards, 0 falhas HTTP, 0 erros online de console e
  service worker pronto.
- Produção: `https://rs.votopraquem.org` respondeu HTTP 200.

## Bloqueios reais

- Publicação remota bloqueada por permissão efetiva do GitHub: `git push origin
  main` retornou HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to
  Snerolino`). HEAD local `931629a` continua à frente de `origin/main`; nenhum
  workflow/deploy novo foi iniciado.
- Doctor local: shell Node 22.22.2, enquanto o projeto exige Node 24; rota MCP
  Codex falha por refresh token inválido; OpenCode ausente e fallback Ollama sem
  preflight. Nenhum desses bloqueios foi contornado com escrita insegura.
- Senado permanece fail-closed sem envelope nominal verificável.
- Nenhuma aplicação factual remota: R0/schema/FK/fonte/dry-run/idempotência não
  estão simultaneamente satisfeitos para os itens bloqueados.

## Próximo passo

Retentar a publicação do conjunto documental quando a permissão GitHub efetiva
for corrigida; somente após `main -> main` validar o workflow backup remoto
`334951434`, `headSha` do run e a versão em produção. Manter ALRS/Senado
fail-closed e continuar a recon oficial read-only da Câmara em próximo tick.
