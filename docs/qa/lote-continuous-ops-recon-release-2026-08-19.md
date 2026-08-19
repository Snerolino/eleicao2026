# QA — tick continuous ops: reconciliação TSE e release

- **Data:** 2026-08-19 05:36 UTC
- **Objetivo:** executar um tick bounded com as quatro lanes ativas, revalidar o snapshot TSE local, validar gates locais e tentar a verificação de publicação sem alterar dados remotos.

## Entregue e verificado

- Lock não bloqueante `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado no mesmo processo.
- `git status --short --branch`: `main...origin/main`, worktree limpa no início.
- `HEAD` e `origin/main`: `f16cdf8f382e442d3766e2044e26f25f2c6539df`.
- Doctor smoke: `OK=51 WARN=5 FAIL=1`; o único FAIL é o shell cron em Node `v22.22.2`, enquanto os gates foram executados em Node `v24.19.0`. Warnings: OpenCode ausente, Gemini apenas legacy, Ollama sem preflight e rota opcional.
- Reconciliação read-only `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` versus `data/public-candidates.json`: `1003` linhas em cada lado, `0` somente no dataset e `0` somente no snapshot.
- Campos públicos de identidade `SQ_CANDIDATO`, nome e partido coincidiram; a única divergência observada foi `210002533050`/TENENTE NETO, cujo `ballot_name` está ausente no snapshot e presente no CSV oficial. Nenhum dado foi promovido automaticamente.
- Geração de artefatos locais pelo build confirmou snapshot `1003` candidaturas e `988` fotos; sitemap `1003` candidatos + estáticas = `1005` URLs; `release.json` local para `f16cdf8`.

## Gates locais

- `npm run test`: **verde**, 78 arquivos / 366 testes.
- `npx tsc --noEmit`: **verde**.
- `node scripts/validate-impact-schema.mjs`: **verde**.
- `npm run data:check`: **verde**, 1003 candidaturas / 988 fotos / 1 fonte TSE.
- `npm run build`: **verde**, Vite/PWA/sitemap/release concluídos.
- `git diff --check`: **verde** antes desta documentação.

## Publicação/verificação remota

- `gh api repos/Snerolino/eleicao2026/actions/workflows`: bloqueado por `error connecting to api.github.com`.
- `curl https://rs.votopraquem.org` e `/release.json`: bloqueados por falha DNS (`Could not resolve host`).
- Commit documental `c876f0e73d4d244f07685158f075a8085e5bc982` foi criado e publicado em `origin/main`; a API GitHub continua indisponível para localizar/disparar o workflow backup. Nenhuma escrita factual Supabase foi executada.

## Estado dos dados e segurança

- Nenhum candidato, voto, identidade, FK, source reference, claim, matriz, RLS/RPC/Auth/Storage ou secret foi alterado.
- O caso TENENTE NETO permanece somente como divergência de campo de apresentação e exige decisão/contrato de sincronização antes de qualquer mutação.
- Reconhecimento oficial e publicação ficam separados: a falha de rede não é tratada como ausência de fonte nem como sucesso de deploy.

## Próximo passo

Reexecutar a verificação de GitHub/Cloudflare/produção quando DNS/API estiverem disponíveis; depois revisar a divergência de `ballot_name` com o pipeline oficial e somente então considerar sincronização idempotente. Manter lanes legislativas fail-closed para qualquer identidade, FK ou voto sem fonte e correspondência exatas.
