# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 05:36 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only (Câmara e ALRS), auditoria de fontes, comparação do CSV TSE vivo com o snapshot público e gates locais após o último checkpoint.

## Entregue e verificado
- Lock bounded testado com `flock -n` e liberado ao fim do tick.
- Câmara: `discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 3`; a janela 2025-01-01–2025-03-31 falhou fechado com `fetch failed`; demais páginas observadas responderam `ok`; por fail-closed `vote_ids=[]`, sem reconciliação ou aplicação.
- ALRS FED-17 residual: `repair-alrs-fed17-residual.mjs --dry-run` retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra seguem sem ID oficial e fonte exata.
- Auditoria estrita de fontes manteve gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit 2, sem promoção.
- Dataset: CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; 1.003 linhas e 1.003 IDs coincidentes com o snapshot (`0/0` diferenças). Nenhum refresh factual.
- Doctor: `OK=49 WARN=6 FAIL=2`; FAIL real por shell Node 22.22.2 quando o projeto exige Node 24 e por falta de evidência da rota MCP Codex read-only; Codex reportou `401 invalid_refresh_token`. OpenCode ausente e fallback Ollama sem preflight são WARNs.

## Gates locais
- `npm run test`: verde, 400 testes em 98 arquivos.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde — 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: verde — sitemap 1.003 candidatos + 2 estáticas; `release.json` local `d697b66-20260822T053646130Z`.
- `git diff --check`: verde; worktree limpa antes deste registro.
- `npm run smoke:local`: primeira tentativa falhou transitoriamente com `cards=0` durante carregamento; repetição verde — 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Bloqueios
- Push/publicação: ainda não revalidado neste tick; o HEAD local já está 53 commits à frente de `origin/main`, portanto nenhum deploy novo é afirmado.
- ALRS residual bloqueado por ausência de evidência oficial recuperável nesta execução.
- Câmara Q1/2025 bloqueada por `fetch failed` e Senado continua fail-closed sem envelope nominal/PDF/`legislator_id`/SHA verificável.
- Nenhum dado factual, Supabase, Cloudflare, identidade, FK, voto, claim ou matriz foi alterado.

## Próximo passo
Repetir a recon bounded da janela Câmara bloqueada, manter ALRS/Senado fail-closed e retentar a lane de publicação documental apenas com permissão efetiva de push; depois validar workflow backup `334951434`, `headSha`, HTTP de produção e release SHA. Aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
