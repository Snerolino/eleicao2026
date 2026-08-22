# Lote continuous-ops — recon oficial e gates — 2026-08-22 20:37Z

## Objetivo
Executar um tick bounded do control plane, manter as lanes oficiais read-only/fail-closed, conferir o dataset vivo, validar os gates locais e tentar a publicação documental sem promover fatos sem fonte exata.

## Entregue e verificado
- Lock bounded foi adquirido/liberado com `flock -n`.
- ALRS FED-17 residual executado em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais Enio Carlos Terra continuam sem ID oficial e fonte exata verificável; nenhum voto/data/fonte foi alterado.
- Auditoria regular de fontes (`npm run impact:sources:audit`) RC 0, mantendo gaps reais: votos sem fonte ALRS `4/4000`, Câmara `2/552`, Senado `455/455`; versões sem fonte `1251/3/112`; eventos sem fonte `1647/2/188`. Nenhum fato foi promovido.
- Senado permanece fail-closed pela ausência de `/tmp/senado-nominal-envelope-latest.json`; nenhum `legislator_id`, voto ou SHA foi inferido.
- Dataset vivo conferido contra `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1.003/1.003 IDs, diferença `0/0`, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais (Node 24.19.0)
- `npm run test -- --passWithNoTests`: **RC 0**, 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**.
- `npm run data:check`: **RC 0**, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: **RC 0**, sitemap 1.003 candidatos + 2 estáticas; `release.json` local `6f7851d-20260822T203659670Z`.
- `npm run smoke:local`: **RC 0**, 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto; detalhe canônico `/candidatos/priscila_voigt_severiano_210002533355`.
- `git diff --check`: **RC 0**.

## Publicação
- `git push origin main`: **RC 128**, GitHub rejeitou com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`. Nenhum workflow ou deploy novo foi acionado.
- HEAD local `6f7851d` permanece 9 commits à frente de `origin/main`; a publicação documental continua bloqueada pela permissão efetiva do remoto.

## Bloqueios reais
- GitHub: identidade autenticada não tem permissão efetiva de push no repositório remoto (HTTP 403).
- ALRS: quatro residuais sem identidade oficial/fonte exata; reparo permanece fail-closed.
- Senado: envelope nominal verificável ausente.
- Auditoria estrita de fontes segue com gaps reais; não publicar fatos órfãos.

## Próximo passo
Retentar `main -> main` em novo tick; se aceito, validar workflow backup `334951434`, `headSha` e produção. Manter recon ALRS/Senado/Câmara read-only e aplicação factual condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
