# Lote continuous-ops — recon read-only — 2026-08-23 21:50 UTC

## Objetivo
Retomar o control plane contínuo, revalidar dados públicos, fontes legislativas, fila residual ALRS e publicação, sem promover decisões editoriais nem aplicar fatos sem fonte.

## Entregue e verificado
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` versus `data/public-candidates.json`: `1003/1003` IDs, diferença `0/0`; CSV `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run data:check`: RC `0`; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Auditoria regular de fontes: RC `0`. Auditoria strict: RC `2`, fail-closed; gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- `npm run impact:alrs:residual:repair`: RC `0`, dry-run, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Micro-lote P2-6 local regenerado: `5` versões, IDs oficiais preservados. O pack editorial P2-5 permanece `5/5` fontes verdes e `5` disposições pendentes; nenhuma decisão foi aplicada.
- `node scripts/verify-cli-output.mjs --live`: RC `0`; `1000` claims publicadas auditadas, `0` sem fonte.
- Produção: raiz HTTP `200`, `/release.json` HTTP `200`; release `0.2.971`, SHA live `a82510b7d22199e1c22fbd1e05c57ef57567aad8`, snapshot `1003`.
- GitHub Actions: backup `334951434` run `32668450924` concluído `success` com `headSha=a82510b7d22199e1c22fbd1e05c57ef57567aad8`; Deploy primário run `32668442174` também `success`.
- Commit documental local `1b34ab4` criado (amend do registro inicial). `git push origin main` e retries falharam RC `128` por HTTP `403` (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); nenhum workflow novo foi acionado. Local está `1` commit à frente de `origin/main`.

## Estado dos dados e decisões
- Nenhuma identidade, FK, voto, source reference, claim, disposição, assessment, matriz, Supabase ou Cloudflare foi alterado.
- Os quatro votos ALRS residuais permanecem bloqueados até reprodução de fonte oficial com URL, hash, bytes e match exato.
- Senado e gaps de fontes legislativas continuam fail-closed.

## Bloqueios reais
- Auditoria strict permanece bloqueada por ausência de evidência vinculável nos gaps oficiais; não converter ausência em voto nem inventar fonte.
- Doctor RC `1`: shell usa Node `22.22.2` embora o projeto exija Node 24; OpenCode ausente. Isso não impede este recon read-only.

## Próximo passo
Manter a fila editorial no `/admin` para revisão humana e continuar a recuperação read-only dos quatro ALRS residuais. Só aplicar qualquer fato após R0, identidade/FK, fonte exata, dry-run e idempotência comprovados.
