# QA — lote continuous ops: recon oficial e gates locais — 2026-08-21 15:35Z

## Objetivo
Executar novo tick bounded do control plane, mantendo as quatro lanes: recon oficial read-only, lane local independente, publicação/verificação após gates e aplicação factual remota bloqueada sem R0/schema/FK/fonte/dry-run/idempotência.

## Entregue e verificado

- ALRS residual FED-17: `node scripts/repair-alrs-fed17-residual.mjs` em dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Nenhum voto ou correção foi promovido.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, em 8 janelas trimestrais de 2025–2026, `max-pages=1`; 8/8 páginas com `status=ok` e 700 IDs oficiais descobertos. Nenhuma identidade, FK, evento ou voto foi reconciliado/aplicado.
- Senado: adaptação fail-closed; `/tmp/senado-nominal-envelope-latest.json` está ausente (`ENOENT`). Nenhum PDF, `legislator_id`, FK ou voto foi inferido.
- Dataset vivo: CSV oficial completo `consulta_cand_2026_RS.csv` foi comparado com o snapshot usando `latin1` e cabeçalho CSV entre aspas: 1.003 linhas, 1.003 IDs no CSV, 1.003 no snapshot, diferença 0/0. Nenhum refresh foi aplicado.
- Auditoria estrita de fontes read-only manteve gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; processo saiu exit 2. Nenhuma fonte foi inventada.

## Gates locais

Executados sob Node `v24.19.0`:

- `npm run test`: **400 testes / 98 arquivos aprovados**.
- `npx tsc --noEmit`: **aprovado**.
- `node scripts/validate-impact-schema.mjs`: **aprovado**.
- `npm run data:check`: **aprovado**, 1.003 candidaturas / 988 fotos.
- `npm run build`: **aprovado**, sitemap com 1.003 candidatos + 2 estáticas e `release.json` gerado.
- `npm run smoke:local`: **aprovado**, 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- `git diff --check`: **aprovado**.

## Bloqueios

1. `npm run orch:doctor` continua exit 1 porque o shell padrão usa Node `v22.22.2`; Node `v24.19.0` está instalado e foi usado nos gates.
2. Doctor reportou WARN de OpenCode ausente, WARN de Ollama sem preflight e WARN de rota Hermes→Codex MCP não exercitada; a lane local seguiu sem delegação mutável.
3. Quatro residuais ALRS Enio Carlos Terra continuam sem combinação verificável de ID oficial + fonte exata.
4. Envelope nominal do Senado continua ausente e a auditoria estrita mantém gaps substantivos de fontes.

## Publicação/verificação

- Worktree estava limpa antes do tick; a documentação deste lote e o checkpoint operacional são as únicas alterações pretendidas.
- O commit deste tick foi criado como `92b8fd4`; `git push origin main` falhou com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). `gh api` confirma permissões administrativas, mas a credencial usada pelo Git continua sem autorização efetiva de push; não houve loop cego.
- Produção respondeu `HTTP 200`; `/release.json?cb=continuous1535` confirmou o release anterior `e925327276b82481a348d4db3e2339d075dfe9a3`, snapshot `row_count=1003`. Sem push, o workflow backup Cloudflare não foi acionado e não há release novo deste tick.

## Próximo passo

Tentar publicar os commits documentais pendentes, verificar workflow backup `334951434`, `headSha`, `/release.json` e smoke de produção. Em paralelo, continuar recon bounded oficial. Aplicação factual remota permanece proibida até R0, schema/FK, fonte exata, dry-run revisado e idempotência comprovada.
