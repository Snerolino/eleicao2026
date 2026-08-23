# Lote continuous ops — recon oficial e gates locais — 2026-08-23

## Objetivo
Retomar a reconciliação bounded, somente leitura, das fontes legislativas oficiais e verificar a saúde local/publicada sem aplicar fatos, identidades, FKs, claims, matrizes ou assessments.

## Entregue e verificado
- Câmara: `node scripts/discover-camara-vote-ids.mjs --start 2025-01-01 --end 2026-12-31 --max-pages 1` consultou 8 janelas trimestrais na API oficial `dadosabertos.camara.leg.br`; `8/8` retornaram `status=ok`, `blocked=null`, com IDs apenas inventariados. Nenhuma reconciliação ou escrita foi executada.
- Auditoria regular de fontes: RC 0; auditoria `--strict`: RC 2, fail-closed, preservando gaps reais.
- Cobertura auditada: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`. A fila ALRS residual contém 4 votos sem evidência vinculada (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`).
- Dataset/snapshot: snapshot local `1003` registros. Nenhuma alteração factual foi feita.

## Gates locais
Executados com Node `24.19.0`:
- `npm run test -- --passWithNoTests`: RC 0 — `98` arquivos, `401` testes.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- `npm run build`: RC 0 — `226` módulos; sitemap `1003 + 2 = 1005` URLs; `release.json` local gerado.
- `git diff --check`: RC 0.

## Publicação e produção
- `git push origin main`: bloqueado, RC 128, HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Produção independentemente verificada: raiz HTTP 200 e `/release.json` HTTP 200.
- Últimos workflows consultados: backup `32652456631` e primário `32652443864` concluíram `success` no SHA remoto anterior `5a8a240`; o commit documental deste lote ainda não foi publicado.

## Bloqueios
- Transporte GitHub continua bloqueado por autorização HTTP 403; não houve novo workflow nem deploy deste lote.
- Auditoria estrita mantém gaps de fonte reais; não aplicar votos sem URL/hash/evidência oficial.
- `npm run orch:doctor` permanece RC 1 pelo shell padrão Node `22.22.2`, além de OpenCode ausente e smoke MCP Codex não exercitado no modo rápido. Os gates do projeto foram executados explicitamente com Node 24.19.0.

## Estado remoto
Nenhum candidato, identidade, voto, FK, source reference, claim, matriz, assessment, Supabase ou Cloudflare foi alterado.

## Próximo passo
Retentar transporte `main -> origin/main`; após aceitação, validar workflow backup `334951434`, `headSha`, raiz e `/release.json`. Manter recon Câmara/ALRS/Senado read-only e aplicação factual condicionada a R0, schema/FK, fonte oficial, dry-run e idempotência.
