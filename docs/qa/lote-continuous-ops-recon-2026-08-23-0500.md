# Lote continuous-ops — recon oficial, gates e publicação — 2026-08-23 05:00Z

## Objetivo
Executar tick bounded mantendo reconhecimento oficial, verificação local e publicação automática, sem promover fatos sem identidade/fonte exata.

## Entregue e verificado
- Lock não bloqueante adquirido/liberado com `flock -n`.
- Câmara dos Deputados: descoberta read-only em 8 janelas trimestrais explícitas entre 2025-01-01 e 2026-12-31; `8/8` respostas `ok`, `blocked=null`, `700` IDs transitórios. Nenhuma reconciliação ou aplicação.
- ALRS FED-17 residual: dry-run RC 0 com `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os 4 casos Enio Carlos Terra continuam bloqueados por falta de ID oficial/fonte exata.
- Auditoria de fontes read-only RC 0: gaps preservados — versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Gates Node 24.19.0: `401` testes em `98` arquivos, TypeScript, schema, `data:check` (`1003` candidaturas, `988` fotos oficiais, `1` fonte TSE), build (`224` módulos; sitemap `1003 + 2`; `release.json` local `ce53850-20260823T050015491Z`) e `git diff --check` verdes.

## Publicação
- `env -u GH_TOKEN git push origin main` falhou RC 128 com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Worktree permanece limpa, `main` local está `46` commits à frente de `origin/main`; nenhum workflow/deploy novo foi acionado.
- Não foi possível validar backup `334951434` para o HEAD atual. Nenhuma escrita Supabase/Cloudflare ocorreu.

## Estado e bloqueios reais
- Dados públicos e fatos legislativos não foram alterados; Senado segue fail-closed sem envelope nominal com SHA verificável.
- Bloqueios: transporte Git HTTPS rejeitado (403); ALRS remoto segue sem identidade/fonte exata utilizável; gaps de fontes legislativas permanecem na fila; doctor RC 1 por Node 22 padrão, Codex 401/token expirado e OpenCode ausente. Gates foram executados com Node 24.19.0.

## Próximo passo
Retentar `main -> main` quando o transporte Git aceitar a credencial; depois validar run backup `334951434`, `headSha` e produção. Manter Câmara read-only e ALRS/Senado fail-closed; aplicação remota continua condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
