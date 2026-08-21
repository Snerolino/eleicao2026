# QA — lote continuous ops: recon oficial e gates locais — 2026-08-21 16:17Z

## Objetivo
Executar tick bounded do control plane mantendo recon oficial read-only, lane local independente, publicação/verificação automática após gates e aplicação factual remota bloqueada sem R0/schema/FK/fonte/dry-run/idempotência.

## Reconhecimento oficial e dataset

- ALRS residual FED-17: `node scripts/repair-alrs-fed17-residual.mjs` em dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Nenhum voto ou correção foi promovido.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, 8 janelas trimestrais de 2025–2026, `max-pages=1`; 8/8 páginas `status=ok` e IDs oficiais retornados. Nenhuma identidade, FK, evento ou voto foi reconciliado/aplicado.
- Senado: envelope nominal transitório não disponível; nenhuma adaptação, PDF, `legislator_id`, FK ou voto foi inferido.
- Dataset vivo: arquivo completo `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` comparado por `SQ_CANDIDATO` com `data/public-candidates.json`: 1.003 IDs no CSV, 1.003 no snapshot, diferença 0/0. O CSV irmão em `../dataset2026/candidatos/consulta_cand_2026_RS.csv` é parcial (213 linhas) e não foi usado como fonte completa.
- Auditoria estrita read-only manteve gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; saiu exit 2. Nenhuma fonte foi inventada.

## Gates locais

Executados com Node `v24.19.0`:

- `npm run test`: **400 testes / 98 arquivos aprovados**.
- `npx tsc --noEmit`: **aprovado**.
- `node scripts/validate-impact-schema.mjs`: **aprovado**.
- `npm run data:check`: **aprovado**, 1.003 candidaturas / 988 fotos.
- `npm run build`: **aprovado**, sitemap com 1.003 candidatos + 2 estáticas e `release.json` gerado.
- `npm run smoke:local`: **aprovado**, 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: **aprovado**.

## Publicação e verificação

- Worktree iniciou limpa em `23e085a431c6128e96a452def180ff1107ed57d5`; o commit documental `58e7377` permanece local, seis commits à frente de `origin/main`.
- `git push origin main` falhou com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). A tentativa adicional `env -u GH_TOKEN git push origin main` falhou com o mesmo 403. Não houve loop cego.
- Como o push não chegou ao remoto, o workflow backup Cloudflare `334951434` não foi acionado para este tick.
- Produção respondeu `HTTP 200`; `/release.json` respondeu `HTTP 200` e ainda identifica o release remoto `e925327276b82481a348d4db3e2339d075dfe9a3`, não os seis commits locais pendentes.

## Bloqueios

1. Push GitHub bloqueado por permissão efetiva da credencial HTTPS, apesar de `gh auth status` listar Snerolino autenticado. Publicação/Cloudflare ficam pendentes até a credencial de Git ter permissão efetiva.
2. Doctor continua exit 1 por shell Node `v22.22.2`; gates foram executados explicitamente com Node `v24.19.0`.
3. Doctor reportou OpenCode ausente, Ollama sem preflight e rota Hermes→Codex MCP não comprovada; Codex registrou `401 invalid_refresh_token`.
4. Quatro residuais ALRS Enio Carlos Terra continuam sem combinação verificável de ID oficial + fonte exata; Senado segue sem envelope; gaps substantivos de fontes permanecem.

## Próximo chunk

Manter recon bounded oficial e lane local independente. Repetir publicação somente após corrigir a permissão efetiva de push; aplicação factual remota permanece bloqueada até R0, schema/FK, fonte exata, dry-run revisado e idempotência comprovada.
