# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 09:14 UTC

## Objetivo
Executar um tick bounded do control plane: manter a recon oficial read-only ativa, verificar o estado vivo de `../dataset2026`, rodar os gates locais e preparar a publicação somente se todos os gates de projeto passarem.

## Entregue e verificado
- Lock não bloqueante `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado com `flock -n`.
- Câmara: consulta oficial read-only em 8 janelas trimestrais de 2025–2026, `max_pages=1`; 8/8 páginas responderam `status=ok`, `blocked=null`. IDs foram apenas observados em memória; nenhuma reconciliação ou aplicação ocorreu.
- ALRS FED-17 residual: dry-run retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Auditoria estrita de fontes executada read-only. Gaps reais permanecem: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`; saída com `has_gaps=true`. Nenhum fato foi promovido.
- `../dataset2026` não apresentou mudança observável no snapshot: `data/public-candidates.json` contém 1.003 registros, SHA `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- Gates verdes: 400 testes em 98 arquivos; TypeScript; schema de impacto; `data:check` com 1.003 candidaturas e 988 fotos; build Vite/PWA; sitemap com 1.003 candidatos + 2 estáticas; `git diff --check`.
- Build gerou `release.json` local `424951f-20260822T091426480Z`.

## Estado dos dados
Nenhuma escrita em snapshot, Supabase, claims, votos, identidade, FK, Cloudflare ou matriz. Aplicação factual permanece fail-closed e condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.

## Bloqueios reais
- ALRS: quatro residuais sem identidade oficial/fonte exata; dry-run bloqueou corretamente.
- Senado: envelope nominal verificável/PDF, `legislator_id` e SHA continuam ausentes; não houve promoção.
- Auditoria estrita: gaps de fonte descritos acima, exit lógico 2 por lacunas reais.
- Doctor: shell cron usa Node 22.22.2 embora o projeto exija Node 24; rota MCP Codex não comprovada por `401 invalid_refresh_token`; OpenCode ausente; smoke do fallback Codex vazio; Ollama sem preflight. A lane local passou sem depender dessas rotas.
- Publicação: `origin/main` está 68 commits atrás do HEAD local; push/deploy será tentado após este registro. Não afirmar publicação sem `main -> main`, run backup e `headSha` correspondente.

## Próximo passo
Executar smoke local e revalidar produção; tentar `git push origin main`. Se o push for aceito, acompanhar o workflow backup Cloudflare `334951434`, conferir `headSha` e HTTP 200 de `https://rs.votopraquem.org`. Se o push continuar bloqueado, registrar a causa real e manter a recon oficial/read-only no próximo tick.
