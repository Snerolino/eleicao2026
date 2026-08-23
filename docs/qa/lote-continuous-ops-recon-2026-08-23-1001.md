# QA — continuous ops recon oficial — 2026-08-23 10:01Z

## Objetivo
Executar um tick bounded do control plane com reconhecimento oficial read-only, conferência do dataset vivo, microbatch local P2 e gates antes de publicação.

## Entregue e verificado
- Lock não bloqueante `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado por subprocessos bounded.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara oficial read-only: 8/8 janelas trimestrais de 2025–2026 com `status=ok`, `blocked=null`; IDs oficiais foram apenas inventariados, sem reconciliação ou aplicação.
- Auditoria de fontes Supabase read-only: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. Auditoria regular retornou RC 0; nenhuma evidência foi fabricada.
- Senado fail-closed: envelope nominal verificável ausente (`/tmp/senado-nominal-envelope-latest.json` não existe); nenhuma derivação de SHA ou voto foi promovida.
- Dataset vivo contra snapshot por `SQ_CANDIDATO`: `1003/1003`, diferença `0/0`; CSV oficial SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Microbatch P2 local reexecutado com RC 0: `5` versões, `0` votos factuais, `remote_apply=false`, `public_approval=false`.

## Estado dos dados e segurança
Nenhum candidato, voto, identidade, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado. Nenhum segredo foi lido ou exposto. O microbatch permanece `pending_review`/revisão humana obrigatória.

## Bloqueios reais
- Os quatro votos residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata, portanto não podem ser vinculados.
- Senado continua bloqueado pela ausência de envelope nominal com SHA verificável.
- Auditoria mantém lacunas de fontes legislativas; aplicação remota permanece proibida até R0, schema/FK, fonte oficial, dry-run e idempotência.
- `npm run orch:doctor` permanece RC 1 porque o shell padrão usa Node 22.22.2, embora os gates do projeto devam ser executados com Node 24; OpenCode também está ausente.

## Próximo passo
Executar gates locais com Node 24. Se verdes, publicar documentação via commit/push e validar workflow backup `334951434`, `headSha`, HTTP de produção e `release.json`. Manter ALRS/Senado fail-closed e avançar o próximo reconhecimento oficial bounded.
