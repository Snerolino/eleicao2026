# QA — tick contínuo de recon oficial e gates locais — 2026-08-22 07:10 UTC

## Objetivo
Executar um tick bounded mantendo as quatro lanes: recon oficial read-only, verificação local, publicação posterior aos gates e aplicação factual remota bloqueada até as evidências exigidas.

## Entregue e verificado
- Câmara: recon oficial read-only em 8 janelas trimestrais de 2025–2026, `max_pages=1`; 8/8 páginas HTTP classificadas como `ok`, 700 `vote_ids` mantidos apenas em artefato transitório/memória. Nenhuma reconciliação ou aplicação.
- ALRS FED-17 residual: dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais Enio Carlos Terra continuam sem identidade oficial e fonte exata suficientes.
- Senado: fail-closed; `/tmp/senado-nominal-envelope-latest.json` não existe, portanto não houve adaptação, inferência de `legislator_id`, escrita ou promoção.
- Dataset vivo: CSV oficial `consulta_cand_2026_RS.csv` SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; 1.003 IDs no CSV e 1.003 no snapshot; diferença 0/0.

## Gates locais
Todos passaram:
- `npm run test`: 98 arquivos, 400 testes; RC 0.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: checkpoint OK; RC 0.
- `npm run data:check`: 1.003 candidaturas, 988 fotos; RC 0.
- `npm run build`: RC 0; sitemap com 1.003 candidatos + 2 estáticas; `release.json` local `0702049-20260822T070848357Z`.
- `git diff --check`: RC 0.
- `npm run smoke:local`: 1.002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto; RC 0.

## Estado dos dados e segurança
Nenhuma candidatura, voto, proposição, evento, identidade, FK, `source_reference`, claim, matriz, Supabase ou Cloudflare foi alterado. A auditoria estrita anterior permanece com gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`; sem promoção fail-closed.

## Bloqueios reais
- ALRS residual permanece bloqueado por ausência de identidade/fonte exata para os quatro votos.
- Senado permanece bloqueado pela ausência do envelope nominal verificável; não há base para derivar PDF, `legislator_id` ou SHA.
- Publicação Git bloqueada: após o commit documental `e1947f5`, `git push origin main` retornou HTTP 403, `Permission to Snerolino/eleicao2026.git denied to Snerolino`; `main` local permanece à frente de `origin/main`. Nenhum workflow novo foi acionado.
- Produção existente foi apenas revalidada: raiz HTTP 200 e `/release.json` HTTP 200, release `e925327-20260821T145742462Z`, versão `0.2.724`; não corresponde ao commit local e não é publicação deste tick. Workflow backup `334951434` está ativo.
- O checkpoint operacional registra doctor com FAILs de ambiente (shell Node 22.22.2 incompatível e rota MCP Codex `401 invalid_refresh_token`); não repetir MCP neste tick.

## Próximo passo
Tentar publicação apenas da documentação após estes gates; se GitHub/DNS/permissão bloquear, registrar a causa e continuar a recon bounded. Validar workflow Cloudflare backup `334951434` e produção somente se o push for aceito. Aplicação factual remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
