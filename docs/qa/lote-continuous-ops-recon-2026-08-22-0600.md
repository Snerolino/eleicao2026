# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 06:00 UTC

## Objetivo
Executar um tick bounded do control plane com recon oficial read-only, auditoria de fontes, comparação do dataset vivo, gates locais e verificação da publicação existente.

## Entregue e verificado
- Lock bounded adquirido com `flock -n` e liberado ao fim do tick.
- Câmara: `npm run impact:camara:discover -- --start 2025-01-01 --end 2026-12-31 --max-pages 3`; 22 páginas em 8 janelas responderam `ok`, sem bloqueios, e 2.100 `vote_ids` foram descobertos somente em memória. Não houve reconciliação nem aplicação.
- ALRS FED-17 residual: dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria estrita de fontes (`node scripts/audit-legislative-source-coverage.mjs --strict`) saiu com exit 2 por gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; nenhuma promoção.
- Dataset oficial permaneceu sem mudança: `data:check` verde com 1.003 candidaturas, 988 fotos e 1 fonte TSE. O checkpoint anterior registra SHA CSV `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9` e 1.003/1.003 IDs CSV/snapshot.

## Gates locais
- `npm run orch:doctor -- --smoke`: exit 1, `OK=52 WARN=4 FAIL=1`; ambiente Node 24.19.0 compatível. Falha real: rota MCP Codex read-only não comprovada, com `401 invalid_refresh_token`; Ollama não respondeu ao preflight.
- `npm run test`: verde, 400 testes em 98 arquivos.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde.
- `npm run build`: verde.
- `git diff --check`: verde.
- `npm run smoke:local`: falhou em duas tentativas independentes: primeiro `cards=0` enquanto a lista carregava; repetição excedeu timeout em `page.waitForFunction` na rota de comparação. Não afirmar smoke verde neste tick.

## Publicação e produção
- `git push origin main`: falhou HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum workflow novo foi acionado.
- Worktree permaneceu sem alterações de código antes deste registro; não houve escrita factual, Supabase ou Cloudflare.
- Produção existente: `https://rs.votopraquem.org` respondeu HTTP 200 e `/release.json` HTTP 200 na segunda verificação.
- Release live verificado: `sha=e925327276b82481a348d4db3e2339d075dfe9a3`, `release_id=e925327-20260821T145742462Z`, snapshot `row_count=1003`, SHA do snapshot `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Workflow backup remoto ativo: `334951434` (`Deploy to Cloudflare Pages (backup)`); não foi disparado porque não houve push efetivo.

## Bloqueios
- Publicação documental bloqueada por permissão efetiva do GitHub (HTTP 403), apesar de o CLI estar autenticado.
- Smoke local inconclusivo/falho por carregamento assíncrono durante este tick; requer diagnóstico separado antes de declarar o gate verde.
- ALRS residual, Câmara histórico não aplicado e Senado permanecem fail-closed por ausência de evidência/identidade/fonte verificável.

## Próximo passo
Repetir smoke com investigação do carregamento assíncrono, manter ALRS/Senado fail-closed, e retentar push somente quando a permissão efetiva mudar. Aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
