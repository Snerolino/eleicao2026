# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 08:15Z

## Objetivo
Executar um tick bounded do control plane com recon oficial read-only, verificar dataset, fechar os gates locais e tentar a publicação documental pendente.

## Entregue e verificado
- Lock não bloqueante testado com `flock -n` e liberado ao fim de cada operação bounded.
- Câmara: API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`, 8 janelas trimestrais entre `2025-01-01` e `2026-12-31`, `max_pages=1`; 8/8 respostas `ok`, 700 `vote_ids` somente no artefato transitório `/tmp/camara-recon-20260822-0510.json`. Nenhuma reconciliação ou aplicação.
- ALRS FED-17 residual: dry-run com `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra seguem sem ID oficial e fonte exata; nada foi promovido.
- Senado: fail-closed. `/tmp/senado-nominal-envelope-latest.json` continua ausente; nenhum PDF, `legislator_id`, SHA ou voto foi inventado.
- Auditoria de fontes read-only: gaps em versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`; comando retornou `has_gaps=true`, sem promoção factual.
- Dataset sem mudança: CSV oficial SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot SHA `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`; `data:check` confirmou 1.003 candidaturas e 988 fotos.

## Gates locais
Executados com Node `v24.19.0`:
- `npm run test`: aprovado; 400 testes em 98 arquivos.
- `npx tsc --noEmit`: aprovado.
- `node scripts/validate-impact-schema.mjs`: aprovado.
- `npm run data:check`: aprovado; 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: aprovado; sitemap 1.003 candidatos + 2 estáticas; `release.json` local `cc4fe56-20260822T081339103Z`.
- Primeira execução de `npm run smoke:local`: falha transitória durante carregamento (`cards=0`, body ainda em `Carregando lista de candidatos`).
- Segunda execução de `npm run smoke:local`: aprovada; 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto; detalhe/canonical de Priscila Voigt Severiano validado.
- `git diff --check`: aprovado.

## Estado Git e publicação
- HEAD local: `cc4fe5618e4057aef2f4c25ea53992dc3f7aef5d`.
- Worktree estava limpa antes deste QA; este arquivo é a única alteração esperada.
- `env -u GH_TOKEN git push origin main`: falhou com HTTP 403, `Permission to Snerolino/eleicao2026.git denied to Snerolino`; HEAD local segue 64 commits à frente de `origin/main`.
- Sem push aceito, nenhum workflow novo, deploy Cloudflare ou alteração remota foi afirmado.

## Bloqueios reais
1. Permissão efetiva do GitHub continua negando `main -> main` (HTTP 403), impedindo disparar/verificar o workflow backup `334951434`.
2. Shell padrão segue Node 22.22.2; o projeto exige Node 24.19.0. Os gates foram fechados explicitamente com o binário Node 24.19.0.
3. Codex MCP permanece sem nova tentativa neste tick por refresh token inválido registrado no doctor; OpenCode não está instalado.
4. Gaps de fontes legislativas permanecem; ALRS residual e Senado não possuem evidência oficial suficiente para aplicação remota.

## Próximo passo
Retentar publicação documental quando a permissão efetiva permitir `main -> main`; somente então validar workflow backup `334951434`, `headSha` e produção. Manter Câmara em recon read-only, ALRS/Senado fail-closed e qualquer aplicação remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
