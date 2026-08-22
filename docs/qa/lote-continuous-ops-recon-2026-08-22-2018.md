# Lote continuous-ops — recon oficial e gates — 2026-08-22 20:18Z

## Objetivo
Executar um tick bounded do control plane, manter reconciliação oficial read-only/fail-closed, conferir o dataset vivo, verificar os gates locais e tentar a publicação documental sem promover fatos sem fonte exata.

## Entregue e verificado
- Lock bounded adquirido/liberado com `flock -n`.
- ALRS FED-17 residual executado em dry-run, mas bloqueado antes da leitura pelo Supabase: `FED-17 repair: JWT issued at future` (RC 1). Nenhum voto, data ou fonte foi alterado; os quatro residuais Enio Carlos Terra permanecem sem identidade oficial/fonte exata verificável.
- Câmara consultada exclusivamente pela API oficial `dadosabertos.camara.leg.br`, em 8 janelas trimestrais de 2025–2026, todas `ok`, sem bloqueio, com 700 IDs transitórios. Nenhuma reconciliação ou aplicação ocorreu.
- Senado permanece fail-closed: `/tmp/senado-nominal-envelope-latest.json` continua ausente. Nenhum `legislator_id`, voto ou SHA foi inferido.
- Auditoria regular de fontes RC 0 e estrita RC 2, preservando os gaps reais: votos sem fonte ALRS `4/4000`, Câmara `2/552`, Senado `455/455`; versões sem fonte `1251/3/112`; eventos sem fonte `1647/2/188`. Nenhum fato foi promovido.
- Dataset vivo conferido: CSV oficial TSE `consulta_cand_2026_RS.csv`, 1.003/1.003 IDs, diferença `0/0`, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais (Node 24.19.0)
- `npm run test -- --passWithNoTests`: **RC 0**, 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**.
- `npm run data:check`: **RC 0**, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: **RC 0**, sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `63bb29b-20260822T201641788Z`.
- `git diff --check`: **RC 0**.
- Worktree após a verificação: limpa antes desta documentação; alteração intencional é este QA e o checkpoint STATE.

## Publicação e produção
- `git push origin main`: falhou por indisponibilidade intermitente de resolução de `github.com` (RC 128, `Could not resolve host`), inclusive após `gh auth setup-git`; HEAD local segue `63bb29b`, 8 commits à frente de `origin/main`.
- `gh auth status` confirmou autenticação da conta `Snerolino`; workflows confirmados: backup `334951434`, primário `320564705`, verificador `335560210`.
- Produção respondeu raiz HTTP 200 e `/release.json` HTTP 200, ainda no release `3aae2d0-20260822T180456083Z`, SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, versão `0.2.835`; portanto não há novo deploy associado ao HEAD local.

## Bloqueios reais
- Identidade/token Supabase rejeitado por relógio/JWT futuro no scout ALRS; manter item fail-closed e não tentar aplicação remota.
- DNS/rede para GitHub intermitente; publicação documental pendente de `main -> main` bem-sucedido.
- Doctor global continua com FAIL conhecido por shell Node 22.22.2, embora os gates tenham sido executados explicitamente com Node 24.19.0; OpenCode está ausente e Codex MCP permanece fora do circuito após falha de autenticação anterior.

## Próximo passo
Retentar publicação quando GitHub resolver consistentemente; após `main -> main`, validar workflow backup `334951434`, `headSha` e produção. Manter ALRS, Senado e gaps de fontes em recuperação read-only; aplicação factual continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
