# Lote continuous ops — recon oficial e gates locais — 2026-08-22 01:33Z

## Objetivo
Executar um tick bounded do control plane com lock não bloqueante, manter as lanes oficiais read-only ativas e verificar o estado local antes de qualquer publicação.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido/liberado via `flock -n`.
- Câmara: consulta oficial `dadosabertos.camara.leg.br/api/v2/votacoes`, janelas 2025–2026, 20 páginas observadas até o limite de 3 páginas por janela; a janela `2025-01-01`–`2025-03-31` falhou fechado com `fetch failed`, portanto `blocked` foi preservado e nenhum `vote_id` foi promovido.
- ALRS FED-17 residual: `dry-run`, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria de fontes read-only: gaps mantidos em versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`; nenhuma promoção factual.
- Snapshot: `data:check` verde com 1.003 candidaturas, 988 fotos oficiais e 1 fonte TSE.

## Gates locais
- `npm run test -- --passWithNoTests`: OK — 400 testes / 98 arquivos.
- `npx tsc --noEmit`: OK.
- `node scripts/validate-impact-schema.mjs`: OK.
- `npm run build`: OK — sitemap 1.003 candidatos + 2 estáticas; `release.json` gerado.
- `npm run smoke:local`: OK — 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: OK.

## Estado e bloqueios
- Nenhuma escrita factual, snapshot, claim, source reference, FK, voto, matriz, Supabase ou Cloudflare ocorreu.
- Senado continua fail-closed por envelope nominal ausente/sem SHA verificável; não houve promoção de PDF, `legislator_id` ou voto.
- `npm run orch:doctor`: `OK=48 WARN=5 FAIL=1`; FAIL conhecido: shell Node 22.22.2 enquanto o projeto exige Node 24. A rota Câmara também teve bloqueio de rede na primeira janela.
- Worktree permanece limpa, HEAD local `79bf71bf7a8b601405faf42e804c922e7909e994`, 37 commits à frente de `origin/main`.

## Próximo passo
Repetir recon bounded da Câmara quando a API responder; manter ALRS/Senado fail-closed. A publicação GitHub/deploy só pode ser validada após o push efetivo; aplicação factual remota permanece condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
