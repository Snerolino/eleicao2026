# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 05:12 UTC

## Objetivo
Executar um tick bounded do control plane, mantendo recon oficial read-only,
comparação do dataset vivo, gates locais e verificação de publicação sem promover
fatos sem fonte.

## O que foi entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com
  `flock -n` e liberado ao fim do tick.
- Câmara: consulta oficial em janelas trimestrais de 2025-01-01 a 2026-12-31,
  `max_pages=3`. A janela 2025-01-01–2025-03-31 falhou fechado com
  `fetch failed`; as demais janelas observadas responderam `ok`. Por fail-closed,
  `vote_ids=[]`; nenhum ID foi reconciliado ou aplicado.
- ALRS FED-17 residual: `npm run impact:alrs:residual:repair` falhou fechado
  com `FED-17 repair: fetch failed`; nenhum voto/correção foi planejado ou
  aplicado. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e
  fonte exata.
- Auditoria estrita de fontes permaneceu bloqueada por gaps reais, exit 2:
  versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e
  votos `4/2/455`. Nenhuma promoção factual ocorreu.
- Dataset oficial comparado ao snapshot: CSV com 1.003 linhas e 1.003 IDs,
  snapshot com 1.003 IDs, diferenças `0/0`; SHA-256 do CSV
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run data:check`: exit 0, 1.003 candidaturas, 988 fotos oficiais e 1
  fonte TSE.

## Gates locais
- `npm run test`: exit 0, 98 arquivos e 400 testes aprovados.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0 (`CHECKPOINT OK`).
- `npm run build`: exit 0; sitemap com 1.003 candidatos + 2 URLs e
  `release.json` local `907ca10-20260822T050934626Z`.
- `npm run smoke:local`: exit 0; 1.002 cards, 0 falhas HTTP, 0 erros de
  console online e service worker pronto.
- `git diff --check`: exit 0.

## Estado remoto e bloqueios
- `npm run orch:doctor`: `OK=48 WARN=5 FAIL=1`; FAIL conhecido porque o shell
  cron usa Node 22.22.2 enquanto o projeto exige Node 24. OpenCode ausente,
  Ollama sem preflight e rota Hermes → Codex MCP não exercitada permanecem
  avisos/bloqueios de executor; nenhum segredo foi lido ou exposto.
- Produção raiz `https://rs.votopraquem.org`: HTTP 200.
- Consulta de `/release.json` sofreu timeout de resolução DNS neste tick; não
  foi usada para afirmar SHA live.
- Não houve escrita em Supabase, Cloudflare, identidade, FK, voto, claim,
  source reference ou snapshot.
- Commit documental `e589d76` foi criado após os gates. `git push origin main`
  falhou primeiro por DNS (`Could not resolve host: github.com`) e, no retry,
  por HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`).
  Nenhum workflow/deploy novo foi acionado; o commit permanece local.

## Próximo passo
Retentar publicação documental somente se o push efetivo funcionar e então
validar workflow backup Cloudflare `334951434`, `headSha`, HTTP 200 e release
live. Manter ALRS/Senado fail-closed e qualquer aplicação remota condicionada a
R0, schema/FK, fonte oficial, dry-run e idempotência.
