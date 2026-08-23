# QA — lote continuous ops recon — 2026-08-23 00:32 UTC

## Objetivo
Executar um tick bounded do control plane: manter a recon oficial ativa, verificar o snapshot vivo `../dataset2026`, fechar os gates locais e revalidar produção sem promover fatos sem fonte/identidade exatas.

## Entregue e verificado

- Lock não bloqueante adquirido e liberado por `flock` em `.orchestrator/runtime/locks/continuous-progress.lock`.
- ALRS FED-17 residual executado em dry-run:
  - `planned_votes=0`;
  - `planned_event_date_fixes=0`;
  - `blocked_remaining=4`;
  - `impact_touched=false`.
  - Os quatro casos residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata; nenhum voto foi promovido.
- Câmara consultada exclusivamente na API oficial, em oito janelas trimestrais de 2025–2026, com `--max-pages 1`:
  - oito páginas `status=ok`;
  - `blocked=null`;
  - IDs retornados apenas como descoberta transitória;
  - sem reconciliação, FK ou aplicação remota.
- Senado continua fail-closed: não há envelope nominal verificável; nenhum dado foi criado ou aplicado.
- Dataset conferido read-only: quatro CSVs de candidatos localizados em `../dataset2026/candidatos/`; snapshot público com 1.003 registros, 761.786 bytes, SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.

## Gates locais

Executados com Node `v22.22.2` disponível no shell:

- `npm run test -- --passWithNoTests`: **401 testes / 98 arquivos, passou**.
- `npx tsc --noEmit`: **passou**.
- `node scripts/validate-impact-schema.mjs`: **passou**.
- `npm run data:check`: **passou**, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: **passou**, 224 módulos, sitemap com 1.003 candidatos + 2 URLs estáticas e `release.json` local `ff9fc4a-20260823T003240160Z`.
- `git diff --check`: **passou**.
- Produção: raiz `HTTP 200`; `/release.json` `HTTP 200`.

## Estado e bloqueios

- Nenhum candidato, voto, FK, `source_reference`, claim, Supabase remoto ou Cloudflare foi alterado.
- A recon ALRS permanece bloqueada por ausência de identidade oficial/fonte exata nos quatro casos; o processo falha fechado.
- O envelope nominal do Senado permanece ausente/não verificável; processo fail-closed.
- A publicação Git continua condicionada à permissão efetiva do remoto; ticks anteriores registraram HTTP 403 para `main -> main`. Este lote deixa a documentação local pronta para commit/push quando o remoto aceitar.

## Próximo passo

Retentar `git push origin main`; se aceitar, validar o workflow backup Cloudflare `334951434`, seu `headSha` contra o commit publicado e a produção. Em paralelo, manter recon read-only da Câmara e recuperação oficial ALRS/Senado sem aplicar qualquer fato até cumprir R0, schema/FK, fonte exata, dry-run e idempotência.
