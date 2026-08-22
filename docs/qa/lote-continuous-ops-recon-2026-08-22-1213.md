# Lote continuous-ops — recon oficial e gates locais — 2026-08-22 12:13Z

## Objetivo
Executar um tick bounded do control plane, manter as lanes oficiais read-only/fail-closed, conferir o dataset vivo e fechar os gates locais antes de tentar publicação.

## Entregue e verificado
- Lock não bloqueante adquirido e liberado via `flock -n`.
- Câmara dos Deputados: consulta oficial read-only em 8 janelas trimestrais de 2025-01-01 a 2026-12-31, `max_pages=1`; 8/8 janelas `status=ok`, `blocked=null`, 700 `vote_ids` transitórios. Não houve reconciliação, escrita ou promoção.
- ALRS FED-17 residual: dry-run padrão retornou `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro casos de Enio Carlos Terra continuam sem ID oficial e fonte exata.
- Senado: fail-closed porque `/tmp/senado-nominal-envelope-latest.json` está ausente.
- Dataset/snapshot: CSV oficial e snapshot com 1.003 linhas/IDs cada; diferença CSV→snapshot `0` e snapshot→CSV `0`; SHA do CSV `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Gates locais verdes em Node 24: 401 testes/98 arquivos; TypeScript; schema de impacto; `data:check` com 1.003 candidaturas, 988 fotos e 1 fonte TSE; build Vite/PWA com sitemap 1.003 + 2 e `release.json` local `d535463-20260822T151353005Z`; `git diff --check`; smoke com 1.002 cards, 0 falhas HTTP, 0 erros de console online e service worker pronto.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200. Payload live continua na versão `0.2.806`, sem `commitSha`, `headSha`, `snapshotSha` ou `builtAt`; não há correspondência verificável com o HEAD local.

## Estado dos dados
- Nenhuma escrita em Supabase, Cloudflare, snapshot, claims, source references, identidades, FKs, votos ou matrizes.
- Auditoria regular de fontes: RC 0. Auditoria estrita: RC 2 por gaps reais — versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Nenhum fato legislativo foi promovido.

## Bloqueios reais
- `git push origin main` falhou novamente com HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum workflow/deploy novo foi acionado.
- Reconciliação ALRS segue sem ID/fonte exata; Senado segue sem envelope PDF/`legislator_id`/SHA verificável; gaps estritos permanecem abertos.
- `orch:doctor` permanece com FAIL por shell Node 22.22.2 incompatível com o requisito Node 24; OpenCode está ausente. Os gates do projeto foram executados explicitamente com Node 24.

## Próximo passo
Retentar `main -> main` no próximo tick quando a permissão efetiva do GitHub permitir. Se aceito, acompanhar o workflow backup Cloudflare `334951434`, conferir `headSha` contra o commit e repetir validação de produção. Manter ALRS/Senado fail-closed e aplicação remota condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
