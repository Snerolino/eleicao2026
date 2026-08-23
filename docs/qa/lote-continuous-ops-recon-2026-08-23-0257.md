# QA — continuous ops recon — 2026-08-23 02:57 UTC

## Objetivo
Executar um tick bounded do control plane: manter recon oficial read-only ativa,
revalidar o snapshot público, rodar os gates locais e tentar a publicação do HEAD
atual sem aplicar fatos legislativos sem evidência suficiente.

## Entregue e verificado
- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado
  com `flock -n`; nenhum loop ou sleep manteve o lock.
- Recon ALRS FED-17 residual executada em dry-run: `planned_votes=0`,
  `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
  Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Câmara consultada exclusivamente pela API oficial
  `https://dadosabertos.camara.leg.br/api/v2`, em 8 janelas trimestrais de
  2025-01-01 a 2026-12-31, `max_pages=1`: 8/8 páginas `status=ok`,
  `blocked=null`; IDs permaneceram apenas em inventário read-only, sem
  reconciliação ou aplicação.
- Senado permaneceu fail-closed: não foi criado nem aceito envelope nominal sem
  fonte/SHA verificável.
- Auditoria estrita de fontes read-only: RC 2 pelos gaps reais — versões sem
  fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos
  `4/2/455`. Nenhuma evidência foi fabricada.
- `npm run data:check`: RC 0, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.

## Gates locais
Executados com Node 24 via `nvm use 24`:

- `npm run test -- --passWithNoTests`: RC 0, 98 arquivos, 401 testes aprovados.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run build`: RC 0, 224 módulos, sitemap 1.003 candidatos + 2 estáticas,
  `release.json` local `5527c31-20260823T025648967Z`.
- `git diff --check`: RC 0.
- `npm run smoke:local`: primeira tentativa falhou durante o carregamento com
  `cards=0`; repetição verificada passou: 1.002 cards, 2 cards de busca, rota
  canônica de detalhe, service worker pronto, 0 falhas HTTP e 0 erros online.

## Publicação e produção
- Identidade API: `gh api user` retornou `Snerolino`; API do repositório reportou
  `admin=true`, `push=true`. Transporte Git, porém, rejeitou
  `git push origin main` com HTTP 403: `Permission to Snerolino/eleicao2026.git
  denied to Snerolino`.
- Commit documental criado: `f7fc4e84613069f59c5d84f831a3681c7831e0bc`. O push normal falhou primeiro por DNS (`Could not resolve host: github.com`) e o retry sem `GH_TOKEN` falhou por HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`). HEAD local `f7fc4e8`, branch `main`, 38 commits à frente de `origin/main`; nenhum workflow novo foi acionado.
- Workflows remotos confirmados: backup `334951434`, primário `320564705` e
  verificador `335560210`, todos ativos.
- Produção independente: raiz HTTP 200; `/release.json` HTTP 200, ainda no
  release `3aae2d0-20260822T180456083Z`, versão `0.2.835`, SHA
  `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`; não corresponde ao HEAD local.

## Bloqueios reais
- Publicação bloqueada na camada de transporte Git por divergência entre a
  permissão reportada pela API e a credencial efetiva do push HTTPS.
- Doctor RC 1: shell padrão Node 22.22.2 embora o projeto exija Node 24; Codex
  MCP/fallback falham por token expirado/401; OpenCode ausente. Os gates do
  projeto passaram explicitamente em Node 24. Antigravity read-only segue como
  rota de consulta; nenhum segredo foi lido ou exposto.
- Gaps de fonte legislativa permanecem bloqueios factuais, sem escrita remota.

## Próximo passo
Retentar `main -> main` somente no próximo tick; se o transporte aceitar, validar
workflow backup `334951434`, `headSha` do run concluído e `/release.json` em
produção. Manter ALRS/Senado fail-closed e continuar recon Câmara read-only.
