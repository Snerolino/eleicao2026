# QA — lote continuous ops P2/recon — 2026-08-23 06:38 (-03)

## Objetivo
Executar o tick bounded do control plane: recon oficial read-only, comparar o dataset vivo, validar gates locais e preparar um microbatch ALRS P2 sem qualquer aplicação factual remota.

## Entregue e verificado

- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado no tick.
- Dataset vivo conferido sem refresh: `data:check` RC 0, `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.
- CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Snapshot `data/public-candidates.json`: SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- ALRS FED-17 residual: dry-run RC 0, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra permanecem fail-closed, sem ID oficial/fonte exata.
- Câmara oficial `https://dadosabertos.camara.leg.br/api/v2`: recon read-only de 8 janelas trimestrais (`2025-01-01` a `2026-12-31`), `8/8` páginas `ok`, `blocked=null`, `700` IDs transitórios. Nenhuma identidade foi reconciliada e nada foi aplicado.
- Auditoria de fontes RC 0 (read-only), preservando gaps reais: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Microbatch local `data/legislative-import/alrs/p2-microbatch-2026-08-23.json` gerado por `npm run impact:alrs:r4:p2:microbatch`: `5` versões, `factual_votes=0`, `remote_apply=false`, `public_approval=false`, todos `pending_review` e com revisão humana requerida. Não é carga pública nem escrita remota.

## Gates locais

- `npm run test -- --passWithNoTests`: RC 0 — `401` testes, `98` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003/988/1`.
- `npm run build`: RC 0 — `224` módulos, sitemap `1003 + 2`, release local `48eebb9-20260823T093722923Z`.
- `git diff --check`: RC 0.
- `npm run smoke:local`: primeira execução falhou transitoriamente com `cards=0` durante carregamento; segunda execução RC 0 — `1002` cards, `0` falhas HTTP, `0` erros de console online, service worker pronto.

## Bloqueios reais

- Doctor geral RC 1: shell padrão usa Node `22.22.2`, mas o projeto exige Node 24; OpenCode ausente e rota Codex MCP não exercitada no modo rápido. Os gates do projeto foram executados explicitamente com Node `24.19.0`.
- Senado permanece fail-closed sem envelope nominal com SHA verificável.
- ALRS residual permanece sem evidência oficial exata para os quatro casos; não houve tentativa de contornar o gate.
- Aplicação remota continua proibida neste lote: faltam R0/schema/FK/fonte exata/dry-run/idempotência para qualquer escrita factual.

## Próximo passo

Commit criado: `f44f284` (`chore: registrar microbatch P2 e recon oficial`). Publicação bloqueada: `git push origin main` e `env -u GH_TOKEN git push origin main` retornaram HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); `main` local está 1 commit à frente de `origin/main`, portanto nenhum workflow novo foi acionado. Produção revalidada independentemente: raiz DNS falhou (`HTTP 000`), mas `/release.json` respondeu HTTP 200 no commit anterior `48eebb9`, versão `0.2.908`, snapshot `1003`; backup `334951434` permanece ativo. Manter recon ALRS/Senado fail-closed e o microbatch P2 em revisão, sem Supabase/Cloudflare write.
