# Lote continuous-ops — recon oficial e publicação

**Data:** 2026-08-23 06:02 UTC

## Objetivo
Executar um tick bounded do control plane com recon oficial read-only, conferência do dataset vivo e tentativa de publicação documental, sem promover fatos sem R0, identidade/FK, fonte oficial exata, dry-run e idempotência.

## Reconhecimento oficial
- ALRS FED-17 residual: dry-run RC 0, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`; os 4 casos de Enio Carlos Terra continuam bloqueados sem ID oficial e fonte exata.
- Câmara: `scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` retornou `8/8` janelas trimestrais `status=ok`, `blocked=null` e `700` IDs transitórios; nenhuma reconciliação ou aplicação.
- Auditoria de fontes read-only RC 0 preservou os gaps reais: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Senado permanece fail-closed sem envelope nominal com SHA verificável.

## Dataset
- CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` e snapshot: `1003/1003` IDs; diferenças `0/0`.
- SHA-256 do CSV: `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Estado local e publicação
- `npm run orch:doctor`: RC 1 por requisito Node 24 com shell Node 22.22.2; warnings conhecidos: OpenCode ausente e Ollama sem preflight. Nenhum segredo foi lido ou exposto.
- Worktree inicial limpa em `95bd074`; `main` estava 1 commit à frente de `origin/main`.
- `git push origin main`: RC 128, HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). O commit documental permanece local; nenhum workflow novo foi acionado.
- Workflows remotos confirmados: backup `334951434`, primário `320564705` e verificador `335560210`, todos ativos.
- Nenhuma escrita factual em Supabase, alteração de schema/RLS ou deploy Cloudflare ocorreu.

## Bloqueios
- Publicação está bloqueada pela permissão efetiva do transporte Git HTTPS, apesar de a API do GitHub permanecer autenticada. Não contornar com token ou segredo exposto.
- ALRS/Senado continuam bloqueados por ausência de evidência oficial exata; gaps de fontes continuam fail-closed.

## Próximo passo
Retentar `main -> main` quando o transporte Git aceitar a identidade; após sucesso, validar o workflow backup `334951434`, `headSha` contra o commit publicado e `/release.json` em produção. Manter recon oficial read-only e avançar apenas lotes com R0/schema/FK/fonte/dry-run/idempotência.
