# Lote continuous-ops — recon oficial e gates — 2026-08-22 22:04 UTC

## Objetivo
Executar um tick bounded do control plane: reconciliação oficial read-only prioritária, conferência do dataset público, gates locais e tentativa automática de publicação.

## Entregue e verificado
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Os 4 residuais de Enio Carlos Terra continuam bloqueados: não há ID oficial e fonte exata verificáveis; nenhum voto foi promovido.
- Câmara consultada read-only na API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, em janelas trimestrais de 2025–2026, `max_pages=2`: 15 páginas observadas, todas `status=ok`, 1.400 IDs transitórios coletados; sem reconciliação, FK ou escrita.
- Senado permaneceu fail-closed: envelope nominal verificável ausente; nenhuma fonte, identidade ou voto foi inventado.
- Dataset oficial conferido contra `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1.003 IDs no CSV e 1.003 no snapshot, diferença 0/0. SHA-256 do CSV: `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais
Executados com Node `v24.19.0`:
- `npm run test`: OK — 98 arquivos, 401 testes.
- `npx tsc --noEmit`: OK.
- `node scripts/validate-impact-schema.mjs`: OK.
- `npm run data:check`: OK — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: OK — sitemap 1.003 candidatos + 2 estáticas; `release.json` local `17939d5-20260822T220355832Z`.
- `git diff --check`: OK.
- `npm run smoke:local`: primeira tentativa falhou transitoriamente com `cards=0` durante carregamento; repetição verificada OK — 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Publicação e produção
- `git push origin main`: bloqueado novamente por HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- HEAD local: `17939d5`; 15 commits à frente de `origin/main`; nenhum workflow novo ou deploy foi acionado.
- Workflows remotos confirmados: backup `334951434`, primário `320564705`, verificador `335560210`.
- Produção revalidada: raiz HTTP 200 e `/release.json` HTTP 200. Live permanece `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, versão `0.2.835`, snapshot 1.003, sem correspondência com o HEAD local.

## Estado dos dados e bloqueios
Nenhum candidato, voto, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado. O bloqueio de publicação é autenticação/permissão efetiva do GitHub, não falha de build. ALRS residual e Senado seguem fail-closed por falta de evidência oficial completa.

## Próximo passo
No próximo tick, retentar `main -> main`; se aceito, validar o workflow backup `334951434`, `headSha` do run concluído e `/release.json` em produção. Manter aplicação factual remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
