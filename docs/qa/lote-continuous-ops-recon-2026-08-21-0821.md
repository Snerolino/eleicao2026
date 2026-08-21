# Lote continuous ops — recon bounded oficial e pacote de fonte — 2026-08-21 08:21 UTC

## Objetivo
Executar novo tick bounded das lanes oficiais, manter a preparação local ativa e fechar os gates verificáveis sem inserir voto, identidade, FK ou fonte não comprovados.

## Entregue e verificado
- Lock não bloqueante adquirido/liberado com `flock -n`.
- Recon executada por `.orchestrator/runtime/recon_tick.py`; evidências em `.orchestrator/runtime/continuous-tick-20260821T081923Z/`.
- Senado: 6/6 HTTP 200, 6/6 prefixos PDF válidos, 3/6 bytes coincidentes e 0/6 SHA coincidentes com o manifesto; fail-closed.
- ALRS: HTTP 200, 77.442 bytes, SHA-256 `sha256:6a386d7d8b9ae17f8f5107b0cb6c90d71795a8568f08ed7c5972746a4ac0bab1`, 0 `data-item`, sem ocorrência de Enio/Terra no catálogo; nenhum ID ou voto inferido.
- Câmara: HTTP 200, JSON válido na janela 2026-10-01–2026-12-31, 0 registros.
- Dataset vivo: 10 CSVs examinados, 1003 IDs no snapshot, 0 ausentes; nenhum refresh aplicado.
- Pacote local de pedidos substantivos regenerado: 9 pedidos e 8 versões.
- Validador de fonte substantiva falhou fechado como esperado: 25 itens sem fonte substantiva; nenhuma aplicação remota.

## Estado dos dados
Nenhuma escrita factual, identidade, FK, voto, matriz, claim, source reference, Supabase, Cloudflare ou snapshot foi realizada. O pacote permanece preparação local, `pending_review`, `human_review_required=true` e `remote_apply=false`.

## Bloqueios reais
- Senado: deriva SHA em 6/6 fontes; não promover conteúdo.
- ALRS: catálogo sem `data-item` e sem Enio/Terra; 25 itens continuam sem fonte substantiva exata.
- Câmara: nenhum `vote_id` novo no intervalo consultado.
- Auditoria read-only de fontes mantém gaps: ALRS 1251 versões/1647 eventos/4 votos; Câmara 3/2/2; Senado 112/188/455. O modo `--strict` saiu 2 por esses gaps, sem suprimir o gate.
- `npm run orch:doctor -- --smoke`: FAIL por shell em Node 22.22.2 e smoke Codex/MCP com `401 invalid_refresh_token`; gates do projeto executados com Node 24.19.0. WARNs opcionais: OpenCode ausente, gateway Hermes com Node divergente e Ollama sem preflight.

## Verificação local
- `npm run test`: exit 0, 97 arquivos/398 testes.
- `npx tsc --noEmit`: exit 0.
- `node scripts/validate-impact-schema.mjs`: exit 0.
- `npm run data:check`: exit 0, 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: exit 0; sitemap 1003 candidatos + 2 estáticas; `release.json` gerado com SHA `a92168137524`.
- `git diff --check`: exit 0.
- `npm run smoke:local`: exit 0; 1002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Publicação verificada
- Commit `ed320f9815efa56134262275c96fbf7451a0c146` enviado para `origin/main`.
- Backup Cloudflare `334951434`, run `32462865222`: `completed/success`, `headSha` idêntico.
- Produção: `https://rs.votopraquem.org` HTTP 200.
- `release.json` em produção confirma SHA idêntico, `row_count=1003`, release `ed320f9-20260821T082252009Z`.
- Smoke remoto: exit 0; 1002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Próximo passo
Repetir recon bounded fail-closed e manter a lane local independente. Aplicação remota somente após R0/schema/FK/fonte oficial/dry-run/idempotência; não inventar URL, hash, UUID, identidade ou voto.
