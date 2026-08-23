# QA — tick contínuo de recon oficial — 2026-08-23 04:02Z

## Objetivo
Executar um tick bounded do control plane: manter reconhecimento oficial ativo, validar o snapshot público, rodar os gates locais e verificar o estado de publicação sem promover dados sem fonte.

## O que foi entregue/verificado
- Lock bounded `flock -n .orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado; nenhum writer concorrente.
- Recon Câmara read-only: API oficial `dadosabertos.camara.leg.br/api/v2/votacoes`, 8 janelas trimestrais 2025–2026, `8/8` páginas `ok`, `blocked=null`, `700` IDs transitórios; nenhuma reconciliação ou aplicação.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`; os quatro casos Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria estrita de fontes read-only: gaps reais preservados — versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; exit 2 por lacunas, sem fabricação de evidência.
- Dataset/snapshot: `npm run data:check` verde com `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.
- Gates Node `v24.19.0`: `npm run test -- --passWithNoTests` — `98` arquivos e `401` testes verdes; `npx tsc --noEmit` verde; `node scripts/validate-impact-schema.mjs` verde; build Vite verde com `224` módulos, sitemap `1003 + 2` URLs e `release.json` local `4a96bbb-20260823T040159849Z`; `git diff --check` verde.
- Smoke local verde: `1002` cards, `2` resultados de busca, `0` falhas HTTP, `0` erros online, service worker pronto; detalhe canônico de Priscila Voigt Severiano validado.
- Produção revalidada: raiz HTTP `200`, `/release.json` HTTP `200`; live ainda em SHA `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`, release `3aae2d0-20260822T180456083Z`, versão `0.2.835`.

## Publicação
- `env -u GH_TOKEN git push origin main` retentado após diagnóstico e falhou com RC `128`: HTTP `403`, `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- `gh api` continua autenticado e lista os workflows remotos, incluindo backup `334951434`, mas isso não prova permissão efetiva no transporte Git HTTPS.
- Nenhum workflow novo, deploy Cloudflare, escrita Supabase, migration, source reference, voto, identidade ou FK foi executado.

## Estado dos dados e bloqueios
- Nenhum dado factual novo foi promovido. ALRS residual, Senado e gaps de fontes permanecem fail-closed.
- Bloqueio de publicação: credencial/permissão efetiva do transporte Git HTTPS divergente da identidade/permissões reportadas pela API GitHub. Não há evidência para contornar o bloqueio com segredo ou método não autorizado.
- Doctor do shell permanece degradado por Node 22 padrão e smoke MCP Codex com token expirado; gates foram executados comprovadamente com Node 24.19.0. OpenCode ausente é rota opcional indisponível.

## Próximo passo
Revalidar a credencial efetiva do transporte Git em um tick futuro; somente após `main -> main` aceito, acompanhar o workflow backup `334951434`, confirmar `headSha` e validar `/release.json` em produção. Continuar recon bounded sem aplicar ALRS/Senado/Câmara enquanto faltarem R0, schema/FK, fonte oficial exata, dry-run e idempotência.
