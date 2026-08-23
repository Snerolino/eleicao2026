# Lote continuous-ops — reconhecimento oficial 2026-08-23 08:04Z

## Objetivo
Executar tick bounded das lanes oficiais, revalidar gates locais e manter qualquer aplicação factual em fail-closed.

## Entregue e verificado
- Lock bounded `flock -n` adquirido/liberado; nenhum loop ou sleep mantido.
- ALRS FED-17 residual: dry-run RC 0, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara oficial `dadosabertos.camara.leg.br/api/v2`: 8 janelas trimestrais 2025–2026, `status=ok` em `8/8`, `700` IDs descobertos; somente inventário read-only, sem reconciliação ou aplicação.
- Senado: envelope nominal verificável ausente; nenhuma adaptação ou aplicação.
- Dataset vivo versus snapshot por `SQ_CANDIDATO`: `1003/1003`, diferença `0/0`; CSV SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Testes: `401` em `98` arquivos, RC 0.
- TypeScript, schema e `data:check`: RC 0; `data:check` confirmou `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.
- Build: RC 0, `224` módulos, sitemap `1003 + 2`, `release.json` local gerado.
- Smoke local: RC 0, `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto.
- Auditoria regular de fontes RC 0; auditoria estrita RC 2 preserva gaps reais: versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.

## Estado dos dados
Nenhum candidato, voto, identidade, FK, source reference, claim, snapshot, Supabase remoto ou Cloudflare foi alterado. As quatro pendências ALRS de Enio Carlos Terra seguem sem ID oficial e fonte exata.

## Bloqueios reais
- ALRS: sem evidência oficial exata e identidade oficial para os quatro residuais.
- Senado: sem envelope nominal com SHA verificável.
- Auditoria estrita: lacunas substantivas de fontes permanecem e não foram preenchidas por inferência.
- Doctor: shell padrão Node 22.22.2 incompatível com requisito Node 24; OpenCode ausente. Gates executados com Node 24.19.0.
- Publicação: `HEAD` local está à frente de `origin/main`; transporte Git HTTPS já rejeitou HTTP 403. Não declarar deploy novo sem `main -> main` aceito.

## Próximo passo
Retentar boundedmente o transporte Git; se aceitar, validar backup Cloudflare `334951434`, `headSha`, `/release.json` e smoke remoto. Manter `remote_factual_apply` condicionado a R0/schema/FK/fonte oficial/dry-run/idempotência.
