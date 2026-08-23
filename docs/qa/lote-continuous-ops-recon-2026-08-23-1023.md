# QA — lote continuous ops recon — 2026-08-23 10:23 UTC

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, validar o snapshot vivo, rodar todos os gates locais e verificar a produção sem aplicar fatos remotos.

## Entregue e verificado
- Lock `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado no tick.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos de Enio Carlos Terra continuam bloqueados por ausência de ID oficial e fonte exata; nenhum voto foi inventado ou aplicado.
- Câmara oficial read-only: 8 janelas trimestrais 2025–2026 retornaram `status=ok`, `blocked=null`; IDs foram apenas inventariados, sem reconciliação ou escrita.
- Auditoria de fontes read-only RC 0, mantendo lacunas reais: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Snapshot público válido: `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE. Comparação com `../dataset2026`: CSV presente, `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot SHA `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- Gates em Node `v24.19.0`: `401/401` testes em `98` arquivos; TypeScript RC 0; schema RC 0; `data:check` RC 0; build RC 0 (`224` módulos, sitemap `1003 + 2`, release local `1a4c356-20260823T102217735Z`); `git diff --check` RC 0; smoke RC 0 (`1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto).
- Produção verificada independentemente: raiz HTTP 200 e `/release.json` HTTP 200. Live continua no SHA remoto `23fa294e9811c3aa69a41fdf44e168beb6f6e86e`, release `23fa294-20260823T095444467Z`, versão `0.2.912`, snapshot `1003` com o mesmo SHA oficial do CSV.
- Worktree sem alterações após os gates; HEAD local `1a4c356`, `main` está 2 commits à frente de `origin/main`.

## Bloqueios reais
- Publicação documental ainda bloqueada pelo transporte Git: tentativas anteriores registradas em `STATE.md` retornaram HTTP 403 para `Snerolino/eleicao2026.git`, apesar de a API GitHub listar permissão de push. Nenhum push ou workflow novo foi acionado neste tick.
- `npm run orch:doctor` não pôde ser executado pelo shell do gateway: o doctor tenta reiniciar/parar o gateway e o runtime bloqueia essa operação (`Blocked: command or referenced script cannot restart or stop the gateway from inside the gateway process`). O histórico vigente mantém os bloqueios conhecidos de shell Node 22/OpenCode ausente; gates do projeto foram executados explicitamente em Node 24.19.0.
- ALRS residual e Senado permanecem fail-closed por falta de evidência oficial exata/envelope nominal com SHA verificável. Nenhuma mutação Supabase, Cloudflare ou factual foi feita.

## Próximo passo
Retentar o transporte `main -> main`; se aceito, validar o workflow backup `334951434`, seu `headSha` e o `/release.json` de produção. Manter recon ALRS/Senado e qualquer aplicação factual condicionados a R0, schema/FK, fonte oficial, dry-run e idempotência.
