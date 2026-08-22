# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 06:44Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, verificar o snapshot vivo, rodar os gates locais e validar a publicação existente sem promover fatos sem fonte.

## Entregue e verificado
- Lock não bloqueante em `.orchestrator/runtime/locks/continuous-progress.lock` testado com `flock -n`.
- Câmara: consulta oficial `dadosabertos.camara.leg.br/api/v2/votacoes`, oito janelas trimestrais 2025–2026, `max_pages=1`: 8/8 páginas `ok`, sem bloqueios, 700 `vote_ids` apenas em memória; nenhuma reconciliação ou aplicação.
- ALRS FED-17 residual: falhou fechado com causa real `JWT issued at future`; `planned_votes=0`, sem alteração. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: permanece fail-closed; nenhum PDF/`legislator_id`/SHA verificável foi promovido.
- Auditoria estrita de fontes: exit 2 por gaps reais — versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; sem promoção.
- Dataset: `data:check` verde, 1.003 candidaturas e 988 fotos. CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; snapshot JSON SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- Gates locais verdes com Node 24: 400 testes/98 arquivos, TypeScript, schema de impacto, `data:check`, build, sitemap 1.003 + 2 estáticas, `git diff --check`.
- Smoke local verde: 1.002 cards, 2 resultados de busca, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- Doctor: `OK=49 WARN=6 FAIL=2`; FAIL real por shell Node 22.22.2 (projeto exige Node 24) e rota MCP Codex sem evidência (`401 invalid_refresh_token`). OpenCode ausente e Ollama sem preflight permanecem WARN/bloqueios de rota; não repetir MCP neste tick.
- Produção: raiz `https://rs.votopraquem.org` HTTP 200. A primeira consulta a `/release.json` falhou por DNS (HTTP 000), mas a repetição respondeu HTTP 200; a leitura do payload ainda deve ser considerada somente como verificação do live existente.
- Commit documental criado como `b2bdb9e`; `git push origin main` e retry falharam por DNS (`Could not resolve host: github.com`), sem workflow/deploy novo. Worktree permaneceu limpa após o commit.

## Estado dos dados
Nenhum candidato, foto, claim, source reference, identidade, FK, voto, matriz, Supabase ou Cloudflare foi alterado. Recon e auditoria permaneceram read-only/fail-closed.

## Bloqueios
1. Push GitHub segue bloqueado por resolução DNS (`Could not resolve host: github.com`); HEAD local ficou 59 commits à frente de `origin/main`. Revalidar e publicar quando DNS/permissão efetiva permitirem.
2. ALRS residual bloqueado por `JWT issued at future`, sem fonte/ID exatos.
3. Senado bloqueado por envelope nominal/PDF/`legislator_id`/SHA verificável ausente.
4. Auditoria estrita bloqueada por lacunas de fontes, mantidas em fila de recuperação.
5. DNS intermitente para `/release.json`; sem validação de `headSha` nesta execução.

## Próximo passo
Commit documental após este gate; tentar `git push origin main` conforme autorização do arco. Se chegar ao remoto, acionar/verificar o workflow backup `334951434`, confirmar `headSha` e repetir HTTP/`release.json`. Manter ALRS/Senado fail-closed e qualquer aplicação remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
