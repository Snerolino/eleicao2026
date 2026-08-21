# QA — lote continuous ops: recon oficial e gates locais — 2026-08-21 15:54Z

## Objetivo
Executar tick bounded do control plane com quatro lanes ativas: recon oficial read-only, lane local independente, publicação/verificação após gates e aplicação factual remota bloqueada sem R0/schema/FK/fonte/dry-run/idempotência.

## Entregue e verificado

- ALRS residual FED-17: `node scripts/repair-alrs-fed17-residual.mjs` em dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Nenhum voto ou correção foi promovido.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, em 8 janelas trimestrais de 2025–2026, `max-pages=1`; 8/8 páginas `status=ok` e 700 IDs oficiais descobertos. Nenhuma identidade, FK, evento ou voto foi reconciliado/aplicado.
- Senado: adaptação fail-closed; `/tmp/senado-nominal-envelope-latest.json` ausente (`ENOENT`). Nenhum PDF, `legislator_id`, FK ou voto foi inferido.
- Dataset vivo: `consulta_cand_2026_RS.csv` comparado com `data/public-candidates.json` usando `SQ_CANDIDATO`: 1.003 linhas, 1.003 IDs no CSV, 1.003 no snapshot, diferença 0/0. Nenhum refresh foi aplicado.
- Auditoria estrita de fontes read-only manteve gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; processo saiu exit 2. Nenhuma fonte foi inventada.

## Gates locais

Executados sob Node `v24.19.0` e aprovados:

- `npm run test`: **400 testes / 98 arquivos aprovados**.
- `npx tsc --noEmit`: **aprovado**.
- `node scripts/validate-impact-schema.mjs`: **aprovado**.
- `npm run data:check`: **aprovado**, 1.003 candidaturas / 988 fotos.
- `npm run build`: **aprovado**, sitemap com 1.003 candidatos + 2 estáticas e `release.json` gerado.
- `npm run smoke:local`: **aprovado**, 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: **aprovado**.

## Bloqueios

1. `npm run orch:doctor -- --smoke` continua exit 1 porque o shell padrão usa Node `v22.22.2`; Node `v24.19.0` está instalado e é usado nos gates.
2. Doctor reportou OpenCode ausente, Ollama sem preflight e rota Hermes→Codex MCP não comprovada; Codex registrou `401 invalid_refresh_token`. A lane local seguiu sem delegação mutável.
3. Quatro residuais ALRS Enio Carlos Terra continuam sem combinação verificável de ID oficial + fonte exata.
4. Envelope nominal do Senado continua ausente e a auditoria estrita mantém gaps substantivos de fontes.

## Publicação/verificação

- Gates verdes geraram o commit local `docs: registra recon bounded do tick 1554`.
- `git push origin main` e nova tentativa com a credencial keyring (`env -u GH_TOKEN git push origin main`) falharam com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. `gh auth status` mostra duas identidades, com `GH_TOKEN` ativa; a credencial efetiva de push permanece sem permissão. Não houve loop cego.
- Como o push não chegou ao remoto, o workflow backup Cloudflare `334951434` não foi acionado e nenhum release novo foi atribuído a este tick.
- Nenhuma escrita factual, Supabase, identidade, FK, voto, claim, source reference ou Cloudflare foi feita neste tick.

## Próximo passo

Publicar/verificar os commits documentais pendentes e continuar recon bounded oficial. Aplicação factual remota permanece bloqueada até R0, schema/FK, fonte exata, dry-run revisado e idempotência comprovada.
