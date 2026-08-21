# QA — lote continuous ops: recon oficial e gates locais — 2026-08-21 15:15Z

## Objetivo
Executar um tick bounded do control plane: manter a recon oficial read-only ativa,
verificar o estado vivo do dataset, rodar a lane local independente e registrar
bloqueios sem promover fatos sem fonte exata.

## Entregue e verificado

- Câmara: consulta oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, em
  8 janelas trimestrais de 2025–2026, `max-pages=1`; 8/8 respostas `status=ok`,
  700 IDs oficiais descobertos na primeira página. Nenhuma identidade, voto, FK ou
  escrita remota foi feita.
- ALRS residual FED-17: `node scripts/repair-alrs-fed17-residual.mjs` em dry-run;
  `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`,
  `impact_touched=false`. Os quatro residuais Enio Carlos Terra continuam sem
  combinação verificável de ID oficial + fonte exata; fail-closed.
- Senado: `/tmp/senado-nominal-envelope-latest.json` não existe. O adaptador não foi
  executado e nenhum PDF, `legislator_id`, FK ou voto foi inferido.
- Dataset: snapshot público permanece com 1.003 candidaturas e 988 fotos oficiais;
  `npm run data:check` passou. A inspeção do CSV `lista_candidatos_2026.csv` foi
  feita com `cp1252` (322 linhas); esse arquivo é parcial e não foi usado para
  substituir o snapshot nem para fabricar um diff global.
- Auditoria de fontes read-only (`impact:sources:audit` e `--strict`): gaps reais
  mantidos — versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos
  `4/2/455`; `--strict` saiu 2. Isso é bloqueio de cobertura, não falha a suprimir.

## Gates locais

Executados sob Node `v24.19.0`:

- `npm run test`: **400 testes / 98 arquivos aprovados**.
- `npx tsc --noEmit`: **aprovado**.
- `node scripts/validate-impact-schema.mjs`: **aprovado**.
- `npm run data:check`: **aprovado**, 1.003 candidaturas / 988 fotos.
- `npm run build`: **aprovado**, sitemap com 1.003 candidatos + 2 estáticas e
  `release.json` gerado.
- `npm run smoke:local`: **aprovado**, 1.002 cards, 0 falhas HTTP, 0 erros de
  console online, service worker pronto.
- `git diff --check`: **aprovado**.

## Bloqueios

1. Doctor shell reportou FAIL porque o shell padrão estava em Node `v22.22.2`,
   embora Node `v24.19.0` esteja instalado e tenha sido usado nos gates.
2. Doctor reportou FAIL de evidência estruturada da rota MCP Codex; logs indicam
   `401 invalid_refresh_token`. Não houve loop nem delegação mutável alternativa.
3. Quatro votos ALRS Enio/Terra sem ID oficial e fonte exata.
4. Envelope nominal do Senado ausente e gaps substantivos de fonte legislativa.

## Publicação/verificação

- Worktree iniciou e terminou sem alterações antes da documentação; produção
  respondeu `HTTP 200` em `https://rs.votopraquem.org`.
- Após esta documentação, repetir os gates afetados, publicar pelo workflow backup
  Cloudflare `334951434` e confirmar `headSha`/release antes de considerar o lote
  publicado.

## Próximo passo

Continuar a recon bounded oficial (ALRS residual, Senado fail-closed e Câmara em
novas janelas independentes) e a lane local/publicação. Aplicação factual remota
continua proibida até R0, schema/FK, fonte oficial exata, dry-run revisado e
idempotência comprovada.
