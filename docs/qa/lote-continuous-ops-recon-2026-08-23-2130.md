# Lote continuous-ops — recon read-only — 2026-08-23 21:30 UTC

## Objetivo
Retomar o control plane contínuo: revalidar snapshot TSE, cobertura de fontes legislativas, residual ALRS e publicação, sem promover decisões editoriais nem aplicar fatos sem fonte.

## Entregue e verificado
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` versus `data/public-candidates.json`: `1003/1003` IDs; diferença `0/0`; SHA/bytes do CSV permanecem `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9` / `553194`.
- `npm run data:check`: RC `0`; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Auditoria regular de fontes: RC `0`. Auditoria strict: RC `2`, fail-closed, com gaps reais: versões ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- `npm run impact:alrs:residual:repair`: RC `0`, dry-run, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Produção: `https://rs.votopraquem.org` HTTP `200`; `/release.json` HTTP `200`; release `0.2.961`, snapshot `1003`, SHA do commit não exposto no payload.
- Git: `HEAD=4f33ddf`, `main` local `7` commits à frente de `origin/main`; `git push origin main` RC `128`, HTTP `403` (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). Nenhum workflow novo foi disparado.
- Doctor: RC `1`, com bloqueios de infraestrutura já conhecidos: shell Node `22.22.2` enquanto o projeto exige Node 24 e OpenCode ausente; demais checks principais OK.

## Estado dos dados e decisões
- Nenhuma identidade, FK, voto, source reference, claim, disposição, assessment, matriz, Supabase ou Cloudflare foi alterado.
- Os quatro votos ALRS residuais permanecem bloqueados até reprodução de fonte oficial com URL, hash, bytes e match exato.
- Filas editoriais continuam sob revisão humana; nenhuma decisão foi promovida automaticamente.

## Bloqueios reais
1. Transporte Git rejeitado pelo GitHub com HTTP 403 para o usuário autenticado `Snerolino`; o QA deste tick permanece apenas local.
2. Auditoria strict bloqueada por ausência de evidência vinculável nos gaps legislativos listados; fail-closed aplicado.
3. Doctor degradado pelo Node do shell e ausência do OpenCode; não impede a recon read-only nem o gate específico `data:check`.

## Próximo passo
Retentar o transporte Git no próximo tick. Se `main -> main` for aceito, validar workflow backup `334951434`, `headSha` e produção. Manter a recuperação dos quatro ALRS em reconciliação read-only e não aplicar votos sem fonte exata.
